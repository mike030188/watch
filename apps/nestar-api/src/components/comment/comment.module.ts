import { Module } from '@nestjs/common';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import CommentSchema from '../../schemas/Comment.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { PropertyModule } from '../property/property.module';
import { BoardArticleModule } from '../board-article/board-article.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Comment',
				schema: CommentSchema,
			},
		]),
		AuthModule, // *for using Guards and Decorators
		MemberModule, // enum CommentGroup {MEMBER = 'MEMBER',}
		PropertyModule, // enum CommentGroup {PROPERTY = 'PROPERTY',}
		BoardArticleModule, // enum CommentGroup {ARTICLE = 'ARTICLE',}
	],
	providers: [CommentResolver, CommentService],
})
export class CommentModule {}
