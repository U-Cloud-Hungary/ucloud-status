export class Server {
    constructor({ id, name, location, apiKey, categoryId }) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.apiKey = apiKey;
        this.categoryId = categoryId;
    }

    static fromJSON(data) {
        return new Server(data);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            location: this.location,
            apiKey: this.apiKey,
            categoryId: this.categoryId
        };
    }

    // Validation methods
    isValid() {
        return this.name &&
            this.location &&
            this.apiKey &&
            this.categoryId &&
            this.name.trim().length > 0 &&
            this.location.trim().length > 0;
    }

    // Update server properties
    update(updateData) {
        if (updateData.name !== undefined) {
            this.name = updateData.name;
        }
        if (updateData.location !== undefined) {
            this.location = updateData.location;
        }
        if (updateData.categoryId !== undefined) {
            this.categoryId = updateData.categoryId;
        }
        return this;
    }

    // Generate display name for UI
    getDisplayName() {
        return `${this.name} (${this.location})`;
    }

    // Check if server belongs to category
    belongsToCategory(categoryId) {
        return this.categoryId === categoryId;
    }

    // Mask API key for security (show only last 4 characters)
    getMaskedApiKey() {
        if (!this.apiKey || this.apiKey.length < 8) {
            return '****';
        }
        return `${'*'.repeat(this.apiKey.length - 4)}${this.apiKey.slice(-4)}`;
    }
}