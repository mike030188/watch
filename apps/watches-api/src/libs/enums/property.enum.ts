import { registerEnumType } from '@nestjs/graphql';

export enum PropertyType {
	AUTOMATIC = 'AUTOMATIC',
	MECHANICAL = 'MECHANICAL',
	SMART = 'SMART',
}
registerEnumType(PropertyType, {
	name: 'PropertyType',
});

export enum PropertyBrand {
	ROLEX = 'ROLEX',
	CARTIER = 'CARTIER',
	SEIKO = 'SEIKO',
	TUDOR = 'TUDOR',
	OMEGA = 'OMEGA',
	HUBLOT = 'HUBLOT',
	PATEK_PHILIPPE = 'PATEK_PHILIPPE',
	TISSOT = 'TISSOT',
	TAGHEUER = 'TAGHEUER',
	BREITLING = 'BREITLING',
}
registerEnumType(PropertyBrand, {
	name: 'PropertyBrand',
});

export enum PropertyCategory {
	MENS = 'MENS',
	LADIES = 'LADIES',
}
registerEnumType(PropertyCategory, {
	name: 'PropertyCategory',
});

export enum PropertyStatus {
	// HOLD = 'HOLD', // not use in Watches
	ACTIVE = 'ACTIVE', // *user & *agent & *admin
	SOLD = 'SOLD', // *agent & *admin
	DELETE = 'DELETE', // *admin
}
registerEnumType(PropertyStatus, {
	name: 'PropertyStatus',
});

export enum PropertyLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}
registerEnumType(PropertyLocation, {
	name: 'PropertyLocation',
});

export enum PropertyColor {
	WHITE = 'WHITE',
	BLACK = 'BLACK',
	BLUE = 'BLUE',
	BROWN = 'BROWN',
	COPPER = 'COPPER',
	GOLD = 'GOLD',
	GREEN = 'GREEN',
	GREY = 'GREY',
	RED = 'RED',
	SILVER = 'SILVER',
}
registerEnumType(PropertyColor, {
	name: 'PropertyColor',
});

export enum PropertyConnectivity {
	BLUETOOTH = 'BLUETOOTH',
	HDMI = 'HDMI',
	USB = 'USB',
	WIFI = 'WI-FI',
}
registerEnumType(PropertyConnectivity, {
	name: 'PropertyConnectivity',
});
