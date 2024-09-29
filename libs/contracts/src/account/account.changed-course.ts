import { PurchaseState } from '@purple/interfaces';
import { IsEmail, IsString } from 'class-validator';

export namespace AccountChangedCourse {
  export const topic = 'account.changed-course.event';

  export class Request {
    @IsEmail()
    courseId!: string;

    @IsString()
    userId!: string;

    @IsString()
    state!: PurchaseState;
  }
}
