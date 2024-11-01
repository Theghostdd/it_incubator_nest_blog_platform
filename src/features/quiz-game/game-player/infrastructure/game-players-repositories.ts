import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GamePlayers } from '../domain/game-players.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GamePlayersRepository {
  constructor(
    @InjectRepository(GamePlayers)
    private readonly gamePlayersRepository: Repository<GamePlayers>,
  ) {}
}
