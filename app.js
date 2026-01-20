// app.js - Sneaker Archive App с загрузкой фото
class SneakerArchiveApp {
    constructor() {
        // Инициализация Telegram Mini App
        this.tg = window.Telegram.WebApp;
        
        // Страницы приложения
        this.pages = {
            main: document.getElementById('mainPage'),
            archive: document.getElementById('archivePage'),
            collab: document.getElementById('collabPage')
        };
        
        // Элементы навигации
        this.elements = {
            // Поиск
            globalSearch: document.getElementById('globalSearch'),
            searchBtn: document.getElementById('searchBtn'),
            
            // Навигация
            collabBtn: document.getElementById('collabBtn'),
            backToMainBtn: document.getElementById('backToMainBtn'),
            backFromCollabBtn: document.getElementById('backFromCollabBtn'),
            
            // Контейнеры
            brandsGrid: document.getElementById('brandsGrid'),
            recentGrid: document.getElementById('recentGrid'),
            sneakersGrid: document.getElementById('sneakersGrid'),
            collabsGrid: document.getElementById('collabsGrid'),
            archiveTitle: document.getElementById('archiveTitle'),
            
            // Форма добавления
            fabBtn: document.getElementById('fabBtn'),
            addFormModal: document.getElementById('addFormModal'),
            addSneakerForm: document.getElementById('addSneakerForm'),
            cancelAddBtn: document.getElementById('cancelAddBtn')
        };

        // Текущий фильтр
        this.currentFilter = {
            type: null, // 'brand', 'search', 'collab'
            value: null
        };

        this.init();
    }

    init() {
        // Инициализируем Telegram
        this.tg.ready();
        this.tg.expand();
        
        // Проверяем возможности платформы
        console.log('Platform:', this.tg.platform);
        
        // Настраиваем слушатели
        this.setupEventListeners();
        
        // Загружаем главную страницу
        this.loadMainPage();
        
        // Автоматическая тема Telegram
        this.setupTheme();
    }

