import { IUserCreateTestModel } from '../../models/user/interfaces';

export interface IUserTestManager {
  createUser: (
    userModel: IUserCreateTestModel,
    authorizationToken: string,
    statusCode: number,
  ) => void;
}
