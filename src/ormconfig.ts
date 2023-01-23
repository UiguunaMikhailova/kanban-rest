import dotenv from 'dotenv';
import path from 'path';
import { ConnectionOptions } from 'typeorm';

dotenv.config({
  path: path.join(__dirname, '.env'),
});

export default {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  cache: false,
  database: 'kanban_pdb',
  username: 'kanban_user',
  password: 'kanban',
  // url: process.env.PGDB_URL,
  synchronize: false,
  logging: false,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
  ssl: false,
  entities: ['src/resources/**/**.entity{.ts,.js}'],
  migrations: ['./migrations/*.ts'],
} as ConnectionOptions;
