export enum QuizGameStatusEnum {
  'Active' = 'Active',
  'Finished' = 'Finished',
  'PendingSecondPlayer' = 'PendingSecondPlayer',
}

export enum QuizGamePropertyEnum {
  'id' = 'id',
  'status' = 'status',
  'pairCreatedDate' = 'pairCreatedDate',
  'startGameDate' = 'startGameDate',
  'finishGameDate' = 'finishGameDate',
  'gameQuestions' = 'gameQuestions',
  'gamePlayers' = 'gamePlayers',
  'gamesCount' = 'gamesCount',
  'sumScore' = 'sumScore',
  'avgScores' = 'avgScores',
}

export type UserStatisticType = {
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  sumScore: number;
  avgScores: number;
};

export type UserStatisticWithUserInfoType = {
  userId: number;
  login: string;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  sumScore: number;
  avgScores: number;
};
