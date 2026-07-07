import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { WordsService } from './words.service';
import { JwtAuthOptionalGuard } from '../auth/jwt-auth-optional.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get('levels')
  async getLevels() {
    return this.wordsService.getLevels();
  }

  @Get('domains')
  async getDomains() {
    return this.wordsService.getDomains();
  }

  @Get()
  async findAll(
    @Query('level') level?: string,
    @Query('domain') domain?: string,
  ) {
    return this.wordsService.findAll(level, domain);
  }

  @Get('random')
  @UseGuards(JwtAuthOptionalGuard)
  async getRandom(
    @Query('level') level?: string,
    @Query('domain') domain?: string,
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count?: number,
  ) {
    return this.wordsService.getRandom(level, domain, count);
  }

  @Get('lesson')
  @UseGuards(JwtAuthOptionalGuard)
  async getLesson(
    @Query('level') level: string,
    @Query('lessonNo', ParseIntPipe) lessonNo: number,
    @CurrentUser() user?: any,
  ) {
    return this.wordsService.getLessonWords(level, lessonNo, user?.userId);
  }
}
