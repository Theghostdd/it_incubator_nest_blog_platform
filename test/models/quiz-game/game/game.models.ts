export class GameTestModel {
  public readonly answerForCurrentQuestion1: string;
  public readonly answerForCurrentQuestion2: string;
  public readonly answerForCurrentQuestion3: string;
  public readonly unCorrectAnswerForCurrentQuestion: string;
  constructor() {
    this.answerForCurrentQuestion1 = '1 million';
    this.answerForCurrentQuestion2 = 'million';
    this.answerForCurrentQuestion3 = '1000000';
    this.unCorrectAnswerForCurrentQuestion = 'odin';
  }
}
