// app.js
const tg = window.Telegram.WebApp;

// Инициализируем приложение
tg.ready();
tg.expand(); // Раскрываем приложение на весь экран

// Элементы страницы
const filtersContainer = document.getElementById('filters');
const listContainer = document.getElementById('sneaker-list');

// Данные для примера (позже заменим на ваш архив)
const brands = ['Nike', 'Adidas', 'Reebok', 'Puma'];

// Создаём кнопки фильтров
brands.forEach(brand => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = brand;
    btn.onclick = () => {
        showSneakersByBrand(brand);
    };
    filtersContainer.appendChild(btn);
});

function showSneakersByBrand(brand) {
    // Временная заглушка для демонстрации
    listContainer.innerHTML = `<p><strong>Выбран бренд:</strong> ${brand}. Данные из вашего архива появятся здесь.</p>`;
}

// Показываем первую информацию
showSneakersByBrand(brands[0]);