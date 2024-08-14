/* eslint-disable @typescript-eslint/no-unused-vars */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MessageInputDto, MessagesInquiryDto } from '../../libs/dto/message/message.input';
import { MessageUpdateDto } from '../../libs/dto/message/message.update';
import { MessageService } from './messaging.service';
import { MessageDto, MessagesDto } from '../../libs/dto/message/message';

@Resolver()
export class MessageResolver {
	constructor(private readonly messageService: MessageService) {}

	@UseGuards(AuthGuard)
	@Mutation((returns) => MessageDto)
	public async createMessage(
		@Args('input') input: MessageInputDto,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<MessageDto> {
		console.log('Mutation: createMessage ');
		return await this.messageService.createMessage(memberId, input);
	}

	@Mutation((returns) => MessageDto)
	public async updateMessage(
		@Args('input') input: MessageUpdateDto,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<MessageDto> {
		console.log('Mutation: updateComment ');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.messageService.updateMessage(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => MessagesDto)
	public async getMessages(
		@Args('input') input: MessagesInquiryDto,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<MessagesDto> {
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
