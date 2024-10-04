import { Injectable } from '@nestjs/common';
import {
  selectUserProperty,
  User,
  UserPropertyEnum,
} from '../domain/user.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  Repository,
  WhereExpressionBuilder,
} from 'typeorm';
import { tablesName } from '../../../../core/utils/tables/tables';
import {
  selectUserConfirmationProperty,
  UserConfirmation,
} from '../domain/user-confirm.entity';

@Injectable()
export class UserRepositories {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserConfirmation)
    private readonly userConfirmationRepository: Repository<UserConfirmation>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async save(user: User): Promise<number> {
    const newUser: User = await this.userRepository.save(user);
    return newUser.id;
  }

  // async delete(userId: number): Promise<void> {
  //   const query = `
  //     UPDATE ${tablesName.USERS}
  //     SET "isActive" = $1
  //     WHERE id = $2
  //   `;
  //   await this.dataSource.query(query, [false, userId]);
  // }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: id, isActive: true },
    });
  }

  async getUserByConfirmCode(code: string): Promise<User | null> {
    const query = `
    SELECT 
      u."id", u."login", u."email", u."password",
      uc."isConfirm", uc."confirmationCode", uc."dataExpire" 
    FROM ${tablesName.USERS_CONFIRMATION} as uc
        LEFT JOIN ${tablesName.USERS} as u
        ON uc."userId" = u."id"
    WHERE uc."confirmationCode" = $1 AND u."isActive" = true
    `;
    const result = await this.dataSource.query(query, [code]);
    if (result.length > 0) {
      //return this.mapResultUser(result);
    }
    return null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = `
    SELECT 
    u."id", u."login", u."email", u."password",
    uc."isConfirm", uc."confirmationCode", uc."dataExpire" 
    FROM ${tablesName.USERS} as u
        LEFT JOIN ${tablesName.USERS_CONFIRMATION} as uc
        ON u."id" = uc."userId"
    WHERE u."email" = $1 AND u."isActive" = true
    `;
    const result = await this.dataSource.query(query, [email]);
    if (result.length > 0) {
      //return this.mapResultUser(result);
    }
    return null;
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
          qb.where('email = :email', { email: email || emailOrLogin }).orWhere(
            'login = :login',
            {
              login: login || emailOrLogin,
            },
          );
        }),
      )
      .andWhere({ isActive: true })
      .getOne();
  }

  async confirmUserEmailByUserId(userId: number): Promise<void> {
    const query = `
    UPDATE ${tablesName.USERS_CONFIRMATION}
      SET "isConfirm"=true
      WHERE "userId" = $1;
    `;
    await this.dataSource.query(query, [userId]);
  }

  async updateConfirmationCodeByUserId(
    code: string,
    dataExpire: string,
    userId: number,
  ): Promise<void> {
    const query = `
    UPDATE ${tablesName.USERS_CONFIRMATION}
      SET "confirmationCode"=$1, "dataExpire"=$2
      WHERE "userId" = $3;
    `;
    await this.dataSource.query(query, [code, dataExpire, userId]);
  }

  async updateUserPasswordByUserId(
    userId: number,
    hash: string,
  ): Promise<void> {
    const query = `
    UPDATE ${tablesName.USERS}
      SET "password"=$1
      WHERE "id" = $2;
    `;
    await this.dataSource.query(query, [hash, userId]);
  }

  // mapResultUser(users: User[]): User {
  //   const user = users.map((u: User) => {
  //     return {
  //       id: u.id,
  //       login: u.login,
  //       email: u.email,
  //       password: u.password,
  //       createdAt: u.createdAt,
  //       userConfirm: {
  //         isConfirm: u.isConfirm,
  //         confirmationCode: u.confirmationCode,
  //         dataExpire: u.dataExpire,
  //       },
  //     };
  //   });
  //   // @ts-ignore
  //   return user[0];
  // }
}
