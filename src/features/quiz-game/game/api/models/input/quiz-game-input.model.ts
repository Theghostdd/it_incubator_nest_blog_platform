import { Trim } from '../../../../../../core/decorators/transform/trim';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuizGameAnswerQuestionInputModel {
  @ApiProperty({
    description: 'Answer`s body',
    example: 'This is answer for question',
    type: String,
  })
  @Trim()
  @IsNotEmpty()
  @IsString()
  answer: string;
}
