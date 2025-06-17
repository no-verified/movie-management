import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const createTestDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'test',
    password: 'test',
    database: ':memory:',
    entities: ['src/**/*.entity{.ts,.js}'],
    synchronize: true,
    dropSchema: true,
    // Use PGlite for in-memory testing
    extra: {
      // Override connection to use PGlite
      connectionString: ':memory:',
    },
  };
};
