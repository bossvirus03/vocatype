import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private googleClient;
    constructor(prisma: PrismaService, jwtService: JwtService);
    verifyGoogleToken(token: string): Promise<{
        user: {
            name: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            googleId: string;
            avatar: string | null;
            currentLevel: string;
            favoriteDomains: string[];
        };
        token: string;
        isNewUser: boolean;
    }>;
}
