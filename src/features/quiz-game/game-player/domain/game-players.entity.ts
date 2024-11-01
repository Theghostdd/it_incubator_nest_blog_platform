import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizGame } from '../../game/domain/quiz-game.entity';
import { QuizGamePlayer } from '../../player/domain/quiz-game-player.entity';

@Entity()
export class GamePlayers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playerNumber: number;

  @ManyToOne(() => QuizGame, (quizGame: QuizGame) => quizGame.gamePlayers)
  @JoinColumn({ name: 'gameId' })
  games: QuizGame;
  @Column({ nullable: false })
  gameId: number;

  @ManyToOne(
    () => QuizGamePlayer,
    (quizGamePlayer: QuizGamePlayer) => quizGamePlayer.gamePlayers,
  )
  @JoinColumn({ name: 'playerId' })
  player: QuizGamePlayer;
  @Column({ nullable: false })
  playerId: number;
}
