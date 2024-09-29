import { AccountChangedCourse } from '@purple/contracts';
import {
  IDomainEvent,
  IUser,
  IUserCourses,
  PurchaseState,
  UserRole,
} from '@purple/interfaces';
import { compare, genSalt, hash } from 'bcrypt';

export class UserEntity implements IUser {
  _id?: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses?: IUserCourses[];
  events: IDomainEvent[] = [];

  constructor(user: IUser) {
    this._id = user._id;
    this.displayName = user.displayName;
    this.passwordHash = user.passwordHash;
    this.email = user.email;
    this.role = user.role;
    this.courses = user.courses;
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public validatePassword(password: string) {
    return compare(password, this.passwordHash);
  }

  public updateProfile(displayName: string) {
    this.displayName = displayName;
    return this;
  }

  public getPublicProfile() {
    return {
      displayName: this.displayName,
      email: this.email,
      role: this.role,
    };
  }

  public getCourseState(courseId: string): PurchaseState {
    return (
      this.courses.find((c) => c.courseId === courseId)?.purchaseState ??
      PurchaseState.Started
    );
  }

  public setCourseStatus(courseId: string, state: PurchaseState) {
    const isExist = this.courses.find((course) => course.courseId === courseId);

    if (!isExist) {
      this.courses.push({
        courseId,
        purchaseState: state,
      });
      return this;
    }

    if (state === PurchaseState.Canceled) {
      this.courses = this.courses.filter(
        (course) => course.courseId !== courseId
      );
      return this;
    }

    this.courses.map((course) => {
      if (course.courseId === courseId) {
        course.purchaseState = state;
        return course;
      }

      return course;
    });

    this.events.push({
      topic: AccountChangedCourse.topic,
      payload: {
        courseId,
        state,
        userId: this._id,
      },
    });

    return this;
  }
}
