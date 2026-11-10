import { Controller, Get, Patch, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile, HttpCode, HttpStatus, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AvatarValidationPipe } from './pipes/avatar-validation.pipe'; 

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return this.usersService.getProfile(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @Request() req,
    @UploadedFile(new AvatarValidationPipe()) file: any,
  ) {
    return this.usersService.uploadAvatar(req.user.id, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAvatar(@Request() req) {
    return this.usersService.removeAvatar(req.user.id);
  }
}