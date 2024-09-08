import { Injectable } from '@nestjs/common';
import { BlogService } from '../../features/blog-platform/blog/application/blog-service';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { BlogDocumentType } from '../../features/blog-platform/blog/domain/blog.entity';
import { AppResultType } from '../../base/types/types';
import { AppResult } from '../../base/enum/app-result.enum';
import { Types } from 'mongoose';

@ValidatorConstraint({ async: false })
@Injectable()
export class FindBlogConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogService: BlogService) {}

  async validate(blogId: string, args: ValidationArguments) {
    if (!blogId || !Types.ObjectId.isValid(blogId)) return false;
    const blog: AppResultType<BlogDocumentType | null> =
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
