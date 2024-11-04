import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { QuizQuestionAnswer } from '../../question-answer/domain/question-answer.entity';
import {
  QuestionsInputModel,
  QuestionsUpdateInputModel,
} from '../api/models/input/questions-input.model';
import { GameQuestions } from '../../game-questions/domain/game-questions.entity';

@Entity()
export class QuizQuestions {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'text' })
  body: string;
  @Column({ default: false })
  published: boolean;
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date;
  @OneToMany(
    () => QuizQuestionAnswer,
    (questionAnswer: QuizQuestionAnswer) => questionAnswer.question,
    { cascade: ['remove', 'insert'] },
  )
  answers: QuizQuestionAnswer[];

  @OneToMany(
    () => GameQuestions,
    (gameQuestions: GameQuestions) => gameQuestions.question,
    { cascade: ['remove', 'insert'] },
  )
  gameQuestions: GameQuestions[];

  static createQuestion(
    questionInputModel: QuestionsInputModel,
  ): QuizQuestions {
    const { body, correctAnswers } = questionInputModel;

    const question: QuizQuestions = new this();
    const date: Date = new Date();
    const answers: QuizQuestionAnswer[] = correctAnswers.map(
      (answerItem: string) => {
        const answer: QuizQuestionAnswer = new QuizQuestionAnswer();
        answer.body = answerItem;
        answer.question = question;
        return answer;
      },
    );

    question.body = body;
    question.published = false;
    question.answers = answers;
    question.createdAt = date;
    question.updatedAt = null;
    return question;
  }

  publishQuestion(publish: boolean): void {
    const date: Date = new Date();
    if (publish) {
      this.published = true;
    } else {
      this.published = false;
    }
    this.updatedAt = date;
  }

  updateQuestion(updateModel: QuestionsUpdateInputModel): void {
    const { body, correctAnswers } = updateModel;
    const date: Date = new Date();
    this.body = body;

    this.answers = correctAnswers.map((answerItem: string) => {
      const answer = new QuizQuestionAnswer();
      answer.body = answerItem;
      answer.question = this;
      return answer;
    });
    this.updatedAt = date;
  }
}
