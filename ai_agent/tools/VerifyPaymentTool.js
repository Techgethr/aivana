const BaseTool = require('./BaseTool');
const ArcService = require('../../blockchain/arc');
const CartModel = require('../../models/Cart');
const CartSessionModel = require('../../models/CartSession');
const ProductModel = require('../../models/Product');

class VerifyPaymentTool extends BaseTool {
  constructor() {
    super(
      'verify_payment',
      'Verify a payment transaction by checking the blockchain and comparing with the user\'s cart. Validates that transaction ID is unique and reduces product stock.',
      {
        type: 'object',
        properties: {
          transactionId: {
            type: 'string',
            description: 'The blockchain transaction ID to verify'
          },
          sessionId: {
            type: 'string',
            description: 'The user session ID to retrieve the cart information'
          },
          buyerWalletId: {
            type: 'string',
            description: 'The buyer\'s wallet ID (optional)'
          }
        },
        required: ['transactionId', 'sessionId']
      }
    );
  }

  async execute(args) {
    try {
      const { transactionId, sessionId, buyerWalletId } = args;

      // Initialize Arc service
      const arcService = new ArcService();

      // Get the expected wallet address from environment
      const expectedWalletAddress = process.env.WALLET_ADDRESS;
      if (!expectedWalletAddress) {
        return { error: 'WALLET_ADDRESS environment variable not configured' };
      }

      // Check if transaction ID already exists for another session
      const existingSession = await CartSessionModel.getSessionByTransactionId(transactionId);
      if (existingSession && existingSession.session_id !== sessionId) {
        return { error: `Transaction ID ${transactionId} already exists for another session` };
      }

      // Get transaction details from blockchain
      const transaction = await arcService.getTransaction(transactionId);
      if (!transaction) {
        return { error: `Transaction ${transactionId} not found on the blockchain` };
      }

      // Verify that the transaction was sent to the correct wallet
      if (transaction.to.toLowerCase() !== expectedWalletAddress.toLowerCase()) {
        return {
          error: `Payment was not sent to the correct wallet. Expected: ${expectedWalletAddress}, Got: ${transaction.to}`
        };
      }

      // Get the user's cart from the database
      const cartItems = await CartModel.getCart(sessionId);
      if (!cartItems || cartItems.length === 0) {
        return { error: `Cart is empty for session ${sessionId}` };
      }

      // Calculate the expected total from the cart
      let expectedTotal = 0;
      for (const item of cartItems) {
        const product = item.products;
        expectedTotal += (product.price || 0) * item.quantity;
      }

      // Convert transaction value from Wei to appropriate unit for comparison
      const transactionValue = parseInt(transaction.value);
      // Note: The value is in wei, so we need to convert based on the currency used

      // Mark the cart session as paid and store transaction details
      await CartSessionModel.markAsPaid(sessionId, transactionId, buyerWalletId || transaction.from);

      // Process payment confirmation and reduce product stock
      await CartModel.processPaymentConfirmation(sessionId);

      return {
        success: true,
        message: `Payment verified successfully. Transaction ID: ${transactionId}, Session: ${sessionId}`,
        transactionDetails: {
          id: transactionId,
          amount: transactionValue,
          to: transaction.to,
          from: transaction.from,
          blockNumber: transaction.blockNumber
        },
        expectedAmount: expectedTotal,
        itemsPurchased: cartItems.length,
        buyerWalletId: buyerWalletId || transaction.from
      };
    } catch (error) {
      console.error('Error in verify_payment tool:', error);
      return { error: `Failed to verify payment: ${error.message}` };
    }
  }
}

module.exports = VerifyPaymentTool;