import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { QuizQuestions } from '../domain/questions.entity';
import { QuizQuestionsPropertyEnum } from '../domain/types';
import { QuizQuestionAnswer } from '../../question-answer/domain/question-answer.entity';

@Injectable()
export class GameQuestionRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(QuizQuestions)
    private readonly quizQuestionsRepository: Repository<QuizQuestions>,
  ) {}

  async save(question: QuizQuestions): Promise<number | null> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const questionEntity: QuizQuestions =
        await queryRunner.manager.save(question);

      await queryRunner.commitTransaction();
      return questionEntity.id;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async getQuestionById(id: number): Promise<QuizQuestions | null> {
    return await this.quizQuestionsRepository.findOne({
      where: { [QuizQuestionsPropertyEnum.id]: id },
      relations: [QuizQuestionsPropertyEnum.answers],
    });
  }

  async deleteQuestion(question: QuizQuestions): Promise<boolean> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.remove(question);
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async updateQuestion(
    question: QuizQuestions,
    pastAnswers: QuizQuestionAnswer[],
  ): Promise<boolean> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.remove(pastAnswers);
      await queryRunner.manager.save(question);
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async getFiveRandomQuestions(): Promise<QuizQuestions[]> {
    return await this.quizQuestionsRepository
      .createQueryBuilder('q')
      .orderBy('RANDOM()')
      .where(`q.${QuizQuestionsPropertyEnum.published} = :status`, {
        status: true,
      })
      .take(5)
      .getMany();
  }
}
