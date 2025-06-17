import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActorsService } from './actors.service';
import { ActorsController } from './actors.controller';
import { Actor } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Actor])],
  controllers: [ActorsController],
  providers: [ActorsService],
  exports: [ActorsService],
})
export class ActorsModule {}
