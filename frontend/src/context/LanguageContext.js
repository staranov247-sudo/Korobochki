import React, { createContext, useState, useEffect, useRef } from 'react';

export const LanguageContext = createContext();

const fallbackTranslations = {
    uk: {
        menu: 'МЕНЮ',
        catalog: 'КАТАЛОГ',
        cooperation: 'СПІВПРАЦЯ',
        discounts: 'СИСТЕМА ЗНИЖОК',
        contacts: 'КОНТАКТИ',
        newProducts: 'НОВИНКИ',
        subscribeTitle: 'ХОЧЕШ ДІЗНАВАТИСЯ ПРО ЗНИЖКИ ТА НОВИНКИ ПЕРШИМ?',
        subscribePlaceholder: 'Введіть ваш Email',
        subscribeBtn: 'ПІДПИСАТИСЬ',
        about: 'Про нас',
        payment: 'Оплата і доставка',
        newsroom: 'NewsRoom',
        siteMap: 'Мапа сайту',
        handmadeCards: 'Листівки ручної роботи',
        handmadeEnvelopes: 'Конверти ручної роботи',
        miniCards: 'Міні-листівки',
        miniEnvelopes: 'Міні-конверти',
        paper: 'Папір',
        stickers: 'Стікери',
        yourCart: 'Ваш кошик',
        emptyCart: 'Кошик порожній 😔',
        total: 'Разом:',
        checkout: 'Оформити замовлення',
        addToCart: 'Купити',
        buy: 'КУПИТИ',
        productNotFound: 'Товар не знайдено',
        allCategories: 'Всі категорії',
        productCategory: 'Категорії продукції',
        noProductsInCategory: 'У цій категорії поки немає товарів.',
        previousProduct: 'ПОПЕРЕДНІЙ ТОВАР',
        nextProduct: 'НАСТУПНИЙ ТОВАР',
        additionalInfo: 'ДОДАТКОВА ІНФОРМАЦІЯ',
        price: 'Ціна:',
        code: 'Code',
        manufacturer: 'Виробник:',
        category: 'Категорія:',
        size: 'Розмір:',
        characteristics: 'Характеристики:',
        authTitle: 'Авторизація',
        authSubtitle: 'Вхід або реєстрація для роботи з магазином',
        login: 'Увійти',
        register: 'Реєстрація',
        loginTab: 'Увійти',
        registerTab: 'Реєстрація',
        firstName: 'Ім’я',
        lastName: 'Прізвище',
        phone: 'Телефон',
        email: 'Пошта',
        password: 'Пароль',
        passwordPlaceholder: 'Придумайте пароль',
        signInButton: 'Увійти',
        signUpButton: 'Зареєструватися',
        enterYourName: 'Введіть ім’я',
        enterYourLastName: 'Введіть прізвище',
        enterYourPhone: 'Введіть телефон',
        enterCorrectEmail: 'Введіть коректну пошту',
        passwordHint: 'Пароль має бути не менше 6 символів',
        loginSuccess: 'Вхід успішний',
        registerSuccess: 'Реєстрація успішна',
        authError: 'Помилка авторизації'
    },
    en: {
        menu: 'MENU',
        catalog: 'CATALOG',
        cooperation: 'COOPERATION',
        discounts: 'DISCOUNTS',
        contacts: 'CONTACTS',
        newProducts: 'NEW ARRIVALS',
        subscribeTitle: 'WANT TO BE THE FIRST TO KNOW ABOUT DISCOUNTS AND NEWS?',
        subscribePlaceholder: 'Enter your Email',
        subscribeBtn: 'SUBSCRIBE',
        about: 'About Us',
        payment: 'Payment & Delivery',
        newsroom: 'NewsRoom',
        siteMap: 'Sitemap',
        handmadeCards: 'Handmade Cards',
        handmadeEnvelopes: 'Handmade Envelopes',
        miniCards: 'Mini Cards',
        miniEnvelopes: 'Mini Envelopes',
        paper: 'Paper',
        stickers: 'Stickers',
        yourCart: 'Your cart',
        emptyCart: 'Your cart is empty 😔',
        total: 'Total:',
        checkout: 'Checkout',
        addToCart: 'Buy',
        buy: 'BUY',
        productNotFound: 'Product not found',
        allCategories: 'All categories',
        productCategory: 'Product categories',
        noProductsInCategory: 'There are no products in this category yet.',
        previousProduct: 'PREVIOUS PRODUCT',
        nextProduct: 'NEXT PRODUCT',
        additionalInfo: 'ADDITIONAL INFORMATION',
        price: 'Price:',
        code: 'Code',
        manufacturer: 'Manufacturer:',
        category: 'Category:',
        size: 'Size:',
        characteristics: 'Specifications:',
        authTitle: 'Authorization',
        authSubtitle: 'Sign in or register to shop with us',
        login: 'Sign in',
        register: 'Register',
        loginTab: 'Sign in',
        registerTab: 'Register',
        firstName: 'First name',
        lastName: 'Last name',
        phone: 'Phone',
        email: 'Email',
        password: 'Password',
        passwordPlaceholder: 'Create a password',
        signInButton: 'Sign in',
        signUpButton: 'Register',
        enterYourName: 'Enter your name',
        enterYourLastName: 'Enter your last name',
        enterYourPhone: 'Enter your phone',
        enterCorrectEmail: 'Enter a valid email',
        passwordHint: 'Password must be at least 6 characters long',
        loginSuccess: 'Login successful',
        registerSuccess: 'Registration successful',
        authError: 'Authorization error'
    }
};

