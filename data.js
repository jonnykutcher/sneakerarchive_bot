// data.js
window.sneakerArchive = {
    // Здесь хранятся ВСЕ кроссовки
    sneakers: [
        {
            id: 1,
            article: "BQ6817-100",
            brand: "Nike",
            collaboration: "",
            model: "Air Jordan 1",
            model2: "Retro High OG",
            series: "Air Jordan",
            collection: "Chicago",
            pack: "",
            year: 1985,
            country: "USA",
            details: ["Кожаный верх", "Резиновая подошва"],
            main_color: "Белый",
            main_color2: "Красный",
            detail_color: "Чёрный",
            detail_color2: "",
            description: "Культовая модель 1985 года",
            image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=300&fit=crop"
        },
        {
            id: 2,
            article: "unknown1",
            brand: "Adidas",
            collaboration: "",
            model: "Superstar",
            model2: "",
            series: "",
            collection: "",
            pack: "",
            year: "???",
            country: "Германия",
            details: ["Мысок-ракушка", "3 полоски"],
            main_color: "Белый",
            main_color2: "",
            detail_color: "Чёрный",
            detail_color2: "",
            description: "Классические кроссовки с мыском-ракушкой",
            image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w-400&h=300&fit=crop"
        }
    ],

    // Генерируем следующий ID для новых кроссовок
    getNextId: function() {
        if (this.sneakers.length === 0) return 1;
        const maxId = Math.max(...this.sneakers.map(s => s.id));
        return maxId + 1;
    },

    // Генерируем артикул "unknownX" если его нет
    generateArticle: function() {
        const unknownItems = this.sneakers.filter(s => 
            s.article.startsWith('unknown')
        );
        
        if (unknownItems.length === 0) {
            return 'unknown1';
        }
        
        const numbers = unknownItems.map(s => {
            const match = s.article.match(/unknown(\d+)/);
            return match ? parseInt(match[1]) : 0;
        });
        
        const nextNumber = Math.max(...numbers) + 1;
        return `unknown${nextNumber}`;
    },

    // Добавить новые кроссовки
    addSneaker: function(sneakerData) {
        // Автоматически назначаем ID и артикул если нужно
        const newSneaker = {
            id: this.getNextId(),
            article: sneakerData.article || this.generateArticle(),
            ...sneakerData
        };
        
        this.sneakers.push(newSneaker);
        this.saveToLocalStorage();
        return newSneaker;
    },

    // Сохраняем в localStorage браузера (чтобы данные не пропадали)
    saveToLocalStorage: function() {
        try {
            localStorage.setItem('sneakerArchive', JSON.stringify(this.sneakers));
            console.log('Данные сохранены в localStorage');
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    },

    // Загружаем из localStorage при запуске
    loadFromLocalStorage: function() {
        try {
            const saved = localStorage.getItem('sneakerArchive');
            if (saved) {
                this.sneakers = JSON.parse(saved);
                console.log('Данные загружены из localStorage:', this.sneakers.length, 'кроссовок');
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        }
    },

    // Поиск кроссовок
    search: function(query, filters = {}) {
        let results = [...this.sneakers];

        // Текстовый поиск
        if (query && query.trim() !== '') {
            const searchTerm = query.toLowerCase().trim();
            results = results.filter(sneaker => {
                const searchFields = [
                    sneaker.article,
                    sneaker.brand,
                    sneaker.model,
                    sneaker.model2,
                    sneaker.collection,
                    sneaker.description
                ].join(' ').toLowerCase();
                
                return searchFields.includes(searchTerm);
            });
        }

        // Фильтр по бренду
        if (filters.brand && filters.brand !== 'all') {
            results = results.filter(s => s.brand === filters.brand);
        }

        // Фильтр по году
        if (filters.year) {
            results = results.filter(s => s.year == filters.year);
        }

        return results;
    },

    // Получить все уникальные бренды для фильтра
    getAllBrands: function() {
        const brands = [...new Set(this.sneakers.map(s => s.brand))];
        return brands.sort();
    }
};

// Сразу загружаем сохранённые данные при запуске
window.sneakerArchive.loadFromLocalStorage();