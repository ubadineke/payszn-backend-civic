import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKey } from './entities/api-key.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  // create(createApiKeyDto: CreateApiKeyDto) {
  //   return 'This action adds a new apiKey';
  // }

  // findAll() {
  //   return `This action returns all apiKey`;
  // }

  async findJwtByKey(apiKey: string) {
    const apiFac = await this.apiKeyRepository.findOne({ where: { apiKey } });
    if (!apiFac) throw new NotFoundException('Api Group Entry not found');
    return apiFac.apiKeyJwt;
    // return `This action returns a #${id} apiKey`;
  }

  // update(id: number, updateApiKeyDto: UpdateApiKeyDto) {
  //   return `This action updates a #${id} apiKey`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} apiKey`;
  // }

  async createApiTokenEntry(apiKeyJwt: string, apiKey: string, user: User) {
    let key = await this.apiKeyRepository.create({ apiKey, apiKeyJwt, user });
    await this.apiKeyRepository.save(key);
  }

  async verifyApiKey(apiKey: string) {
    let apiFac = await this.apiKeyRepository.findOne({ where: { apiKey } });

    if (!apiFac) return { isValid: false };

    return { isValid: true };
  }

  async fetchUserWalletByKey(apiKey: string) {
    let apiFac = await this.apiKeyRepository.findOne({
      where: { apiKey },
      relations: ['user'],
    });

    if (!apiFac) {
      throw new BadRequestException('invalid api key');
    }

    //Return wallet
    return { wallet: apiFac.user.wallet };
  }
}
