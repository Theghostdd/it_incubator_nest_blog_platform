import { Injectable, NotFoundException } from '@nestjs/common';
import {
  UserMapperOutputModel,
  UserMeOutputModel,
  UserOutputModel,
} from '../api/models/output/user-output.model';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { UserSortingQuery } from '../api/models/input/user-input.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { tablesName } from '../../../../core/utils/tables/tables';
import { User, UserPropertyEnum } from '../domain/user.entity';

@Injectable()
export class UserQueryRepositories {
  constructor(
    private readonly userMapperOutputModel: UserMapperOutputModel,
    private readonly userSortingQuery: UserSortingQuery,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getUserById(id: number): Promise<UserOutputModel> {
    const result: User = await this.userRepository.findOne({
      where: { id: id, isActive: true },
      select: [
        UserPropertyEnum.id,
        UserPropertyEnum.login,
        UserPropertyEnum.email,
        UserPropertyEnum.createdAt,
      ],
    });
    if (result) {
      return this.userMapperOutputModel.userModel(result);
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
             FROM ${tablesName.USERS}
                 WHERE
                      (
                        CASE
                            WHEN $1 <> '' AND $2 <> '' THEN
                                ("login" ILIKE '%' || $1 || '%')
                                OR
                                ("email" ILIKE '%' || $2 || '%')
                            ELSE
                                ("login" ILIKE '%' || $1 || '%')
                                AND
                                ("email" ILIKE '%' || $2 || '%')
                        END
                    )
                AND "isActive" = ${true}
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
              (
                CASE
                    WHEN $1 <> '' AND $2 <> '' THEN
                        ("login" ILIKE '%' || $1 || '%')
                        OR
                        ("email" ILIKE '%' || $2 || '%')
                    ELSE
                        ("login" ILIKE '%' || $1 || '%')
                        AND
                        ("email" ILIKE '%' || $2 || '%')
                END
            )
        AND "isActive" = ${true}
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $3 OFFSET $4
    `;

    const users: User[] | [] = await this.dataSource.query(queryR, [
      searchLoginTerm,
      searchEmailTerm,
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
        WHERE "id" = $1 AND "isActive" = ${true}
    `;
    const user: User[] | [] = await this.dataSource.query(query, [id]);
    if (user.length <= 0) throw new NotFoundException();
    return this.userMapperOutputModel.currentUserModel(user[0]);
  }
}
