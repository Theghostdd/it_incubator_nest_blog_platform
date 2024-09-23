import { Injectable } from '@nestjs/common';
import { User, UserJoinType, UserType } from '../domain/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { tablesName } from '../../../../core/utils/tables/tables';

@Injectable()
export class UserRepositories {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async save(user: User): Promise<number> {
    const query = `
      WITH inserted_user AS ( 
          INSERT INTO ${tablesName.USERS} ("login", "email", "password", "createdAt", "isActive")
          VALUES ($1, $2, $3, $4, $5)
      RETURNING "id" as createdUserId
      )
      INSERT INTO ${tablesName.USERS_CONFIRMATION} ("userId", "isConfirm", "confirmationCode", "dataExpire")
      SELECT createdUserId, $6, $7, $8
      FROM inserted_user
      RETURNING "userId"
    `;

    const result: { userId: number }[] = await this.dataSource.query(query, [
      user.login,
      user.email,
      user.password,
      user.createdAt,
      user.isActive,
      user.userConfirm.isConfirm,
      user.userConfirm.confirmationCode,
      user.userConfirm.dataExpire,
    ]);
    return result[0].userId;
  }

  async delete(userId: number): Promise<void> {
    const query = `
      UPDATE ${tablesName.USERS}
      SET "isActive" = $1
      WHERE id = $2
    `;
    await this.dataSource.query(query, [false, userId]);
  }

  async getUserById(id: number): Promise<UserType | null> {
    const query = `
    SELECT 
        u."id", u."login", u."email", u."password",
        uc."isConfirm", uc."confirmationCode", uc."dataExpire" 
    FROM ${tablesName.USERS} as u
        LEFT JOIN ${tablesName.USERS_CONFIRMATION} as uc
        ON u."id" = uc."userId"
    WHERE u."id" = $1 AND u."isActive" = true
    `;
    const result = await this.dataSource.query(query, [id]);
    if (result.length > 0) {
      return this.mapResultUser(result);
    }
    return null;
  }

  async getUserByConfirmCode(code: string): Promise<UserType | null> {
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
      return this.mapResultUser(result);
    }
    return null;
  }

  async getUserByEmail(email: string): Promise<UserType | null> {
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
      return this.mapResultUser(result);
    }
    return null;
  }

  async getUserByEmailOrLogin(
    email: string,
    login: string,
    emailOrLogin?: string,
  ): Promise<UserType | null> {
    const query = `
    SELECT 
      u."id", u."login", u."email", u."password",
      uc."isConfirm", uc."confirmationCode", uc."dataExpire" 
    FROM ${tablesName.USERS} as u
        LEFT JOIN ${tablesName.USERS_CONFIRMATION} as uc
        ON u."id" = uc."userId"
    WHERE u."email" = $1 OR u."login" = $2 AND u."isActive" = true
    `;

    const result: UserJoinType[] | [] = await this.dataSource.query(query, [
      email || emailOrLogin,
      login || emailOrLogin,
    ]);

    if (result.length > 0) {
      return this.mapResultUser(result);
    }
    return null;
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

  mapResultUser(users: UserJoinType[]): UserType {
    const user = users.map((u: UserJoinType) => {
      return {
        id: u.id,
        login: u.login,
        email: u.email,
        password: u.password,
        createdAt: u.createdAt,
        userConfirm: {
          isConfirm: u.isConfirm,
          confirmationCode: u.confirmationCode,
          dataExpire: u.dataExpire,
        },
      };
    });
    return user[0];
  }
}
