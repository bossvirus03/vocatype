import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    googleLogin(token: string): Promise<{
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
