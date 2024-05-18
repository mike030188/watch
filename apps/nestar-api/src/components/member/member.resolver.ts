import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';

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
		return this.memberService.login(input);
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

	// Authenticated (ixtiyoriy memberlar iwlata oladi)
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
		return this.memberService.updateMember(memberId, input);
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('Query: getMember');
		return this.memberService.getMember();
	}

	/** ADMIN **/

	// Authorization: ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => String)
	public async getAllMembersByAdmin(): Promise<string> {
		// console.log('authMember.memberType:', authMember.memberType);
		return this.memberService.getAllMembersByAdmin();
	}

	// Authorization: ADMIN
	@Mutation(() => String)
	public async updateAllMembersByAdmin(): Promise<string> {
		console.log('Mutation: updateAllMembersByAdmin');
		return this.memberService.updateAllMembersByAdmin();
	}
}
