import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';

import { Repository, IsNull, In } from 'typeorm';

import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

import { Board, IBoard } from './boards.entity';
import { User } from '../users/users.entity';

const getUniqueByProp = (arr: Array<IBoard>, prop: keyof IBoard) => [
  ...new Map(arr.map((obj) => [obj[prop], obj])).values(),
];

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
      throw new HttpException('Board not found!', HttpStatus.NOT_FOUND);
    }
    return !!resp;
  }

  async getAll(token: string): Promise<IBoard[]> {
    try {
      const { userId } = this.jwt.decode(token) as {
        userId: string;
        login: string;
      };

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

      const sharedBoards = await this.userRepository
        .createQueryBuilder()
        .relation(User, 'sharedBoards')
        .of({ id: userId })
        .loadMany();

      const allBoards = ownBoards.concat(sharedBoards);

      return getUniqueByProp(allBoards, 'id') as IBoard[];
    } catch (error) {
      throw new HttpException('Can not get boards.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(id: UUIDType): Promise<IBoard> {
    const board = await this.boardsRepository
      .createQueryBuilder('boards')
      .where({ id })
      .select([
        'boards.userId',
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
        'shared.id',
        'shared.login',
      ])
      .leftJoin('boards.columns', 'columns')
      .leftJoin('columns.tasks', 'tasks')
      .leftJoin('tasks.files', 'files')
      .leftJoin('boards.sharedWith', 'shared')
      .getOne();

    if (!board) {
      throw new HttpException('Board not found!', HttpStatus.NOT_FOUND);
    }
    return board as IBoard;
  }

  async create(boardDto: CreateBoardDto, token: string): Promise<IBoard> {
    const board = new Board();

    const { userId } = this.jwt.decode(token) as {
      userId: string;
      login: string;
    };

    board.title = boardDto.title;
    board.description = boardDto.description;
    board.userId = userId;
    board.sharedWith = [];

    try {
      const modelBoard = await this.boardsRepository.save(board);
      return modelBoard;
    } catch (error) {
      throw new HttpException('Can not save board to DB.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: UUIDType): Promise<void> {
    const board = (await this.boardsRepository.findOne({ where: { id } })) as Board;
    if (!board) {
      throw new HttpException('Board not found!', HttpStatus.NOT_FOUND);
    }
    await board.remove();
  }

  async update(id: UUIDType, body: UpdateBoardDto): Promise<IBoard> {
    const shared: string[] = body.sharedWith ? body.sharedWith : [];

    const board = (await this.boardsRepository.findOne({ where: { id } })) as Board;

    const sharedWith = await this.userRepository.find({
      where: {
        login: In(shared),
      },
    });

    if (!board) {
      throw new HttpException('Board not found!', HttpStatus.NOT_FOUND);
    }

    board.title = body.title;
    board.description = body.description;
    board.sharedWith = sharedWith;

    const data = await board.save();

    return data;
  }
}
