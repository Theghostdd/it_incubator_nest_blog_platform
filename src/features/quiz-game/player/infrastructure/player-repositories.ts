import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizGamePlayer } from '../domain/quiz-game-player.entity';
import { PlayerPropertyEnum } from '../domain/types';

@Injectable()
export class PlayerRepository {
  constructor(
    @InjectRepository(QuizGamePlayer)
    private readonly playerRepository: Repository<QuizGamePlayer>,
  ) {}

  async save(player: QuizGamePlayer): Promise<QuizGamePlayer> {
    return await this.playerRepository.save(player);
  }

  async getPlayerByUserId(id: number): Promise<QuizGamePlayer | null> {
    return await this.playerRepository.findOne({
      where: { userId: id },
      relations: [PlayerPropertyEnum.user],
    });
  }
}