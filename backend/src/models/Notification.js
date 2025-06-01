export class Notification {
    constructor({ id, type, message, timestamp, active = true }) {
        this.id = id;
        this.type = type;
        this.message = message;
        this.timestamp = timestamp || new Date().toISOString();
        this.active = active;
    }

    static fromJSON(data) {
        return new Notification(data);
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            message: this.message,
            timestamp: this.timestamp,
            active: this.active
        };
    }

    deactivate() {
        this.active = false;
    }
}
