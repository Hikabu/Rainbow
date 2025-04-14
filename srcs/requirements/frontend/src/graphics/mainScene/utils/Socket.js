// Socket.js
import { EventBus } from './EventBus';
import { getUserID } from './utils';

export class Socket {
  constructor() {
    if (Socket.instance) return Socket.instance;
    this.state = "off";
    this.msgQueue = [];
    Socket.instance = this;
  }

  async init() {
    this.state = "on";
    this.userID = await getUserID();
    this.msgQueue = [];
    this.socket = new WebSocket(`ws://localhost:8004/ws/${this.userID}/`);
    this.socket.onopen = this.myOpen.bind(this);
    this.socket.onclose = this.myClose.bind(this);
    this.socket.onmessage = this.myReceive.bind(this); // Update here to use class method
    return Promise.resolve();
  }

  myOpen() {
    this.msgQueue.forEach(msg => {
      this.send(msg);
    });
    this.msgQueue = [];
  }

  myClose(event) {
    this.socket = null;
    Socket.instance = null;
  }

  async myReceive(event) {
    const data = JSON.parse(event.data);
    if (!data) return;

    if (data.type === "game update") {
      EventBus.emit('game.update', data); // Emit event for game update
    } else if (data.type === "tour.updates") {
      if ("update_tour_registration" in data) {
        EventBus.emit('tour.update.registration', data); // Emit event for tour registration
      } else if ("update_display" in data) {
        EventBus.emit('tour.update.display', data); // Emit event for tour display update
      } else if ("notification" in data) {
        EventBus.emit('tour.notification', data); // Emit event for notification
      }
    }
  }

  send(obj) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(obj));
    } else {
      this.msgQueue.push(obj);
    }
  }
}
