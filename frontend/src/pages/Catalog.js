import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Typography, Spin, message, Button } from 'antd';
import { HeartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';

const { Title, Paragraph } = Typography;


// --- НОВИЙ КОМПОНЕНТ КАРТКИ ТОВАРУ ---
const ProductCard = ({ product, addToCart, navigate, title }) => {
    const [quantity, setQuantity] = useState(1);
    const { lang, t, formatPrice } = useContext(LanguageContext);
    const displayTitle = title || product.title;
    
    // Перевіряємо, чи є масив фотографій (для сумісності зі старими товарами)
    let mainImage = product.imageUrl;
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        mainImage = product.images[0];
    } else if (typeof product.images === 'string') {
        try {
            const parsed = JSON.parse(product.images);
            if (parsed.length > 0) mainImage = parsed[0];
        } catch (e) {}
    }

    // Функція для додавання вибраної кількості товарів у кошик
    const handleBuy = (e) => {
        e.stopPropagation(); // Щоб клік не перекидав на сторінку товару
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        setQuantity(1); // Скидаємо лічильник після додавання
    };

    return (
        <div style={{ 
            border: '1px solid #e8e8e8', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', height: '100%', 
            transition: 'box-shadow 0.3s', cursor: 'pointer' 
        }} 
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
        >
            {/* Верхня частина з фото */}
            <div style={{ position: 'relative', height: '280px', overflow: 'hidden', backgroundColor: '#f9f9f9' }} onClick={() => navigate(`/product/${product.id}`)}>
                <HeartOutlined style={{ position: 'absolute', top: 15, left: 15, color: '#ffb3c6', fontSize: '22px', zIndex: 2 }} />
                <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#4bc0c8', color: '#fff', padding: '6px 16px', fontSize: '12px', fontWeight: 'bold', zIndex: 2 }}>
                    NEW
                </div>
                <img src={mainImage} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Інформація про товар */}
            <div style={{ padding: '15px 20px', flex: 1, display: 'flex', flexDirection: 'column' }} onClick={() => navigate(`/product/${product.id}`)}>
                <div style={{ color: '#4bc0c8', fontSize: '16px', marginBottom: '8px' }}>{displayTitle}</div>
                <div style={{ fontSize: '15px', color: '#000' }}>{t('price')} <b>{formatPrice(product.price)}</b></div>
                <div style={{ color: '#999', fontSize: '12px', textAlign: 'right', marginTop: 'auto' }}>
                    {t('code')} {product.code || `PRS-0${product.id}`}
                </div>
            </div>

            {/* Рядок з кнопками (Кількість + Купити) */}
            <div style={{ display: 'flex', borderTop: '1px solid #e8e8e8', height: '50px' }}>
                <div style={{ display: 'flex', width: '50%', borderRight: '1px solid #e8e8e8' }}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }} 
                        style={{ flex: 1, border: 'none', background: '#fff', cursor: 'pointer', fontSize: '18px', color: '#888' }}
                    >—</button>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', color: '#000' }}>
                        {quantity}
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setQuantity(q => q + 1); }} 
                        style={{ flex: 1, border: 'none', background: '#fff', cursor: 'pointer', fontSize: '18px', color: '#888' }}
                    >+</button>
                </div>
                <button 
                    onClick={handleBuy} 
                    style={{ width: '50%', border: 'none', background: '#fff', color: '#000', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.color = '#4bc0c8'}
                    onMouseOut={e => e.currentTarget.style.color = '#000'}
                >
                    {t('addToCart')}
                </button>
            </div>
        </div>
    );
};

