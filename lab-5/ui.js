import { randomColor, uid } from './helpers.js';

export default class UI {
    constructor(store, selectors = {}) {
        this.store = store;
        this.container = document.querySelector(
            selectors.container || '#shapes-container'
        );
        this.btnAddSquare = document.querySelector(
            selectors.addSquare || '#add-square'
        );
        this.btnAddCircle = document.querySelector(
            selectors.addCircle || '#add-circle'
        );
        this.colorSquareInput = document.querySelector(
            selectors.colorSquare || '#color-square'
        );
        this.colorCircleInput = document.querySelector(
            selectors.colorCircle || '#color-circle'
        );
        this.btnApplySquareColor = document.querySelector(
            selectors.applySquare || '#apply-square-color'
        );
        this.btnApplyCircleColor = document.querySelector(
            selectors.applyCircle || '#apply-circle-color'
        );
        this.btnClear = document.querySelector(
            selectors.clearAll || '#clear-all'
        );

        this.counterSquareEl = document.querySelector(
            selectors.countSquare || '#count-square'
        );
        this.counterCircleEl = document.querySelector(
            selectors.countCircle || '#count-circle'
        );
        this.counterTotalEl = document.querySelector(
            selectors.countTotal || '#count-total'
        );

        this._bindUI();

        this.store.subscribe((state, action) =>
            this.handleStateChange(state, action)
        );
    }

    _bindUI() {
        this.btnAddSquare.addEventListener('click', () => {
            const shape = {
                id: uid('s_'),
                type: 'square',
                color: randomColor(),
            };
            this.store.addShape(shape);
        });

        this.btnAddCircle.addEventListener('click', () => {
            const shape = {
                id: uid('c_'),
                type: 'circle',
                color: randomColor(),
            };
            this.store.addShape(shape);
        });

        this.container.addEventListener('click', (ev) => {
            const target = ev.target.closest('.shape');
            if (!target) return;
            const id = target.dataset.id;
            if (!id) return;
            this.store.removeShape(id);
        });

        this.btnApplySquareColor.addEventListener('click', () => {
            const color = this.colorSquareInput.value;
            this.store.recolor('square', color);
        });

        this.btnApplyCircleColor.addEventListener('click', () => {
            const color = this.colorCircleInput.value;
            this.store.recolor('circle', color);
        });

        this.btnClear.addEventListener('click', () => {
            if (confirm('Usunąć wszystkie kształty?')) {
                this.store.clearAll();
            }
        });
    }

    handleStateChange(state, action) {
        switch (action.type) {
            case 'init':
                this._renderAll(state);
                break;
            case 'add':
                this._renderOne(action.shape);
                this._updateCounters(state);
                break;
            case 'remove':
                this._removeOne(action.id);
                this._updateCounters(state);
                break;
            case 'recolor':
                this._recolorMany(
                    action.shapeType,
                    action.color,
                    action.changedIds
                );
                this._updateCounters(state);
                break;
            case 'clear':
                this._clearAll();
                this._updateCounters(state);
                break;
            default:
                this._syncToState(state);
                this._updateCounters(state);
                break;
        }
    }

    _renderAll(state) {
        this.container.innerHTML = '';
        for (const s of state.shapes) {
            this._renderOne(s);
        }
        this._updateCounters(state);
    }

    _renderOne(shape) {
        if (this.container.querySelector(`[data-id="${shape.id}"]`)) return;
        const el = document.createElement('div');
        el.classList.add('shape', shape.type);
        el.dataset.id = shape.id;
        el.dataset.type = shape.type;
        el.title = `${shape.type} — kliknij, aby usunąć`;
        el.style.backgroundColor = shape.color;
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `${shape.type}`);
        this.container.appendChild(el);
    }

    _removeOne(id) {
        const el = this.container.querySelector(`[data-id="${id}"]`);
        if (el) el.remove();
    }

    _recolorMany(type, color, changedIds = []) {
        if (Array.isArray(changedIds) && changedIds.length) {
            for (const id of changedIds) {
                const el = this.container.querySelector(`[data-id="${id}"]`);
                if (el) el.style.backgroundColor = color;
            }
            return;
        }
        const els = this.container.querySelectorAll(
            `.shape[data-type="${type}"]`
        );
        els.forEach((e) => (e.style.backgroundColor = color));
    }

    _clearAll() {
        this.container.innerHTML = '';
    }

    _syncToState(state) {
        const existingIds = new Set(
            Array.from(this.container.querySelectorAll('.shape')).map(
                (el) => el.dataset.id
            )
        );
        const stateIds = new Set(state.shapes.map((s) => s.id));

        for (const id of existingIds) {
            if (!stateIds.has(id)) {
                this._removeOne(id);
            }
        }

        for (const s of state.shapes) {
            if (!existingIds.has(s.id)) this._renderOne(s);
            else {
                const el = this.container.querySelector(`[data-id="${s.id}"]`);
                if (el && el.style.backgroundColor !== s.color)
                    el.style.backgroundColor = s.color;
            }
        }

        this._updateCounters(state);
    }

    _updateCounters(state) {
        const counts = { square: 0, circle: 0, total: 0 };
        for (const s of state.shapes) {
            if (s.type === 'square') counts.square++;
            if (s.type === 'circle') counts.circle++;
            counts.total++;
        }
        this.counterSquareEl.textContent = `Kwadraty: ${counts.square}`;
        this.counterCircleEl.textContent = `Kółka: ${counts.circle}`;
        this.counterTotalEl.textContent = `Wszystkich: ${counts.total}`;
    }
}
