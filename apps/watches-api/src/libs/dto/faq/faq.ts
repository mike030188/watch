import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Member, TotalCounter } from '../member/member';
import { FaqStatus, FaqType } from '../../enums/faq.enum';

@ObjectType()
export class Faq {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	faqQuestion: string;

	@Field(() => String)
	faqAnswer: string;

	@Field(() => FaqType)
	faqType: FaqType;

	@Field(() => FaqStatus, { nullable: true })
	faqStatus?: FaqStatus;

	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => Date, { nullable: true })
	createdAt?: Date;

	@Field(() => Date, { nullable: true })
	updatedAt?: Date;
}

@ObjectType()
export class Faqs {
	@Field(() => [Faq])
	list: Faq[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
