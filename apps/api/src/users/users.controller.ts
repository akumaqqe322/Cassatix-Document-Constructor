import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../auth/user.decorator';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Roles('admin', 'lawyer', 'partner')
  getMe(@User() user: any) {
    // The RolesGuard already resolved the user from the database
    // and attached it to the request. The @User decorator extracts it.
    return user;
  }
}
