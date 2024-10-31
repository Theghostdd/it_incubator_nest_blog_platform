import { QuestionsUpdateInputModel } from '../../api/models/input/questions-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ApiErrorMessageModel,
  AppResultType,
} from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { GameQuestionRepository } from '../../infrastructure/game-question-repositories';
import { QuizQuestions } from '../../domain/questions.entity';
import { QuizQuestionAnswer } from '../../../question-answer/domain/question-answer.entity';

export class UpdateQuestionByIdCommand {
  constructor(
    public id: number,
    public updateQuestionInputModel: QuestionsUpdateInputModel,
  ) {}
}

@CommandHandler(UpdateQuestionByIdCommand)
export class UpdateQuestionByIdHandler
  implements
    ICommandHandler<
      UpdateQuestionByIdCommand,
      AppResultType<null, ApiErrorMessageModel>
    >
{
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly gameQuestionRepository: GameQuestionRepository,
  ) {}
  async execute(
    command: UpdateQuestionByIdCommand,
  ): Promise<AppResultType<null, ApiErrorMessageModel>> {
    const question: QuizQuestions =
      await this.gameQuestionRepository.getQuestionById(command.id);

    if (!question) return this.applicationObjectResult.notFound();

    if (question.published)
      return this.applicationObjectResult.badRequest({
        message: 'Question was publish',
        field: 'published',
      });

    const pastAnswers: QuizQuestionAnswer[] = question.answers;
    question.updateQuestion(command.updateQuestionInputModel);

    const result: boolean = await this.gameQuestionRepository.updateQuestion(
      question,
      pastAnswers,
    );

    if (!result) return this.applicationObjectResult.internalServerError();
    return this.applicationObjectResult.success(null);
  }
}
