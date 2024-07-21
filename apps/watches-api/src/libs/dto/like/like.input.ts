import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';
import { LikeGroup } from '../../enums/like.enum';

@InputType()
export class LikeInput {
	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId; // likeni kim sodir etyapti

	@IsNotEmpty()
	@Field(() => String)
	likeRefId: ObjectId; // aynan qaysi targetni like qilmoqda "id"si

	@IsNotEmpty()
	@Field(() => LikeGroup)
	likeGroup: LikeGroup; // qaysi target groupga like bosmoqda (member | property | article)
}
