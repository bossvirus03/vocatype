import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client();
  }

  async verifyGoogleToken(token: string) {
    try {
      const audience = process.env.GOOGLE_CLIENT_ID;
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        ...(audience ? { audience } : {}),
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Token Google không hợp lệ');
      }

      const { email, name, picture, sub: googleId } = payload;
      if (!email) {
        throw new UnauthorizedException('Không thể lấy email từ Google OAuth');
      }

      // Tìm hoặc tạo user
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

      // Ký token
      const jwtToken = this.jwtService.sign({
        userId: user.id,
        email: user.email,
      });

      return {
        user,
        token: jwtToken,
        isNewUser,
      };
    } catch (error) {
      console.error('Lỗi OAuth Google:', error);
      throw new UnauthorizedException('Xác thực Google thất bại');
    }
  }
}
