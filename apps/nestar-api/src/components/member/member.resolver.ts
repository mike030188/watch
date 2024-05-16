import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member) // GraphQL ham 'Member'ni qaytariwi kk
	// @UsePipes(ValidationPipe) // method type pipe-validation => switch to GlobalPipe-validation(main.ts)
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

	// Authenticated (ixtiyoriy memberlar iwlata oladi)
	@Mutation(() => String)
	public async updateMember(): Promise<string> {
		console.log('Mutation: updateMember');
		return this.memberService.updateMember();
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('Query: getMember');
		return this.memberService.getMember();
	}

	/** ADMIN **/

	// Authorization: ADMIN
	@Mutation(() => String)
	public async getAllMembersByAdmin(): Promise<string> {
		return this.memberService.getAllMembersByAdmin();
	}

	// Authorization: ADMIN
	@Mutation(() => String)
	public async updateAllMembersByAdmin(): Promise<string> {
		console.log('Mutation: updateAllMembersByAdmin');
		return this.memberService.updateAllMembersByAdmin();
	}
}
