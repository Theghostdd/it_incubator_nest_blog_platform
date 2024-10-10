import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  Repository,
  WhereExpressionBuilder,
} from 'typeorm';
import {
  selectUserRecoveryPasswordSessionProperty,
  UserRecoveryPasswordSessionPropertyEnum,
} from '../../../access-control/auth/domain/types';
import {
  selectUserConfirmationProperty,
  selectUserProperty,
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

  async save(user: User): Promise<number> {
    const userEntity: User = await this.userRepository.save(user);
    return userEntity.id;
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('u')
      .select(selectUserProperty)
      .addSelect(selectUserConfirmationProperty)
      .leftJoin(`u.${UserPropertyEnum.userConfirm}`, 'uc')
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
