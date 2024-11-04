import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../users/user/domain/user.entity';
import { GamePlayers } from '../../game-player/domain/game-players.entity';
import { GameUserAnswer } from '../../game-answer/domain/game-user-answer.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user: User) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({ nullable: false })
  userId: number;

  // The player is involved in some kind of game
  @OneToMany(
    () => GamePlayers,
    (gamePlayers: GamePlayers) => gamePlayers.player,
  )
  gamePlayers: GamePlayers[];

  // Player`s answers
  @OneToMany(
    () => GameUserAnswer,
    (gameUserAnswer: GameUserAnswer) => gameUserAnswer.player,
  )
  playerAnswers: GameUserAnswer[];

  static createPlayer(user: User): Player {
    const player: Player = new this();
    player.user = user;
    player.userId = user.id;
    return player;
  }
}
