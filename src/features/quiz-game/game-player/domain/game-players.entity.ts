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

  @Column({ default: 0 })
  score: number;

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

  setScore(): void {
    ++this.score;
  }

  setFinallyScore(secondPlayer: GamePlayers): void {
    const isTrueCurrentPlayer: boolean = this.player.playerAnswers.some(
      (a: GameUserAnswer) => a.isTrue,
    );
    const isTrueSecondPlayer: boolean = secondPlayer.player.playerAnswers.some(
      (a: GameUserAnswer) => a.isTrue,
    );

    if (this.isFirst) {
      isTrueCurrentPlayer ? ++this.score : this.score;
    } else {
      isTrueSecondPlayer ? ++secondPlayer.score : secondPlayer.score;
    }
  }

  setWinStatus(secondPlayer: GamePlayers) {
    const isTrueCurrentPlayer: boolean = this.player.playerAnswers.some(
      (a: GameUserAnswer) => a.isTrue,
    );
    const isTrueSecondPlayer: boolean = secondPlayer.player.playerAnswers.some(
      (a: GameUserAnswer) => a.isTrue,
    );

    let currentPlayerScore = this.player.playerAnswers.reduce(
      (acc: number, a: GameUserAnswer) => acc + (a?.isTrue ? 1 : 0),
      0,
    );
    let secondPlayerScore = secondPlayer.player.playerAnswers.reduce(
      (acc: number, a: GameUserAnswer): number => acc + (a?.isTrue ? 1 : 0),
      0,
    );

    if (this.isFirst) {
      isTrueCurrentPlayer ? ++currentPlayerScore : currentPlayerScore;
    } else {
      isTrueSecondPlayer ? ++secondPlayerScore : secondPlayerScore;
    }

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
