import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class TestingRepositories {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async clearDb(): Promise<void> {
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
}
