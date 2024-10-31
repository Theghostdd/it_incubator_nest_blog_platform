export enum QuizQuestionsAnswerPropertyEnum {
  'id' = 'id',
  'body' = 'body',
  'questionId' = 'questionId',
}

export const selectQuestionsAnswerProperty = [
  `a.${QuizQuestionsAnswerPropertyEnum.id} as "${QuizQuestionsAnswerPropertyEnum.id}"`,
  `a.${QuizQuestionsAnswerPropertyEnum.body} as "${QuizQuestionsAnswerPropertyEnum.body}"`,
  `a.${QuizQuestionsAnswerPropertyEnum.questionId} as "${QuizQuestionsAnswerPropertyEnum.questionId}"`,
];
