import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {} // viewSchema modelni qo`lga oldik

	public async recordView(input: ViewInput): Promise<View | null> {
		// console.log('recordView executed!');
		const viewExist = await this.checkViewExistence(input);
		if (!viewExist) {
			console.log('- New View Insert -');
			return await this.viewModel.create(input);
		} else return null;
	}

	/** Avval korilganmi tekwiriw mantigi */
	private async checkViewExistence(input: ViewInput): Promise<View> {
		const { memberId, viewRefId } = input; // distraction
		const search: T = { memberId: memberId, viewRefId: viewRefId };
		return await this.viewModel.findOne(search).exec();
	}
}
