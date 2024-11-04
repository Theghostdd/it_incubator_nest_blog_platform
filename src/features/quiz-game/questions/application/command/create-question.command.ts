import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsInputModel } from '../../api/models/input/questions-input.model';
import { QuizQuestions } from '../../domain/questions.entity';
import { Inject } from '@nestjs/common';
import { GameQuestionRepository } from '../../infrastructure/game-question-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResultType } from '../../../../../base/types/types';

export class CreateQuestionCommand {
  constructor(public questionsInputModel: QuestionsInputModel) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionCommandHandler
  implements ICommandHandler<CreateQuestionCommand, AppResultType<number>>
{
  constructor(
    @Inject(QuizQuestions.name)
    private readonly quizQuestionsEntity: typeof QuizQuestions,
    private readonly gameQuestionRepository: GameQuestionRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}
  async execute(
    command: CreateQuestionCommand,
  ): Promise<AppResultType<number>> {
    const question: QuizQuestions = this.quizQuestionsEntity.createQuestion(
      command.questionsInputModel,
    );

    const result: number = await this.gameQuestionRepository.save(question);
    if (!result) this.applicationObjectResult.internalServerError();
    return this.applicationObjectResult.success(result);
  }
}
