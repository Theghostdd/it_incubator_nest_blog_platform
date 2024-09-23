import { Injectable } from '@nestjs/common';
import {
  RecoveryPasswordSession,
  RecoveryPasswordSessionType,
} from '../domain/recovery-session.entity';
import { DataSource } from 'typeorm';
import { tablesName } from '../../../../core/utils/tables/tables';

@Injectable()
export class RecoveryPasswordSessionRepositories {
  constructor(private readonly dataSource: DataSource) {}

  async save(session: RecoveryPasswordSession): Promise<void> {
    const query = `
      INSERT INTO ${tablesName.RECOVERY_PASSWORD_SESSIONS}
        ("email", "code", "expAt", "userId")
        VALUES ($1, $2, $3, $4)
    `;
    await this.dataSource.query(query, [
      session.email,
      session.code,
      session.expAt,
      session.userId,
    ]);
  }

  async delete(sessionId: number): Promise<void> {
    const query = `
      DELETE FROM ${tablesName.RECOVERY_PASSWORD_SESSIONS}
        WHERE "id" = $1
    `;
    await this.dataSource.query(query, [sessionId]);
  }

  async getSessionByCode(
    code: string,
  ): Promise<RecoveryPasswordSessionType | null> {
    const query = `
      SELECT "email", "code", "expAt", "userId", "id"
      FROM ${tablesName.RECOVERY_PASSWORD_SESSIONS}
      WHERE "code" = $1
    `;
    const result: RecoveryPasswordSessionType[] | [] =
      await this.dataSource.query(query, [code]);
    return result.length > 0 ? result[0] : null;
  }
}
