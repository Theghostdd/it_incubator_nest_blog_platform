import { Injectable } from '@nestjs/common';
import { TestingRepositories } from '../infrastructure/testing-repositories';

@Injectable()
export class TestingService {
  constructor(private readonly testingRepositories: TestingRepositories) {}

  async clearDb(): Promise<void> {
    await this.testingRepositories.clearDb();
    return;
  }
}
