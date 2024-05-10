import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			playground: true,
			uploads: false,
			autoSchemaFile: true,
		}),
		ComponentsModule, // asosiy mantiqlar shuyerga
		DatabaseModule, // bu faqat 1ta iwga tuwvoliw un alohida qilindi
	],
	// quyidagi mantiqlar serverimiz iwlayotganini TEST qiliw uchungina kk holos
	controllers: [AppController],
	providers: [AppService, AppResolver],
})
export class AppModule {}
