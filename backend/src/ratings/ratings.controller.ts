import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  create(@Body() createRatingDto: CreateRatingDto) {
    return this.ratingsService.create(createRatingDto);
  }

  @Get()
  findAll() {
    return this.ratingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.findOne(id);
  }

  @Get('movie/:movieId')
  findByMovie(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.ratingsService.findByMovie(movieId);
  }

  @Get('movie/:movieId/average')
  async getAverageRating(
    @Param('movieId', ParseIntPipe) movieId: number,
    @Res() res: Response,
  ) {
    const result = await this.ratingsService.getAverageRating(movieId);
    if (result === null) {
      return res.json(null);
    }
    return res.json(result);
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    return this.ratingsService.update(id, updateRatingDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.ratingsService.remove(id);
  }
}
