import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { Board } from './boards.entity';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { User } from '../users/users.entity';

@Module({
  providers: [BoardsService],
  controllers: [BoardsController],
  imports: [AuthModule, TypeOrmModule.forFeature([Board, User])],
  exports: [BoardsService],
})
export class BoardsModule {}
