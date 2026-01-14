const { createPublicClient, http, parseEther, getAddress } = require('viem');
const { arcTestnet } = require('viem/chains');
require('dotenv').config();

class EthereumService {
  constructor() {
    // Initialize viem client with Ethereum RPC URL
    this.client = createPublicClient({
      chain: arcTestnet,
      transport: http(process.env.ARC_RPC_URL)
    });

    // Store the wallet address
    this.walletAddress = process.env.WALLET_ADDRESS; // Using a wallet address instead of private key for now
  }

  // Function to get balance of an address
  async getBalance(address) {
    try {
      // Validate address
      const validAddress = getAddress(address);

      // Get balance
      const balanceBigNumber = await this.client.getBalance({
        address: validAddress,
      });

      // Convert to ETH
      const balanceEth = Number(balanceBigNumber);

      return {
        address: validAddress,
        balanceWei: balanceBigNumber.toString(),
        balanceEth: balanceEth
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  // Function to get block information
  async getLatestBlock() {
    try {
      const block = await this.client.getBlock();

      return {
        number: Number(block.number),
        hash: block.hash,
        timestamp: Number(block.timestamp),
        gasLimit: block.gasLimit.toString()
      };
    } catch (error) {
      console.error('Error getting latest block:', error);
      throw error;
    }
  }

  // Function to get transaction details (without executing)
  async getTransaction(hash) {
    try {
      const transaction = await this.client.getTransaction({
        hash: hash,
      });

      if (!transaction) {
        return null;
      }

      return {
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value.toString(),
        gas: transaction.gas,
        gasPrice: transaction.gasPrice?.toString(),
        nonce: transaction.nonce,
        blockNumber: transaction.blockNumber ? Number(transaction.blockNumber) : null
      };
    } catch (error) {
      if (error.message.includes('transaction not found')) {
        return null;
      }
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  // Function to get transaction receipt
  async getTransactionReceipt(hash) {
    try {
      const receipt = await this.client.getTransactionReceipt({
        hash: hash,
      });

      if (!receipt) {
        return null;
      }

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 'success' ? 'success' : 'reverted',
        contractAddress: receipt.contractAddress
      };
    } catch (error) {
      if (error.message.includes('transaction receipt not found')) {
        return null;
      }
      console.error('Error getting transaction receipt:', error);
      throw error;
    }
  }

  // Function to convert ETH to USD (using a mock rate for demonstration)
  async convertEthToUsd(ethAmount) {
    // In a real implementation, you would use a real-time exchange rate API
    // For this demo, we'll use a fixed rate
    const ethToUsdRate = 2500; // $2500 per ETH (this would be dynamic in production)
    return ethAmount * ethToUsdRate;
  }

  // Function to convert USD to ETH
  async convertUsdToEth(usdAmount) {
    // In a real implementation, you would use a real-time exchange rate API
    // For this demo, we'll use a fixed rate
    const ethToUsdRate = 2500; // $2500 per ETH (this would be dynamic in production)
    return usdAmount / ethToUsdRate;
  }

  // Function to validate an Ethereum address
  isValidAddress(address) {
    try {
      getAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  // Function to get current gas price
  async getCurrentGasPrice() {
    try {
      const feeData = await this.client.estimateFeesPerGas();

      return {
        gasPriceWei: feeData.gasPrice ? Number(feeData.gasPrice) : null,
        maxFeePerGas: feeData.maxFeePerGas ? Number(feeData.maxFeePerGas) : null,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? Number(feeData.maxPriorityFeePerGas) : null
      };
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw error;
    }
  }
}

module.exports = EthereumService;