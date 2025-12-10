// Telegram Web App инициализация
const tg = window.Telegram.WebApp;

// Основные элементы
const userGreeting = document.getElementById('user-greeting');
const visitorsCount = document.getElementById('visitors');
const siteUrl = document.getElementById('site-url');
const repoLink = document.getElementById('repo-link');

// Инициализация приложения
function initApp() {
    // Расширяем на весь экран
    tg.expand();
    
    // Показываем кнопку "Назад" если нужно
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        tg.close();
    });
    
    // Получаем данные пользователя
    const user = tg.initDataUnsafe.user;
    
    if (user) {
        const userName = user.first_name || 'пользователь';
        const userUsername = user.username ? `@${user.username}` : '';
        
        userGreeting.innerHTML = `
            👋 Привет, <strong>${userName}</strong> ${userUsername}!
            <br><small>Ваш ID: ${user.id}</small>
        `;
    } else {
        userGreeting.textContent = '👋 Привет, пользователь Telegram!';
    }
    
    // Устанавливаем информацию о сайте
    siteUrl.textContent = window.location.href;
    repoLink.textContent = 'github.com/ваш-логин/ваш-репозиторий';
    
    // Имитируем счетчик посетителей
    let visitors = localStorage.getItem('visitors') || 100;
    visitors = parseInt(visitors) + 1;
    localStorage.setItem('visitors', visitors);
    
    // Анимация счетчика
    animateCounter(visitorsCount, 0, visitors, 2000);
    
    // Настраиваем основную кнопку
    tg.MainButton.setText("🎯 Главное действие");
    tg.MainButton.setParams({
        color: "#667eea",
        text_color: "#ffffff"
    });
    tg.MainButton.onClick(() => {
        tg.showAlert("Вы нажали главную кнопку! Отличная работа! 🚀");
    });
    
    // Готово!
    tg.ready();
    console.log('Telegram Mini App инициализирован на GitHub Pages!');
}

// Анимация счетчика
function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        element.textContent = current.toLocaleString('ru-RU');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Функции для кнопок
function showWelcome() {
    tg.showAlert("🎉 Добро пожаловать на мой сайт!\n\nЗдесь вы можете:\n• Тестировать функции\n• Смотреть демо\n• Учиться разработке\n\nУдачи! 🚀");
}

function changeTheme() {
    const isDark = tg.colorScheme === 'dark';
    tg.showPopup({
        title: 'Смена темы',
        message: isDark ? 'Переключиться на светлую тему?' : 'Переключиться на темную тему?',
        buttons: [
            {id: 'yes', type: 'default', text: 'Да'},
            {id: 'no', type: 'destructive', text: 'Нет'}
        ]
    }, (buttonId) => {
        if (buttonId === 'yes') {
            tg.showAlert(`Тема изменена на ${isDark ? 'светлую' : 'темную'}!`);
        }
    });
}

function showPopup() {
    tg.showPopup({
        title: 'Диалоговое окно',
        message: 'Это всплывающее окно из Telegram Web Apps SDK',
        buttons: [
            {id: 'ok', type: 'ok', text: 'OK'},
            {id: 'cancel', type: 'cancel', text: 'Отмена'}
        ]
    }, (buttonId) => {
        tg.showAlert(`Вы выбрали: ${buttonId === 'ok' ? 'OK 👍' : 'Отмена 👎'}`);
    });
}

// Обновление времени
function updateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('update-time').textContent = 
        now.toLocaleDateString('ru-RU', options);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    updateTime();
    
    // Обновляем время каждую минуту
    setInterval(updateTime, 60000);
});

// Обработка событий Telegram
tg.onEvent('themeChanged', () => {
    tg.showAlert('Тема изменена системой!');
});

tg.onEvent('viewportChanged', () => {
    console.log('Размер окна изменен');
});