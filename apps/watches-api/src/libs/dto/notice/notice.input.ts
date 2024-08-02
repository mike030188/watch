import { Field, InputType, Int } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { IsNotEmpty, Min, IsOptional, IsIn, Length } from 'class-validator';
import { NoticeStatus, NoticeType } from '../../enums/notice.enum';
import { Direction } from '../../enums/common.enum';
import { availableNoticeSorts } from '../../config';

@InputType()
export class NoticeInput {
	@IsNotEmpty()
	@Field(() => NoticeType)
	noticeType: NoticeType;

	@IsNotEmpty()
	@Length(1, 300)
	@Field(() => String)
	noticeContent: string;

	@IsOptional()
	@Field(() => NoticeStatus, { nullable: true })
	noticeStatus?: NoticeStatus;

	memberId?: ObjectId; // Authenticaion dan memberId qabul qilamiz
}

@InputType()
export class NoticeInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableNoticeSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsOptional()
	@IsIn(Object.values(NoticeType))
	@Field(() => NoticeType, { nullable: true })
	noticeType?: NoticeType;

	@IsOptional()
	@Field(() => NoticeStatus, { nullable: true })
	noticeStatus?: NoticeStatus;
}
