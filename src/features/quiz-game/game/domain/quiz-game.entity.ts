import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizGameStatusEnum } from './types';
import { GameQuestions } from '../../game-questions/domain/game-questions.entity';
import { Player } from '../../player/domain/quiz-game-player.entity';
import { GamePlayers } from '../../game-player/domain/game-players.entity';
import { QuizQuestions } from '../../questions/domain/questions.entity';

@Entity()
export class QuizGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ enum: QuizGameStatusEnum })
  status: QuizGameStatusEnum;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  pairCreatedDate: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  startGameDate: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  finishGameDate: Date;

  // Questions for specify game (THIS GAME)
  @OneToMany(
    () => GameQuestions,
    (gameQuestions: GameQuestions) => gameQuestions.game,
    { cascade: true },
  )
  gameQuestions: GameQuestions[];

  // Players for specify game (THIS GAME)
  @OneToMany(
    () => GamePlayers,
    (gamePlayers: GamePlayers) => gamePlayers.games,
    { cascade: true },
  )
  gamePlayers: GamePlayers[];

  static createGame(player: Player): QuizGame {
    const game: QuizGame = new this();
    const date: Date = new Date();

    const gamePlayer: GamePlayers = new GamePlayers();
    gamePlayer.playerNumber = 1;
    gamePlayer.player = player;
    gamePlayer.playerId = player.id;
    gamePlayer.isFirst = false;

    game.status = QuizGameStatusEnum.PendingSecondPlayer;
    game.pairCreatedDate = date;
    game.startGameDate = null;
    game.finishGameDate = null;
    game.gamePlayers = [];
    game.gamePlayers.push(gamePlayer);
    return game;
  }

  connectToGame(player: Player, questions: QuizQuestions[]): void {
    const gamePlayer: GamePlayers = new GamePlayers();
    const date: Date = new Date();
    gamePlayer.playerNumber = 2;
    gamePlayer.player = player;
    gamePlayer.playerId = player.id;
    gamePlayer.gameId = this.id;
    gamePlayer.isFirst = false;
    this.gamePlayers.push(gamePlayer);
    this.startGameDate = date;
    this.status = QuizGameStatusEnum.Active;
    this.gameQuestions = [];

    let position: number = 1;
    questions.forEach((question: QuizQuestions) => {
      const gameQuestion: GameQuestions = new GameQuestions();
      gameQuestion.position = position;
      gameQuestion.questionId = question.id;
      gameQuestion.game = this;
      gameQuestion.gameId = this.id;
      ++position;
      this.gameQuestions.push(gameQuestion);
    });
  }

  finishGame(): void {
    this.finishGameDate = new Date();
    this.status = QuizGameStatusEnum.Finished;
  }
}
