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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const google_auth_library_1 = require("google-auth-library");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    googleClient;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.googleClient = new google_auth_library_1.OAuth2Client();
    }
    async verifyGoogleToken(token) {
        try {
            const audience = process.env.GOOGLE_CLIENT_ID;
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                ...(audience ? { audience } : {}),
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new common_1.UnauthorizedException('Token Google không hợp lệ');
            }
            const { email, name, picture, sub: googleId } = payload;
            if (!email) {
                throw new common_1.UnauthorizedException('Không thể lấy email từ Google OAuth');
            }
            let user = await this.prisma.user.findUnique({
                where: { googleId },
            });
            let isNewUser = false;
            if (!user) {
                isNewUser = true;
                user = await this.prisma.user.create({
                    data: {
                        email,
                        name: name || email.split('@')[0],
                        avatar: picture || '',
                        googleId,
                        currentLevel: 'A1',
                        favoriteDomains: [],
                    },
                });
            }
            const jwtToken = this.jwtService.sign({
                userId: user.id,
                email: user.email,
            });
            return {
                user,
                token: jwtToken,
                isNewUser,
            };
        }
        catch (error) {
            console.error('Lỗi OAuth Google:', error);
            throw new common_1.UnauthorizedException('Xác thực Google thất bại');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map