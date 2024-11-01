import { Trim } from '../../../../../../core/decorators/transform/trim';
import { IsNotEmpty, IsString } from 'class-validator';

export class QuizGameAnswerQuestionInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  answer: string;
}
