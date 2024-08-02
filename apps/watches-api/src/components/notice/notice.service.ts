import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { Message } from '../../libs/enums/common.enum';
import { NoticeUpdate } from '../../libs/dto/notice/notice.update';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class NoticeService {
	constructor(
		@InjectModel('Notice') private readonly noticeModel: Model<Notice>,
		private memberService: MemberService,
	) {}

	/** ADMIN **/
	public async createNotice(input: NoticeInput): Promise<Notice> {
		try {
			const result = await this.noticeModel.create(input);

			return result;
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async updateNotice(memberId: ObjectId, input: NoticeUpdate): Promise<Notice> {
		const result: Notice = await this.noticeModel
			.findOneAndUpdate({ _id: input._id, memberId: memberId }, input, { new: true })
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async deleteNotice(noticeId: ObjectId): Promise<Notice> {
		const result: Notice = await this.noticeModel.findOneAndDelete(noticeId).exec();

		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	/** Client **/

	public async getNotice(noticeId: ObjectId): Promise<Notice> {
		const result: Notice = await this.noticeModel.findOne(noticeId).exec();

		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result;
	}

	public async getNotices(memberId: ObjectId, input: NoticeInquiry): Promise<Notices> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { noticeType } = input;

		const match: T = { noticeStatus: NoticeStatus.ACTIVE };
		const sort: T = { ['createdAt']: -1 };
		const result = await this.noticeModel
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

		const noticesResult = result[0];

		const notices: Notices = {
			list: noticesResult.list.map((item: Notice) => ({
				_id: item._id,
				noticeContent: item.noticeContent,
				noticeType: item.noticeType,
				memberData: item.memberData,
				noticeStatus: item.noticeStatus,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			})),
			metaCounter: noticesResult.metaCounter,
		};

		return notices;
	}
}
