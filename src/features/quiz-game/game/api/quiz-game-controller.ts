import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectToPairGameCommand } from '../application/command/connect-to-pair.command';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import { QuizGameQueryRepository } from '../infrastructure/quiz-game-query-repositories';
import { EntityId } from '../../../../core/decorators/entityId';
import {
  ApiErrorsMessageModel,
  AppResultType,
  JWTAccessTokenPayloadType,
} from '../../../../base/types/types';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { AuthJWTAccessGuard } from '../../../../core/guards/jwt/jwt.guard';
import { CurrentUser } from '../../../../core/decorators/current-user';
import {
  QuizGameOutputModel,
  QuizGameOutputModelForSwagger,
  QuizGameStatisticModel,
} from './models/output/quiz-game-output.models';
import {
  QuizGameAnswerQuestionInputModel,
  QuizGameQuery,
} from './models/input/quiz-game-input.model';
import { AnswerForQuestionCommand } from '../application/command/answer-for-question.command';
import { GamPlayerAnswerOutputModel } from '../../game-answer/api/model/output/gam-player-answer-output.model';
import { GamePlayerAnswerQueryRepository } from '../../game-answer/infrastructure/game-player-answer-query-repositories';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BasePagination } from '../../../../base/pagination/base-pagination';

@ApiTags('Quiz game')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller(apiPrefixSettings.QUIZ_GAME.public.pair_game_quiz)
@UseGuards(AuthJWTAccessGuard)
export class QuizGameController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly quizGameQueryRepository: QuizGameQueryRepository,
    private readonly gamePlayerAnswerQueryRepository: GamePlayerAnswerQueryRepository,
  ) {}

  @ApiOkResponse({
    description: 'Return current user game',
    type: QuizGameOutputModel,
  })
  @ApiNotFoundResponse({
    description: 'If game does not exist',
  })
  @ApiOperation({
    summary: 'Get current user game',
  })
  @Get(
    `${apiPrefixSettings.QUIZ_GAME.public.pairs}/${apiPrefixSettings.QUIZ_GAME.public.my_current}`,
  )
  async getGameCurrentUser(
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<QuizGameOutputModel> {
    return this.quizGameQueryRepository.getGameCurrentUser(user.userId);
  }

  @ApiOkResponse({
    description: 'Return games current player with pagination',
    type: QuizGameOutputModelForSwagger,
  })
  @ApiOperation({
    summary: 'Get all current player game, closed and current',
  })
  @Get(
    `${apiPrefixSettings.QUIZ_GAME.public.pairs}/${apiPrefixSettings.QUIZ_GAME.public.my}`,
  )
  async getAllGamesCurrentUser(
    @Query() query: QuizGameQuery,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<BasePagination<QuizGameOutputModel[] | []>> {
    return await this.quizGameQueryRepository.getAllCurrentPlayerGames(
      user.userId,
      query,
    );
  }

  @ApiOkResponse({
    description: 'Return current user statistic',
    type: QuizGameStatisticModel,
  })
  @ApiOperation({
    summary: 'Get statistic current player user',
  })
  @Get(
    `${apiPrefixSettings.QUIZ_GAME.public.users}/${apiPrefixSettings.QUIZ_GAME.public.my_statistic}`,
  )
  async getStatisticCurrentUser(
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<QuizGameStatisticModel | []> {
    return [];
  }

  @ApiOkResponse({
    description: 'Return game by id',
    type: QuizGameOutputModel,
  })
  @ApiNotFoundResponse({
    description: 'If game does not exist',
  })
  @ApiForbiddenResponse({
    description:
      'If current user tries to get pair in which user is not participant',
  })
  @ApiBadRequestResponse({
    description: 'If id is not correct',
    type: ApiErrorsMessageModel,
  })
  @ApiOperation({
    summary: 'Get game by id',
  })
  @ApiParam({ name: 'id', description: 'Question`s id' })
  @Get(`${apiPrefixSettings.QUIZ_GAME.public.pairs}/:id`)
  async getGameById(
    @EntityId() id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<QuizGameOutputModel> {
    return this.quizGameQueryRepository.getGameById(id, user.userId);
  }

  @ApiOkResponse({
    description: 'Connect to pending random game or create new game',
    type: QuizGameOutputModel,
  })
  @ApiForbiddenResponse({
    description: 'If current user is already participating in active pair',
  })
  @ApiOperation({
    summary: 'Connect to pending random game or create new game',
  })
  @Post(
    `${apiPrefixSettings.QUIZ_GAME.public.pairs}/${apiPrefixSettings.QUIZ_GAME.public.connection}`,
  )
  @HttpCode(200)
  async connectOrCreateGame(
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<QuizGameOutputModel> {
    const result: AppResultType<number> = await this.commandBus.execute(
      new ConnectToPairGameCommand(user.userId),
    );

    switch (result.appResult) {
      case AppResult.Success:
        return await this.quizGameQueryRepository.getGameById(
          result.data,
          user.userId,
        );
      case AppResult.Forbidden:
        throw new ForbiddenException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiOkResponse({
    description: 'Answer for current player game for next question for player',
    type: GamPlayerAnswerOutputModel,
  })
  @ApiForbiddenResponse({
    description: 'If current user is already participating in active pair',
  })
  @ApiOperation({
    summary: 'Answer for current player game for next question for player',
  })
  @Post(
    `${apiPrefixSettings.QUIZ_GAME.public.pairs}/${apiPrefixSettings.QUIZ_GAME.public.my_current}/${apiPrefixSettings.QUIZ_GAME.public.answers}`,
  )
  @HttpCode(200)
  async answerCurrentUserGame(
    @CurrentUser() user: JWTAccessTokenPayloadType,
    @Body() inputModel: QuizGameAnswerQuestionInputModel,
  ): Promise<GamPlayerAnswerOutputModel> {
    const result: AppResultType<number> = await this.commandBus.execute(
      new AnswerForQuestionCommand(inputModel, user.userId),
    );

    switch (result.appResult) {
      case AppResult.Success:
        return await this.gamePlayerAnswerQueryRepository.getAnswerById(
          result.data,
        );
      case AppResult.Forbidden:
        throw new ForbiddenException();
      default:
        throw new InternalServerErrorException();
    }
  }
}
