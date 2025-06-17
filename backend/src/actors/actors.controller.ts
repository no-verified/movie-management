import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ActorsService } from './actors.service';
import { CreateActorDto, UpdateActorDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  create(@Body() createActorDto: CreateActorDto) {
    return this.actorsService.create(createActorDto);
  }

  @Get('recent')
  findRecent() {
    return this.actorsService.findRecent();
  }

  @Get()
  findAll(@Query('search') search?: string) {
    if (search) {
      return this.actorsService.search(search);
    }
    return this.actorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.actorsService.findOne(id);
  }

  @Get(':id/movies')
  getMoviesByActor(@Param('id', ParseIntPipe) id: number) {
    return this.actorsService.findOne(id).then((actor) => actor.movies);
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActorDto: UpdateActorDto,
  ) {
    return this.actorsService.update(id, updateActorDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.actorsService.remove(id);
  }
}
