import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../auth/user-profile.entity';
import { User } from '../auth/user.entity';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import moment from 'moment';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectPinoLogger(UserProfileService.name)
    private readonly logger: PinoLogger,
  ) {}

  async createProfile(
    userId: number,
    createUserProfileDto: CreateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    this.logger.debug({ userId }, 'Creating user profile');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn({ userId }, 'User not found');
      throw new NotFoundException('Usuário não encontrado.');
    }

    const existingProfile = await this.userProfileRepository.findOne({
      where: { userId },
    });
    if (existingProfile) {
      this.logger.warn({ userId }, 'User profile already exists');
      throw new BadRequestException('Perfil do usuário já existe.');
    }

    const birthDate = createUserProfileDto.birthDate
      ? typeof createUserProfileDto.birthDate === 'string'
        ? this.parseBrazilianDate(createUserProfileDto.birthDate)
        : createUserProfileDto.birthDate
      : null;

    const userProfile = this.userProfileRepository.create({
      name: createUserProfileDto.name,
      birthDate: birthDate || undefined,
      address: createUserProfileDto.address,
      profession: createUserProfileDto.profession,
      user: user,
    });

    await this.userProfileRepository.save(userProfile);
    this.logger.info(
      { userId, profileId: userProfile.id },
      'User profile created',
    );

    return this.buildResponseDto(user, userProfile);
  }

  async updateProfile(
    userId: number,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    this.logger.debug({ userId }, 'Updating user profile');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn({ userId }, 'User not found');
      throw new NotFoundException('Usuário não encontrado.');
    }

    const userProfile = await this.userProfileRepository.findOne({
      where: { userId },
    });
    if (!userProfile) {
      this.logger.warn({ userId }, 'User profile not found');
      throw new NotFoundException('Perfil do usuário não encontrado.');
    }

    if (updateUserProfileDto.name !== undefined) {
      userProfile.name = updateUserProfileDto.name;
    }
    if (updateUserProfileDto.birthDate !== undefined) {
      userProfile.birthDate = this.parseBrazilianDate(
        updateUserProfileDto.birthDate,
      );
    }
    if (updateUserProfileDto.address !== undefined) {
      userProfile.address = updateUserProfileDto.address;
    }
    if (updateUserProfileDto.profession !== undefined) {
      userProfile.profession = updateUserProfileDto.profession;
    }

    await this.userProfileRepository.save(userProfile);
    this.logger.info({ userId }, 'User profile updated');

    return this.buildResponseDto(user, userProfile);
  }

  async getProfileByUserId(userId: number): Promise<UserProfileResponseDto> {
    this.logger.debug({ userId }, 'Fetching user profile by user ID');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn({ userId }, 'User not found');
      throw new NotFoundException('Usuário não encontrado.');
    }

    const userProfile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    return this.buildResponseDto(user, userProfile || ({} as UserProfile));
  }

  private buildResponseDto(
    user: User,
    userProfile: UserProfile,
  ): UserProfileResponseDto {
    return {
      id: user.id,
      username: user.username,
      name: userProfile.name || undefined,
      birthDate: userProfile.birthDate
        ? this.formatToBrazilianDate(userProfile.birthDate)
        : undefined,
      address: userProfile.address || undefined,
      profession: userProfile.profession || undefined,
    };
  }

  private parseBrazilianDate(date: string): Date {
    const [day, month, year] = date.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  private formatToBrazilianDate(date: Date): string {
    console.log(date);

    const formattedDate = moment(date).format('DD/MM/YYYY');
    return formattedDate;
  }
}
