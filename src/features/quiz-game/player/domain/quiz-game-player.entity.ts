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
export class QuizGamePlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user: User) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({ nullable: false })
  userId: number;

  @OneToMany(
    () => GamePlayers,
    (gamePlayers: GamePlayers) => gamePlayers.gameId,
  )
  gamePlayers: GamePlayers[];

  @OneToMany(
    () => GameUserAnswer,
    (gameUserAnswer: GameUserAnswer) => gameUserAnswer.player,
  )
  userAnswers: GameUserAnswer[];

  static createPlayer(user: User): QuizGamePlayer {
    const player: QuizGamePlayer = new this();
    player.user = user;
    player.userId = user.id;
    return player;
  }
}
