import {getUserID} from './utils'
import { msgRouter } from './BackendMsg';

export class Socket {
	constructor(){
		if (Socket.instance)
			return Socket.instance
		this.msgQueue = [];
		this.init();
		Socket.instance = this;
	}
	async init(){
		this.userID = await getUserID();
		this.msgQueue = [];
		try {
			this.socket = new WebSocket(`ws://localhost:8004/ws/${this.userID}/`);
			this.socket.onerror = this.myError.bind(this);
			this.socket.onopen = this.myOpen.bind(this);
			this.socket.onclose = this.myClose.bind(this);
			this.socket.onmessage = msgRouter; 
		}
		catch(err){
			this.myError(err)
		}
	}
	myError(err){
		console.error("WebSocket error:", err);		
		//this.myRetry();		
	}
	myOpen(){
		this.msgQueue.forEach(msg => {
			this.send(msg)});
		this.msgQueue = [];
	}
	myRetry(){
		this.socket = null;
		Socket.instance = null;
		setTimeout(() => {
			new Socket();
		}, 1000);
	}
	myClose(){
		console.log("close...");
		this.socket = null;
		Socket.instance = null;
	}
	send(obj){
		if (this.socket && this.socket.readyState == WebSocket.OPEN)
				this.socket.send(JSON.stringify(obj));
		else
			this.msgQueue.push(obj);
	}
	send(obj){
		if (this.socket && this.socket.readyState == WebSocket.OPEN)
				this.socket.send(JSON.stringify(obj));
		else
			this.msgQueue.push(obj);
	}
}
