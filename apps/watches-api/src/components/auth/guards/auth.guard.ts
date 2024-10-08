import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Message } from 'apps/watches-api/src/libs/enums/common.enum';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private authService: AuthService) {}

	async canActivate(context: ExecutionContext | any): Promise<boolean> {
		console.info('--- @guard() Authentication [AuthGuard] ---');

		if (context.contextType === 'graphql') {
			const request = context.getArgByIndex(2).req; // requestni qolga olyapmiz

			const bearerToken = request.headers.authorization; // POSTMAN => headers => token
			if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXIST);

			// console.log('bearerToken =>', bearerToken);
			const token = bearerToken.split(' ')[1],
				authMember = await this.authService.verifyToken(token);
			if (!authMember) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);

			console.log('memberNick[auth] =>', authMember.memberNick);
			request.body.authMember = authMember; // here middleware exec

			return true; // authenticate bo`ldi, next processga o`tkaz
		}

		// description => http, rpc, gprs and etc are ignored
	}
}
