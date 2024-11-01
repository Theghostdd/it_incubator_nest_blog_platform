import { Module } from '@nestjs/common';
import { GameQuestionQueryRepositories } from './questions/infrastructure/game-question-query-repositories';
import { QuestionMapperOutputModel } from './questions/api/models/output/question-output.model';
import { QuestionSaController } from './questions/api/question-sa.controller';
import { QuizQuestions } from './questions/domain/questions.entity';
import { CreateQuestionCommandHandler } from './questions/application/command/create-question.command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizQuestionAnswer } from './question-answer/domain/question-answer.entity';
import { GameQuestionRepository } from './questions/infrastructure/game-question-repositories';
import { DeleteQuestionByIdHandler } from './questions/application/command/delete-question-by-id.command';
import { QuestionQuery } from './questions/api/models/input/questions-input.model';
import { PublishQuestionByIdHandler } from './questions/application/command/publish-question-by-id.command';
import { UpdateQuestionByIdHandler } from './questions/application/command/update-question-by-id.command';
import { GameQuestions } from './game-questions/domain/game-questions.entity';
import { QuizGame } from './game/domain/quiz-game.entity';
import { QuizGamePlayer } from './player/domain/quiz-game-player.entity';
import { ConnectToPairGameHandler } from './game/application/command/connect-to-pair.command';
import { QuizGameRepositories } from './game/infrastructure/quiz-game-repositories';
import { GamePlayers } from './game-player/domain/game-players.entity';
import { QuizGameController } from './game/api/quiz-game-controller';
import { PlayerRepository } from './player/infrastructure/player-repositories';
import { CheckOrCreatePlayerByUserIdHandler } from './player/application/command/check-or-create-player.command';
import { UsersModule } from '../users/users.module';
import { CreatePlayerHandler } from './player/application/command/create-player.command';
import { QuizGameMapperOutputModel } from './game/api/models/output/quiz-game-output.models';
import { QuizGameQueryRepository } from './game/infrastructure/quiz-game-query-repositories';
import { GameUserAnswer } from './game-answer/domain/game-user-answer.entity';
import { AnswerForQuestionHandler } from './game/application/command/answer-for-question.command';
import { GamePlayerAnswerRepositories } from './game-answer/infrastructure/game-player-answer-repositories';
import { GamePlayerAnswerQueryRepository } from './game-answer/infrastructure/game-player-answer-query-repositories';
import { GamPlayerAnswerOutputModelMapper } from './game-answer/api/model/output/gam-player-answer-output.model';

const QuizQuestionProvider = {
  provide: 'QuizQuestions',
  useValue: QuizQuestions,
};

const QuizGameProvider = {
  provide: 'QuizGame',
  useValue: QuizGame,
};

const QuizGamePlayerProvider = {
  provide: 'QuizGamePlayer',
  useValue: QuizGamePlayer,
};

const QuizGameUserAnswerProvider = {
  provide: 'GameUserAnswer',
  useValue: GameUserAnswer,
};

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      QuizGame,
      QuizGamePlayer,
      QuizQuestions,
      QuizQuestionAnswer,
      GameQuestions,
      GamePlayers,
      GameUserAnswer,
    ]),
  ],
  controllers: [QuestionSaController, QuizGameController],
  providers: [
    GameQuestionQueryRepositories,
    QuestionMapperOutputModel,
    QuizQuestionProvider,
    CreateQuestionCommandHandler,
    GameQuestionRepository,
    DeleteQuestionByIdHandler,
    QuestionQuery,
    PublishQuestionByIdHandler,
    UpdateQuestionByIdHandler,
    ConnectToPairGameHandler,
    QuizGameProvider,
    QuizGamePlayerProvider,
    QuizGameUserAnswerProvider,
    QuizGameRepositories,
    PlayerRepository,
    CheckOrCreatePlayerByUserIdHandler,
    CreatePlayerHandler,
    QuizGameMapperOutputModel,
    QuizGameQueryRepository,
    AnswerForQuestionHandler,
    GamePlayerAnswerRepositories,
    GamePlayerAnswerQueryRepository,
    GamPlayerAnswerOutputModelMapper,
  ],
})
export class QuizGameModule {}
