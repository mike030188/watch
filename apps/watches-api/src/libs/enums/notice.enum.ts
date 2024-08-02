import { registerEnumType } from '@nestjs/graphql';

export enum NoticeCategory {
	FAQ = 'FAQ',
	TERMS = 'TERMS',
	INQUIRY = 'INQUIRY',
}
registerEnumType(NoticeCategory, {
	name: 'NoticeCategory',
});

export enum NoticeStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(NoticeStatus, {
	name: 'NoticeStatus',
});

export enum NoticeType {
	PROMOTION = 'PROMOTION',
	NEW_ARRIVAL = 'NEW_ARRIVAL',
	MAINTENANCE = 'MAINTENANCE',
	SAFETY = 'SAFETY',
	WEBSITE_UPDATE = 'WEBSITE_UPDATE',
	LEGAL_POLICY = 'LEGAL_POLICY',
	GENERAL_ANNOUNCEMENT = 'GENERAL_ANNOUNCEMENT',
}
registerEnumType(NoticeType, {
	name: 'NoticeType',
});
