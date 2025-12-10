// Telegram Web App инициализация
const tg = window.Telegram.WebApp;

// Инициализация приложения
function initApp() {
    // Расширяем на весь экран
    tg.expand();
    
    // Настраиваем цветовую тему
    tg.setHeaderColor('#0a0a0a');
    tg.setBackgroundColor('#0a0a0a');
    
    // Показываем основную кнопку
    tg.MainButton.setText("🛒 Открыть корзину");
    tg.MainButton.setParams({
        color: '#ff6b6b',
        text_color: '#ffffff'
    });
    tg.MainButton.show();
    tg.MainButton.onClick(openCart);
    
    // Готово
    tg.ready();
    console.log('HOT SPOT инициализирован');
}

// Данные продуктов
const products = {
    1: { name: "МАЛИНА КАКАШКА", price: 450, color: "#ff6b9d" },
    2: { name: "БАНАН СПЕРМА", price: 450, color: "#ffd166" },
    3: { name: "БАРЕБУХНЫЙ КОКТЕЙЛЬ", price: 450, color: "#06d6a0" },
    4: { name: "ВИНОГРАДНЫЙ ЛЁД", price: 450, color: "#a663cc" },
    5: { name: "ПЕРСИКОВЫЙ РАЙ", price: 450, color: "#ff9e6d" },
    6: { name: "ПОЛЯРНАЯ МЯТА", price: 450, color: "#4cc9f0" }
};

// Корзина
let cart = JSON.parse(localStorage.getItem('hotspot_cart')) || {};
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');

// Обновление корзины
function updateCart() {
    // Сохраняем в localStorage
    localStorage.setItem('hotspot_cart', JSON.stringify(cart));
    
    // Обновляем счетчик
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Обновляем основную кнопку
    if (totalItems > 0) {
        tg.MainButton.setText(`🛒 Корзина (${totalItems})`);
    } else {
        tg.MainButton.setText("🛒 Открыть корзину");
    }
    
    // Обновляем модальное окно
    updateCartModal();
}

// Обновление модального окна корзины
function updateCartModal() {
    cartItems.innerHTML = '';
    let total = 0;
    
    for (const [id, item] of Object.entries(cart)) {
        const product = products[id];
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${product.name}</h4>
                <div class="cart-item-meta">
                    <span>${product.price} ₽ × ${item.quantity}</span>
                </div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn decrease" data-id="${id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${id}">+</button>
                <span class="item-price">${itemTotal} ₽</span>
            </div>
        `;
        cartItems.appendChild(cartItem);
    }
    
    // Итого
    cartTotalPrice.textContent = `${total} ₽`;
    
    // Добавляем обработчики для кнопок
    document.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            changeQuantity(id, -1);
        });
    });
    
    document.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            changeQuantity(id, 1);
        });
    });
}

// Изменение количества
function changeQuantity(id, delta) {
    if (!cart[id]) {
        if (delta > 0) {
            cart[id] = { quantity: 1 };
        }
    } else {
        cart[id].quantity += delta;
        if (cart[id].quantity <= 0) {
            delete cart[id];
            tg.HapticFeedback.impactOccurred('light');
        }
    }
    updateCart();
    
    if (delta > 0) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Открытие корзины
function openCart() {
    cartModal.style.display = 'flex';
    tg.HapticFeedback.impactOccurred('medium');
}

// Закрытие корзины
function closeCartModal() {
    cartModal.style.display = 'none';
    tg.HapticFeedback.impactOccurred('light');
}

// Оформление заказа
function checkout() {
    if (Object.keys(cart).length === 0) {
        tg.showAlert('Корзина пуста!');
        return;
    }
    
    // Формируем сообщение для заказа
    let orderMessage = "🚀 ЗАКАЗ С HOT SPOT 🚀\n\n";
    let total = 0;
    
    for (const [id, item] of Object.entries(cart)) {
        const product = products[id];
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        orderMessage += `${product.name}\n${item.quantity} × ${product.price} ₽ = ${itemTotal} ₽\n\n`;
    }
    
    orderMessage += `\n💰 ИТОГО: ${total} ₽\n\n`;
    orderMessage += `Для оформления заказа свяжитесь с менеджером:\n@hotspot_manager`;
    
    // Показываем подтверждение
    tg.showPopup({
        title: 'Подтверждение заказа',
        message: `Общая сумма: ${total} ₽\n\nПодтвердить оформление заказа?`,
        buttons: [
            {id: 'confirm', type: 'default', text: '✅ Подтвердить'},
            {id: 'cancel', type: 'destructive', text: '❌ Отмена'}
        ]
    }, (buttonId) => {
        if (buttonId === 'confirm') {
            // Отправляем данные в Telegram
            tg.sendData(JSON.stringify({
                action: 'order',
                cart: cart,
                total: total,
                timestamp: new Date().toISOString()
            }));
            
            tg.showAlert('Заказ отправлен! Менеджер свяжется с вами в течение 5 минут.');
            
            // Очищаем корзину
            cart = {};
            updateCart();
            closeCartModal();
            
            tg.HapticFeedback.notificationOccurred('success');
        }
    });
}

// Инициализация событий
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    
    // Обработчики кнопок "Добавить в корзину"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.add-to-cart').dataset.id;
            changeQuantity(id, 1);
            
            // Анимация кнопки
            const button = e.target.closest('.add-to-cart');
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.background = '#2ed573';
            
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-plus"></i>';
                button.style.background = 'linear-gradient(135deg, #ff6b6b, #ffa500
