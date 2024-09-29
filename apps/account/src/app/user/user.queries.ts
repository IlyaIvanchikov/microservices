import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { Body, Controller, Get } from '@nestjs/common';
import { AccountUserCourses, AccountUserInfo } from '@purple/contracts';
import { RMQValidate, RMQRoute, RMQService } from 'nestjs-rmq';

@Controller()
export class UserQueries {
  constructor(private readonly userRepository: UserRepository, private readonly rmqService: RMQService) {}

  @RMQValidate()
  @RMQRoute(AccountUserInfo.topic)
  async userInfo(
    @Body() dto: AccountUserInfo.Request
  ): Promise<AccountUserInfo.Response> {
    const user = await this.userRepository.findUserById(dto.id);

    const profile = new UserEntity(user).getPublicProfile();

    return { profile };
  }

  @RMQValidate()
  @RMQRoute(AccountUserCourses.topic)
  async userCourses(
    @Body() dto: AccountUserCourses.Request
  ): Promise<AccountUserCourses.Response> {
    const user = await this.userRepository.findUserById(dto.id);
    return { courses: user.courses };
  }

  @Get('healthcheck')
  async healthCheck() {
    const isRMQ = await this.rmqService.healthCheck();
    const user = await this.userRepository.healthCheck();
  }
}