const detectLanguage = (text = '') => {
    if (!text || typeof text !== 'string') return 'uk';
    return /[А-Яа-яЁё]/.test(text) ? 'uk' : 'en';
};

const translateTextWithApi = async (text, targetLang) => {
    if (!text || typeof text !== 'string' || !text.trim()) return text;

    const sourceLang = detectLanguage(text);
    if (sourceLang === targetLang) return text;

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        const response = await fetch(url);
        if (!response.ok) return text;

        const data = await response.json();
        const translatedText = data?.responseData?.translatedText || data?.matches?.[0]?.translation || text;
        return translatedText || text;
    } catch (error) {
        return text;
    }
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        try {
            return localStorage.getItem('lang') || 'uk';
        } catch (error) {
            return 'uk';
        }
    });
    const [currency, setCurrency] = useState(() => {
        try {
            return localStorage.getItem('currency') || 'uah';
        } catch (error) {
            return 'uah';
        }
    });
    const [customTranslations, setCustomTranslations] = useState({});
    const [translationCache, setTranslationCache] = useState({});
    const pendingTranslationsRef = useRef({});

    useEffect(() => {
        try {
            localStorage.setItem('lang', lang);
        } catch (error) {
            // ignore if storage is unavailable
        }
    }, [lang]);

    useEffect(() => {
        try {
            localStorage.setItem('currency', currency);
        } catch (error) {
            // ignore if storage is unavailable
        }
    }, [currency]);

    const changeLanguage = (newLang) => {
        setLang(newLang);
    };

    const changeCurrency = (newCurrency) => {
        setCurrency(newCurrency);
    };

    const currencyMeta = {
        uah: { label: 'UAH', symbol: '₴', rate: 1 },
        usd: { label: 'USD', symbol: '$', rate: 1 / 38 },
        eur: { label: 'EUR', symbol: '€', rate: 1 / 42 }
    };

    const formatPrice = (value) => {
        const numericValue = Number(value || 0);
        const selected = currencyMeta[currency] || currencyMeta.uah;
        const converted = numericValue * selected.rate;
        const fixedValue = selected.rate === 1 ? converted.toFixed(0) : converted.toFixed(2);
        return `${fixedValue} ${selected.symbol}`;
    };

    const ensureTranslation = async (text) => {
        if (!text || typeof text !== 'string' || !text.trim()) return;

        const sourceLang = detectLanguage(text);
        if (sourceLang === lang) return;

        const cacheKey = `${sourceLang}|${lang}|${text}`;
        if (pendingTranslationsRef.current[cacheKey]) return;

        pendingTranslationsRef.current[cacheKey] = true;

        const translated = await translateTextWithApi(text, lang);
        if (translated && translated !== text) {
            setCustomTranslations((prev) => ({
                ...prev,
                [lang]: {
                    ...(prev[lang] || {}),
                    [text]: translated
                }
            }));
        }

        delete pendingTranslationsRef.current[cacheKey];
    };

    const translateText = async (text, targetLang = lang) => {
        if (!text || typeof text !== 'string' || !text.trim()) return text;

        const cacheKey = `${targetLang}|${text}`;
        if (translationCache[cacheKey]) {
            return translationCache[cacheKey];
        }

        const sourceLang = detectLanguage(text);
        if (sourceLang === targetLang) {
            setTranslationCache((prev) => ({ ...prev, [cacheKey]: text }));
            return text;
        }

        const translated = await translateTextWithApi(text, targetLang);
        const finalValue = translated || text;

        setTranslationCache((prev) => ({
            ...prev,
            [cacheKey]: finalValue
        }));

        if (translated && translated !== text) {
            setCustomTranslations((prev) => ({
                ...prev,
                [targetLang]: {
                    ...(prev[targetLang] || {}),
                    [text]: translated
                }
            }));
        }

        return finalValue;
    };

    const getTranslatedText = (text, targetLang = lang) => {
        if (!text || typeof text !== 'string') return text;
        const cacheKey = `${targetLang}|${text}`;
        return translationCache[cacheKey] || text;
    };

    const t = (key) => {
        const text = typeof key === 'string' ? key : String(key ?? '');
        if (!text) return text;

        const dictionary = { ...(fallbackTranslations[lang] || {}), ...(customTranslations[lang] || {}) };
        if (dictionary[text]) {
            return dictionary[text];
        }

        const fallbackValue = fallbackTranslations[lang]?.[text] || customTranslations[lang]?.[text];
        if (fallbackValue) {
            return fallbackValue;
        }

        if (text.trim() && detectLanguage(text) !== lang) {
            ensureTranslation(text);
        }

        return text;
    };

    return (
        <LanguageContext.Provider value={{
            lang,
            changeLanguage,
            currency,
            changeCurrency,
            formatPrice,
            t,
            translateText,
            getTranslatedText
        }}>
            {children}
        </LanguageContext.Provider>
    );
};