import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }])], // memberSchema modelini wakllantiryapmiz
	providers: [MemberResolver, MemberService],
})
export class MemberModule {}
