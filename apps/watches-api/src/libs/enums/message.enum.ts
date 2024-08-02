import { registerEnumType } from '@nestjs/graphql';

export enum MessageStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(MessageStatus, {
	name: 'MessageStatus',
});

export enum MessageGroup {
	MEMBER = 'MEMBER',
	AGENT = 'AGENT',
}
registerEnumType(MessageGroup, {
	name: 'MessageGroup',
});
