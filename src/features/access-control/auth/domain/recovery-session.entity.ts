import { Injectable } from '@nestjs/common';

export class RecoveryPasswordSession {
  email: string;
  code: string;
  expAt: string;
}

export type RecoveryPasswordSessionType = RecoveryPasswordSession & {
  id: number;
};

@Injectable()
export class RecoveryPasswordSessionFactory {
  constructor() {}
  create(email: string, code: string, expAt: string): RecoveryPasswordSession {
    const session = new RecoveryPasswordSession();
    session.email = email;
    session.code = code;
    session.expAt = expAt;
    return session;
  }
}
