import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { UserBan } from '../domain/user-ban.entity';

@Injectable()
export class UserBanRepositories {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async save(userBan: UserBan, queryRunner?: QueryRunner): Promise<number> {
    if (queryRunner) {
      const userEntity: UserBan = await queryRunner.manager.save(userBan);
      return userEntity.id;
    }
    const newQueryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await newQueryRunner.connect();
    try {
      await newQueryRunner.startTransaction();
      const userEntity: UserBan = await newQueryRunner.manager.save(userBan);
      await newQueryRunner.commitTransaction();
      return userEntity.id;
    } catch (e) {
      await newQueryRunner.rollbackTransaction();
      return null;
    } finally {
      await newQueryRunner.release();
    }
  }

  async saveMany(userBan: UserBan[], queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      await queryRunner.manager.save(userBan);
      return;
    }
    const newQueryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await newQueryRunner.connect();
    try {
      await newQueryRunner.startTransaction();
      await newQueryRunner.manager.save(userBan);
      await newQueryRunner.commitTransaction();
      return;
    } catch (e) {
      await newQueryRunner.rollbackTransaction();
      return;
    } finally {
      await newQueryRunner.release();
    }
  }
}
