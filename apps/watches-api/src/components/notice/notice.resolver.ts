import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NoticeService } from './notice.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { ObjectId } from 'mongoose';
import { NoticeUpdate } from '../../libs/dto/notice/notice.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class NoticeResolver {
	constructor(private readonly noticeService: NoticeService) {}

	/** ADMIN **/
	@Roles(MemberType.ADMIN, MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Notice)
	public async createNotice(@Args('input') input: NoticeInput, @AuthMember('_id') memberId: ObjectId): Promise<Notice> {
		console.log('Mutation: createNotice');
		input.memberId = memberId;
		const data = await this.noticeService.createNotice(input);
		return data;
	}

	@Roles(MemberType.ADMIN, MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Notice)
	public async updateNotice(
		@Args('input') input: NoticeUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notice> {
		console.log('Mutation: updateNotice');
		const data = await this.noticeService.updateNotice(memberId, input);
		return data;
	}

	@Roles(MemberType.ADMIN, MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Notice)
	public async deleteNotice(@Args('input') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Notice> {
		console.log('Mutation: deleteNotice');
		const noticeId = shapeIntoMongoObjectId(input);
		const data = await this.noticeService.deleteNotice(noticeId);
		return data;
	}

	/** CLIENT **/

	@UseGuards(WithoutGuard)
	@Query((returns) => Notice)
	public async getNotice(@Args('input') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Notice> {
		console.log('Query: getNotice');
		const noticeId = shapeIntoMongoObjectId(input);
		const data = this.noticeService.getNotice(noticeId);

		return data;
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Notices)
	public async getNotices(
		@Args('input') input: NoticeInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notices> {
		console.log('Query: getNotices');
		const data = this.noticeService.getNotices(memberId, input);
		return data;
	}
}
