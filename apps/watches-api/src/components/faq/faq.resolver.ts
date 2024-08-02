import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FaqService } from './faq.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Faq, Faqs } from '../../libs/dto/faq/faq';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { FaqInput, FaqInquiry } from '../../libs/dto/faq/faq.input';
import { ObjectId } from 'mongoose';
import { FaqUpdate } from '../../libs/dto/faq/faq.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class FaqResolver {
	constructor(private readonly faqService: FaqService) {}

	/** ADMIN **/
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Faq)
	public async createFaq(@Args('input') input: FaqInput, @AuthMember('_id') memberId: ObjectId): Promise<Faq> {
		console.log('Mutation: createFaq');
		console.log(input, '***************');

		const data = await this.faqService.createFaq(memberId, input);
		return data;
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Faq)
	public async updateFaq(@Args('input') input: FaqUpdate, @AuthMember('_id') memberId: ObjectId): Promise<Faq> {
		console.log('Mutation: updateFaq');
		const data = await this.faqService.updateFaq(memberId, input);
		return data;
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Faq)
	public async deleteFaq(@Args('input') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Faq> {
		console.log('Mutation: deleteFaq');
		const faqId = shapeIntoMongoObjectId(input);
		const data = await this.faqService.deleteFaq(faqId);
		return data;
	}

	/** CLIENT **/

	@UseGuards(WithoutGuard)
	@Query((returns) => Faq)
	public async getFaq(@Args('input') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Faq> {
		console.log('Query: getFaq');
		const faqId = shapeIntoMongoObjectId(input);
		const data = this.faqService.getFaq(faqId);

		return data;
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Faqs)
	public async getFaqs(@Args('input') input: FaqInquiry, @AuthMember('_id') memberId: ObjectId): Promise<Faqs> {
		console.log('Query: getFaqs');

		const data = this.faqService.getFaqs(memberId, input);

		return data;
	}
}
