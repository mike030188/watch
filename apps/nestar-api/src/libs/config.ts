import { ObjectId } from 'bson'; //"burak": mongoose edi

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};
