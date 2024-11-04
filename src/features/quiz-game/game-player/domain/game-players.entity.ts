import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizGame } from '../../game/domain/quiz-game.entity';
import { Player } from '../../player/domain/quiz-game-player.entity';

@Entity()
export class GamePlayers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playerNumber: number;

  @Column({ default: false })
  isFirst: boolean;

  // What game is the player involved in
  @ManyToOne(() => QuizGame, (quizGame: QuizGame) => quizGame.gamePlayers)
  @JoinColumn({ name: 'gameId' })
  games: QuizGame;
  @Column({ nullable: false })
  gameId: number;

  // Player
  @ManyToOne(
    () => Player,
    (quizGamePlayer: Player) => quizGamePlayer.gamePlayers,
  )
  @JoinColumn({ name: 'playerId' })
  player: Player;
  @Column({ nullable: false })
  playerId: number;

  setFirst(): void {
    this.isFirst = true;
  }
}
