import { Injectable, NotFoundException } from '@nestjs/common';
import {
  UserMapperOutputModel,
  UserMeOutputModel,
  UserOutputModel,
} from '../api/models/output/user-output.model';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { UserSortingQuery } from '../api/models/input/user-input.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { User, UserPropertyEnum } from '../domain/user.entity';

@Injectable()
export class UserQueryRepositories {
  constructor(
    private readonly userMapperOutputModel: UserMapperOutputModel,
    private readonly userSortingQuery: UserSortingQuery,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getUserById(id: number): Promise<UserOutputModel> {
    const user: User = await this.userRepository.findOne({
      where: { [UserPropertyEnum.id]: id, [UserPropertyEnum.isActive]: true },
      select: [
        UserPropertyEnum.id,
        UserPropertyEnum.login,
        UserPropertyEnum.email,
        UserPropertyEnum.createdAt,
      ],
    });
    if (user) {
      return this.userMapperOutputModel.userModel(user);
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

    const skip: number = (pageNumber - 1) * pageSize;

    const users: [User[] | [], number] = await this.userRepository
      .createQueryBuilder('u')
      .select([
        `u.${UserPropertyEnum.id}`,
        `u.${UserPropertyEnum.email}`,
        `u.${UserPropertyEnum.login}`,
        `u.${UserPropertyEnum.createdAt}`,
      ])
      .where(
        new Brackets((qb: WhereExpressionBuilder) => {
          if (searchLoginTerm && searchEmailTerm) {
            qb.where(`u.${UserPropertyEnum.login} ILIKE :login`, {
              login: `%${searchLoginTerm}%`,
            }).orWhere(`u.${UserPropertyEnum.email} ILIKE :email`, {
              email: `%${searchEmailTerm}%`,
            });
          } else {
            qb.where(`u.${UserPropertyEnum.login} ILIKE :login`, {
              login: `%${searchLoginTerm || ''}%`,
            }).andWhere(`u.${UserPropertyEnum.email} ILIKE :email`, {
              email: `%${searchEmailTerm || ''}%`,
            });
          }
        }),
      )
      .andWhere({ [UserPropertyEnum.isActive]: true })
      .orderBy(`"${sortBy}"`, sortDirection as 'ASC' | 'DESC')
      .limit(pageSize)
      .offset(skip)
      .getManyAndCount();

    const totalCount: number = users[1];
    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: +pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items:
        users[0].length > 0
          ? this.userMapperOutputModel.usersModel(users[0])
          : [],
    };
  }

  async getUserByIdAuthMe(id: number): Promise<UserMeOutputModel> {
    const user: User = await this.userRepository.findOne({
      where: { [UserPropertyEnum.id]: id, [UserPropertyEnum.isActive]: true },
      select: [
        UserPropertyEnum.id,
        UserPropertyEnum.login,
        UserPropertyEnum.email,
        UserPropertyEnum.createdAt,
      ],
    });
    if (!user) throw new NotFoundException('User not found');
    return this.userMapperOutputModel.currentUserModel(user);
  }
}
