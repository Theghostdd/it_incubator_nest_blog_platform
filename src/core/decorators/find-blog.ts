import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { AppResultType } from '../../base/types/types';
import { AppResult } from '../../base/enum/app-result.enum';
import { BlogService } from '../../features/blog-platform/blog/application/blog-service';
import { BlogType } from '../../features/blog-platform/blog/domain/blog.entity';

@ValidatorConstraint({ async: false })
@Injectable()
export class FindBlogConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogService: BlogService) {}

  async validate(blogId: number, args: ValidationArguments) {
    if (!blogId || !Number(blogId)) return false;
    const blog: AppResultType<BlogType | null> =
      await this.blogService.getBlogById(blogId);
    return blog.appResult === AppResult.Success;
  }

  defaultMessage(args: ValidationArguments) {
    return `Blog not found`;
  }
}

export function FindBlog(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: FindBlogConstraint,
    });
  };
}
