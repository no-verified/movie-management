import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { MoviesModule } from './movies/movies.module';
import { ActorsModule } from './actors/actors.module';
import { RatingsModule } from './ratings/ratings.module';
import { SeedingModule } from './seeding/seeding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),
    MoviesModule,
    ActorsModule,
    RatingsModule,
    SeedingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
