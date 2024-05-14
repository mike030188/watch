import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger(); // kirdi-chiqdi req | res terminalda print out qiliadi

	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const recordTime = Date.now(); // request kirib kelgan vaqti
		const requestType = context.getType<GqlContextType>(); // request type identifier

		if (requestType === 'http') {
			/** Develop if needed! **/
		} else if (requestType === 'graphql') {
			/** (1) Print Request **/
			const gqlContext = GqlExecutionContext.create(context);
			this.logger.log(`${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST'); // req.body = 'object'

			/** (2) Errors handling via GraphQL **/

			/** (3) No Errors, giving Response below **/
			return next.handle().pipe(
				tap((context) => {
					const responseTime = Date.now() - recordTime;
					this.logger.log(`${this.stringify(context)} - ${responseTime}ms \n\n`, 'RESPONSE');
				}),
			);
		}
	}

	private stringify(context: ExecutionContext): string {
		// console.log(typeof context); // GraphQL API da context => "object"ga teng bo`ladi
		return JSON.stringify(context).slice(0, 75); // stringify orqali "body"ni 75chi harfigacha joyini chop etdik
	}
}
