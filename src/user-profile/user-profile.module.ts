import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from '../auth/user-profile.entity';
import { User } from '../auth/user.entity';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile, User])],
  providers: [UserProfileService],
  controllers: [UserProfileController],
})
export class UserProfileModule {}
