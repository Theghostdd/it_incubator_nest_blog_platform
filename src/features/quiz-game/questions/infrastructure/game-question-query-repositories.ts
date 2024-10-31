import { Injectable, NotFoundException } from '@nestjs/common';
import {
  QuestionMapperOutputModel,
  QuestionOutputModel,
} from '../api/models/output/question-output.model';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestions } from '../domain/questions.entity';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import {
  QuizQuestionPublishedPropertyEnum,
  QuizQuestionsPropertyEnum,
  selectQuestionsProperty,
} from '../domain/types';
import { QuestionQuery } from '../api/models/input/questions-input.model';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { QuizQuestionsAnswerPropertyEnum } from '../../question-answer/domain/type';
import { QuizQuestionAnswer } from '../../question-answer/domain/question-answer.entity';

@Injectable()
export class GameQuestionQueryRepositories {
  constructor(
    private readonly questionMapperOutputModel: QuestionMapperOutputModel,
    @InjectRepository(QuizQuestionAnswer)
    private readonly quizQuestionAnswerRepository: Repository<QuizQuestionAnswer>,
    @InjectRepository(QuizQuestions)
    private readonly quizQuestionsRepository: Repository<QuizQuestions>,
    private readonly questionQuery: QuestionQuery,
  ) {}

  async getQuestions(
    query: QuestionQuery,
  ): Promise<BasePagination<QuestionOutputModel[]>> {
    const {
      sortBy,
      sortDirection,
      pageSize,
      pageNumber,
      bodySearchTerm,
      publishedStatus,
    } = this.questionQuery.createQuestionQuery(query);

    const skip: number = (+pageNumber - 1) * pageSize;
    let publishedCondition: boolean | null;
    switch (publishedStatus) {
      case QuizQuestionPublishedPropertyEnum.all:
        publishedCondition = null;
        break;
      case QuizQuestionPublishedPropertyEnum.published:
        publishedCondition = true;
        break;
      case QuizQuestionPublishedPropertyEnum.notPublished:
        publishedCondition = false;
        break;
      default:
        publishedCondition = null;
    }

    const questions: [QuizQuestions[], number] = await Promise.all([
      this.quizQuestionsRepository
        .createQueryBuilder('q')
        .select(selectQuestionsProperty)
        .addSelect((subQuery) => {
          return subQuery
            .select(
              `jsonb_agg(json_build_object(
                        '${QuizQuestionsAnswerPropertyEnum.id}', a."${QuizQuestionsAnswerPropertyEnum.id}",
                        '${QuizQuestionsAnswerPropertyEnum.body}', a."${QuizQuestionsAnswerPropertyEnum.body}"
                      ))`,
              `${QuizQuestionsPropertyEnum.answers}`,
            )
            .from((subSubQuery) => {
              return subSubQuery
                .select('*')
                .from(this.quizQuestionAnswerRepository.target, 'a')
                .where(
                  `a.${QuizQuestionsAnswerPropertyEnum.questionId} = q.${QuizQuestionsPropertyEnum.id}`,
                );
            }, 'a');
        }, `${QuizQuestionsPropertyEnum.answers}`)
        .where(`q.${QuizQuestionsPropertyEnum.body} ILIKE :bodySearchTerm`, {
          bodySearchTerm: `%${bodySearchTerm || ''}%`,
        })
        .andWhere(
          new Brackets((qb: WhereExpressionBuilder) => {
            if (publishedCondition === true || publishedCondition === false) {
              qb.where(
                `q.${QuizQuestionsPropertyEnum.published} = :publishedCondition`,
                { publishedCondition: publishedCondition },
              );
            } else {
              qb.where(`q.${QuizQuestionsPropertyEnum.published} IS NOT NULL`);
            }
          }),
        )
        .orderBy(`q."${sortBy}"`, sortDirection as 'ASC' | 'DESC')
        .take(pageSize)
        .skip(skip)
        .getRawMany(),
      this.quizQuestionsRepository
        .createQueryBuilder('q')
        .where(`q.${QuizQuestionsPropertyEnum.body} ILIKE :bodySearchTerm`, {
          bodySearchTerm: `%${bodySearchTerm || ''}%`,
        })
        .andWhere(
          new Brackets((qb: WhereExpressionBuilder) => {
            if (publishedCondition === true || publishedCondition === false) {
              qb.where(
                `q.${QuizQuestionsPropertyEnum.published} = :publishedCondition`,
                { publishedCondition: publishedCondition },
              );
            } else {
              qb.where(`q.${QuizQuestionsPropertyEnum.published} IS NOT NULL`);
            }
          }),
        )
        .getCount(),
    ]);

    const totalCount: number = +questions[1];
    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items:
        questions.length > 0
          ? this.questionMapperOutputModel.questionsModel(questions[0])
          : [],
    };
  }

  async getQuestionById(id: number): Promise<QuestionOutputModel> {
    const question: QuizQuestions = await this.quizQuestionsRepository.findOne({
      where: { [QuizQuestionsPropertyEnum.id]: id },
      relations: [QuizQuestionsPropertyEnum.answers],
    });

    if (!question) throw new NotFoundException();
    return this.questionMapperOutputModel.questionModel(question);
  }
}
