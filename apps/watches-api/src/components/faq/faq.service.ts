import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Faq, Faqs } from '../../libs/dto/faq/faq';
import { Model, ObjectId } from 'mongoose';
import { FaqInput, FaqInquiry } from '../../libs/dto/faq/faq.input';
import { Message } from '../../libs/enums/common.enum';
import { FaqUpdate } from '../../libs/dto/faq/faq.update';
import { T } from '../../libs/types/common';

@Injectable()
export class FaqService {
	constructor(@InjectModel('Faq') private readonly faqModel: Model<Faq>) {}

	/** ADMIN**/
	public async createFaq(memberId: ObjectId, input: FaqInput): Promise<Faq> {
		input.memberId = memberId;

		const result: Faq = await this.faqModel.create(input);

		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

		return result;
	}

	public async updateFaq(memberId: ObjectId, input: FaqUpdate): Promise<Faq> {
		console.log(input, 'FAQ INPUT');

		const result: Faq = await this.faqModel
			.findOneAndUpdate({ _id: input._id, memberId: memberId }, input, {
				new: true,
			})
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async deleteFaq(faqId: ObjectId): Promise<Faq> {
		const result: Faq = await this.faqModel.findOneAndDelete(faqId).exec();

		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	/** CLIENT **/

	public async getFaq(faqId: ObjectId): Promise<Faq> {
		const result: Faq = await this.faqModel.findOne(faqId).exec();

		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result;
	}

	public async getFaqs(memberId: ObjectId, input: FaqInquiry): Promise<Faqs> {
		const { faqType, faqStatus, text } = input;
		const match: T = {};
		if (faqType) {
			match.faqType = faqType;
		}
		if (faqStatus) {
			match.faqStatus = faqStatus;
		}
		if (text) {
			// match.faqAnswer = { $regex: new RegExp(text, 'i') };
			match.faqQuestion = { $regex: new RegExp(text, 'i') };
		}

		const sort: T = { ['createdAt']: -1 };
		const result = await this.faqModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result || !result[0]) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const faqsResult = result[0];

		const faqsDto: Faqs = {
			list: faqsResult.list.map((item: Faq) => ({
				_id: item._id,
				faqQuestion: item.faqQuestion,
				faqAnswer: item.faqAnswer,
				faqType: item.faqType,
				faqStatus: item.faqStatus,
				memberData: item.memberData,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			})),
			metaCounter: faqsResult.metaCounter,
		};

		return faqsDto;
	}
}
