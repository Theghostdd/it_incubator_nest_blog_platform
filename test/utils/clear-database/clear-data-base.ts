import { AnyObject, Connection, InsertManyResult } from 'mongoose';
import { IInsertResult } from './interfaces';

export class DataBase {
  constructor(private readonly databaseConnection: Connection) {
    this.databaseConnection = databaseConnection;
  }
  async clearDatabase(): Promise<void> {
    await Promise.all([this.databaseConnection.dropDatabase()]);
  }

  async dbConnectionClose(): Promise<void> {
    await this.databaseConnection.close();
  }

  async dbInsertOne<T>(collection: string, data: T): Promise<IInsertResult> {
    return this.databaseConnection.collection(collection).insertOne(data);
  }

  async dbInsertMany<T>(
    collection: string,
    data: T[],
  ): Promise<InsertManyResult<any>> {
    return this.databaseConnection.collection(collection).insertMany(data);
  }

  async dbFindOne<T>(collection: string, filter: T): Promise<AnyObject> {
    return this.databaseConnection.collection(collection).findOne(filter);
  }

  async dbFindAll<T>(collection: string, filter?: T): Promise<AnyObject> {
    return this.databaseConnection
      .collection(collection)
      .find(filter)
      .toArray();
  }
}
