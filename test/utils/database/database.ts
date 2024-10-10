import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export class DataBase {
  constructor(private readonly dataSource: DataSource) {
    this.dataSource = dataSource;
  }
  async clearDatabase(): Promise<void> {
    const query = `
    DO
    $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
        END LOOP;
    END
    $$;
`;
    await this.dataSource.query(query);
  }

  async queryDataSource(query: string): Promise<any> {
    return await this.dataSource.query(query);
  }

  getRepository<T extends ObjectLiteral>(
    repository: EntityTarget<T>,
  ): Repository<T> {
    return this.dataSource.getRepository(repository);
  }
}
