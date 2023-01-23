import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({ example: 'Done', description: 'Column title' })
  @IsString()
  @IsNotEmpty()
  readonly title!: string;
}
