import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommandBus } from '@nestjs/cqrs';
import { Cron } from '@nestjs/schedule';
import { EndActiveGameCommand } from './command/end-active-game.command';

export class QuizGameService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly commandBus: CommandBus,
  ) {}

  @Cron('*/5 * * * * *')
  async endActiveFinishedGames() {
    await this.commandBus.execute(new EndActiveGameCommand());
  }
}
