// Основная логика игры
class TatarCookingGame {
    constructor() {
        this.currentStep = 0;
        this.gameData = {
            collectedIngredients: [],
            completedDishes: [],
            score: 0
        };
        this.init();
    }

    init() {
        console.log('Татарский мастер-класс загружен!');
    }

    // Переход к следующему экрану
    goToScreen(screenName) {
        window.location.href = `pages/${screenName}.html`;
    }

    // Сохранение прогресса в localStorage
    saveProgress() {
        localStorage.setItem('tatarCookingProgress', JSON.stringify(this.gameData));
    }

    // Загрузка прогресса из localStorage
    loadProgress() {
        const saved = localStorage.getItem('tatarCookingProgress');
        if (saved) {
            this.gameData = JSON.parse(saved);
        }
    }

    // Добавление ингредиента
    addIngredient(ingredient) {
        if (!this.gameData.collectedIngredients.includes(ingredient)) {
            this.gameData.collectedIngredients.push(ingredient);
            this.saveProgress();
        }
    }

    // Проверка наличия ингредиента
    hasIngredient(ingredient) {
        return this.gameData.collectedIngredients.includes(ingredient);
    }

    // Завершение блюда
    completeDish(dishName) {
        if (!this.gameData.completedDishes.includes(dishName)) {
            this.gameData.completedDishes.push(dishName);
            this.gameData.score += 100;
            this.saveProgress();
        }
    }
}

// Глобальный экземпляр игры
let game;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    game = new TatarCookingGame();
    game.loadProgress();
});

// Функция запуска игры с главной страницы
function startGame() {
    game.goToScreen('welcome');
}

// Drag and Drop функциональность
function initDragAndDrop() {
    const draggables = document.querySelectorAll('.draggable');
    const dropZones = document.querySelectorAll('.drop-zone');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', handleDragStart);
        draggable.addEventListener('dragend', handleDragEnd);
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.ingredient || e.target.textContent);
    e.target.style.opacity = '0.5';
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    
    const data = e.dataTransfer.getData('text/plain');
    const dropZone = e.target;
    
    // Проверяем, можно ли добавить этот ингредиент
    if (dropZone.dataset.accepts && dropZone.dataset.accepts.includes(data)) {
        const ingredient = document.createElement('div');
        ingredient.className = 'dropped-ingredient';
        ingredient.textContent = data;
        dropZone.appendChild(ingredient);
        
        // Добавляем ингредиент в игровые данные
        if (game) {
            game.addIngredient(data);
        }
        
        // Проверяем завершение шага
        checkStepCompletion(dropZone);
    }
}

// Проверка завершения текущего шага
function checkStepCompletion(dropZone) {
    const requiredIngredients = dropZone.dataset.required ? dropZone.dataset.required.split(',') : [];
    const droppedIngredients = Array.from(dropZone.querySelectorAll('.dropped-ingredient')).map(el => el.textContent);
    
    if (requiredIngredients.every(ingredient => droppedIngredients.includes(ingredient))) {
        showSuccessMessage();
        setTimeout(() => {
            const nextButton = document.querySelector('.next-button');
            if (nextButton) {
                nextButton.style.display = 'block';
            }
        }, 1000);
    }
}

// Показ сообщения об успехе
function showSuccessMessage(text = '✅ Отлично! Переходим к следующему шагу.') {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = text;
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #00b894, #00cec9);
        color: white;
        padding: 20px 40px;
        border-radius: 15px;
        font-size: 1.2rem;
        z-index: 1000;
        animation: fadeInUp 0.5s ease-out;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}

// Показ обычного сообщения
function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.innerHTML = text;
    
    const colors = {
        info: 'linear-gradient(45deg, #74b9ff, #0984e3)',
        warning: 'linear-gradient(45deg, #fdcb6e, #f39c12)',
        error: 'linear-gradient(45deg, #e17055, #d63031)',
        success: 'linear-gradient(45deg, #00b894, #00cec9)'
    };
    
    message.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        font-size: 1rem;
        z-index: 1000;
        animation: fadeInUp 0.5s ease-out;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Обновление прогресс-бара
function updateProgressBar(current, total) {
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        const percentage = (current / total) * 100;
        progressBar.style.width = percentage + '%';
    }
}

// Функции навигации
function goBack() {
    window.history.back();
}

function goToNext(nextPage) {
    if (nextPage) {
        // Нормализуем путь для корректной работы при деплое
        let normalizedPath = nextPage;
        
        // Если путь начинается с ../pages/, убираем это
        if (normalizedPath.startsWith('../pages/')) {
            normalizedPath = normalizedPath.replace('../pages/', '');
        }
        
        // Если мы находимся в папке pages, добавляем только имя файла
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = normalizedPath;
        } else {
            // Если мы на главной странице, добавляем pages/
            window.location.href = `pages/${normalizedPath}`;
        }
    }
}

