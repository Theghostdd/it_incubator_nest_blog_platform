import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GameQuestionQueryRepositories } from '../infrastructure/game-question-query-repositories';
import { EntityId } from '../../../../core/decorators/entityId';
import {
  QuestionOutputModel,
  QuestionOutputModelForSwagger,
} from './models/output/question-output.model';
import {
  ApiErrorMessageModel,
  ApiErrorsMessageModel,
  AppResultType,
} from '../../../../base/types/types';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/command/create-question.command';
import {
  QuestionQuery,
  QuestionsInputModel,
  QuestionsPublishInputModel,
  QuestionsUpdateInputModel,
} from './models/input/questions-input.model';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import { BasicGuard } from '../../../../core/guards/basic/basic.guard';
import { DeleteQuestionByIdCommand } from '../application/command/delete-question-by-id.command';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { PublishQuestionByIdCommand } from '../application/command/publish-question-by-id.command';
import { UpdateQuestionByIdCommand } from '../application/command/update-question-by-id.command';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiBasicAuth()
@ApiTags('Super admin - Question for quiz game')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(BasicGuard)
@Controller(apiPrefixSettings.QUIZ_GAME.sa.game_question)
export class QuestionSaController {
  constructor(
    private readonly gameQuestionQueryRepositories: GameQuestionQueryRepositories,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiOperation({
    summary: 'Return all questions with pagination',
  })
  @ApiOkResponse({
    description: 'Success',
    type: QuestionOutputModelForSwagger,
  })
  @Get()
  async getQuestions(
    @Query() query: QuestionQuery,
  ): Promise<BasePagination<QuestionOutputModel[]>> {
    return await this.gameQuestionQueryRepositories.getQuestions(query);
  }

  @ApiCreatedResponse({
    description: 'Return question created output model',
    type: QuestionOutputModel,
  })
  @ApiBadRequestResponse({
    description: 'If input model not correct',
    type: ApiErrorsMessageModel,
  })
  @ApiOperation({
    summary: 'Create and return question model',
  })
  @Post()
  async createQuestion(
    @Body() inputModel: QuestionsInputModel,
  ): Promise<QuestionOutputModel> {
    const createResult: AppResultType<number> = await this.commandBus.execute(
      new CreateQuestionCommand(inputModel),
    );

    switch (createResult.appResult) {
      case AppResult.Success:
        return await this.gameQuestionQueryRepositories.getQuestionById(
          createResult.data,
        );
      case AppResult.BadRequest:
        throw new BadRequestException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiOperation({
    summary: 'Delete the question by id',
  })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({
    description: 'Question was delete',
  })
  @ApiNotFoundResponse({
    description: 'If the question not found',
  })
  @Delete(':id')
  @HttpCode(204)
  async deleteQuestionById(@EntityId() id: number): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new DeleteQuestionByIdCommand(id),
    );

    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiOperation({
    summary: 'Publish/unpublish question by id',
  })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({
    description: 'Question was publish/unpublish',
  })
  @ApiBadRequestResponse({
    description: 'If input model not correct',
    type: ApiErrorsMessageModel,
  })
  @ApiNotFoundResponse({
    description: 'Question not found',
  })
  @Put(`:id/${apiPrefixSettings.QUIZ_GAME.sa.publish}`)
  @HttpCode(204)
  async publishQuestionById(
    @EntityId() id: number,
    @Body() inputModel: QuestionsPublishInputModel,
  ): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new PublishQuestionByIdCommand(id, inputModel),
    );

    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiOperation({
    summary: 'Update question by id',
  })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({
    description: 'Question was update',
  })
  @ApiBadRequestResponse({
    description: 'If input model not correct',
    type: ApiErrorsMessageModel,
  })
  @ApiNotFoundResponse({
    description: 'Question not found',
  })
  @Put(`:id`)
  @HttpCode(204)
  async updateQuestionById(
    @EntityId() id: number,
    @Body() updateModel: QuestionsUpdateInputModel,
  ): Promise<void | ApiErrorMessageModel> {
    const result: AppResultType<null, ApiErrorMessageModel> =
      await this.commandBus.execute(
        new UpdateQuestionByIdCommand(id, updateModel),
      );

    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException();
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }
}
