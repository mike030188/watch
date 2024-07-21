import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe()); // bu yerda "class"dan instance hosil qivolyapmiz
	app.useGlobalInterceptors(new LoggingInterceptor());
	app.enableCors({ origin: true, credentials: true }); // istalgan domaindan kiriw
	app.use(graphqlUploadExpress({ maxFileSize: 15000000, maxFiles: 10 })); // max 15mb, 10tagacha image
	app.use('/uploads', express.static('./uploads')); // tawqi olamga static koriniwda ochiqlayapmiz
	app.useWebSocketAdapter(new WsAdapter(app));

	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
