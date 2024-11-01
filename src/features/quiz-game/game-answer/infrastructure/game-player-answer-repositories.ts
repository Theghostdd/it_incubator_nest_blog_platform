import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameUserAnswer } from '../domain/game-user-answer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GamePlayerAnswerRepositories {
  constructor(
    @InjectRepository(GameUserAnswer)
    private readonly gameUserAnswerRepository: Repository<GameUserAnswer>,
  ) {}

  async save(answer: GameUserAnswer): Promise<number> {
    const answerEntity: GameUserAnswer =
      await this.gameUserAnswerRepository.save(answer);
    return answerEntity.id;
  }
}
