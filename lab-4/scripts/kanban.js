function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function saveBoard() {
    const data = {};
    document.querySelectorAll('.column').forEach((col) => {
        const key = col.dataset.column;
        const cards = [];
        col.querySelectorAll('.card').forEach((card) => {
            cards.push({
                id: card.dataset.id,
                text: card.querySelector('.card-text').innerText,
                color: card.style.background,
            });
        });
        data[key] = cards;
    });
    localStorage.setItem('kanban', JSON.stringify(data));
}

function loadBoard() {
    const data = JSON.parse(localStorage.getItem('kanban'));
    if (!data) return;
    for (const col in data) {
        data[col].forEach((c) => createCard(col, c.text, c.color, c.id));
    }
    updateCounts();
}

function createCard(
    column,
    text = '📌 Nowa karta',
    color = randomColor(),
    id = Date.now()
) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.background = color;
    card.dataset.id = id;

    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `<span>ID: ${id}</span><button class="delete">✕</button>`;

    const content = document.createElement('div');
    content.className = 'card-text';
    content.contentEditable = true;
    content.innerText = text;

    const btns = document.createElement('div');
    btns.className = 'card-buttons';
    btns.innerHTML = `
        <button class="left">←</button>
        <button class="color">Zmień kolor</button>
        <button class="right">→</button>
    `;

    card.append(content, header, btns);
    document
        .querySelector(`.column[data-column="${column}"] .cards`)
        .append(card);
    updateCounts();
    saveBoard();
}

function updateCounts() {
    document.querySelectorAll('.column').forEach((col) => {
        const count = col.querySelectorAll('.card').length;
        col.querySelector('.count').innerText = count;
    });
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-card')) {
        const col = e.target.closest('.column').dataset.column;
        createCard(col);
    }

    if (e.target.classList.contains('delete')) {
        e.target.closest('.card').remove();
        updateCounts();
        saveBoard();
    }

    if (e.target.classList.contains('right')) {
        const card = e.target.closest('.card');
        const col = card.closest('.column').dataset.column;
        const order = ['todo', 'doing', 'done'];
        let i = order.indexOf(col);
        if (i < order.length - 1) {
            document
                .querySelector(`.column[data-column="${order[i + 1]}"] .cards`)
                .append(card);
        }
        updateCounts();
        saveBoard();
    }

    if (e.target.classList.contains('left')) {
        const card = e.target.closest('.card');
        const col = card.closest('.column').dataset.column;
        const order = ['todo', 'doing', 'done'];
        let i = order.indexOf(col);
        if (i > 0) {
            document
                .querySelector(`.column[data-column="${order[i - 1]}"] .cards`)
                .append(card);
        }
        updateCounts();
        saveBoard();
    }

    if (e.target.classList.contains('color')) {
        const card = e.target.closest('.card');
        card.style.background = randomColor();
        saveBoard();
    }

    if (e.target.classList.contains('colorize-column')) {
        const col = e.target.closest('.column');
        col.querySelectorAll('.card').forEach(
            (c) => (c.style.background = randomColor())
        );
        saveBoard();
    }

    if (e.target.classList.contains('sort-cards')) {
        const col = e.target.closest('.column');
        const cards = [...col.querySelectorAll('.card')];
        cards.sort((a, b) =>
            a
                .querySelector('.card-text')
                .innerText.localeCompare(
                    b.querySelector('.card-text').innerText
                )
        );
        const container = col.querySelector('.cards');
        container.innerHTML = '';
        cards.forEach((c) => container.append(c));
        saveBoard();
    }
});

window.addEventListener('input', saveBoard);
window.addEventListener('load', loadBoard);
