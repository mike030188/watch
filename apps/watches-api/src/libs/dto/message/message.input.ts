import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { Direction } from '../../enums/common.enum';
import { availableMessageSorts } from '../../config';
import { MessageGroup } from '../../enums/message.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class MessageInputDto {
	@IsOptional()
	@Field(() => MessageGroup, { nullable: true })
	messageGroup?: MessageGroup;

	@IsNotEmpty()
	@Length(1, 100)
	@Field(() => String)
	messageContent: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberName?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberPhone?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberEmail?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	messageRefId: string;

	memberId?: ObjectId;
}

@InputType()
class MSISearch {
	@IsNotEmpty()
	@Field(() => String)
	messageRefId: ObjectId;
}

@InputType()
export class MessagesInquiryDto {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableMessageSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => MSISearch)
	search: MSISearch;
}
