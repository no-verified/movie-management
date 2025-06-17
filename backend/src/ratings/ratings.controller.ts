import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from './dto';
import { ApiKeyGuard } from '../auth/guards';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  create(@Body(ValidationPipe) createRatingDto: CreateRatingDto) {
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
  getAverageRating(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.ratingsService.getAverageRating(movieId);
  }

  @Patch(':id')
  @UseGuards(ApiKeyGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateRatingDto: UpdateRatingDto,
  ) {
    return this.ratingsService.update(id, updateRatingDto);
  }

  @Delete(':id')
  @UseGuards(ApiKeyGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.remove(id);
  }
}