// --- ГОЛОВНИЙ КОМПОНЕНТ КАТАЛОГУ ---
const Catalog = () => {
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { t, lang, translateText } = useContext(LanguageContext);
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [translatedCategories, setTranslatedCategories] = useState({});
    const [translatedProducts, setTranslatedProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:5000/api/products').then(res => res.json()),
            fetch('http://localhost:5000/api/categories').then(res => res.json())
        ])
        .then(([productsData, categoriesData]) => {
            // ЗАХИСТ: Перевіряємо, чи це дійсно масиви
            setProducts(Array.isArray(productsData) ? productsData : []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            message.error('Помилка завантаження каталогу');
            setProducts([]);
            setCategories([]);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        let isMounted = true;

        const translateCategories = async () => {
            const result = {};
            for (const category of categories) {
                if (!category || !category.name) continue;
                const translated = await translateText(category.name, lang);
                if (isMounted) result[category.id] = translated || category.name;
            }
            if (isMounted) setTranslatedCategories(result);
        };

        if (categories.length) {
            translateCategories();
        } else {
            setTranslatedCategories({});
        }

        return () => { isMounted = false; };
    }, [categories, lang, translateText]);

    useEffect(() => {
        let isMounted = true;

        const translateProducts = async () => {
            const result = {};
            for (const product of products) {
                if (!product || !product.title) continue;
                const translated = await translateText(product.title, lang);
                if (isMounted) result[product.id] = translated || product.title;
            }
            if (isMounted) setTranslatedProducts(result);
        };

        if (products.length) {
            translateProducts();
        } else {
            setTranslatedProducts({});
        }

        return () => { isMounted = false; };
    }, [products, lang, translateText]);

    // ЗАХИСТ: Переконуємося, що products - це масив перед тим, як фільтрувати
    const filteredProducts = (Array.isArray(products) && selectedCategory)
        ? products.filter(item => item.category && item.category.toLowerCase() === selectedCategory.toLowerCase())
        : [];

    const selectedCategoryLabel = categories.find(cat => cat.name === selectedCategory)?.name || selectedCategory;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {!selectedCategory ? (
                <>
                    {/* СІТКА КАТЕГОРІЙ */}
                    <Title level={2} style={{ textAlign: 'center', marginBottom: '40px', color: '#1a365d', fontWeight: '300', textTransform: 'uppercase' }}>
                        {t('productCategory')}
                    </Title>
                    <Row gutter={[24, 24]}>
                        {categories.map((cat) => {
                            const itemCount = Array.isArray(products) ? products.filter(p => p.category && p.category.toLowerCase() === cat.name.toLowerCase()).length : 0;
                            const categoryLabel = translatedCategories[cat.id] || cat.name;
                            return (
                                <Col xs={24} sm={12} md={8} lg={6} key={cat.id}>
                                    <div 
                                        onClick={() => setSelectedCategory(cat.name)}
                                        style={{
                                            position: 'relative',
                                            aspectRatio: '1/1',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            backgroundColor: '#f0f2f5',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                        }}
                                        onMouseOver={e => e.currentTarget.children[0].style.transform = 'scale(1.05)'}
                                        onMouseOut={e => e.currentTarget.children[0].style.transform = 'scale(1)'}
                                    >
                                        <img 
                                            src={cat.imageUrl} 
                                            alt={categoryLabel} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
                                        />
                                        
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            width: '100%',
                                            backgroundColor: 'rgba(235, 238, 240, 0.9)',
                                            padding: '16px 10px',
                                            textAlign: 'center'
                                        }}>
                                            <span style={{ color: '#00263b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>
                                                {categoryLabel} ({itemCount})
                                            </span>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </>
            ) : (
                <>
                    {/* ВІДОБРАЖЕННЯ ТОВАРІВ ОБРАНОЇ КАТЕГОРІЇ */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedCategory(null)} style={{ marginRight: '20px' }}>
                            {t('allCategories')}
                        </Button>
                        <Title level={3} style={{ margin: 0, color: '#2c3e50' }}>{translatedCategories[categories.find(cat => cat.name === selectedCategory)?.id] || selectedCategoryLabel}</Title>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Typography.Text type="secondary" style={{ fontSize: '16px' }}>{t('noProductsInCategory')}</Typography.Text>
                        </div>
                    ) : (
                        <Row gutter={[24, 32]}>
                            {filteredProducts.map((product) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                                    {/* Виклик нашої нової картки */}
                                    <ProductCard product={product} addToCart={addToCart} navigate={navigate} title={translatedProducts[product.id] || product.title} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}
        </div>
    );
};

export default Catalog;