import { Field, InputType, Int } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { FaqStatus, FaqType } from '../../enums/faq.enum';
import { IsNotEmpty, Min, IsOptional, IsIn, Length } from 'class-validator';

@InputType()
export class FaqInput {
	@IsNotEmpty()
	@Length(8, 50)
	@Field(() => String)
	faqQuestion: string;

	@IsNotEmpty()
	@Length(10, 150)
	@Field(() => String)
	faqAnswer: string;

	@IsNotEmpty()
	@Field(() => FaqType)
	faqType: FaqType;

	@IsOptional()
	@Field(() => FaqStatus, { nullable: true })
	faqStatus?: FaqStatus;

	memberId?: ObjectId; // Authenticaion dan memberId qabul qilamiz
}

@InputType()
export class FaqInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@IsIn(Object.values(FaqType))
	@Field(() => FaqType, { nullable: true })
	faqType?: FaqType;

	@IsOptional()
	@IsIn(Object.values(FaqStatus))
	@Field(() => FaqStatus, { nullable: true })
	faqStatus?: FaqStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}
