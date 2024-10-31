export enum QuizQuestionsPropertyEnum {
  'id' = 'id',
  'body' = 'body',
  'published' = 'published',
  'createdAt' = 'createdAt',
  'updatedAt' = 'updatedAt',
  'answers' = 'answers',
}

export const selectQuestionsProperty = [
  `q.${QuizQuestionsPropertyEnum.id} as "${QuizQuestionsPropertyEnum.id}"`,
  `q.${QuizQuestionsPropertyEnum.body} as "${QuizQuestionsPropertyEnum.body}"`,
  `q.${QuizQuestionsPropertyEnum.published} as "${QuizQuestionsPropertyEnum.published}"`,
  `q.${QuizQuestionsPropertyEnum.createdAt} as "${QuizQuestionsPropertyEnum.createdAt}"`,
  `q.${QuizQuestionsPropertyEnum.updatedAt} as "${QuizQuestionsPropertyEnum.updatedAt}"`,
];

export enum QuizQuestionPublishedPropertyEnum {
  'all' = 'all',
  'published' = 'published',
  'notPublished' = 'notPublished',
}
