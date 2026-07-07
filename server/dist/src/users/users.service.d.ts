import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: number): Promise<{
        name: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        googleId: string;
        avatar: string | null;
        currentLevel: string;
        favoriteDomains: string[];
    }>;
    updateFavoriteDomains(userId: number, domains: string[]): Promise<{
        name: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        googleId: string;
        avatar: string | null;
        currentLevel: string;
        favoriteDomains: string[];
    }>;
    savePlacementTestResult(userId: number, correctRatio: number): Promise<{
        name: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        googleId: string;
        avatar: string | null;
        currentLevel: string;
        favoriteDomains: string[];
    }>;
    getProgress(userId: number): Promise<{
        id: number;
        level: string;
        lessonNo: number;
        userId: number;
        completed: boolean;
        completedAt: Date | null;
        wpm: number | null;
        accuracy: number | null;
    }[]>;
    saveLessonProgress(userId: number, level: string, lessonNo: number, wpm: number, accuracy: number): Promise<{
        id: number;
        level: string;
        lessonNo: number;
        userId: number;
        completed: boolean;
        completedAt: Date | null;
        wpm: number | null;
        accuracy: number | null;
    }>;
}
