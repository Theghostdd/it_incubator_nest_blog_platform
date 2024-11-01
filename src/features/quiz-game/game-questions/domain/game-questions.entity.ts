import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizGame } from '../../game/domain/quiz-game.entity';
import { QuizQuestions } from '../../questions/domain/questions.entity';
import { GameUserAnswer } from '../../game-answer/domain/game-user-answer.entity';

@Entity()
export class GameQuestions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  position: number;

  @ManyToOne(() => QuizGame, (quizGame: QuizGame) => quizGame.gameQuestions)
  @JoinColumn({ name: 'gameId' })
  game: QuizGame;
  @Column({ nullable: false })
  gameId: number;

  @ManyToOne(
    () => QuizQuestions,
    (quizQuestions: QuizQuestions) => quizQuestions.gameQuestions,
  )
  @JoinColumn({ name: 'questionId' })
  question: QuizQuestions;
  @Column({ nullable: false })
  questionId: number;

  @OneToMany(
    () => GameUserAnswer,
    (gameUserAnswer: GameUserAnswer) => gameUserAnswer.question,
  )
  userAnswer: GameUserAnswer[];
}
