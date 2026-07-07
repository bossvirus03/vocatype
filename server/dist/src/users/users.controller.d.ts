import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<{
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
    updateFavoriteDomains(user: any, domains: string[]): Promise<{
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
    savePlacementTest(user: any, correctRatio: number): Promise<{
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
    getProgress(user: any): Promise<{
        id: number;
        level: string;
        lessonNo: number;
        userId: number;
        completed: boolean;
        completedAt: Date | null;
        wpm: number | null;
        accuracy: number | null;
    }[]>;
    saveLessonProgress(user: any, level: string, lessonNo: number, wpm: number, accuracy: number): Promise<{
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
