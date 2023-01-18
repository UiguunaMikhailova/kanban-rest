import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column as ColumnPg,
  OneToMany,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Task } from '../tasks/tasks.entity';
import { Column } from '../columns/columns.entity';
import { User } from '../users/users.entity';

import { CreateColumnDto } from '../columns/dto/create-column.dto';

export interface IColumn {
  id: UUIDType;
  title: string;
  order: number;
}

export interface IBoard {
  id: UUIDType;
  title: string;
  description: string;
}

/**
 * Class Board format.
 */
@Entity('boards')
export class Board extends BaseEntity {
  /** @public uuid record */
  @ApiProperty({ example: '9a111e19-24ec-43e1-b8c4-13776842b8d5', description: 'ID Board' })
  @PrimaryGeneratedColumn('uuid')
  id!: UUIDType;

  /** @public user uuid */
  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: string;

  /** @public user uuid */
  @ApiProperty({ example: '40af606c-c0bb-47d1-bc20-a2857242cde3', description: 'ID of the User who owns the Board' })
  @ColumnPg({ nullable: true })
  userId!: string | null;

  /** @public title board */
  @ApiProperty({ example: 'Homework tasks', description: 'Board title' })
  @ColumnPg()
  title!: string;

  /** @public description board */
  @ApiProperty({ example: 'My board tasks', description: 'Board description' })
  @ColumnPg()
  description!: string;

  /** @public array of objects the column */
  @OneToMany(() => Column, (column) => column.board, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  columns!: CreateColumnDto[];

  @OneToMany(() => Task, (task) => task.board, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  tasks!: Task[];

  // ! -------------------------------------------------------------------------
  @ManyToMany(() => User, (user) => user.sharedBoards)
  @JoinTable()
  sharedWith!: User[];
}
