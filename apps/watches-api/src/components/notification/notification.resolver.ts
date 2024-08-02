import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { UseGuards } from '@nestjs/common';
import { WithoutGuard } from '../auth/guards/without.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Notification } from '../../libs/dto/notification/notification';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { NotificationUpdate } from '../../libs/dto/notification/notification.update';
import { AuthGuard } from '../auth/guards/auth.guard';
import { NotificationsInquiry } from '../../libs/dto/notification/notification.input';

@Resolver()
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(WithoutGuard) // any users can access
	@Query((returns) => Notification)
	public async getNotification(
		@Args('notificationId') input: string, // frtEnddan "notificationId" orqali string value yuborilyapti (MongoDB Id)
		@AuthMember('_id') authorId: ObjectId, // if noAuth memb => return null
	): Promise<Notification> {
		console.log('Query: getNotification');
		const notificationId = shapeIntoMongoObjectId(input);
		return await this.notificationService.getNotification(authorId, notificationId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async updateNotification(
		@Args('input') input: NotificationUpdate,
		@AuthMember('_id') authorId: ObjectId,
	): Promise<Notification> {
		console.log('Mutation: updateNotification');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.notificationService.updateNotification(authorId, input);
	}

	@UseGuards(WithoutGuard) // any users can access
	@Query((returns) => Notification)
	public async getNotifications(
		@Args('input') input: NotificationsInquiry, // clientdan talab etiladigan 'input' type
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification> {
		console.log('Query: getNotifications');
		return await this.notificationService.getNotifications(memberId, input);
	}
}
