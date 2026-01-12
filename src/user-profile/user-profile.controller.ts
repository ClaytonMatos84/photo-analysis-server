import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@Controller('user-profiles')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProfile(
    @Request() req: { user: { userId: number } },
    @Body() createUserProfileDto: CreateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.userProfileService.createProfile(
      req.user.userId,
      createUserProfileDto,
    );
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Request() req: { user: { userId: number } },
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.userProfileService.updateProfile(
      req.user.userId,
      updateUserProfileDto,
    );
  }

  @Get()
  async getAuthenticatedUserProfile(
    @Request() req: { user: { userId: number } },
  ): Promise<UserProfileResponseDto> {
    return this.userProfileService.getProfileByUserId(req.user.userId);
  }
}