    setupEventListeners() {
        // Поиск
        this.elements.searchBtn.addEventListener('click', () => this.performSearch());
        this.elements.globalSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Навигация
        this.elements.collabBtn.addEventListener('click', () => this.showCollabPage());
        this.elements.backToMainBtn.addEventListener('click', () => this.showMainPage());
        this.elements.backFromCollabBtn.addEventListener('click', () => this.showMainPage());
        
        // Добавление кроссовок
        this.elements.fabBtn.addEventListener('click', () => this.showAddForm());
        this.elements.cancelAddBtn.addEventListener('click', () => this.hideAddForm());
        this.elements.addSneakerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddSneaker();
        });
    }

    setupTheme() {
        // Используем тему Telegram
        const isDark = this.tg.colorScheme === 'dark';
        document.body.classList.toggle('dark-theme', isDark);
        
        this.tg.onEvent('themeChanged', () => {
            const isDark = this.tg.colorScheme === 'dark';
            document.body.classList.toggle('dark-theme', isDark);
        });
    }

    // ===== НАВИГАЦИЯ МЕЖДУ СТРАНИЦАМИ =====
    showMainPage() {
        this.hideAllPages();
        this.pages.main.style.display = 'block';
        this.currentFilter = { type: null, value: null };
    }

    showArchivePage(title = 'Архив') {
        this.hideAllPages();
        this.pages.archive.style.display = 'block';
        this.elements.archiveTitle.textContent = title;
    }

    showCollabPage() {
        this.hideAllPages();
        this.pages.collab.style.display = 'block';
        this.loadCollaborations();
    }

    hideAllPages() {
        Object.values(this.pages).forEach(page => {
            page.style.display = 'none';
        });
    }

    // ===== ГЛАВНАЯ СТРАНИЦА =====
    loadMainPage() {
        this.loadBrands();
        this.loadRecentSneakers();
    }

    loadBrands() {
        const brands = window.sneakerArchive.getAllBrands();
        const sneakers = window.sneakerArchive.sneakers;
        
        this.elements.brandsGrid.innerHTML = '';
        
        // Добавляем кнопку "Все бренды" первой
        const allBrandsCard = document.createElement('div');
        allBrandsCard.className = 'brand-item all-brands';
        allBrandsCard.innerHTML = `
            <div class="brand-logo-container">
                <span style="font-size: 32px;">👟</span>
            </div>
            <span class="brand-count">${sneakers.length}</span>
        `;
        
        allBrandsCard.addEventListener('click', () => {
            this.showArchivePage('Все кроссовки');
            this.currentFilter = { type: null, value: null };
            this.displayAllSneakers();
        });
        
        this.elements.brandsGrid.appendChild(allBrandsCard);
        
        // Добавляем кнопки для каждого бренда
        brands.forEach(brand => {
            const count = sneakers.filter(s => s.brand === brand).length;
            
            // Создаём квадратную кнопку
            const brandCard = document.createElement('div');
            brandCard.className = 'brand-item no-label';
            brandCard.setAttribute('data-brand', brand);
            
            // Логотип бренда
            const logoPath = this.getBrandLogoPath(brand);
            
            brandCard.innerHTML = `
                <div class="brand-logo-container">
                    <img src="${logoPath}" 
                         alt="${brand}" 
                         class="brand-logo"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/150/1C1C1E/FFFFFF?text=${brand.charAt(0)}'">
                </div>
                <span class="brand-count">${count}</span>
            `;
            
            brandCard.addEventListener('click', () => {
                this.showBrandArchive(brand);
            });
            
            this.elements.brandsGrid.appendChild(brandCard);
        });
    }

    getBrandLogoPath(brand) {
        const brandLogos = {
            'Nike': 'images/brands/nike.png',
            'Adidas': 'images/brands/adidas.png',
            'Reebok': 'images/brands/reebok.png',
            'Puma': 'images/brands/puma.png',
            'New Balance': 'images/brands/new-balance.png',
            'Converse': 'images/brands/converse.png',
            'Vans': 'images/brands/vans.png',
            'Asics': 'images/brands/asics.png',
            'Jordan': 'images/brands/jordan.png'
        };
        
        return brandLogos[brand] || `https://via.placeholder.com/150/1C1C1E/FFFFFF?text=${brand.charAt(0)}`;
    }

    loadRecentSneakers() {
        const recent = window.sneakerArchive.sneakers
            .sort((a, b) => b.id - a.id)
            .slice(0, 4);
        
        this.elements.recentGrid.innerHTML = '';
        
        recent.forEach(sneaker => {
            const recentCard = document.createElement('div');
            recentCard.className = 'recent-item';
            recentCard.innerHTML = `
                <img src="${sneaker.image}" alt="${sneaker.brand} ${sneaker.model}" 
                     class="recent-image" onerror="this.src='https://via.placeholder.com/300/1C1C1E/FFFFFF?text=👟'">
                <div class="recent-info">
                    <h4>${sneaker.brand} ${sneaker.model}</h4>
                    <p>${sneaker.article} • ${sneaker.year}</p>
                </div>
            `;
            
            recentCard.addEventListener('click', () => {
                this.showSneakerDetails(sneaker.id);
            });
            
            this.elements.recentGrid.appendChild(recentCard);
        });
    }

    // ===== ФУНКЦИОНАЛ ПОИСКА =====
    performSearch() {
        const query = this.elements.globalSearch.value.trim();
        
        if (!query) {
            alert('Введите поисковый запрос');
            return;
        }
        
        this.currentFilter = {
            type: 'search',
            value: query
        };
        
        this.showArchivePage(`Результаты поиска: "${query}"`);
        this.displaySneakers();
    }

    // ===== АРХИВ ПО БРЕНДУ =====
    showBrandArchive(brand) {
        this.currentFilter = {
            type: 'brand',
            value: brand
        };
        
        this.showArchivePage(`Бренд: ${brand}`);
        this.displaySneakers();
    }

    displayAllSneakers() {
        this.elements.sneakersGrid.innerHTML = '';
        
        const sneakers = window.sneakerArchive.sneakers;
        
        if (sneakers.length === 0) {
            this.elements.sneakersGrid.innerHTML = `
                <div class="empty-state full-width">
                    <p>Архив пуст. Добавьте первые кроссовки!</p>
                </div>
            `;
            return;
        }
        
        sneakers.forEach(sneaker => {
            const card = this.createSneakerCard(sneaker);
            this.elements.sneakersGrid.appendChild(card);
        });
    }

    // ===== ОТОБРАЖЕНИЕ КРОССОВОК =====
    displaySneakers() {
        let sneakers = window.sneakerArchive.sneakers;
        
        if (this.currentFilter.type === 'brand') {
            sneakers = sneakers.filter(s => s.brand === this.currentFilter.value);
        } else if (this.currentFilter.type === 'search') {
            const query = this.currentFilter.value.toLowerCase();
            sneakers = sneakers.filter(s => 
                s.brand.toLowerCase().includes(query) ||
                s.model.toLowerCase().includes(query) ||
                s.article.toLowerCase().includes(query) ||
                (s.model2 && s.model2.toLowerCase().includes(query))
            );
        }
        
        this.elements.sneakersGrid.innerHTML = '';
        
        if (sneakers.length === 0) {
            this.elements.sneakersGrid.innerHTML = `
                <div class="empty-state">
                    <p>Ничего не найдено</p>
                </div>
            `;
            return;
        }
        
        sneakers.forEach(sneaker => {
            const card = this.createSneakerCard(sneaker);
            this.elements.sneakersGrid.appendChild(card);
        });
    }

    createSneakerCard(sneaker) {
        const card = document.createElement('div');
        card.className = 'sneaker-card';
        
        card.innerHTML = `
            <img src="${sneaker.image}" alt="${sneaker.brand} ${sneaker.model}" 
                 class="sneaker-image" onerror="this.src='https://via.placeholder.com/300/1C1C1E/FFFFFF?text=👟'">
            
            <div class="sneaker-info">
                <div class="sneaker-header">
                    <div class="sneaker-title">
                        <h3>${sneaker.brand} ${sneaker.model}</h3>
                        <p>${sneaker.article}</p>
                    </div>
                    <span class="sneaker-year">${sneaker.year}</span>
                </div>
                
                ${sneaker.collaboration ? `<p><strong>Коллаборация:</strong> ${sneaker.collaboration}</p>` : ''}
                
                <p><strong>Цвет:</strong> ${sneaker.main_color}${sneaker.main_color2 ? `, ${sneaker.main_color2}` : ''}</p>
                <p><strong>Страна:</strong> ${sneaker.country}</p>
                
                ${sneaker.description ? `<p class="description">${sneaker.description}</p>` : ''}
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.showSneakerDetails(sneaker.id);
        });
        
        return card;
    }

    // ===== КОЛЛАБОРАЦИИ =====
    loadCollaborations() {
        const sneakers = window.sneakerArchive.sneakers;
        const collabs = {};
        
        sneakers.forEach(sneaker => {
            if (sneaker.collaboration && sneaker.collaboration.trim() !== '') {
                if (!collabs[sneaker.collaboration]) {
                    collabs[sneaker.collaboration] = {
                        name: sneaker.collaboration,
                        count: 0
                    };
                }
                collabs[sneaker.collaboration].count++;
            }
        });
        
        this.elements.collabsGrid.innerHTML = '';
        
        const collabList = Object.values(collabs);
        
        if (collabList.length === 0) {
            this.elements.collabsGrid.innerHTML = `
                <div class="empty-state">
                    <p>Коллабораций пока нет</p>
                </div>
            `;
            return;
        }
        
        collabList.forEach(collab => {
            const collabCard = document.createElement('div');
            collabCard.className = 'collab-item';
            collabCard.innerHTML = `
                <img src="https://via.placeholder.com/80/5856D6/FFFFFF?text=${collab.name.charAt(0)}" 
                     alt="${collab.name}" class="collab-logo">
                <h3>${collab.name}</h3>
                <p>${collab.count} моделей</p>
            `;
            
            collabCard.addEventListener('click', () => {
                this.showCollabArchive(collab.name);
            });
            
            this.elements.collabsGrid.appendChild(collabCard);
        });
    }

    showCollabArchive(collabName) {
        this.currentFilter = {
            type: 'collab',
            value: collabName
        };
        
        this.showArchivePage(`Коллаборация: ${collabName}`);
        
        const filtered = window.sneakerArchive.sneakers.filter(
            s => s.collaboration === collabName
        );
        
        this.elements.sneakersGrid.innerHTML = '';
        
        filtered.forEach(sneaker => {
            const card = this.createSneakerCard(sneaker);
            this.elements.sneakersGrid.appendChild(card);
        });
    }

    // ===== ФОРМА ДОБАВЛЕНИЯ С DRAG & DROP =====
    showAddForm() {
        this.elements.addFormModal.style.display = 'flex';
        this.createFormFields();
        
        setTimeout(() => {
            this.setupImageUpload();
        }, 100);
    }

    hideAddForm() {
        this.elements.addFormModal.style.display = 'none';
        this.elements.addSneakerForm.reset();
        this.clearImagePreview();
    }

    createFormFields() {
        const formFields = [
            { name: 'brand', label: 'Бренд*', type: 'text', required: true, width: 'half' },
            { name: 'model', label: 'Модель*', type: 'text', required: true, width: 'half' },
            { name: 'article', label: 'Артикул (оставьте пустым для автогенерации)', type: 'text', required: false, width: 'full' },
            { name: 'collaboration', label: 'Коллаборация с', type: 'text', required: false, width: 'full' },
            { name: 'model2', label: 'Модель 2', type: 'text', required: false, width: 'half' },
            { name: 'series', label: 'Серия', type: 'text', required: false, width: 'half' },
            { name: 'collection', label: 'Коллекция', type: 'text', required: false, width: 'half' },
            { name: 'pack', label: 'Пак', type: 'text', required: false, width: 'half' },
            { name: 'year', label: 'Год', type: 'number', required: false, width: 'half' },
            { name: 'country', label: 'Страна производства', type: 'text', required: false, width: 'half' },
            { name: 'main_color', label: 'Основной цвет*', type: 'text', required: true, width: 'half' },
            { name: 'main_color2', label: 'Основной цвет 2', type: 'text', required: false, width: 'half' },
            { name: 'detail_color', label: 'Цвет деталей*', type: 'text', required: true, width: 'half' },
            { name: 'detail_color2', label: 'Цвет деталей 2', type: 'text', required: false, width: 'half' },
            { name: 'description', label: 'Описание', type: 'textarea', required: false, width: 'full' }
        ];

        let formHTML = '<div class="form-grid">';
        
        formFields.forEach(field => {
            const widthClass = field.width === 'full' ? 'full-width' : '';
            
            formHTML += `
                <div class="form-group ${widthClass}">
                    <label for="${field.name}">${field.label}</label>
                    ${field.type === 'textarea' 
                        ? `<textarea id="${field.name}" name="${field.name}" 
                           ${field.required ? 'required' : ''}
                           placeholder="Введите описание"></textarea>`
                        : `<input type="${field.type}" id="${field.name}" name="${field.name}" 
                           ${field.required ? 'required' : ''}
                           placeholder="Введите ${field.label.toLowerCase()}">`
                    }
                </div>
            `;
        });

        // Компонент для загрузки фото
        formHTML += this.createImageUploadField();
        
        formHTML += `
            <div class="form-group full-width">
                <label for="details">Детали (через запятую)</label>
                <input type="text" id="details" name="details" 
                       placeholder="Например: кожаный верх, резиновая подошва, светоотражающие элементы">
            </div>
        </div>`;

        this.elements.addSneakerForm.innerHTML = formHTML;
    }

    createImageUploadField() {
        return `
            <div class="form-group full-width">
                <label>Изображение кроссовок</label>
                <div class="image-upload-area" id="imageUploadArea">
                    <div class="upload-placeholder">
                        <span class="upload-icon">📷</span>
                        <p class="upload-text">Перетащите фото сюда</p>
                        <p class="upload-subtext">или нажмите для выбора</p>
                        <input type="file" id="imageFile" name="image" accept="image/*" capture="environment" style="display: none;">
                    </div>
                    <div class="image-preview" id="imagePreview" style="display: none;">
                        <img id="previewImage" src="" alt="Предпросмотр">
                        <button type="button" class="remove-image-btn" id="removeImageBtn">×</button>
                    </div>
                </div>
                <div class="upload-options">
                    <button type="button" class="upload-option-btn" id="takePhotoBtn">📸 Сделать фото</button>
                    <button type="button" class="upload-option-btn" id="choosePhotoBtn">📁 Выбрать из галереи</button>
                    <button type="button" class="upload-option-btn" id="pasteUrlBtn">🔗 Вставить ссылку</button>
                </div>
                <input type="hidden" id="imageDataUrl" name="imageDataUrl">
                <input type="text" id="imageUrl" name="imageUrl" placeholder="Или введите URL изображения" style="display: none; margin-top: 10px;">
            </div>
        `;
    }

    setupImageUpload() {
        const uploadArea = document.getElementById('imageUploadArea');
        const fileInput = document.getElementById('imageFile');
        const preview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        const removeBtn = document.getElementById('removeImageBtn');
        const takePhotoBtn = document.getElementById('takePhotoBtn');
        const choosePhotoBtn = document.getElementById('choosePhotoBtn');
        const pasteUrlBtn = document.getElementById('pasteUrlBtn');
        const imageUrlInput = document.getElementById('imageUrl');
        const imageDataUrlInput = document.getElementById('imageDataUrl');

        if (!uploadArea) return;

        // Drag & Drop события
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageFile(files[0]);
            }
        });

        // Клик по области загрузки
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Выбор файла
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImageFile(e.target.files[0]);
            }
        });

        // Удаление изображения
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearImagePreview();
            });
        }

        // Кнопка "Сделать фото" (только в Telegram)
        if (takePhotoBtn) {
            takePhotoBtn.addEventListener('click', () => {
                this.takePhotoWithCamera();
            });
        }

        // Кнопка "Выбрать из галереи"
        if (choosePhotoBtn) {
            choosePhotoBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        // Кнопка "Вставить ссылку"
        if (pasteUrlBtn) {
            pasteUrlBtn.addEventListener('click', () => {
                if (imageUrlInput) {
                    imageUrlInput.style.display = 'block';
                    imageUrlInput.focus();
                }
            });
        }

        // Ввод URL
        if (imageUrlInput) {
            imageUrlInput.addEventListener('change', (e) => {
                if (e.target.value.trim() !== '') {
                    this.showImagePreview(e.target.value);
                }
            });
        }
    }

    handleImageFile(file) {
        if (!file.type.match('image.*')) {
            this.showNotification('Пожалуйста, выберите файл изображения', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Файл слишком большой. Максимум 5MB', 'error');
            return;
        }

        this.showUploadProgress();

        const reader = new FileReader();
        
        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                this.updateProgressBar(percent);
            }
        };

        reader.onload = (e) => {
            document.getElementById('imageDataUrl').value = e.target.result;
            this.showImagePreview(e.target.result);
            this.hideUploadProgress();
            this.showNotification('Фото успешно загружено!', 'success');
        };

        reader.onerror = () => {
            this.showNotification('Ошибка при чтении файла', 'error');
            this.hideUploadProgress();
        };

        reader.readAsDataURL(file);
    }

    takePhotoWithCamera() {
        if (this.tg && this.tg.platform !== 'unknown') {
            this.tg.showCamera((file) => {
                if (file) {
                    const base64Data = `data:image/jpeg;base64,${file}`;
                    document.getElementById('imageDataUrl').value = base64Data;
                    this.showImagePreview(base64Data);
                    this.showNotification('Фото сделано!', 'success');
                }
            });
        } else {
            const fileInput = document.getElementById('imageFile');
            fileInput.setAttribute('capture', 'environment');
            fileInput.click();
            setTimeout(() => fileInput.removeAttribute('capture'), 100);
        }
    }

    showImagePreview(src) {
        const uploadArea = document.getElementById('imageUploadArea');
        const preview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        const imageUrlInput = document.getElementById('imageUrl');

        if (previewImage) {
            previewImage.src = src;
            preview.style.display = 'block';
            uploadArea.querySelector('.upload-placeholder').style.display = 'none';
            
            if (imageUrlInput) {
                imageUrlInput.style.display = 'none';
                imageUrlInput.value = '';
            }
        }
    }

    clearImagePreview() {
        const uploadArea = document.getElementById('imageUploadArea');
        const preview = document.getElementById('imagePreview');
        const fileInput = document.getElementById('imageFile');
        const imageDataUrlInput = document.getElementById('imageDataUrl');
        const imageUrlInput = document.getElementById('imageUrl');

        if (preview) {
            preview.style.display = 'none';
        }
        
        uploadArea.querySelector('.upload-placeholder').style.display = 'flex';
        fileInput.value = '';
        if (imageDataUrlInput) imageDataUrlInput.value = '';
        if (imageUrlInput) {
            imageUrlInput.style.display = 'none';
            imageUrlInput.value = '';
        }
    }

    showUploadProgress() {
        const uploadArea = document.getElementById('imageUploadArea');
        
        const progressHTML = `
            <div class="upload-progress">
                <span>Загрузка...</span>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
            </div>
        `;
        
        uploadArea.insertAdjacentHTML('beforeend', progressHTML);
    }

    updateProgressBar(percent) {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = percent + '%';
        }
    }

    hideUploadProgress() {
        const progress = document.querySelector('.upload-progress');
        if (progress) {
            progress.remove();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `upload-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, 20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    handleAddSneaker() {
        const formData = new FormData(this.elements.addSneakerForm);
        const sneakerData = {};

        // Обрабатываем загруженное фото
        const imageDataUrl = document.getElementById('imageDataUrl')?.value;
        const imageUrlInput = document.getElementById('imageUrl')?.value;
        
        if (imageDataUrl) {
            sneakerData.image = imageDataUrl;
        } else if (imageUrlInput && imageUrlInput.trim() !== '') {
            sneakerData.image = imageUrlInput.trim();
        } else {
            sneakerData.image = 'https://via.placeholder.com/300/1C1C1E/FFFFFF?text=👟';
        }

        // Остальные поля формы
        for (let [key, value] of formData.entries()) {
            if (key !== 'image' && key !== 'imageDataUrl' && key !== 'imageUrl') {
                sneakerData[key] = value.trim();
            }
        }

        // Обработка деталей
        if (sneakerData.details) {
            sneakerData.details = sneakerData.details.split(',')
                .map(d => d.trim())
                .filter(d => d !== '');
        } else {
            sneakerData.details = [];
        }

        // Значения по умолчанию
        if (!sneakerData.year) sneakerData.year = '???';
        if (!sneakerData.country) sneakerData.country = '???';

        // Добавляем кроссовок
        const newSneaker = window.sneakerArchive.addSneaker(sneakerData);
        
        // Показываем уведомление
        this.tg.showAlert(`✅ Кроссовки добавлены!\n${newSneaker.brand} ${newSneaker.model}\nАртикул: ${newSneaker.article}`);
        
        // Обновляем интерфейс
        this.hideAddForm();
        this.loadMainPage();
        
        if (this.pages.archive.style.display === 'block') {
            this.displaySneakers();
        }
    }

    showSneakerDetails(id) {
        const sneaker = window.sneakerArchive.sneakers.find(s => s.id === id);
        
        if (!sneaker) return;
        
        const modalHTML = `
            <div class="sneaker-details-modal">
                <div class="details-header">
                    <h2>${sneaker.brand} ${sneaker.model}</h2>
                    <button class="close-details-btn">×</button>
                </div>
                
                <img src="${sneaker.image}" alt="${sneaker.brand} ${sneaker.model}" 
                     class="details-image" onerror="this.src='https://via.placeholder.com/400/1C1C1E/FFFFFF?text=👟'">
                
                <div class="details-content">
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Артикул</span>
                            <span class="detail-value">${sneaker.article}</span>
                        </div>
                        
                        ${sneaker.collaboration ? `
                        <div class="detail-item">
                            <span class="detail-label">Коллаборация</span>
                            <span class="detail-value">${sneaker.collaboration}</span>
                        </div>` : ''}
                        
                        <div class="detail-item">
                            <span class="detail-label">Модель</span>
                            <span class="detail-value">${sneaker.model}${sneaker.model2 ? ` ${sneaker.model2}` : ''}</span>
                        </div>
                        
                        ${sneaker.series ? `
                        <div class="detail-item">
                            <span class="detail-label">Серия</span>
                            <span class="detail-value">${sneaker.series}</span>
                        </div>` : ''}
                        
                        ${sneaker.collection ? `
                        <div class="detail-item">
                            <span class="detail-label">Коллекция</span>
                            <span class="detail-value">${sneaker.collection}</span>
                        </div>` : ''}
                        
                        ${sneaker.pack ? `
                        <div class="detail-item">
                            <span class="detail-label">Пак</span>
                            <span class="detail-value">${sneaker.pack}</span>
                        </div>` : ''}
                        
                        <div class="detail-item">
                            <span class="detail-label">Год</span>
                            <span class="detail-value">${sneaker.year}</span>
                        </div>
                        
                        <div class="detail-item">
                            <span class="detail-label">Страна</span>
                            <span class="detail-value">${sneaker.country}</span>
                        </div>
                        
                        <div class="detail-item full-width">
                            <span class="detail-label">Основной цвет</span>
                            <span class="detail-value">${sneaker.main_color}${sneaker.main_color2 ? `, ${sneaker.main_color2}` : ''}</span>
                        </div>
                        
                        <div class="detail-item full-width">
                            <span class="detail-label">Цвет деталей</span>
                            <span class="detail-value">${sneaker.detail_color}${sneaker.detail_color2 ? `, ${sneaker.detail_color2}` : ''}</span>
                        </div>
                    </div>
                    
                    ${sneaker.details.length > 0 ? `
                    <div class="details-section">
                        <h3>Детали</h3>
                        <div class="details-tags">
                            ${sneaker.details.map(detail => `<span class="detail-tag">${detail}</span>`).join('')}
                        </div>
                    </div>` : ''}
                    
                    ${sneaker.description ? `
                    <div class="details-section">
                        <h3>Описание</h3>
                        <p>${sneaker.description}</p>
                    </div>` : ''}
                </div>
            </div>
        `;
        
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay details-overlay';
        modalOverlay.innerHTML = modalHTML;
        document.body.appendChild(modalOverlay);
        
        const closeBtn = modalOverlay.querySelector('.close-details-btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
        
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });
    }
}

// Запускаем приложение
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SneakerArchiveApp();
});