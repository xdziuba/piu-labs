export const uid = (prefix = '') => {
    return (
        prefix +
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 8)
    );
};

export const randomColor = () => {
    const r = Math.floor(120 + Math.random() * 120);
    const g = Math.floor(120 + Math.random() * 120);
    const b = Math.floor(120 + Math.random() * 120);
    return `rgb(${r},${g},${b})`;
};
