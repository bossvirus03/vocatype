"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        return user;
    }
    async updateFavoriteDomains(userId, domains) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { favoriteDomains: domains },
        });
    }
    async savePlacementTestResult(userId, correctRatio) {
        let initialLevel = 'A1';
        if (correctRatio >= 0.8) {
            initialLevel = 'B2';
        }
        else if (correctRatio >= 0.6) {
            initialLevel = 'B1';
        }
        else if (correctRatio >= 0.4) {
            initialLevel = 'A2';
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { currentLevel: initialLevel },
        });
    }
    async getProgress(userId) {
        return this.prisma.userProgress.findMany({
            where: { userId },
            orderBy: [{ level: 'asc' }, { lessonNo: 'asc' }],
        });
    }
    async saveLessonProgress(userId, level, lessonNo, wpm, accuracy) {
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
        const completedLessonsCount = await this.prisma.userProgress.count({
            where: {
                userId,
                level,
                completed: true,
            },
        });
        if (completedLessonsCount >= 20) {
            const nextLevelMap = {
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map