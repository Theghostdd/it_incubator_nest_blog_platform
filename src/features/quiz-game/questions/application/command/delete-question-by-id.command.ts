import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { GameQuestionRepository } from '../../infrastructure/game-question-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { QuizQuestions } from '../../domain/questions.entity';

export class DeleteQuestionByIdCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeleteQuestionByIdCommand)
export class DeleteQuestionByIdHandler
  implements ICommandHandler<DeleteQuestionByIdCommand, AppResultType>
{
  constructor(
    private readonly gameQuestionRepository: GameQuestionRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}
  async execute(command: DeleteQuestionByIdCommand): Promise<AppResultType> {
    const { id: questionId } = command;
    const question: QuizQuestions | null =
      await this.gameQuestionRepository.getQuestionById(questionId);

    if (!question) return this.applicationObjectResult.notFound();
    const result: boolean =
      await this.gameQuestionRepository.deleteQuestion(question);
    if (!result) return this.applicationObjectResult.internalServerError();
    return this.applicationObjectResult.success(null);
  }
}
