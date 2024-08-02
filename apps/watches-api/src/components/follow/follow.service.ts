import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { Follower, Followers, Following, Followings } from '../../libs/dto/follow/follow';
import { Direction, Message } from '../../libs/enums/common.enum';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import {
	lookupAuthMemberFollowed,
	lookupAuthMemberLiked,
	lookupFollowerData,
	lookupFollowingData,
} from '../../libs/config';
import { T } from '../../libs/types/common';
import { Member } from '../../libs/dto/member/member';
import { NotificationService } from '../notification/notification.service';
import { MemberStatus } from '../../libs/enums/member.enum';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';

@Injectable()
export class FollowService {
	constructor(
		@InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly memberService: MemberService,
		private notificationService: NotificationService,
	) {}

	public async subscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		// qiymatlari bir xil bo`lganligi bn RefId lari har xil shuning un compare qilyapmiz string koriniwda
		if (followerId.toString() === followingId.toString()) {
			throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);
		}

		const targetMember = await this.memberService.getMember(null, followingId);
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		/** Subscribtionni ro`yhatdan o`tkazyapmiz **/
		const result = await this.registerSubscription(followerId, followingId);

		/* NOTIFICATION for subscribtion */
		const authMember: Member = await this.memberModel
			.findOne({ _id: followerId, memberStatus: MemberStatus.ACTIVE })
			.exec();

		if (!authMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const notificationInput: NotificationInput = {
			notificationType: NotificationType.SUBSCRIBE,
			notificationStatus: NotificationStatus.WAIT,
			notificationGroup: NotificationGroup.ARTICLE,
			notificationTitle: 'Follow',
			notificationDesc: `${authMember.memberNick} followed you!`,
			authorId: followerId,
			receiverId: followingId,
			// propertyId: likeRefId,
		};
		await this.notificationService.createNotification(notificationInput);

		await this.memberService.memberStatsEditor({ _id: followerId, targetKey: 'memberFollowings', modifier: 1 });
		await this.memberService.memberStatsEditor({ _id: followingId, targetKey: 'memberFollowers', modifier: 1 });

		return result;
	}

	private async registerSubscription(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		// DB validation failed => try/catch
		try {
			return await this.followModel.create({
				followingId: followingId,
				followerId: followerId,
			});
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async unsubscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		// unsubscribe bo`lmoqchi bo`lgan memberimiz mavjudmi
		const targetMember = await this.memberService.getMember(null, followingId);
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const result = await this.followModel
			.findOneAndDelete({
				followingId: followingId,
				followerId: followerId,
			})
			.exec();

		/* NOTIFICATION for unsubscribe */
		const authMember: Member = await this.memberModel
			.findOne({ _id: followerId, memberStatus: MemberStatus.ACTIVE })
			.exec();

		if (!authMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const notificationInput: NotificationInput = {
			notificationType: NotificationType.UNSUBSCRIBE,
			notificationStatus: NotificationStatus.WAIT,
			notificationGroup: NotificationGroup.ARTICLE,
			notificationTitle: 'Follow',
			notificationDesc: `${authMember.memberNick} unfollowed you!`,
			authorId: followerId,
			receiverId: followingId,
			// propertyId: likeRefId,
		};
		await this.notificationService.createNotification(notificationInput);

		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		await this.memberService.memberStatsEditor({ _id: followerId, targetKey: 'memberFollowings', modifier: -1 });
		await this.memberService.memberStatsEditor({ _id: followingId, targetKey: 'memberFollowers', modifier: -1 });

		return result;
	}

	public async getMemberFollowings(memberId: ObjectId, input: FollowInquiry): Promise<Followings> {
		const { page, limit, search } = input;
		if (!search?.followerId) throw new InternalServerErrorException(Message.BAD_REQUEST);
		const match: T = { followerId: search?.followerId };
		console.log('match:', match);

		const result = await this.followModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: Direction.DESC } },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							// meLiked
							lookupAuthMemberLiked(memberId, '$followingId'),
							// meFollowed
							lookupAuthMemberFollowed({
								followerId: memberId, //David
								followingId: '$followingId', // Shawn
							}),
							lookupFollowingData, // biz follow bo`lgan memberni to`liq malumotini olib beradi
							{ $unwind: '$followingData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async getMemberFollowers(memberId: ObjectId, input: FollowInquiry): Promise<Followers> {
		const { page, limit, search } = input;
		if (!search?.followingId) throw new InternalServerErrorException(Message.BAD_REQUEST);

		const match: T = { followingId: search?.followingId };
		console.log('match:', match);

		// bu mantiqlar DB da execution bo`ladi {backend da emas => source yemaydi}
		const result = await this.followModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: Direction.DESC } },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							// meLiked
							lookupAuthMemberLiked(memberId, '$followerId'),
							// meFollowed
							lookupAuthMemberFollowed({
								followerId: memberId,
								followingId: '$followerId',
							}),
							lookupFollowerData,
							{ $unwind: '$followerData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}
}
