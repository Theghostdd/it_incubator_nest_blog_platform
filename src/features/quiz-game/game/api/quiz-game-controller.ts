import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectToPairGameCommand } from '../application/command/connect-to-pair.command';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import { QuizGameQueryRepository } from '../infrastructure/quiz-game-query-repositories';
import { EntityId } from '../../../../core/decorators/entityId';
import {
  AppResultType,
  JWTAccessTokenPayloadType,
} from '../../../../base/types/types';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { AuthJWTAccessGuard } from '../../../../core/guards/jwt/jwt.guard';
import { CurrentUser } from '../../../../core/decorators/current-user';
import { QuizGameOutputModel } from './models/output/quiz-game-output.models';
import { QuizGameAnswerQuestionInputModel } from './models/input/quiz-game-input.model';
import { AnswerForQuestionCommand } from '../application/command/answer-for-question.command';
import { GamPlayerAnswerOutputModel } from '../../game-answer/api/model/output/gam-player-answer-output.model';
import { GamePlayerAnswerQueryRepository } from '../../game-answer/infrastructure/game-player-answer-query-repositories';

@Controller(apiPrefixSettings.QUIZ_GAME.public.pair_game_quiz)
@UseGuards(AuthJWTAccessGuard)
export class QuizGameController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly quizGameQueryRepository: QuizGameQueryRepository,
    private readonly gamePlayerAnswerQueryRepository: GamePlayerAnswerQueryRepository,
  ) {}

  @Get(
    `${apiPrefixSettings.QUIZ_GAME.public.pairs}/${apiPrefixSettings.QUIZ_GAME.public.my_current}`,
  )
  async getGameCurrentUser(
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<QuizGameOutputModel> {
    return this.quizGameQueryRepository.getGameCurrentUser(user.userId);
  }

  @Get(`${apiPrefixSettings.QUIZ_GAME.public.pairs}/:id`)
  async getGameById(
    @EntityId() id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<QuizGameOutputModel> {
    return this.quizGameQueryRepository.getGameById(id, user.userId);
  }

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