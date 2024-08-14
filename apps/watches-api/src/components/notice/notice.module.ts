import { Module } from '@nestjs/common';
import { NoticeResolver } from './notice.resolver';
import { NoticeService } from './notice.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MemberModule } from '../member/member.module';
import { AuthModule } from '../auth/auth.module';
import NoticeSchema from '../../schemas/Notice.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Notice',
				schema: NoticeSchema,
			},
		]),
		MemberModule,
		AuthModule,
	],
	providers: [NoticeResolver, NoticeService],
})
export class NoticeModule {}
