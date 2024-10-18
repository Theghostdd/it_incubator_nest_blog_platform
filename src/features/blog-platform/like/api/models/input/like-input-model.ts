import { LikeStatusEnum } from '../../../domain/type';
import { Trim } from '../../../../../../core/decorators/transform/trim';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LikeInputModel {
  @Trim()
  @IsNotEmpty()
  @IsEnum(LikeStatusEnum)
  @ApiProperty({
    description: 'The like status',
    enum: LikeStatusEnum,
    example: LikeStatusEnum.Like,
  })
  public likeStatus: LikeStatusEnum;
}
