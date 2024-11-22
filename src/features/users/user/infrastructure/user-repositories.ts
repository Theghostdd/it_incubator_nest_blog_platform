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
    const userEntity: User = await this.userRepository.save(user);
    return userEntity.id;
  }

  async getUserById(
    id: number,
    queryRunner?: QueryRunner,
  ): Promise<User | null> {
    if (queryRunner) {
      const user: User | null = await this.userRepository
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

      if (!user) return null;

      await queryRunner.manager
        .createQueryBuilder(this.userRepository.target, 'u')
        .setLock('pessimistic_write')
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
