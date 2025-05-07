import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection } from '@solana/web3.js';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UsersService } from 'src/users/users.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PaymentGatewayService {
  private connection: Connection;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
  ) {
    this.connection = new Connection(
      'https://api.mainnet-beta.solana.com',
      'confirmed',
    );
  }

  async processTransaction(signature: string, expectedReceiver: string) {
    //Confirm if the merchant exists
    const user = await this.usersService.findUserByWallet(expectedReceiver);

    if (!user)
      throw new NotFoundException('Merchant does not exist on this platform');

    const confirmedTx = await this.transactionsService.confirmTransaction(
      this.connection,
      signature,
      expectedReceiver,
    );

    //Update Transaction History
    const transaction = await this.transactionsService.createTransaction(
      confirmedTx.signature,
      confirmedTx.sender,
      confirmedTx.receiver,
      confirmedTx.destinationToken.amount as string,
      true,
    );

    //Send Notification mail to Merchant

    //Send update to the appplication registered Webhook

    const webhookUrl = user.webhookUrl;
    const callbackUrl = user.callbackUrl;
    // const webhookUrl = 'http://localhost:4000/webhook';
    // const callbackUrl = 'http:/dff.com/ad';

    if (webhookUrl) {
      try {
        this.httpService
          .post(webhookUrl, {
            status: 'success',
            transaction,
          })
          .toPromise();
        console.log('Webhook sent successfully');
      } catch (error) {
        console.error('Webhook failed:', error);
      }
    }

    // Return Data for Callback URL Redirect
    return {
      message: 'Transaction successful',
      transaction,
      callbackUrl: callbackUrl, // Frontend will redirect the user here
    };
  }
}
