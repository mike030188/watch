import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { MessageDto, Messages } from '../../libs/dto/message/message';
import { MessageInput, MessagesInquiry } from '../../libs/dto/message/message.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { MessageUpdate } from '../../libs/dto/message/message.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class MessageResolver {
	constructor(private readonly messageService: MessageService) {}

	@UseGuards(AuthGuard)
	@Mutation((returns) => MessageDto)
	public async createMessage(
		@Args('input') input: MessageInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<MessageDto> {
		console.log('Mutation: createMessage ');
		return await this.messageService.createMessage(memberId, input);
	}

	@Mutation((returns) => MessageDto)
	public async updateMessage(
		@Args('input') input: MessageUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<MessageDto> {
		console.log('Mutation: updateComment ');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.messageService.updateMessage(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Messages)
	public async getMessages(
		@Args('input') input: MessagesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Messages> {
		console.log('Mutation: getComments ');
		input.search.messageRefId = shapeIntoMongoObjectId(input.search.messageRefId);
		return await this.messageService.getMessages(memberId, input);
	}
	@UseGuards(RolesGuard)
	@Mutation((returns) => MessageDto)
	public async removeMessage(@Args('messageId') input: string): Promise<MessageDto> {
		console.log('Mutation: removeCommentByAdmin');
		const messageId = shapeIntoMongoObjectId(input);
		return await this.messageService.removeMessage(messageId);
	}
}
