import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/user.model';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async createUser(user: UserEntity): Promise<User> {
    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async findUser(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async deleteUser(email: string) {
    return this.userModel.deleteOne({ email }).exec();
  }

  async findUserById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async updateUser(user: UserEntity): Promise<User> {
    return this.userModel.findByIdAndUpdate(user._id, user).exec();
  }

  async healthCheck() {
    return this.userModel.findOne({}).exec();
  }
}
