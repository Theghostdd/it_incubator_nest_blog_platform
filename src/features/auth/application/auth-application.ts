import { AppSettings } from '../../../settings/app-setting';
import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(private readonly appSettings: AppSettings) {}
  async generatePasswordHashAndSalt(password: string): Promise<string> {
    return await bcrypt.hash(
      password,
      this.appSettings.api.PASSWORD_HASH_ROUNDS,
    );
  }
}