// Анимация появления элементов
function animateElements() {
    const elements = document.querySelectorAll('.animate-on-load');
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Звуковые эффекты (заглушки для будущего расширения)
function playSound(soundName) {
    console.log(`Играет звук: ${soundName}`);
    // Здесь можно добавить реальные звуковые эффекты
}

// Инициализация специфичных для страницы функций
function initPageSpecific() {
    // Инициализация drag and drop если есть соответствующие элементы
    if (document.querySelector('.draggable')) {
        initDragAndDrop();
    }
    
    // Анимация элементов
    animateElements();
    
    // Обновление прогресса
    if (game && document.querySelector('.progress-fill')) {
        updateProgressBar(game.gameData.completedDishes.length, 4);
    }
}

// Вызываем инициализацию при загрузке каждой страницы
document.addEventListener('DOMContentLoaded', initPageSpecific);

// Система диалогов в стиле визуальной новеллы
class VNDialogSystem {
    constructor() {
        this.currentDialog = 0;
        this.dialogs = [];
        this.isTyping = false;
        this.typewriterSpeed = 50; // миллисекунды между символами
        this.autoAdvance = false;
    }

    // Инициализация диалогов для главной страницы
    initMainPageDialogs() {
        this.dialogs = [
            {
                speaker: "Бабушка Фатима",
                text: "Салам алейкум! Я бабушка Фатима, и сегодня я научу вас готовить настоящие татарские блюда!",
                action: null
            },
            {
                speaker: "Бабушка Фатима",
                text: "Мы приготовим четыре традиционных блюда: эчпочмак, кыстыбый, чак-чак и татарский чай.",
                action: null
            },
            {
                speaker: "Бабушка Фатима",
                text: "Каждое блюдо имеет свою историю и особенности приготовления. Готовы начать наш мастер-класс?",
                action: () => {
                    const nextBtn = document.getElementById('vn-next-btn');
                    if (nextBtn) {
                        nextBtn.textContent = 'Начать мастер-класс';
                        nextBtn.onclick = () => startGame();
                    }
                }
            }
        ];
    }

    // Инициализация диалогов для страницы welcome
    initWelcomePageDialogs() {
        this.dialogs = [
            {
                speaker: "Бабушка Фатима",
                text: "Салам алейкум, дорогой! Меня зовут Фатима, и я научу тебя готовить настоящие татарские блюда. Моя семья передавала эти рецепты из поколения в поколение уже более 200 лет!",
                action: null
            },
            {
                speaker: "Бабушка Фатима",
                text: "Сегодня мы приготовим четыре традиционных блюда: эчпочмак, кыстыбый, чак-чак и татарский чай. Каждое блюдо имеет свою историю и особенности приготовления.",
                action: null
            },
            {
                speaker: "Бабушка Фатима",
                text: "Но сначала нам нужно собрать все необходимые продукты. Пойдём к холодильнику и посмотрим, что у нас есть!",
                action: null
            },
            {
                speaker: "Бабушка Фатима",
                text: "Помни, дорогой: в татарской кухне главное - это любовь к семье и уважение к традициям. Готовить нужно с душой!",
                action: () => {
                    const nextBtn = document.getElementById('vn-next-btn');
                    if (nextBtn) {
                        nextBtn.textContent = 'К холодильнику!';
                        nextBtn.onclick = () => goToNext('refrigerator.html');
                    }
                }
            }
        ];
    }

    // Эффект печатающегося текста
    typewriterEffect(element, text, callback) {
        this.isTyping = true;
        element.textContent = '';
        element.classList.add('typing');
        
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                element.classList.remove('typing');
                this.isTyping = false;
                if (callback) callback();
            }
        }, this.typewriterSpeed);
    }

    // Переход к следующему диалогу
    nextDialog() {
        if (this.isTyping) {
            // Если текст ещё печатается, завершаем его мгновенно
            this.skipTypewriter();
            return;
        }

        this.currentDialog++;
        
        if (this.currentDialog < this.dialogs.length) {
            const dialog = this.dialogs[this.currentDialog];
            this.showDialog(dialog);
            this.updateProgress();
        }
    }

    // Показ диалога
    showDialog(dialog) {
        const speakerElement = document.getElementById('vn-speaker');
        const textElement = document.getElementById('vn-text');
        
        if (speakerElement) {
            speakerElement.textContent = dialog.speaker;
        }
        
        if (textElement) {
            this.typewriterEffect(textElement, dialog.text, () => {
                if (dialog.action) {
                    dialog.action();
                }
            });
        }
    }

    // Пропуск эффекта печатания
    skipTypewriter() {
        const textElement = document.getElementById('vn-text');
        if (textElement && this.isTyping) {
            const currentDialog = this.dialogs[this.currentDialog];
            textElement.textContent = currentDialog.text;
            textElement.classList.remove('typing');
            this.isTyping = false;
            
            if (currentDialog.action) {
                currentDialog.action();
            }
        }
    }

    // Обновление прогресса
    updateProgress() {
        const progressElement = document.getElementById('progress-fill');
        if (progressElement && this.dialogs.length > 0) {
            const percentage = ((this.currentDialog + 1) / this.dialogs.length) * 100;
            progressElement.style.width = percentage + '%';
        }
    }

    // Инициализация системы
    init(pageType = 'main') {
        if (pageType === 'welcome') {
            this.initWelcomePageDialogs();
        } else {
            this.initMainPageDialogs();
        }
        
        // Показываем первый диалог
        if (this.dialogs.length > 0) {
            this.showDialog(this.dialogs[0]);
            this.updateProgress();
        }
    }
}

// Глобальный экземпляр системы диалогов
let vnDialogSystem;

// Функция для следующего диалога (вызывается из HTML)
function nextVNDialog() {
    if (vnDialogSystem) {
        vnDialogSystem.nextDialog();
    }
}

// Инициализация VN системы при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Определяем тип страницы
    const isWelcomePage = window.location.pathname.includes('welcome.html');
    const isMainPage = window.location.pathname.endsWith('index.html') ||
                       window.location.pathname === '/' ||
                       window.location.pathname.endsWith('/') ||
                       window.location.pathname === '' ||
                       !window.location.pathname.includes('.html');
    
    if (isMainPage || isWelcomePage) {
        vnDialogSystem = new VNDialogSystem();
        vnDialogSystem.init(isWelcomePage ? 'welcome' : 'main');
    }
});
