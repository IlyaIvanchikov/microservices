import {
  CourseGetCourse,
  PaymentCheck,
  PaymentGenerateLink,
  PaymentStatus,
} from '@purple/contracts';
import { UserEntity } from '../entities/user.entity';
import { BuyCourseSagaState } from './buy-course.state';
import { PurchaseState } from '@purple/interfaces';

export class BuyCourseSagaStateStarted extends BuyCourseSagaState {
  public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    const { course } = await this.saga.rmqService.send<
      CourseGetCourse.Request,
      CourseGetCourse.Response
    >(CourseGetCourse.topic, {
      id: this.saga.courseId,
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.price === 0) {
      this.saga.user.setCourseStatus(course._id, PurchaseState.Purchased);
      return {
        paymentLink: null,
        user: this.saga.user,
      };
    }

    const { paymentLink } = await this.saga.rmqService.send<
      PaymentGenerateLink.Request,
      PaymentGenerateLink.Response
    >(PaymentGenerateLink.topic, {
      courseId: course._id,
      userId: this.saga.user._id,
      sum: course.price,
    });

    this.saga.setState(PurchaseState.WaitingForPayment, course._id);

    return { paymentLink, user: this.saga.user };
  }
  public checkPayment(): never {
    throw new Error('not to check payment');
  }
  public async cancel(): Promise<{ user: UserEntity }> {
    this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
    return {
      user: this.saga.user,
    };
  }
}

export class BuyCourseSagaStateWaitingForPayment extends BuyCourseSagaState {
  public pay(): never {
    throw new Error('state is processing');
  }

  public async checkPayment(): Promise<{
    user: UserEntity;
    status: PaymentStatus;
  }> {
    const { status } = await this.saga.rmqService.send<
      PaymentCheck.Request,
      PaymentCheck.Response
    >(PaymentCheck.topic, {
      courseId: this.saga.courseId,
      userId: this.saga.user._id,
    });

    if (status === 'success') {
      this.saga.setState(PurchaseState.Purchased, this.saga.courseId);
      return {
        user: this.saga.user,
        status
      };
    }

    if (status === 'cancel') {
      this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
      return {
        user: this.saga.user,
        status
      };
    }

    if (status === 'progress') {
      return {
        user: this.saga.user,
        status
      };
    }
  }

  public cancel(): never {
    throw new Error('not to cancel');
  }
}

export class BuyCourseSagaStatePurchased extends BuyCourseSagaState {
  public pay(): never {
    throw new Error('state is finished');
  }

  public checkPayment(): never {
    throw new Error('state is finished');
  }

  public cancel(): never {
    throw new Error('state is finished');
  }
}

export class BuyCourseSagaStateCanceled extends BuyCourseSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    this.saga.setState(PurchaseState.Started, this.saga.courseId);
    return this.saga.getState().pay();
  }

  public checkPayment(): never {
    throw new Error('state is canceled');
  }

  public cancel(): never {
    throw new Error('state is canceled');
  }
}
