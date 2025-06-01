export class Metrics {
    constructor({ id, name, location, status = 'offline', metrics = {}, lastUpdated }) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.status = status;
        this.metrics = {
            cpu: metrics.cpu || 0,
            ram: metrics.ram || 0,
            disk: metrics.disk || 0
        };
        this.lastUpdated = lastUpdated || new Date().toISOString();
    }

    static fromJSON(data) {
        return new Metrics(data);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            location: this.location,
            status: this.status,
            metrics: this.metrics,
            lastUpdated: this.lastUpdated
        };
    }

    updateMetrics(newMetrics) {
        this.metrics = { ...this.metrics, ...newMetrics };
        this.status = 'online';
        this.lastUpdated = new Date().toISOString();
    }

    setOffline() {
        this.status = 'offline';
        this.metrics = { cpu: 0, ram: 0, disk: 0 };
        this.lastUpdated = new Date().toISOString();
    }
}