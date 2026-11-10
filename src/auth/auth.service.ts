import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_SECRET = 'access-secret-key-1234';
  private readonly JWT_REFRESH_SECRET = 'refresh-secret-key-5678';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('อีเมลนี้ถูกใช้งานแล้ว');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        fullName: dto.fullName,
      },
    });

    const { passwordHash, ...result } = user;
    return {
      message: 'การลงทะเบียนสำเร็จ',
      user: result,
    };
  } 

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูฏต้อง')
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    const { passwordHash, ...result } = user;
    return {
      message: 'เข้าสู่ระบบสำเร็จ',
      user: result,
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refresh_token, {
        secret: this.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('ไม่พบข้อมูลผู้ใช้งาน');
      }

      return await this.generateTokens(user.id, user.email);
    } 
      catch(error) {
        throw new UnauthorizedException('Refresh Token ไม่ถูกต้องหรือหมดอายุ');
      }
   }

   private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.JWT_ACCESS_SECRET,
        expiresIn: '15m',  
      }),
      this.jwtService.signAsync(payload, {
        secret: this.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
   }
}
