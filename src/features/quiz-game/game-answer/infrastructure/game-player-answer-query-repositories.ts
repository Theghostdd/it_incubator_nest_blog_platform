import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameUserAnswer } from '../domain/game-user-answer.entity';
import { Repository } from 'typeorm';
import {
  GamPlayerAnswerOutputModel,
  GamPlayerAnswerOutputModelMapper,
} from '../api/model/output/gam-player-answer-output.model';
import { GamePlayerAnswerPropertyEnum } from '../domain/types';

@Injectable()
export class GamePlayerAnswerQueryRepository {
  constructor(
    @InjectRepository(GameUserAnswer)
    private readonly gameUserAnswerRepository: Repository<GameUserAnswer>,
    private readonly gamPlayerAnswerOutputModelMapper: GamPlayerAnswerOutputModelMapper,
  ) {}

  async getAnswerById(id: number): Promise<GamPlayerAnswerOutputModel> {
    const answer: GameUserAnswer | null =
      await this.gameUserAnswerRepository.findOne({
        where: { id: id },
        relations: [GamePlayerAnswerPropertyEnum.gameQuestion],
      });

    if (!answer) throw new NotFoundException();
    return this.gamPlayerAnswerOutputModelMapper.mapAnswer(answer);
  }
}
