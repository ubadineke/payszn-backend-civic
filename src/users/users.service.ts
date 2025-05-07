import { Injectable, NotFoundException } from '@nestjs/common';
import { AllowedUserUpdateDto, UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsService } from 'src/transactions/transactions.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly transactionService: TransactionsService,
  ) {}
  async findUserByEmail(email: string) {
    let user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOrCreateUser(email: string, name: string, wallet: string) {
    let user = await this.userRepository.findOne({ where: { email } });

    // console.log(user);

    if (!user) {
      user = this.userRepository.create({ email, name, wallet });
      await this.userRepository.save(user);
    }

    return user;
  }

  async updateUser(email: string, update: AllowedUserUpdateDto) {
    await this.userRepository.update({ email }, { ...update });
    return { message: 'Update successful' };
  }

  async findUserById(id: number) {
    let user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findUserByWallet(wallet: string) {
    let user = await this.userRepository.findOne({
      where: { wallet },
    });
    return user;
  }

  async fetchUserTransactions(walletAddress: string) {
    let transactions =
      await this.transactionService.fetchTransactionsByUser(walletAddress);
    return transactions;
  }
}
