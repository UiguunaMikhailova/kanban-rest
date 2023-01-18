import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import bcrypt = require('bcryptjs');

import { User } from '../users/users.entity';
import { SigninUserDto } from './dto/signin-user.dto';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>, private jwtService: JwtService) {}

  async signin(body: SigninUserDto): Promise<{ token: string }> {
    const user = await this.usersRepository.findOne({ select: ['id', 'password'], where: { login: body.login } });
    if (!user) {
      throw new HttpException('User was not founded!', HttpStatus.FORBIDDEN);
    }

    const match = await bcrypt.compare(body.password, user.password);
    if (!match) {
      throw new HttpException('User was not founded!', HttpStatus.FORBIDDEN);
    }
    try {
      const token = this.jwtService.sign({ userId: user.id, login: body.login }, {secret: process.env.JWT_SECRET_KEY});

      return { token };
    } catch (error) {
      throw new Error('Error');
    }
  }
}
