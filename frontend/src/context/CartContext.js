import React, { createContext, useState, useEffect } from 'react';
import { message } from 'antd';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Намагаємося дістати кошик з пам'яті браузера при завантаженні
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Щоразу, коли кошик змінюється, зберігаємо його в пам'ять браузера
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Додати товар в кошик
    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                // Якщо такий товар вже є, просто збільшуємо кількість на 1
                return prevItems.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // Якщо товару ще немає, додаємо його з кількістю 1
            return [...prevItems, { ...product, quantity: 1 }];
        });
        message.success(`${product.title} додано до кошика!`);
    };

    // Видалити товар з кошика повністю
    const removeFromCart = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    // Змінити кількість (плюс/мінус)
    const updateQuantity = (id, amount) => {
        setCartItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                const newQuantity = item.quantity + amount;
                return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
            }
            return item;
        }));
    };

    // Підрахунок загальної суми
    const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    // Підрахунок загальної кількості товарів (для значка на іконці)
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, totalPrice, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};