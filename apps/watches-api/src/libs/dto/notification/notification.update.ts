import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NotificationStatus } from '../../enums/notification.enum';

@InputType()
export class NotificationUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId; // qaysi notification yangilayotganimizni _id orqali yuboramiz

	@IsOptional()
	@Field(() => NotificationStatus, { nullable: true })
	notificationStatus?: NotificationStatus;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	notificationTitle?: string;

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	notificationDesc?: string;
}
