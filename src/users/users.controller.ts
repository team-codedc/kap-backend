import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccessTokenAuthGuard } from 'src/auth/guards';
import { User } from 'src/entities';
import { GetUser } from 'src/libs/decorators';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AccessTokenAuthGuard)
  @Get('profile')
  getUserProfile(@GetUser() user: User) {
    return user;
  }
}
