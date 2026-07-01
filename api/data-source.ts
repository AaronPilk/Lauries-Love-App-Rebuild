import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as entities from './libs/database/src/entities';
// import * as migrations from './libs/database/src/migrations';

dotenv.config();

const options: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: process.env.DB_HOST, // localhost
  port: parseInt(process.env.DB_PORT), // 5432
  username: process.env.DB_USERNAME, // databse login role username
  password: process.env.DB_PASSWORD, // database login role password
  database: process.env.DB_DATABASE, // db name

  // We are using migrations, synchronize should be set to false.
  // synchronize: process.env.DB_SYNCHRONIZE
  //  ? process.env.DB_SYNCHRONIZE.toLowerCase() === 'true'
  //  : false,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
  // Run migrations automatically,
  // you can disable this if you prefer running migration manually.
  migrationsRun: false,

  logging: false,
  logger: 'advanced-console',

  // Allow both start:prod and start:dev to use migrations
  // __dirname is either dist or src folder, meaning either
  // the compiled js in prod or the ts in dev.
  migrations: ['libs/database/src/migrations/*.ts'],
  migrationsTableName: 'migrations',

  factories: ['libs/database/src/factories/**/*{.ts,.js}'],
  entities,
  seeds: ['libs/database/src/seeds/*.ts'],
};

export const dataSource: DataSource = new DataSource(options);
