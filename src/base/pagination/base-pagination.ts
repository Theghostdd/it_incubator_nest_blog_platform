export class BasePagination<T> {
  constructor(
    public readonly pagesCount: number,
    public readonly page: number,
    public readonly pageSize: number,
    public readonly totalCount: number,
    public readonly items: T,
  ) {}
}
