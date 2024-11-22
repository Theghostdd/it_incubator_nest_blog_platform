import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  QueryRunner,
  Repository,
  WhereExpressionBuilder,
} from 'typeorm';
import {
  selectUserRecoveryPasswordSessionProperty,
  UserRecoveryPasswordSessionPropertyEnum,
} from '../../../access-control/auth/domain/types';
import {
  selectUserBanProperty,
  selectUserConfirmationProperty,
  selectUserProperty,
  UserBanPropertyEnum,
  UserConfirmationPropertyEnum,
  UserPropertyEnum,
} from '../domain/types';

@Injectable()
export class UserRepositories {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async save(user: User, queryRunner?: QueryRunner): Promise<number> {
    if (queryRunner) {
      const userEntity: User = await queryRunner.manager.save(user);
      return userEntity.id;
    }
    const newQueryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await newQueryRunner.connect();
    try {
      await newQueryRunner.startTransaction();
      const userEntity: User = await newQueryRunner.manager.save(user);
      await newQueryRunner.commitTransaction();
      return userEntity.id;
    } catch (e) {
      await newQueryRunner.rollbackTransaction();
      return null;
    } finally {
      await newQueryRunner.release();
    }
  }

  async updateBanState(
    userId: number,
    state: boolean,
    queryRunner?: QueryRunner,
  ): Promise<boolean> {
    if (queryRunner) {
      await queryRunner.manager.update(
        this.userRepository.target,
        { id: userId },
        { isBan: state },
      );
      return true;
    }
    const newQueryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await newQueryRunner.connect();
    try {
      await newQueryRunner.startTransaction();
      await newQueryRunner.manager.update(
        this.userRepository.target,
        { id: userId },
        { isBan: state },
      );
      await newQueryRunner.commitTransaction();
      return true;
    } catch (e) {
      await newQueryRunner.rollbackTransaction();
      return false;
    } finally {
      await newQueryRunner.release();
    }
  }

  async getUserById(
    id: number,
    queryRunner?: QueryRunner,
  ): Promise<User | null> {
    if (queryRunner) {
      const user: User | null = await queryRunner.manager
        .createQueryBuilder(this.userRepository.target, 'u')
        .select(selectUserProperty)
        .addSelect(selectUserConfirmationProperty)
        .addSelect(selectUserBanProperty)
        .leftJoin(`u.${UserPropertyEnum.userConfirm}`, 'uc')
        .leftJoin(
          `u.${UserPropertyEnum.userBans}`,
          'ub',
          `ub.${UserBanPropertyEnum.isActive} = :banStatus`,
          { banStatus: true },
        )
        .where(`u.${UserPropertyEnum.id}= :id`, { id: id })
        .andWhere(`u.${UserPropertyEnum.isActive} = :isActive`, {
          isActive: true,
        })
        .getOne();

      if (!user) return null;

      await queryRunner.manager
        .createQueryBuilder(this.userRepository.target, 'u')
        .setLock('pessimistic_write')
        .where(`u.${UserPropertyEnum.id} = :userId`, { userId: user.id })
        .execute();

      return user;
    }
    return await this.userRepository
      .createQueryBuilder('u')
      .select(selectUserProperty)
      .addSelect(selectUserConfirmationProperty)
      .addSelect(selectUserBanProperty)
      .leftJoin(`u.${UserPropertyEnum.userConfirm}`, 'uc')
      .leftJoin(
        `u.${UserPropertyEnum.userBans}`,
        'ub',
        `ub.${UserBanPropertyEnum.isActive} = :banStatus`,
        { banStatus: true },
      )
      .where(`u.${UserPropertyEnum.id}= :id`, { id: id })
      .andWhere(`u.${UserPropertyEnum.isActive} = :isActive`, {
        isActive: true,
      })
      .getOne();
  }

  async getUserByConfirmCode(code: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('u')
      .select(selectUserProperty)
      .leftJoin(`u.${UserPropertyEnum.userConfirm}`, 'uc')
      .addSelect(selectUserConfirmationProperty)
      .where(`uc.${UserConfirmationPropertyEnum.confirmationCode} = :code`, {
        code: code,
      })
      .andWhere(`u.${UserPropertyEnum.isActive}= :isActive`, { isActive: true })
      .getOne();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('u')
      .select(selectUserProperty)
      .leftJoin(`u.${UserPropertyEnum.userConfirm}`, 'uc')
      .addSelect(selectUserConfirmationProperty)
      .leftJoin(
        `u.${UserPropertyEnum.userRecoveryPasswordSession}`,
        'rps',
        `rps.${UserRecoveryPasswordSessionPropertyEnum.isActive} = true`,
      )
      .addSelect(selectUserRecoveryPasswordSessionProperty)
      .where(`u.${UserPropertyEnum.email} = :email`, { email: email })
      .andWhere(`u.${UserPropertyEnum.isActive}= :isActive`, { isActive: true })
      .getOne();
  }

  async getUserByEmailOrLogin(
    email: string,
    login: string,
    emailOrLogin?: string,
  ): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('u')
      .select(selectUserProperty)
      .leftJoin(`u.${UserPropertyEnum.userConfirm}`, 'uc')
      .addSelect(selectUserConfirmationProperty)
      .where(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where(`${UserPropertyEnum.email} = :email`, {
            email: email || emailOrLogin,
          }).orWhere(`${UserPropertyEnum.login} = :login`, {
            login: login || emailOrLogin,
          });
        }),
      )
      .andWhere(`u.${UserPropertyEnum.isActive}= :isActive`, { isActive: true })
      .getOne();
  }
}
