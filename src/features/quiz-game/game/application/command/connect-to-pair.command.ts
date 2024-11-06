import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { Inject } from '@nestjs/common';
import { QuizGame } from '../../domain/quiz-game.entity';
import { QuizGameRepositories } from '../../infrastructure/quiz-game-repositories';
import { Player } from '../../../player/domain/quiz-game-player.entity';
import { GameQuestionRepository } from '../../../questions/infrastructure/game-question-repositories';
import { QuizQuestions } from '../../../questions/domain/questions.entity';
import { PlayerRepository } from '../../../player/infrastructure/player-repositories';

export class ConnectToPairGameCommand {
  constructor(public userId: number) {}
}

@CommandHandler(ConnectToPairGameCommand)
export class ConnectToPairGameHandler
  implements ICommandHandler<ConnectToPairGameCommand, AppResultType<number>>
{
  constructor(
    @Inject(QuizGame.name) private readonly quizGameEntity: typeof QuizGame,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly quizGameRepositories: QuizGameRepositories,
    private readonly gameQuestionRepository: GameQuestionRepository,
    private readonly playerRepository: PlayerRepository,
  ) {}
  async execute(
    command: ConnectToPairGameCommand,
  ): Promise<AppResultType<number>> {
    const { userId } = command;

    const player: Player =
      await this.playerRepository.getPlayerByUserId(userId);

    const currentPlayerGame: QuizGame | null =
      await this.quizGameRepositories.getCurrentGame(player.id);

    if (currentPlayerGame) return this.applicationObjectResult.forbidden();

    const randomQuestions: QuizQuestions[] | [] =
      await this.gameQuestionRepository.getFiveRandomQuestions();
    if (!randomQuestions || randomQuestions.length < 5)
      return this.applicationObjectResult.internalServerError();

    const pendingGame: QuizGame | null =
      await this.quizGameRepositories.getRandomPendingGame();
    if (!pendingGame) {
      const newGame: QuizGame = this.quizGameEntity.createGame(player);
      const result: number = await this.quizGameRepositories.save(newGame);
      return this.applicationObjectResult.success(result);
    }

    pendingGame.connectToGame(player, randomQuestions);

    const result: number = await this.quizGameRepositories.save(pendingGame);
    return this.applicationObjectResult.success(result);
  }
}
