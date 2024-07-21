import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { Member } from 'apps/nestar-api/src/libs/dto/member/member';
import * as url from 'url'; // node core package kelyapti

/** FrtEndga => ma`lumot yuborish & qabul qilish un xizmat qiladigan interface yaratamiz - 1 */
interface MessagePayload {
	event: string;
	text: string;
	memberData: Member;
}

/** NewClient connect => ma`lumotini bowqa Clientlarga yuborish un xizmat qiladigan interface yaratamiz - 2 */
interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member;
	action: string;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway');
	private summaryClient: number = 0;
	/**                       JS method <key,   value>()     **/
	private clientsAuthMap = new Map<WebSocket, Member>();
	private messagesList: MessagePayload[] = [];

	constructor(private authService: AuthService) {}

	/** WebSocket Decorator orqali WebSocketServerni qo`lga olamiz */
	@WebSocketServer()
	server: Server;

	public afterInit(server: Server) {
		this.logger.verbose(`WebSocket Server Initialized & total [${this.summaryClient}]`);
	}

	public async retrieveAuth(req: any): Promise<Member> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;
			console.log('token: ', token);
			return await this.authService.verifyToken(token as string);
		} catch (error) {
			return null; // notAuth memeber "Guest"
		}
	}

	public async handleConnection(client: WebSocket, req: any) {
		const authMember = await this.retrieveAuth(req);
		// console.log('authMember:', authMember);
		this.summaryClient++;

		// client => authMember  key => value (save credentials) we can use ==> JS Map() method ==
		this.clientsAuthMap.set(client, authMember); // client key orqali authMember value save qilyapmiz. clientsAuthMap = object

		/** test:
		 const fruits = new Map([
		 	[client1, null], // [key, value]
			[client2, MikeMember],
			[client3, OscarMember]
		 ])
		 */

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`Connection [${clientNick}] & total [${this.summaryClient}]`);

		// newUserConnectInfooMsg => to All online clients
		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'joined',
		};
		this.emitMessage(infoMsg);
		// CLIENT MESSAGES
		/**ulangan clientga habar yuboriw */
		client.send(JSON.stringify({ event: 'getMessages', list: this.messagesList }));
	}

	public handleDisconnect(client: WebSocket) {
		const authMember = this.clientsAuthMap.get(client);
		this.summaryClient--;
		this.clientsAuthMap.delete(client);

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`Disconnection [${clientNick}] & total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'left',
		};
		// client - disconnect
		this.broadcastMessage(client, infoMsg);
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: string): Promise<void> {
		const authMember = this.clientsAuthMap.get(client);
		const newMessage: MessagePayload = { event: 'message', text: payload, memberData: authMember };

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`NEW MESSAGE [${clientNick}]: ${payload}`);

		this.messagesList.push(newMessage);
		/** ohirgi 5ta mssg qoldirish mantigi */
		if (this.messagesList.length > 5) this.messagesList.splice(0, this.messagesList.length - 5);

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

/** MESSAGE TARGET***
 
 1. Client -> only client 
 2. Broadcast -> except client
 3. Emit -> all clients

 */
