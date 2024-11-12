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
import { Player } from './player/domain/quiz-game-player.entity';
import { ConnectToPairGameHandler } from './game/application/command/connect-to-pair.command';
import { QuizGameRepositories } from './game/infrastructure/quiz-game-repositories';
import { GamePlayers } from './game-player/domain/game-players.entity';
import { QuizGameController } from './game/api/quiz-game-controller';
import { PlayerRepository } from './player/infrastructure/player-repositories';
import { UsersModule } from '../users/users.module';
import { QuizGameMapperOutputModel } from './game/api/models/output/quiz-game-output.models';
import { QuizGameQueryRepository } from './game/infrastructure/quiz-game-query-repositories';
import { GameUserAnswer } from './game-answer/domain/game-user-answer.entity';
import { AnswerForQuestionHandler } from './game/application/command/answer-for-question.command';
import { GamePlayerAnswerQueryRepository } from './game-answer/infrastructure/game-player-answer-query-repositories';
import { GamPlayerAnswerOutputModelMapper } from './game-answer/api/model/output/gam-player-answer-output.model';
import {
  QuizGameQuery,
  QuizTopGamePlayersQuery,
} from './game/api/models/input/quiz-game-input.model';
import { EndActiveGameHandler } from './game/application/command/end-active-game.command';
import { QuizGameService } from './game/application/quiz-game-service';

const QuizQuestionProvider = {
  provide: 'QuizQuestions',
  useValue: QuizQuestions,
};

const QuizGameProvider = {
  provide: 'QuizGame',
  useValue: QuizGame,
};

const QuizGamePlayerProvider = {
  provide: 'Player',
  useValue: Player,
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
      Player,
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
    QuizGameMapperOutputModel,
    QuizGameQueryRepository,
    AnswerForQuestionHandler,
    GamePlayerAnswerQueryRepository,
    GamPlayerAnswerOutputModelMapper,
    QuizGameQuery,
    QuizTopGamePlayersQuery,
    EndActiveGameHandler,
    QuizGameService,
  ],
})
export class QuizGameModule {}
