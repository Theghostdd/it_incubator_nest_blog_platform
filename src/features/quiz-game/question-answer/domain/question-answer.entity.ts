import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizQuestions } from '../../questions/domain/questions.entity';

@Entity()
export class QuizQuestionAnswer {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'text' })
  body: string;
  @ManyToOne(
    () => QuizQuestions,
    (quizQuestions: QuizQuestions) => quizQuestions.answers,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'questionId' })
  question: QuizQuestions;
  @Index()
  @Column({ nullable: false })
  questionId: number;
}
