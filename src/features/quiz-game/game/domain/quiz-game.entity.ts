import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { QuizGameStatusEnum } from './types';
import { GameQuestions } from '../../game-questions/domain/game-questions.entity';
import { QuizGamePlayer } from '../../player/domain/quiz-game-player.entity';
import { GamePlayers } from '../../game-player/domain/game-players.entity';
import { QuizQuestions } from '../../questions/domain/questions.entity';

@Entity()
export class QuizGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: QuizGameStatusEnum })
  status: QuizGameStatusEnum;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  startGameAt: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  finishGameAt: Date;

  @OneToMany(
    () => GameQuestions,
    (gameQuestions: GameQuestions) => gameQuestions.game,
    { cascade: true },
  )
  gameQuestions: GameQuestions[];

  @OneToMany(
    () => GamePlayers,
    (gamePlayers: GamePlayers) => gamePlayers.games,
    { cascade: true },
  )
  gamePlayers: GamePlayers[];

  static createGame(
    player: QuizGamePlayer,
    questions: QuizQuestions[],
  ): QuizGame {
    const game: QuizGame = new this();
    const date: Date = new Date();

    const gamePlayer: GamePlayers = new GamePlayers();
    gamePlayer.playerNumber = 1;
    gamePlayer.player = player;
    gamePlayer.playerId = player.id;

    game.status = QuizGameStatusEnum.PendingSecondPlayer;
    game.createdAt = date;
    game.startGameAt = null;
    game.finishGameAt = null;
    game.gamePlayers = [];
    game.gamePlayers.push(gamePlayer);
    game.gameQuestions = [];

    let position: number = 1;
    questions.map((question: QuizQuestions) => {
      const gameQuestion: GameQuestions = new GameQuestions();
      gameQuestion.position = position;
      gameQuestion.questionId = question.id;
      gameQuestion.game = game;
      ++position;
      game.gameQuestions.push(gameQuestion);
    });
    return game;
  }

  connectToGame(player: QuizGamePlayer): void {
    const gamePlayer: GamePlayers = new GamePlayers();
    const date: Date = new Date();
    gamePlayer.playerNumber = 2;
    gamePlayer.player = player;
    gamePlayer.playerId = player.id;
    gamePlayer.gameId = this.id;
    this.gamePlayers.push(gamePlayer);
    this.startGameAt = date;
    this.status = QuizGameStatusEnum.Active;
  }
}
