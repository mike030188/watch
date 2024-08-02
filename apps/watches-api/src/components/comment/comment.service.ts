import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { PropertyService } from '../property/property.service';
import { BoardArticleService } from '../board-article/board-article.service';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { Comments, Comment } from '../../libs/dto/comment/comment';
import { T } from '../../libs/types/common';
import { lookupMember } from '../../libs/config';
import { Member } from '../../libs/dto/member/member';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Property } from '../../libs/dto/property/property';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModel: Model<Comment>, // yangi hosil bo`ladigan "Comment"ni qaytaryapti
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
		private readonly memberService: MemberService,
		private readonly propertyService: PropertyService,
		private readonly boardArticleService: BoardArticleService,
		private notificationService: NotificationService,
	) {}

	public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
		input.memberId = memberId;

		let result = null;
		try {
			result = await this.commentModel.create(input); // creating "input"data => DB
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}

		switch (input.commentGroup) {
			case CommentGroup.PROPERTY:
				await this.propertyService.propertyStatsEditor({
					_id: input.commentRefId,
					targetKey: 'propertyComments',
					modifier: 1,
				});
				// notification logic
				const property = await this.propertyModel.findOne({ _id: input.commentRefId }).exec();
				if (property) {
					const authMember: Member = await this.memberModel
						.findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
						.exec();

					if (!authMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

					const notificationInput: NotificationInput = {
						notificationType: NotificationType.COMMENT,
						notificationStatus: NotificationStatus.WAIT,
						notificationGroup: NotificationGroup.PROPERTY,
						notificationTitle: 'New Comment',
						notificationDesc: `${authMember.memberNick} commented on your product ${property.propertyModel}`,
						authorId: memberId,
						receiverId: property.memberId,
						propertyId: input.commentRefId,
					};
					await this.notificationService.createNotification(notificationInput);
				}

				break;

			case CommentGroup.ARTICLE:
				await this.boardArticleService.boardArticleStatsEditor({
					_id: input.commentRefId,
					targetKey: 'articleComments',
					modifier: 1,
				});
				// notification logic
				const article = await this.boardArticleModel.findOne({ _id: input.commentRefId }).exec();
				if (article) {
					const authMember: Member = await this.memberModel
						.findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
						.exec();

					if (!authMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

					const notificationInput: NotificationInput = {
						notificationType: NotificationType.COMMENT,
						notificationStatus: NotificationStatus.WAIT,
						notificationGroup: NotificationGroup.ARTICLE,
						notificationTitle: 'New Comment',
						notificationDesc: `${authMember.memberNick} commented on your article ${article.articleTitle}`,
						authorId: memberId,
						receiverId: article.memberId,
						propertyId: input.commentRefId,
					};
					await this.notificationService.createNotification(notificationInput);
				}

				break;
			case CommentGroup.MEMBER:
				await this.memberService.memberStatsEditor({
					_id: input.commentRefId,
					targetKey: 'memberComments',
					modifier: 1,
				});
				// notification logic
				const member = await this.memberModel.findOne({ _id: input.commentRefId }).exec();
				if (member) {
					const notificationInput: NotificationInput = {
						notificationType: NotificationType.COMMENT,
						notificationStatus: NotificationStatus.WAIT,
						notificationGroup: NotificationGroup.MEMBER,
						notificationTitle: 'New Comment',
						notificationDesc: `${member.memberNick} commented on your ${member.memberProperties}`,
						authorId: memberId,
						receiverId: article.memberId,
					};
					await this.notificationService.createNotification(notificationInput);
				}

				break;
		}

		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
		return result;
	}

	public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
		const { _id } = input;
		const result = await this.commentModel
			.findOneAndUpdate(
				{
					_id: _id,
					memberId: memberId,
					commentStatus: CommentStatus.ACTIVE,
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

	public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
		const { commentRefId } = input.search;
		const match: T = { commentRefId: commentRefId, commentStatus: CommentStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result: Comments[] = await this.commentModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meLiked
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async removeCommentByAdmin(input: ObjectId): Promise<Comment> {
		const result = await this.commentModel.findByIdAndDelete(input).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}
}
