import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { QuizGameAnswerQuestionInputModel } from '../../api/models/input/quiz-game-input.model';
import { QuizGameRepositories } from '../../infrastructure/quiz-game-repositories';
import { QuizGame } from '../../domain/quiz-game.entity';
import { QuizGamePlayer } from '../../../player/domain/quiz-game-player.entity';
import { CheckOrCreatePlayerByUserIdCommand } from '../../../player/application/command/check-or-create-player.command';
import { QuizGameStatusEnum } from '../../domain/types';
import { GameUserAnswer } from '../../../game-answer/domain/game-user-answer.entity';
import { Inject } from '@nestjs/common';
import { GamePlayers } from '../../../game-player/domain/game-players.entity';
import { GamePlayerAnswerRepositories } from '../../../game-answer/infrastructure/game-player-answer-repositories';

export class AnswerForQuestionCommand {
  constructor(
    public inputModel: QuizGameAnswerQuestionInputModel,
    public userId: number,
  ) {}
}

@CommandHandler(AnswerForQuestionCommand)
export class AnswerForQuestionHandler
  implements ICommandHandler<AnswerForQuestionCommand, AppResultType<number>>
{
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly quizGameRepositories: QuizGameRepositories,
    private readonly commandBus: CommandBus,
    @Inject(GameUserAnswer.name)
    private readonly gameUserAnswer: typeof GameUserAnswer,
    private readonly gamePlayerAnswerRepositories: GamePlayerAnswerRepositories,
  ) {}
  async execute(
    command: AnswerForQuestionCommand,
  ): Promise<AppResultType<number>> {
    const { answer: playerAnswer } = command.inputModel;
    const { userId } = command;

    const player: AppResultType<QuizGamePlayer> = await this.commandBus.execute(
      new CheckOrCreatePlayerByUserIdCommand(userId),
    );
    const game: QuizGame | null =
      await this.quizGameRepositories.getCurrentPlayerGame(player.data.id);

    if (!game) return this.applicationObjectResult.forbidden();
    if (game.status === QuizGameStatusEnum.Finished)
      return this.applicationObjectResult.forbidden();

    const gameWithAnswers: QuizGame | null =
      await this.quizGameRepositories.getCurrentPlayerGameByIdWithAnswers(
        game.id,
      );

    const currentPlayerAnswers: GameUserAnswer[] =
      gameWithAnswers.gamePlayers.find(
        (p: GamePlayers): boolean => p.playerId === player.data.id,
      ).player.userAnswers;

    const secondPlayerAnswers: GameUserAnswer[] =
      gameWithAnswers.gamePlayers.find(
        (p: GamePlayers): boolean => p.playerId !== player.data.id,
      ).player.userAnswers;

    const answer: GameUserAnswer = this.gameUserAnswer.createAnswer(
      playerAnswer,
      currentPlayerAnswers,
      secondPlayerAnswers,
      gameWithAnswers.gameQuestions,
      player.data,
    );

    const result: number = await this.gamePlayerAnswerRepositories.save(answer);
    return this.applicationObjectResult.success(result);
  }
}
