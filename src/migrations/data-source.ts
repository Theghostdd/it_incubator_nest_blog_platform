import { DataSource } from 'typeorm';
import { EnvSettings } from '../settings/env-settings';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const envSettings = new EnvSettings(process.env);
const dataSource = new DataSource({
  type: 'postgres',
  host: envSettings.POSTGRES_CONNECTION_URI,
  port: envSettings.POSTGRES_PORT,
  username: envSettings.POSTGRES_USER,
  password: envSettings.POSTGRES_USER_PASSWORD,
  database: envSettings.DATABASE_NAME,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});

export default dataSource;
