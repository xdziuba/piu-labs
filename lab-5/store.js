const STORAGE_KEY = 'ksztaly_app_state_v1';

export default class Store {
    constructor() {
        this.subscribers = new Set();
        this.state = { shapes: [] };

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.shapes)) {
                    this.state = parsed;
                }
            }
        } catch (e) {
            console.warn(e);
        }
    }

    subscribe(cb) {
        this.subscribers.add(cb);
        cb(this.getState(), { type: 'init' });
        return () => this.subscribers.delete(cb);
    }

    getState() {
        return { shapes: [...this.state.shapes] };
    }

    notify(action = { type: 'unknown' }) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.warn(e);
        }

        for (const cb of this.subscribers) {
            try {
                cb(this.getState(), action);
            } catch (e) {
                console.error(e);
            }
        }
    }

    addShape(shape) {
        this.state.shapes.push(shape);
        this.notify({ type: 'add', shape });
    }

    removeShape(id) {
        const idx = this.state.shapes.findIndex((s) => s.id === id);
        if (idx === -1) return;
        const [removed] = this.state.shapes.splice(idx, 1);
        this.notify({ type: 'remove', id, shape: removed });
    }

    recolor(type, color) {
        const changedIds = [];
        this.state.shapes = this.state.shapes.map((s) => {
            if (s.type === type) {
                changedIds.push(s.id);
                return { ...s, color };
            }
            return s;
        });
        this.notify({ type: 'recolor', shapeType: type, color, changedIds });
    }

    clearAll() {
        this.state.shapes = [];
        this.notify({ type: 'clear' });
    }

    getCounts() {
        const counts = { square: 0, circle: 0, total: 0 };
        for (const s of this.state.shapes) {
            if (s.type === 'square') counts.square++;
            else if (s.type === 'circle') counts.circle++;
            counts.total++;
        }
        return counts;
    }
}
