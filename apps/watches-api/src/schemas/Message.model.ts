import { Schema } from 'mongoose';
import { MessageGroup, MessageStatus } from '../libs/enums/message.enum';

const MessageSchema = new Schema(
	{
		messageStatus: {
			type: String,
			enum: MessageStatus,
			default: MessageStatus.ACTIVE,
		},

		messageGroup: {
			type: String,
			enum: MessageGroup,
		},

		messageContent: {
			type: String,
			required: true,
		},

		memberName: {
			type: String,
		},

		memberPhone: {
			type: String,
		},

		memberEmail: {
			type: String,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member', // Assuming there is a User model
		},

		messageRefId: {
			type: String,
		},
	},
	{ timestamps: true, collection: 'messages' },
);

export default MessageSchema;
