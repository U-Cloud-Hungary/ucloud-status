import { Server } from './Server.js';

export class Category {
    constructor({ id, name, servers = [] }) {
        this.id = id;
        this.name = name;
        this.servers = servers;
    }

    static fromJSON(data) {
        return new Category({
            ...data,
            servers: data.servers?.map(server => Server.fromJSON(server)) || []
        });
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            servers: this.servers.map(server => server.toJSON())
        };
    }

    addServer(server) {
        this.servers.push(server);
    }

    removeServer(serverId) {
        this.servers = this.servers.filter(server => server.id !== serverId);
    }

    findServer(serverId) {
        return this.servers.find(server => server.id === serverId);
    }
}