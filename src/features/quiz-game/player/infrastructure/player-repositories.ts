import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../domain/quiz-game-player.entity';
import { PlayerPropertyEnum } from '../domain/types';

@Injectable()
export class PlayerRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async getPlayerByUserId(id: number): Promise<Player> {
    return await this.playerRepository.findOne({
      where: { userId: id },
      relations: [PlayerPropertyEnum.user],
    });
  }
}
