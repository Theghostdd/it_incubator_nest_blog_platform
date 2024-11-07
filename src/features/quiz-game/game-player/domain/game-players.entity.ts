import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizGame } from '../../game/domain/quiz-game.entity';
import { Player } from '../../player/domain/quiz-game-player.entity';
import { WinStatusEnum } from './types';
import { GameUserAnswer } from '../../game-answer/domain/game-user-answer.entity';

@Entity()
export class GamePlayers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playerNumber: number;

  @Column({ default: false })
  isFirst: boolean;

  @Index()
  @Column({ enum: WinStatusEnum, nullable: true })
  winStatus: WinStatusEnum;

  // What game is the player involved in
  @ManyToOne(() => QuizGame, (quizGame: QuizGame) => quizGame.gamePlayers)
  @JoinColumn({ name: 'gameId' })
  games: QuizGame;
  @Index()
  @Column({ nullable: false })
  gameId: number;

  // Player
  @ManyToOne(
    () => Player,
    (quizGamePlayer: Player) => quizGamePlayer.gamePlayers,
  )
  @JoinColumn({ name: 'playerId' })
  player: Player;
  @Index()
  @Column({ nullable: false })
  playerId: number;

  setFirst(): void {
    this.isFirst = true;
  }

  setWinStatus(currentPlayer: GamePlayers, secondPlayer: GamePlayers) {
    let currentPlayerScore = currentPlayer.player.playerAnswers.reduce(
      (acc: number, a: GameUserAnswer) => acc + (a?.isTrue ? 1 : 0),
      0,
    );
    let secondPlayerScore = secondPlayer.player.playerAnswers.reduce(
      (acc: number, a: GameUserAnswer): number => acc + (a?.isTrue ? 1 : 0),
      0,
    );

    this.isFirst ? ++currentPlayerScore : currentPlayerScore;
    secondPlayer.isFirst ? ++secondPlayerScore : secondPlayerScore;

    if (currentPlayerScore > secondPlayerScore) {
      this.winStatus = WinStatusEnum.win;
      secondPlayer.winStatus = WinStatusEnum.lose;
    } else if (currentPlayerScore < secondPlayerScore) {
      this.winStatus = WinStatusEnum.lose;
      secondPlayer.winStatus = WinStatusEnum.win;
    } else {
      this.winStatus = WinStatusEnum.draw;
      secondPlayer.winStatus = WinStatusEnum.draw;
    }
  }
}
