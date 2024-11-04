import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameQuestions } from '../../game-questions/domain/game-questions.entity';
import { Player } from '../../player/domain/quiz-game-player.entity';
import { QuizQuestionAnswer } from '../../question-answer/domain/question-answer.entity';

@Entity()
export class GameUserAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  body: string;

  @Column()
  isTrue: boolean;

  @Column()
  position: number;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  createdAt: Date;

  // Answer for specify game`s questions
  @ManyToOne(
    () => GameQuestions,
    (gameQuestions: GameQuestions) => gameQuestions.playerAnswer,
  )
  @JoinColumn({ name: 'gameQuestionId' })
  gameQuestion: GameQuestions;
  @Column()
  gameQuestionId: number;

  // The player who gave the answer to the question
  @ManyToOne(
    () => Player,
    (quizGamePlayer: Player) => quizGamePlayer.playerAnswers,
  )
  @JoinColumn({ name: 'playerId' })
  player: Player;
  @Column({ nullable: false })
  playerId: number;

  static createAnswer(
    playerAnswer: string,
    playerAnswers: GameUserAnswer[],
    questions: GameQuestions[],
    player: Player,
  ): GameUserAnswer {
    const answer = new this();
    const date: Date = new Date();
    answer.body = playerAnswer;
    answer.createdAt = date;
    answer.player = player;
    answer.playerId = player.id;

    let currentQuestionPosition: number = 1;
    switch (playerAnswers.length) {
      case 0:
        break;
      case 1:
        currentQuestionPosition = 2;
        break;
      case 2:
        currentQuestionPosition = 3;
        break;
      case 3:
        currentQuestionPosition = 4;
        break;
      case 4:
        currentQuestionPosition = 5;
        break;
      default:
        currentQuestionPosition = 1;
    }

    const currentQuestion: GameQuestions = questions.find(
      (q: GameQuestions): boolean => q.position === currentQuestionPosition,
    );
    answer.gameQuestion = currentQuestion;
    answer.gameQuestionId = currentQuestion.id;
    answer.position = currentQuestionPosition;

    answer.isTrue = currentQuestion.question.answers.some(
      (answer: QuizQuestionAnswer): boolean => answer.body === playerAnswer,
    );
    return answer;
  }
}
