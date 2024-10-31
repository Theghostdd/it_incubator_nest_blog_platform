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

const QuizQuestionProvider = {
  provide: 'QuizQuestions',
  useValue: QuizQuestions,
};
@Module({
  imports: [TypeOrmModule.forFeature([QuizQuestions, QuizQuestionAnswer])],
  controllers: [QuestionSaController],
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
  ],
})
export class QuizGameModule {}
