import { Injectable } from '@nestjs/common';
import { AuthSession, AuthSessionType } from '../domain/auth-session.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { tablesName } from '../../../../core/utils/tables/tables';

@Injectable()
export class AuthSessionRepositories {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async save(session: AuthSession): Promise<number> {
    const query = `
    INSERT INTO ${tablesName.AUTH_SESSIONS}("userId", "deviceId", "deviceName", ip, "issueAt", "expAt", "isActive")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING "id";
    `;
    const result: { id: number }[] = await this.dataSource.query(query, [
      session.userId,
      session.deviceId,
      session.deviceName,
      session.ip,
      session.issueAt,
      session.expAt,
      true,
    ]);
    return result[0].id;
  }

  async delete(sessionId: number): Promise<void> {
    const query = `
    UPDATE ${tablesName.AUTH_SESSIONS}
      SET "isActive"= false
      WHERE "id" = $1;
     `;
    await this.dataSource.query(query, [sessionId]);
  }

  async deleteSessions(deviceIds: string[]): Promise<void> {
    const placeholders = deviceIds
      .map((_, index) => `$${index + 1}`)
      .join(', ');

    const query = `
      UPDATE ${tablesName.AUTH_SESSIONS}
      SET "isActive" = false
      WHERE "deviceId" IN (${placeholders})
    `;
    await this.dataSource.query(query, [...deviceIds]);
  }

  async getSessionByDeviceId(
    deviceId: string,
  ): Promise<AuthSessionType | null> {
    const query = `
      SELECT "as"."deviceId", "as"."id", "as"."deviceName", "as"."userId", "as"."issueAt", "as"."expAt"
        FROM ${tablesName.AUTH_SESSIONS} as "as"
        JOIN ${tablesName.USERS} as u
        ON "as"."userId" = u."id" AND u."isActive" = true
        WHERE "as"."deviceId" = $1 AND "as"."isActive" = true
    `;
    const result: AuthSessionType[] | [] = await this.dataSource.query(query, [
      deviceId,
    ]);
    return result.length > 0 ? result[0] : null;
  }

  async getSessionsByUserId(userId: number): Promise<AuthSessionType[] | null> {
    const query = `
      SELECT "as"."deviceId", "as"."id", "as"."deviceName", "as"."userId", "as"."issueAt", "as"."expAt"
        FROM ${tablesName.AUTH_SESSIONS} as "as"
        JOIN ${tablesName.USERS} as u
        ON "as"."userId" = u."id" AND u."isActive" = true
        WHERE "as"."userId" = $1 AND "as"."isActive" = true
    `;
    const result: AuthSessionType[] | [] = await this.dataSource.query(query, [
      userId,
    ]);
    return result.length > 0 ? result : null;
  }

  async updateAuthSessionByUserId(
    iatDate: string,
    expDate: string,
    userId: number,
  ): Promise<void> {
    const query = `
    UPDATE ${tablesName.AUTH_SESSIONS}
      SET "issueAt" = $1, "expAt" = $2
      WHERE "userId" = $3
    `;
    await this.dataSource.query(query, [iatDate, expDate, userId]);
  }
}
