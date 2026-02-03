import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsString, MaxLength } from 'class-validator';
import { LeaveType } from '@prisma/client';

export class CreateLeaveDto {
  @ApiProperty({ enum: LeaveType, example: 'VL', description: 'Type of leave (VL or SL)' })
  @IsEnum(LeaveType)
  type: LeaveType;

  @ApiProperty({ example: '2026-03-01', description: 'Start date in ISO 8601 format' })
  @IsISO8601()
  startDate: string;

  @ApiProperty({ example: '2026-03-05', description: 'End date in ISO 8601 format' })
  @IsISO8601()
  endDate: string;

  @ApiProperty({ example: 'Family vacation', maxLength: 500, description: 'Reason for leave request' })
  @IsString()
  @MaxLength(500)
  reason: string;
}
