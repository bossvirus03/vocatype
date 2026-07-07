import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async updateFavoriteDomains(userId: number, domains: string[]) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { favoriteDomains: domains },
    });
  }

  async savePlacementTestResult(userId: number, correctRatio: number) {
    // Xác định cấp độ xuất phát dựa trên tỷ lệ đúng
    let initialLevel = 'A1';
    if (correctRatio >= 0.8) {
      initialLevel = 'B2';
    } else if (correctRatio >= 0.6) {
      initialLevel = 'B1';
    } else if (correctRatio >= 0.4) {
      initialLevel = 'A2';
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { currentLevel: initialLevel },
    });
  }

  async getProgress(userId: number) {
    return this.prisma.userProgress.findMany({
      where: { userId },
      orderBy: [{ level: 'asc' }, { lessonNo: 'asc' }],
    });
  }

  async saveLessonProgress(userId: number, level: string, lessonNo: number, wpm: number, accuracy: number) {
    const progress = await this.prisma.userProgress.upsert({
      where: {
        userId_level_lessonNo: {
          userId,
          level,
          lessonNo,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
        wpm: Math.max(wpm, 0),
        accuracy: Math.max(accuracy, 0),
      },
      create: {
        userId,
        level,
        lessonNo,
        completed: true,
        completedAt: new Date(),
        wpm,
        accuracy,
      },
    });

    // Kiểm tra xem đã hoàn thành 20 bài chưa để lên cấp tiếp theo
    const completedLessonsCount = await this.prisma.userProgress.count({
      where: {
        userId,
        level,
        completed: true,
      },
    });

    if (completedLessonsCount >= 20) {
      const nextLevelMap: Record<string, string> = {
        'A1': 'A2',
        'A2': 'B1',
        'B1': 'B2',
        'B2': 'C1',
        'C1': 'C2',
      };

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        const nextLevel = nextLevelMap[level];
        const levelsOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentIdx = levelsOrder.indexOf(user.currentLevel);
        const nextIdx = levelsOrder.indexOf(nextLevel);

        if (nextLevel && nextIdx > currentIdx) {
          await this.prisma.user.update({
            where: { id: userId },
            data: { currentLevel: nextLevel },
          });
        }
      }
    }

    return progress;
  }
}
