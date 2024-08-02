import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { NotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { Notification } from '../../libs/dto/notification/notification';
import { T } from '../../libs/types/common';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { NotificationUpdate } from '../../libs/dto/notification/notification.update';

@Injectable()
export class NotificationService {
	constructor(@InjectModel('Notification') private readonly notificationModel: Model<Notification>) {}

	public async createNotification(input: NotificationInput): Promise<Notification> {
		try {
			const result = await this.notificationModel.create(input);
			return result;
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getNotification(authorId: ObjectId, notificationId: ObjectId): Promise<Notification> {
		//* bu yerda searching objectini hosil qilyapmiz
		const search: T = {
			_id: notificationId,
		};

		const targetNotification: Notification = await this.notificationModel.findOne(search).lean().exec(); // *Notification modify qiliw un "lean"ni biriktiryapmiz
		if (!targetNotification) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return targetNotification;
	}

	public async updateNotification(authorId: ObjectId, input: NotificationUpdate): Promise<Notification> {
		const { _id } = input;

		const result = await this.notificationModel
			.findOneAndUpdate({ _id: _id }, input, {
				new: true,
			})
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async getNotifications(memberId: ObjectId, input: NotificationsInquiry): Promise<Notification> {
		const { receiverId } = input.search;
		const match: T = { receiverId: memberId };
		const sort: T = { ['updatedAt']: input?.direction ?? Direction.DESC };

		console.log('match:', match);

		const result = await this.notificationModel
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
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0]; // aggregation [] datani qaytaradi, 1-chi "0-index" turgan qiymatni resultga teng
	}
}
