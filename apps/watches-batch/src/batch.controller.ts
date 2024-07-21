import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { BATCH_ROLLBACK, BATCH_TOP_AGENTS, BATCH_TOP_PROPERTIES } from './lib/config';

@Controller()
export class BatchController {
	private logger: Logger = new Logger('BatchController');

	constructor(private readonly batchService: BatchService) {}

	@Timeout(1000)
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY!');
	}

	// kechasi soat 1da iwga tuwadi 1marta
	@Cron('00 * * * * *', { name: BATCH_ROLLBACK })
	public async batchRollback() {
		try {
			this.logger['context'] = BATCH_ROLLBACK;
			this.logger.debug('EXECUTED!');
			await this.batchService.batchRollback();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('20 * * * * *', { name: BATCH_TOP_PROPERTIES })
	public async batchTopProperties() {
		try {
			this.logger['context'] = BATCH_TOP_PROPERTIES;
			this.logger.debug('EXECUTED!');
			await this.batchService.batchTopProperties();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('40 * * * * *', { name: BATCH_TOP_AGENTS })
	public async batchTopAgents() {
		try {
			this.logger['context'] = BATCH_TOP_AGENTS;
			this.logger.debug('EXECUTED!');
			await this.batchService.batchTopAgents();
		} catch (err) {
			this.logger.error(err);
		}
	}

	// @Cron('*/20 * * * * *', { name: 'CRON TEST' }) // 00 | */20 (* = 1min)
	// public cronTest() {
	// 	this.logger['context'] = 'CRON TEST';
	// 	this.logger.debug('EXECUTED!');
	// }

	/*@Interval(1000)
	handleInterval() {
		this.logger.debug('INTERVAL TEST');
	}
	*/

	@Get()
	getHello(): string {
		return this.batchService.getHello();
	}
}

/*
cron expressions:

*    *    *    *    *    *
|    |    |    |    |    |
|    |    |    |    |    +----- day of the week (0 - 7) (Sunday=0 or 7)
|    |    |    |    +---------- month (1 - 12)
|    |    |    +--------------- day of the month (1 - 31)
|    |    +-------------------- hour (0 - 23)
|    +------------------------- minute (0 - 59)
+------------------------------ second (0 - 59)


 task to run at the 0th second of every minute, every hour, every day, and so on. 
 In other words, the task will be executed once every minute.
*/
