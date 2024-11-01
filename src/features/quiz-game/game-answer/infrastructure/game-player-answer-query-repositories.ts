import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameUserAnswer } from '../domain/game-user-answer.entity';
import { Repository } from 'typeorm';
import {
  GamPlayerAnswerOutputModel,
  GamPlayerAnswerOutputModelMapper,
} from '../api/model/output/gam-player-answer-output.model';
import { GameUserAnswerPropertyEnum } from '../domain/types';

@Injectable()
export class GamePlayerAnswerQueryRepository {
  constructor(
    @InjectRepository(GameUserAnswer)
    private readonly gameUserAnswerRepository: Repository<GameUserAnswer>,
    private readonly gamPlayerAnswerOutputModelMapper: GamPlayerAnswerOutputModelMapper,
  ) {}

  async getAnswerById(id: number): Promise<GamPlayerAnswerOutputModel> {
    const answer = await this.gameUserAnswerRepository.findOne({
      where: { id: id },
      relations: [GameUserAnswerPropertyEnum.question],
    });

    return this.gamPlayerAnswerOutputModelMapper.mapAnswer(answer);
  }
}
