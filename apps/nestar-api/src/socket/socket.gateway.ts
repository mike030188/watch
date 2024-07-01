import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';

/** FrtEndga => ma`lumot yuborish & qabul qilish un xizmat qiladigan interface yaratamiz - 1 */
interface MessagePayload {
	event: string;
	text: string;
}

/** NewClient connect => ma`lumotini bowqa Clientlarga yuborish un xizmat qiladigan interface yaratamiz - 2 */
interface InfoPayload {
	event: string;
	totalClients: number;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway');
	private summaryClient: number = 0;

	/** WebSocket Decorator orqali WebSocketServerni qo`lga olamiz */
	@WebSocketServer()
	server: Server;

	public afterInit(server: Server) {
		this.logger.verbose(`WebSocket Server Initialized & total [${this.summaryClient}]`);
	}

	handleConnection(client: WebSocket, ...args: any[]) {
		this.summaryClient++;
		this.logger.verbose(`Connection & total [${this.summaryClient}]`);

		// newUserConnectInfooMsg => to All online clients
		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
		};
		this.emitMessage(infoMsg);
	}

	handleDisconnect(client: WebSocket) {
		this.summaryClient--;
		this.logger.verbose(`Disconnection & total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
		};
		// client - disconnect
		this.broadcastMessage(client, infoMsg);
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: string): Promise<void> {
		const newMessage: MessagePayload = { event: 'message', text: payload };

		this.logger.verbose(`NEW MESSAGE:${payload}`);
		this.emitMessage(newMessage);
		// return 'Hello world!';
	}

	private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	// private: faqat shu fileda iwlatiw maqsadida (exportga emas)
	// emit => ALL CLIENT
	private emitMessage(message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}
