import { Injectable, NotFoundException } from '@nestjs/common';
import {
  UserMapperOutputModel,
  UserMeOutputModel,
  UserOutputModel,
} from '../api/models/output/user-output.model';
import { UserType } from '../domain/user.entity';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { UserSortingQuery } from '../api/models/input/user-input.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { tablesName } from '../../../../core/utils/tables/tables';

@Injectable()
export class UserQueryRepositories {
  constructor(
    private readonly userMapperOutputModel: UserMapperOutputModel,
    private readonly userSortingQuery: UserSortingQuery,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getUserById(id: number): Promise<UserOutputModel> {
    const query = `
    SELECT 
      "id", "login", "email", "createdAt"
    FROM "${tablesName.USERS}"
    WHERE "id" = $1 AND "isActive" = true
    `;
    const result: UserType[] | [] = await this.dataSource.query(query, [id]);
    if (result.length > 0) {
      return this.userMapperOutputModel.userModel(result[0]);
    }
    throw new NotFoundException('User not found');
  }

  async getUsers(
    query?: UserSortingQuery,
  ): Promise<BasePagination<UserOutputModel[] | []>> {
    const {
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
      pageSize,
      pageNumber,
    } = this.userSortingQuery.createUserQuery(query);

    const getTotalDocument: { count: number }[] = await this.dataSource.query(
      `SELECT COUNT(*) 
             FROM "${tablesName.USERS}"
                WHERE
                    ("login" ILIKE '%' || $1 || '%' OR $1 IS NULL) 
                AND 
                    ("email" ILIKE '%' || $2 || '%' OR $2 IS NULL) 
                AND "isActive" = true
    `,
      [searchLoginTerm, searchEmailTerm],
    );
    const totalCount: number = getTotalDocument[0].count;
    const pagesCount: number = Math.ceil(totalCount / pageSize);
    const skip: number = (pageNumber - 1) * pageSize;

    const queryR = `
      SELECT "id", "login", "email", "createdAt"
      FROM ${tablesName.USERS}
      WHERE 
          ("login" ILIKE '%' || $1 || '%' OR $1 IS NULL) 
          AND 
          ("email" ILIKE '%' || $2 || '%' OR $2 IS NULL) 
          AND "isActive" = true
      ORDER BY $3 ${sortDirection}
      LIMIT $4 OFFSET $5;
    `;

    const users: UserType[] | [] = await this.dataSource.query(queryR, [
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      pageSize,
      skip,
    ]);

    return {
      pagesCount: +pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items:
        users.length > 0 ? this.userMapperOutputModel.usersModel(users) : [],
    };
  }

  async getUserByIdAuthMe(id: number): Promise<UserMeOutputModel> {
    const query = `
        SELECT "id", "login", "email"
        FROM ${tablesName.USERS}
        WHERE "id" = $1 AND "isActive" = true
    `;
    const user: UserType[] | [] = await this.dataSource.query(query, [id]);
    if (user.length <= 0) throw new NotFoundException();
    return this.userMapperOutputModel.currentUserModel(user[0]);
  }
}
