import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe()); // bu yerda "class"dan instance hosil qivolyapmiz
	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
