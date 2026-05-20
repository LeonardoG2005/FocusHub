
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
  
  async createUser(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }



  async getUsers() {
    return await this.userRepository.find();
  }


  async getUserById(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }


  async updateUser(id: number, updateUserDto: Partial<User>) {
    if (typeof updateUserDto.password === 'string' && updateUserDto.password.trim()) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.userRepository.update(id, updateUserDto);
    return this.getUserById(id);
  }


  async deleteUser(id: number) {
    const user = await this.getUserById(id);
    if (user) {
      await this.userRepository.delete(id);
      return user;
    }
    return null;
  }
}
