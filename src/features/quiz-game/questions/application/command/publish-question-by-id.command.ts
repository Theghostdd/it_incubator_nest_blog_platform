import { QuestionsPublishInputModel } from '../../api/models/input/questions-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { QuizQuestions } from '../../domain/questions.entity';
import { GameQuestionRepository } from '../../infrastructure/game-question-repositories';

export class PublishQuestionByIdCommand {
  constructor(
    public id: number,
    public questionsPublishInputModel: QuestionsPublishInputModel,
  ) {}
}

@CommandHandler(PublishQuestionByIdCommand)
export class PublishQuestionByIdHandler
  implements ICommandHandler<PublishQuestionByIdCommand, AppResultType>
{
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly gameQuestionRepository: GameQuestionRepository,
  ) {}

  async execute(command: PublishQuestionByIdCommand): Promise<AppResultType> {
    const { published } = command.questionsPublishInputModel;

    const question: QuizQuestions | null =
      await this.gameQuestionRepository.getQuestionById(command.id);
    if (!question) return this.applicationObjectResult.notFound();

    question.publishQuestion(published);

    const result: number | null =
      await this.gameQuestionRepository.save(question);

    if (!result) return this.applicationObjectResult.internalServerError();
    return this.applicationObjectResult.success(null);
  }
}
