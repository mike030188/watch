import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';
import { SocketModule } from './socket/socket.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			playground: true,
			uploads: false,
			autoSchemaFile: true,
			formatError: (error: T) => {
				// console.log('error:', error);
				const graphQLFormattedError = {
					// code: 'ERROR CODE', // doim ham status code.ni korsatmedi wunga
					code: error?.extensions.code,
					// message: 'ERROR MESSAGE', // buni ham standard korinishida yozvolamiz
					message:
						error?.extensions?.exception?.response?.message || error?.extensions?.response?.message || error?.message, // server || pipe || umumiy
				};
				console.log('GRAPHQL GLOBAL ERR:', graphQLFormattedError);
				return graphQLFormattedError; // server qotip qolmaslik un return qiliw kk
			},
		}),
		ComponentsModule, // asosiy mantiqlar shuyerga
		DatabaseModule, SocketModule, // bu faqat 1ta iwga tuwvoliw un alohida qilindi
	],
	// quyidagi mantiqlar serverimiz iwlayotganini TEST qiliw uchungina kk holos
	controllers: [AppController],
	providers: [AppService, AppResolver],
})
export class AppModule {}
