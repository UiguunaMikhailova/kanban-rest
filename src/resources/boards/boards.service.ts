import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';

import { Repository, IsNull, In } from 'typeorm';

import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

import { Board, IBoard } from './boards.entity';
import { User } from '../users/users.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) private boardsRepository: Repository<Board>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwt: JwtService,
  ) {}

  async isExist(id: UUIDType) {
    const resp = await this.boardsRepository.findOne({ where: { id } });
    if (!resp) {
      throw new HttpException('Board was not founded!', HttpStatus.NOT_FOUND);
    }
    return !!resp;
  }

  async getAll(token: string): Promise<IBoard[]> {
    // ! -----------------------------------------------------------------------
    try {
      // ? Get userId from JWT
      const { userId } = this.jwt.decode(token) as {
        userId: string;
        login: string;
      };
      // ? Get from DB boards, that have userId === given iserId, or not have userId at all
      const currentUser = await this.userRepository.findOne({ id: userId });

      console.log('CURRENT USER:', currentUser);
      const ownBoards = await this.boardsRepository.find({
        where: [
          {
            userId,
          },
          {
            userId: IsNull(),
          },
        ],
      });
      // ? Get boards, shared with user form relation
      const sharedBoards = await this.userRepository
        .createQueryBuilder()
        .relation(User, 'sharedBoards')
        .of({ id: userId })
        .loadMany();

      console.log('sharedBoards:', sharedBoards);
      const allBoards = ownBoards.concat(sharedBoards);

      return allBoards;
    } catch (error) {
      throw new Error('Error');
    }
  }

  async getById(id: UUIDType): Promise<IBoard> {
    const board = await this.boardsRepository
      .createQueryBuilder('boards')
      .where({ id })
      .select([
        'boards.id',
        'boards.title',
        'boards.description',
        'columns.id',
        'columns.title',
        'columns.order',
        'tasks.id',
        'tasks.title',
        'tasks.order',
        'tasks.description',
        'tasks.userId',
        'files.filename',
        'files.fileSize',
      ])
      .leftJoin('boards.columns', 'columns')
      .leftJoin('columns.tasks', 'tasks')
      .leftJoin('tasks.files', 'files')
      .getOne();
    // const shared = await this.boardsRepository.findOne(id, { relations: ['sharedWith'] });
    // console.log('This board is shared with:', shared?.sharedWith);
    try {
      const shared = await this.boardsRepository
        .createQueryBuilder('boards')
        .relation(Board, 'sharedWith')
        .of(board)
        .loadMany();
      console.log('This board is shared with:', shared);
    } catch (error) {
      console.log(error);
    }
    if (!board) {
      throw new HttpException('Board was not founded!', HttpStatus.NOT_FOUND);
    }
    return board as IBoard;
  }

  async create(boardDto: CreateBoardDto, token: string): Promise<IBoard> {
    const board = new Board();
    // ? Get userId from JWT
    const { userId } = this.jwt.decode(token) as {
      userId: string;
      login: string;
    };

    board.title = boardDto.title;
    board.description = boardDto.description;
    board.userId = userId;
    // ! -----------------------------------------------------------------------
    const sharedWith = JSON.parse(boardDto.sharedWith);
    console.log('shared:', sharedWith);
    try {
      const usrs = await this.userRepository.find({
        where: { login: In(sharedWith) },
      });
      // console.log('usrs:', usrs);
      board.sharedWith = usrs;
      // ? GET USERS THIS BOARD SHARED WITH
      console.log('SW', board.sharedWith);
    } catch (error) {
      console.log(error);
    }
    // ! _______________________________________________________________________
    try {
      const modelBoard = await this.boardsRepository.save(board);
      return modelBoard;
    } catch (error) {
      console.error('AT SAVE::', error);
      return { id: '', title: 'qwe', description: 'asd' };
    }
  }

  async remove(id: UUIDType): Promise<void> {
    const board = (await this.boardsRepository.findOne({ where: { id } })) as Board;
    if (!board) {
      throw new HttpException('Board was not founded!', HttpStatus.NOT_FOUND);
    }
    await board.remove();
  }

  async update(id: UUIDType, body: UpdateBoardDto): Promise<IBoard> {
    const board = (await this.boardsRepository.findOne({ where: { id } })) as Board;
    if (!board) {
      throw new HttpException('Board was not founded!', HttpStatus.NOT_FOUND);
    }

    board.title = body.title;
    board.description = body.description;
    const data = await board.save();
    return data;
  }
}
