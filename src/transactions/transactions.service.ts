import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Connection } from '@solana/web3.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

interface TokenTransfer {
  mint: string;
  amount: number;
}

export interface confirmedTxResponse {
  confirmed: boolean;
  signature: string;
  sender: string;
  receiver: string;
  initialToken: {
    mint: string;
    amount: number | string;
  };
  destinationToken: {
    mint: string;
    amount: number | string;
  };
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}
  // create(createTransactionDto: CreateTransactionDto) {
  //   return 'This action adds a new transaction';
  // }
  // findAll() {
  //   return `This action returns all transactions`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} transaction`;
  // }
  // update(id: number, updateTransactionDto: UpdateTransactionDto) {
  //   return `This action updates a #${id} transaction`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} transaction`;
  // }

  async createTransaction(
    signature: string,
    sender: string,
    receiver: string,
    amount: string,
    confirmed?: boolean,
  ) {
    const transaction = this.transactionRepository.create({
      signature,
      sender,
      receiver,
      amount,
      confirmed,
    });

    return await this.transactionRepository.save(transaction);
  }

  async fetchTransactionsByUser(walletAddress: string) {
    const transactions = await this.transactionRepository.find({
      where: { receiver: walletAddress },
    });

    if (!transactions || transactions.length == 0)
      throw new NotFoundException('No transactions recorded for user');

    return transactions;
  }
  async confirmTransaction(
    connection: Connection,
    signature: string,
    expectedReceiver: string,
  ) {
    try {
      const transaction = await connection.getParsedTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!transaction) {
        throw new Error('Transaction not found or not confirmed.');
      }

      // Check if transaction was successful
      const success = transaction.meta?.err === null;
      // console.log('Successful?', success);
      if (!success) {
        throw new Error('Transaction not successful.');
      }

      // Verify if the expected receiver is in the transaction
      // const receiverExists = transaction.transaction.message.accountKeys.some(
      //   (key) => key.pubkey.toBase58() === expectedReceiver,
      // );

      // if (!receiverExists) {
      //   throw new Error(
      //     'Receiver on this transaction does not match merchant wallet',
      //   );
      // }

      // Extract the sender (usually the fee payer)
      const sender =
        transaction.transaction.message.accountKeys[0].pubkey.toBase58();

      // Extract token transfers from transaction
      const tokenTransfers = this.extractTokenTransfers(transaction);

      if (tokenTransfers.length < 2) {
        throw new Error(
          'From the given transaction: Not enough token transfers found for a swap',
        );
      }

      let response: confirmedTxResponse = {
        signature,
        confirmed: true,
        sender,
        receiver: expectedReceiver,
        initialToken: tokenTransfers[0],
        destinationToken: tokenTransfers[1],
      };
      return response;
    } catch (error) {
      console.error('Error confirming transaction:', error.message);
      throw new Error('Error confirming transaction:', error.message);
    }
  }

  private extractTokenTransfers(transaction: any): Array<TokenTransfer> {
    const transfers: Array<TokenTransfer> = [];

    // Look for token program instructions
    if (
      !transaction.meta?.postTokenBalances ||
      !transaction.meta?.preTokenBalances
    ) {
      return transfers;
    }

    const preBalances = transaction.meta.preTokenBalances;
    const postBalances = transaction.meta.postTokenBalances;

    // Map to track processed account indices
    const processedAccounts = new Set();

    // Process each post balance entry
    for (const postBalance of postBalances) {
      // Skip if we've already processed this account
      if (processedAccounts.has(postBalance.accountIndex)) {
        continue;
      }

      // Find matching pre-balance
      const preBalance = preBalances.find(
        (pre) => pre.accountIndex === postBalance.accountIndex,
      );

      if (preBalance) {
        const preAmount =
          Number(preBalance.uiTokenAmount.amount) /
          10 ** preBalance.uiTokenAmount.decimals;
        const postAmount =
          Number(postBalance.uiTokenAmount.amount) /
          10 ** postBalance.uiTokenAmount.decimals;

        // Calculate the difference
        const difference = Math.abs(postAmount - preAmount);

        if (difference > 0) {
          transfers.push({
            mint: postBalance.mint,
            amount: difference,
          });

          processedAccounts.add(postBalance.accountIndex);
        }
      }
    }

    return transfers;
  }
}
