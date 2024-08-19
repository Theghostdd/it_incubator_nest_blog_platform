import { Injectable, NotFoundException } from '@nestjs/common';
import {
  UserMapperOutputModel,
  UserMeOutputModel,
  UserOutputModel,
} from '../api/models/output/user-output.model';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocumentType, UserModelType } from '../domain/user.entity';
import { BasePagination } from '../../../base/pagination/base-pagination';
import { UserSortingQuery } from '../api/models/input/user-input.model';
import { SortOrder } from 'mongoose';

@Injectable()
export class UserQueryRepositories {
  constructor(
    private readonly userMapperOutputModel: UserMapperOutputModel,
    private readonly userSortingQuery: UserSortingQuery,
    @InjectModel(User.name) private readonly userModel: UserModelType,
  ) {}

  async getUserById(id: string): Promise<UserOutputModel> {
    const result: UserDocumentType | null = await this.userModel.findById(id);
    if (result) {
      return this.userMapperOutputModel.userModel(result);
    }
    throw new NotFoundException('User not found');
  }

  async getUsers(
    query: UserSortingQuery,
  ): Promise<BasePagination<UserOutputModel[] | []>> {
    const {
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
      pageSize,
      pageNumber,
    } = this.userSortingQuery.createUserQuery(query);

    const sort: { [key: string]: SortOrder } = {
      [sortBy]: sortDirection as SortOrder,
    };

    const filter = {
      $or: [
        { login: { $regex: searchLoginTerm, $options: 'i' } },
        { email: { $regex: searchEmailTerm, $options: 'i' } },
      ],
    };

    const getTotalDocument: number =
      await this.userModel.countDocuments(filter);
    const totalCount: number = getTotalDocument;
    const pagesCount: number = Math.ceil(totalCount / pageSize);
    const skip: number = (pageNumber - 1) * pageSize;

    const users: UserDocumentType[] | [] = await this.userModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize!);

    return {
      pagesCount: +pagesCount,
      page: +pageNumber!,
      pageSize: +pageSize!,
      totalCount: +totalCount,
      items:
        users.length > 0 ? this.userMapperOutputModel.usersModel(users) : [],
    };
  }

  async getUserByIdAuthMe(id: string): Promise<UserMeOutputModel> {
    console.log('id', id);
    const user: UserDocumentType | null = await this.userModel.findOne({
      _id: id,
    });
    if (!user) throw new NotFoundException();

    return this.userMapperOutputModel.currentUserModel(user);
  }
}
