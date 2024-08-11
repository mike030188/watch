import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MessageDto, Messages } from '../../libs/dto/message/message';
import { Member } from '../../libs/dto/member/member';
import { MemberService } from '../member/member.service';
import { NotificationService } from '../notification/notification.service';
import { MessageInput, MessagesInquiry } from '../../libs/dto/message/message.input';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { MessageGroup, MessageStatus } from '../../libs/enums/message.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MessageUpdate } from '../../libs/dto/message/message.update';
import { T } from '../../libs/types/common';

@Injectable()
export class MessageService {
	constructor(
		@InjectModel('Message') private readonly messageModel: Model<MessageDto>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly memberService: MemberService,
		private readonly notificationService: NotificationService,
	) {}

	public async createMessage(memberId: ObjectId, input: MessageInput): Promise<MessageDto> {
		input.memberId = memberId;
		const mesId = shapeIntoMongoObjectId(input.messageRefId);

		let result = null;
		console.log('input:', input);

		try {
			result = await this.messageModel.create(input);
		} catch (err) {
			console.error('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
		switch (input.messageGroup) {
			case MessageGroup.AGENT:
				await this.memberService.memberStatsEditor({
					_id: mesId,
					targetKey: 'memberMessages',
					modifier: 1,
				});
				break;
		}

		if (!result) {
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
		return result;
	}

	public async updateMessage(memberId: ObjectId, input: MessageUpdate): Promise<MessageDto> {
		const { _id } = input;
		const result = await this.messageModel
			.findByIdAndUpdate(
				{
					_id: _id,
					memberId: memberId,
					messageStatus: MessageStatus.ACTIVE,
				},
				input,
				{
					new: true,
				},
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async getMessages(memberId: ObjectId, input: MessagesInquiry): Promise<Messages> {
		const { messageRefId } = input.search;
		const match: T = { messageRefId: messageRefId, messageStatus: MessageStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		console.log('match', match);
		console.log('sort', sort);
		const result: Messages[] = await this.messageModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							//meLiked
							lookupMember,
							// { $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}
	public async removeMessage(input: ObjectId): Promise<MessageDto> {
		const result = await this.messageModel.findByIdAndDelete(input).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}
}
