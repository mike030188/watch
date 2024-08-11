import { Field, ObjectType } from '@nestjs/graphql';
import { MessageGroup, MessageStatus } from '../../enums/message.enum';
import { ObjectId } from 'mongoose';
import { Member, TotalCounter } from '../member/member';

@ObjectType()
export class MessageDto {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => MessageStatus, { nullable: true })
	messageStatus?: MessageStatus;

	@Field(() => MessageGroup, { nullable: true })
	messageGroup?: MessageGroup;

	@Field(() => String)
	messageContent: string;

	@Field(() => String)
	memberName: string;

	@Field(() => String)
	memberPhone: string;

	@Field(() => String)
	memberEmail: string;

	@Field(() => String, { nullable: true })
	messageRefId?: ObjectId;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation **/

	@Field(() => Member, { nullable: true })
	memberData?: Member;
}

@ObjectType()
export class Messages {
	@Field(() => [MessageDto])
	list: MessageDto[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
