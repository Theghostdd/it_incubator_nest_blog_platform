import { BlogService } from '../../../src/features/blog-platform/blog/application/blog-service';
import { initSettings } from '../../settings/test-settings';
import { ITestSettings } from '../../settings/interfaces';
import { AppResultType } from '../../../src/base/types/types';
import {
  IBlogCreateModel,
  IBlogInsertModel,
  IBlogUpdateModel,
} from '../../models/blog/interfaces';
import { AppResult } from '../../../src/base/enum/app-result.enum';
import { Types } from 'mongoose';

describe('Blog', () => {
  let blogService: BlogService;
  let testSettings: ITestSettings;
  let blogCreateModel: IBlogCreateModel;
  let blogInsertModel: IBlogInsertModel;
  let blogUpdateModel: IBlogUpdateModel;

  beforeAll(async () => {
    testSettings = await initSettings();
    blogService = testSettings.testingAppModule.get<BlogService>(BlogService);
  });

  afterAll(async () => {
    await testSettings.app.close();
    await testSettings.dataBase.dbConnectionClose();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    blogCreateModel =
      testSettings.testModels.blogTestModel.getBlogCreateModel();
    blogInsertModel =
      testSettings.testModels.blogTestModel.getBlogInsertModel();
    blogUpdateModel =
      testSettings.testModels.blogTestModel.getBlogUpdateModel();
  });

  describe('Create blog', () => {
    it('should create blog', async () => {
      const result: AppResultType<string> =
        await blogService.createBlog(blogCreateModel);
      expect(result).toEqual({
        appResult: AppResult.Success,
        data: expect.any(String),
      });

      const blog = await testSettings.dataBase.dbFindOne('blogs', {
        _id: new Types.ObjectId(result.data),
      });
      expect(blog).toEqual({
        _id: expect.any(Types.ObjectId),
        name: blogCreateModel.name,
        description: blogCreateModel.description,
        websiteUrl: blogCreateModel.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
        __v: expect.any(Number),
      });
    });
  });

  describe('Delete blog', () => {
    it('should delete blog by id', async () => {
      const { insertedId: blogId } = await testSettings.dataBase.dbInsertOne(
        'blogs',
        blogInsertModel,
      );

      const result: AppResultType = await blogService.deleteBlogById(
        blogId.toString(),
      );
      expect(result).toEqual({
        appResult: AppResult.Success,
        data: null,
      });

      const blog = await testSettings.dataBase.dbFindOne('blogs', {
        _id: new Types.ObjectId(blogId),
      });
      expect(blog).toBeNull();
    });

    it('should not delete blog by id, blog not found', async () => {
      const result: AppResultType = await blogService.deleteBlogById(
        '66c4e15b0520745731561266',
      );
      expect(result).toEqual({
        appResult: AppResult.NotFound,
        data: null,
      });
    });
  });

  describe('Update blog', () => {
    it('should update blog by id', async () => {
      const { insertedId: blogId } = await testSettings.dataBase.dbInsertOne(
        'blogs',
        blogInsertModel,
      );

      const result: AppResultType = await blogService.updateBlogById(
        blogId.toString(),
        blogUpdateModel,
      );
      expect(result).toEqual({
        appResult: AppResult.Success,
        data: null,
      });

      const blog = await testSettings.dataBase.dbFindOne('blogs', {
        _id: new Types.ObjectId(blogId),
      });
      expect(blog.name).not.toBe(blogInsertModel.name);
      expect(blog.description).not.toBe(blogInsertModel.description);
      expect(blog.websiteUrl).not.toBe(blogInsertModel.websiteUrl);
    });

    it('should not update blog by id, blog not found', async () => {
      const result: AppResultType = await blogService.updateBlogById(
        '66c4e15b0520745731561266',
        blogUpdateModel,
      );
      expect(result).toEqual({
        appResult: AppResult.NotFound,
        data: null,
      });
    });
  });
});
