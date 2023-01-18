import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ example: 'Homework tasks', description: 'Board title' })
  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @ApiProperty({ example: 'My board tasks', description: 'Board description' })
  @IsString()
  @IsNotEmpty()
  readonly description!: string;

  @ApiProperty({ example: 'My board tasks', description: 'Board description' })
  @IsString()
  @IsNotEmpty()
  readonly sharedWith!: string;
}
