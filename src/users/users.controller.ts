import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AccessTokenAuthGuard } from 'src/auth/guards';
import { User } from 'src/entities';
import { GetUser } from 'src/libs/decorators';
import { UpdateUserDto } from './dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AccessTokenAuthGuard)
  @Get('profile')
  getUserProfile(@GetUser() user: User) {
    return user;
  }

  @UseGuards(AccessTokenAuthGuard)
  @Patch('/:userId')
  updateUserProfile(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUserProfile(userId, updateUserDto);
  }
}
