export class QuestionsTestModel {
  public readonly body: string;
  public readonly updateBody: string;
  public readonly unCorrectBody: string;
  public readonly unCorrectUpdateBody: string;
  public readonly correctAnswers: string[];
  public readonly updateCorrectAnswers: string[];
  public readonly unCorrectUpdateCorrectAnswers: any[];
  public readonly unCorrectAnswers: any[];
  constructor() {
    this.body = 'How many people live on the Earth';
    this.updateBody = 'How many cats live on the Earth';
    this.unCorrectUpdateBody = 'How';
    this.unCorrectBody = 'How';
    this.correctAnswers = ['1 million', 'million', '1000000'];
    this.updateCorrectAnswers = ['2 millions', 'two millions', '2000000'];
    this.unCorrectUpdateCorrectAnswers = [
      '2 millions',
      'two millions',
      2000000,
    ];
    this.unCorrectAnswers = ['1 million', 'million', 1000000];
  }
}
