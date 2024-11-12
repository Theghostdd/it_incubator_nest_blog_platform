import { Cron } from '@nestjs/schedule';
import { EndActiveGameCommand } from '../../src/features/quiz-game/game/application/command/end-active-game.command';
import { CommandBus } from '@nestjs/cqrs';

export class QuizGameServiceMock {
  async endActiveFinishedGames() {
    return;
  }
}

export class QuizGameServiceMockWithCrone {
  constructor(private readonly commandBus: CommandBus) {}
  @Cron('*/5 * * * * *')
  async endActiveFinishedGames() {
    await this.commandBus.execute(new EndActiveGameCommand());
  }
}
