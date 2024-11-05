import {
  Column,
  Entity,
  Index,
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

  // The game for which the question was created
  @ManyToOne(() => QuizGame, (quizGame: QuizGame) => quizGame.gameQuestions)
  @JoinColumn({ name: 'gameId' })
  game: QuizGame;
  @Index()
  @Column({ nullable: false })
  gameId: number;

  // Parent question
  @ManyToOne(
    () => QuizQuestions,
    (quizQuestions: QuizQuestions) => quizQuestions.gameQuestions,
  )
  @JoinColumn({ name: 'questionId' })
  question: QuizQuestions;
  @Index()
  @Column({ nullable: false })
  questionId: number;

  // Player`s answers for this question for specify game
  @OneToMany(
    () => GameUserAnswer,
    (gameUserAnswer: GameUserAnswer) => gameUserAnswer.gameQuestion,
  )
  playerAnswer: GameUserAnswer[];
}
