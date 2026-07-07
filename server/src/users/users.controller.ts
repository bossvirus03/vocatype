import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.userId);
  }

  @Post('favorite-domains')
  async updateFavoriteDomains(
    @CurrentUser() user: any,
    @Body('domains') domains: string[],
  ) {
    return this.usersService.updateFavoriteDomains(user.userId, domains);
  }

  @Post('placement-test')
  async savePlacementTest(
    @CurrentUser() user: any,
    @Body('correctRatio') correctRatio: number,
  ) {
    return this.usersService.savePlacementTestResult(user.userId, correctRatio);
  }

  @Get('progress')
  async getProgress(@CurrentUser() user: any) {
    return this.usersService.getProgress(user.userId);
  }

  @Post('progress/lesson')
  async saveLessonProgress(
    @CurrentUser() user: any,
    @Body('level') level: string,
    @Body('lessonNo') lessonNo: number,
    @Body('wpm') wpm: number,
    @Body('accuracy') accuracy: number,
  ) {
    return this.usersService.saveLessonProgress(
      user.userId,
      level,
      lessonNo,
      wpm,
      accuracy,
    );
  }
}
