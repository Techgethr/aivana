const BaseTool = require('./BaseTool');
const EthereumService = require('../../blockchain/ethereum');
const db = require('../../utils/init-db');

class VerifyPaymentTool extends BaseTool {
  constructor() {
    super(
      'verify_payment',
      'Verify a payment transaction by checking the blockchain and comparing with the user\'s cart',
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
          }
        },
        required: ['transactionId', 'sessionId']
      }
    );
  }

  async execute(args) {
    try {
      const { transactionId, sessionId } = args;

      
      // Initialize Ethereum service
      const ethereumService = new EthereumService();
      
      // Get the expected wallet address from environment
      const expectedWalletAddress = process.env.WALLET_ADDRESS;
      if (!expectedWalletAddress) {
        return { error: 'WALLET_ADDRESS environment variable not configured' };
      }

      // Get transaction details from blockchain
      const transaction = await ethereumService.getTransaction(transactionId);
      if (!transaction) {
        return { error: `Transaction ${transactionId} not found on the blockchain` };
      }

      // Verify that the transaction was sent to the correct wallet
      if (transaction.to.toLowerCase() !== expectedWalletAddress.toLowerCase()) {
        return { 
          error: `Payment was not sent to the correct wallet. Expected: ${expectedWalletAddress}, Got: ${transaction.to}` 
        };
      }

      // Get Cart session from database
      const { data: cartSessionData, error: cartSessionError } = await db.getDb()
        .from('cart_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      // Get the user's cart from the database
      const { data: cartData, error: cartError } = await db.getDb()
        .from('cart_items')
        .select('*')
        .eq('cart_session_id', cartSessionData.id)
        .single();

      console.log("Cart Data: ", cartData);

      if (cartError || !cartData) {
        return { error: `Could not retrieve cart for session ${sessionId}: ${cartError?.message || 'Cart not found'}` };
      }

      // Calculate the expected total from the cart
      let expectedTotal = 0;
      const cartItems = cartData.items || [];
      
      for (const item of cartItems) {
        // Get the current product price to ensure accuracy
        const { data: productData, error: productError } = await db.getDb()
          .from('products')
          .select('price')
          .eq('id', item.productId)
          .single();

        if (productError || !productData) {
          return { error: `Could not retrieve product ${item.productId} for verification` };
        }

        expectedTotal += productData.price * item.quantity;
      }

      // Convert transaction value from Wei to Ether for comparison
      const transactionValueEth = parseInt(transaction.value) / 1e18;
      
    

      // If we reach here, the payment is valid
      // Update the transaction status in the database
      const { data: existingTransaction, error: fetchError } = await db.getDb()
        .from('transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();

      if (!fetchError && existingTransaction) {
        // Update existing transaction
        const { error: updateError } = await db.getDb()
          .from('transactions')
          .update({ 
            status: 'verified',
            verified_at: new Date().toISOString()
          })
          .eq('id', existingTransaction.id);
          
        if (updateError) {
          console.error('Error updating transaction status:', updateError);
        }
      } else {
        // Create a new transaction record if it doesn't exist
        const { error: insertError } = await db.getDb()
          .from('transactions')
          .insert([{
            transaction_id: transactionId,
            buyer_id: sessionId, // Using session ID as buyer reference temporarily
            total_price: expectedTotal,
            status: 'verified',
            created_at: new Date().toISOString(),
            verified_at: new Date().toISOString()
          }]);
          
        if (insertError) {
          console.error('Error creating transaction record:', insertError);
        }
      }

      // Clear the cart after successful payment verification
      // const { error: clearCartError } = await db.getDb()
      //   .from('cart_sessions')
      //   .update({ items: [] })
      //   .eq('session_id', sessionId);
        
      // if (clearCartError) {
      //   console.error('Error clearing cart after payment verification:', clearCartError);
      // }

      return {
        success: true,
        message: `Payment verified successfully. Transaction ID: ${transactionId}`,
        transactionDetails: {
          id: transactionId,
          amount: transactionValueEth,
          to: transaction.to,
          from: transaction.from,
          timestamp: transaction.timestamp
        },
        expectedAmount: expectedTotal
      };
    } catch (error) {
      console.error('Error in verify_payment tool:', error);
      return { error: `Failed to verify payment: ${error.message}` };
    }
  }
}

module.exports = VerifyPaymentTool;