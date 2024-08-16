import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../user/domain/user.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class TestingRepositories {
  constructor(
    @InjectModel(User.name) private readonly userModel: UserModelType,
  ) {}

  async clearDb(): Promise<void> {
    await Promise.all([this.userModel.deleteMany()]);
  }
}
