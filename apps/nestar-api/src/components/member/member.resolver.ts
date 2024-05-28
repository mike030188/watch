import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { getSerialForImage, shapeIntoMongoObjectId, validMimeTypes } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { Message } from '../../libs/enums/common.enum';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member) // GraphQL ham 'Member'ni qaytariwi kk
	// @UsePipes(ValidationPipe) // method type pipe-validation => switch to GlobalPipe-validation(main.ts)
	// below @Args -> param decorator
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		// vaqtinchalik try/catch dan foydalanib handle qilamiz => future global handling
		// try {
		console.log('Mutation: signup');
		// console.log('input:', input);
		return await this.memberService.signup(input);
		// } catch (err) {
		// 	console.log('Error, signup:', err);
		// 	throw new InternalServerErrorException(err);
		// }
	}

	// @UseGuards(RolesGuard) // test un wartli ravishda
	@Mutation(() => Member) // GraphQL ham 'Member'ni qaytariwi kk
	// @UsePipes(ValidationPipe) // method type pipe-validation
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		// try {
		console.log('Mutation: login');
		return await this.memberService.login(input);
		// } catch (err) {
		// 	console.log('Error, signup:', err);
		// 	throw new InternalServerErrorException(err);
		// }
	}

	/**TEST ushun **/
	@UseGuards(AuthGuard)
	@Query(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('Query: checkAuth');
		console.log('memberNick:', memberNick);
		return `Hi ${memberNick}`;
	}

	@Roles(MemberType.USER, MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query(() => String)
	public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
		console.log('Query: checkAuthRoles');
		return `Hi ${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
	}
	// public async checkAuthRoles(@AuthMember('memberNick') memberNick: string): Promise<string> {
	// 	console.log('Query: checkAuth');
	// 	console.log('memberNick:', memberNick);
	// 	return `Hi ${memberNick}`;
	// }

	// Authenticated bolgan memberlar iwlata oladi)
	@UseGuards(AuthGuard) // murojaatchini tekshiriw
	@Mutation(() => Member)
	public async updateMember(
		@Args('input') input: MemberUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		console.log('Mutation: updateMember');
		// console.log(typeof memberId);
		// console.log(memberId); // ixtiyoriy nom (authMember yoki data)
		// console.log(memberId); // murojaatchini aniqlash
		delete input._id;
		return await this.memberService.updateMember(memberId, input);
	}

	@UseGuards(WithoutGuard) // any user can access, if auth member we get 'id
	@Query(() => Member)
	public async getMember(@Args('memberId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Member> {
		console.log('Query: getMember');
		const targetId = shapeIntoMongoObjectId(input);
		// console.log('memberId:', memberId); // who ?
		return await this.memberService.getMember(memberId, targetId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Members)
	public async getAgents(
		@Args('input') input: AgentsInquiry,
		@AuthMember('_id') memberId: ObjectId, //
	): Promise<Members> {
		console.log('Query: getAgents');
		return await this.memberService.getAgents(memberId, input);
	}

	@UseGuards(AuthGuard) // Auhtenticated member
	@Mutation(() => Member)
	public async likeTargetMember(
		@Args('memberId') input: string, // qaysi memberga like bosmoqchimiz
		@AuthMember('_id') memberId: ObjectId, // memberId
	): Promise<Member> {
		console.log('Mutation: likeTargetMember');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.memberService.likeTargetMember(memberId, likeRefId);
	}

	/** ADMIN **/

	// Authorization: ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Members)
	public async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
		console.log('Mutation: getAllMembersByAdmin');
		// console.log('authMember.memberType:', authMember.memberType);
		return await this.memberService.getAllMembersByAdmin(input);
	}

	// Authorization: ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Member)
	public async updateAllMembersByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
		console.log('Mutation: updateAllMembersByAdmin');
		return await this.memberService.updateAllMembersByAdmin(input); // resultni Clientga yuboryapmiz
	}

	/** UPLOADER **/
	@UseGuards(AuthGuard)
	@Mutation((returns) => String)
	public async imageUploader(
		@Args({ name: 'file', type: () => GraphQLUpload })
		{ createReadStream, filename, mimetype }: FileUpload,
		@Args('target') target: String,
	): Promise<string> {
		console.log('Mutation: imageUploader');

		if (!filename) throw new Error(Message.UPLOAD_FAILED);
		const validMime = validMimeTypes.includes(mimetype);
		if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

		const imageName = getSerialForImage(filename); // create random file name
		const url = `uploads/${target}/${imageName}`;
		const stream = createReadStream(); // docs boyicha

		const result = await new Promise((resolve, reject) => {
			stream
				.pipe(createWriteStream(url))
				.on('finish', async () => resolve(true))
				.on('error', () => reject(false));
		});
		if (!result) throw new Error(Message.UPLOAD_FAILED);

		return url;
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => [String])
	public async imagesUploader(
		@Args('files', { type: () => [GraphQLUpload] })
		files: Promise<FileUpload>[],
		@Args('target') target: String,
	): Promise<string[]> {
		console.log('Mutation: imagesUploader');

		const uploadedImages = [];
		const promisedList = files.map(async (img: Promise<FileUpload>, index: number): Promise<Promise<void>> => {
			try {
				const { filename, mimetype, encoding, createReadStream } = await img;

				const validMime = validMimeTypes.includes(mimetype);
				if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);
				// TODO: SECURITY (NPM - HOW TO SECURE)

				const imageName = getSerialForImage(filename);
				const url = `uploads/${target}/${imageName}`;
				const stream = createReadStream();

				const result = await new Promise((resolve, reject) => {
					stream
						.pipe(createWriteStream(url))
						.on('finish', () => resolve(true))
						.on('error', () => reject(false));
				});
				if (!result) throw new Error(Message.UPLOAD_FAILED);

				uploadedImages[index] = url;
			} catch (err) {
				console.log('Error, file missing!');
			}
		});

		await Promise.all(promisedList);
		return uploadedImages;
	}
}
