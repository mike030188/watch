import { Module } from '@nestjs/common';
import { MessageResolver } from './messaging.resolver';
import { MessageService } from './messaging.service';
import { MongooseModule } from '@nestjs/mongoose';
import MessageSchema from '../../schemas/Message.model';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { PropertyModule } from '../property/property.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
		AuthModule,
		MemberModule,
		PropertyModule,
		NotificationModule,
	],
	providers: [MessageResolver, MessageService],
})
export class MessageModule {}
