import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameQuestions } from '../../game-questions/domain/game-questions.entity';
import { QuizGamePlayer } from '../../player/domain/quiz-game-player.entity';
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
  isFirst: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  createdAt: Date;

  @ManyToOne(
    () => GameQuestions,
    (gameQuestions: GameQuestions) => gameQuestions.userAnswer,
  )
  @JoinColumn({ name: 'questionId' })
  question: GameQuestions;
  @Column()
  questionId: number;

  @ManyToOne(
    () => QuizGamePlayer,
    (quizGamePlayer: QuizGamePlayer) => quizGamePlayer.userAnswers,
  )
  @JoinColumn({ name: 'playerId' })
  player: QuizGamePlayer;
  @Column({ nullable: false })
  playerId: number;

  static createAnswer(
    playerAnswer: string,
    playerAnswers: GameUserAnswer[],
    secondPlayerAnswers: GameUserAnswer[],
    questions: GameQuestions[],
    player: QuizGamePlayer,
  ): GameUserAnswer {
    const answer = new this();
    const date: Date = new Date();
    answer.body = playerAnswer;
    answer.createdAt = date;
    answer.isFirst = false;
    answer.player = player;
    answer.playerId = player.id;

    let currentQuestionPosition: number = 1;
    switch (playerAnswers.length) {
      case 0:
        if (secondPlayerAnswers.length === 0) {
          answer.isFirst = true;
        } else {
          answer.isFirst = false;
        }
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
    answer.question = currentQuestion;
    answer.questionId = currentQuestion.id;

    answer.isTrue = currentQuestion.question.answers.some(
      (answer: QuizQuestionAnswer): boolean => answer.body === playerAnswer,
    );
    return answer;
  }
}
