import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Typography, Spin, message, Breadcrumb } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';

const { Title } = Typography;

const ProductPage = () => {
    const { id } = useParams();
    const { addToCart } = useContext(CartContext);
    const { t, formatPrice, lang, translateText } = useContext(LanguageContext);
    const [product, setProduct] = useState(null);
    const [translatedTitle, setTranslatedTitle] = useState('');
    const [translatedCategory, setTranslatedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Стан для кількості та галереї
    const [quantity, setQuantity] = useState(1);
    const [images, setImages] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0); // Змінили на індекс замість URL

    // Стан для ефекту наближення (Zoom)
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState('50% 50%');

    useEffect(() => {
        fetch(`http://localhost:5000/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                
                let imgArray = [];
                if (data.images && Array.isArray(data.images) && data.images.length > 0) {
                    imgArray = data.images;
                } else if (typeof data.images === 'string') {
                    try { imgArray = JSON.parse(data.images); } catch (e) {}
                }
                if (imgArray.length === 0 && data.imageUrl) imgArray = [data.imageUrl];
                
                setImages(imgArray);
                setActiveIndex(0);
                setLoading(false);
            })
            .catch(() => {
                message.error('Помилка завантаження товару');
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        let isMounted = true;

        const applyTranslations = async () => {
            if (!product) return;

            const nextTitle = await translateText(product.title || '', lang);
            const nextCategory = await translateText(product.category || 'Каталог', lang);

            if (isMounted) {
                setTranslatedTitle(nextTitle || product.title || '');
                setTranslatedCategory(nextCategory || product.category || 'Каталог');
            }
        };

        applyTranslations();
        return () => { isMounted = false; };
    }, [product, lang, translateText]);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
    if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}>{t('productNotFound')}</div>;

    const handleBuy = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        message.success(t('productAddedToCart'));
    };

    // Функція розрахунку координат мишки для Zoom-ефекту
    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos(`${x}% ${y}%`);
    };

    // Перемикання фотографій стрілочками
    const handlePrevImage = () => {
        setActiveIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };
    const handleNextImage = () => {
        setActiveIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0', backgroundColor: '#fff' }}>
            
            <Breadcrumb style={{ fontSize: '12px', marginBottom: '20px', color: '#888' }}>
                <Breadcrumb.Item><Link to="/" style={{ color: '#888' }}>Інтернет магазин Листівок</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to="/" style={{ color: '#888' }}>{translatedCategory || product.category || 'Каталог'}</Link></Breadcrumb.Item>
                <Breadcrumb.Item>{translatedTitle || product.title}</Breadcrumb.Item>
            </Breadcrumb>

            <Title level={2} style={{ textAlign: 'center', fontWeight: '300', color: '#4a4a4a', marginBottom: '40px' }}>
                {translatedCategory || product.category || 'Каталог'}
            </Title>

            <Row gutter={[40, 40]}>
                {/* ЛІВА КОЛОНКА: ГАЛЕРЕЯ */}
                <Col xs={24} md={12}>
                    
                    {/* Головне фото з ефектом ЗУМУ */}
                    <div 
                        style={{ 
                            backgroundColor: '#eef4fa', 
                            display: 'flex', justifyContent: 'center', alignItems: 'center', 
                            height: '550px', marginBottom: '20px', position: 'relative', 
                            overflow: 'hidden', cursor: 'crosshair' 
                        }}
                        onMouseEnter={() => setIsZoomed(true)}
                        onMouseLeave={() => setIsZoomed(false)}
                        onMouseMove={handleMouseMove}
                    >
                        {/* Звичайне фото */}
                        <img 
                            src={images[activeIndex]} 
                            alt={translatedTitle || product.title} 
                            style={{ 
                                maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', 
                                opacity: isZoomed ? 0 : 1, transition: 'opacity 0.2s' 
                            }} 
                        />
                        
                        {/* Наближене фото (з'являється тільки при наведенні) */}
                        {isZoomed && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundImage: `url(${images[activeIndex]})`,
                                backgroundPosition: zoomPos,
                                backgroundSize: '250%', // Сила наближення (можна змінити на 200% або 300%)
                                backgroundRepeat: 'no-repeat',
                                pointerEvents: 'none'
                            }} />
                        )}
                    </div>
                    
                    {/* Мініатюри зі стрілочками (Стиль як на макеті) */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        
                        {/* Ліва кнопка */}
                        <div onClick={handlePrevImage} style={{ 
                            width: '40px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            border: '1px solid #e8e8e8', cursor: 'pointer', color: '#4bc0c8' 
                        }}>
                            <LeftOutlined />
                        </div>
                        
                        {/* Список мініатюр */}
                        <div style={{ display: 'flex', gap: '15px', overflow: 'hidden', flex: 1, justifyContent: 'center' }}>
                            {images.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setActiveIndex(idx)}
                                    style={{ 
                                        width: '80px', height: '80px', flexShrink: 0,
                                        border: activeIndex === idx ? '2px solid #4bc0c8' : '1px solid #e8e8e8', 
                                        cursor: 'pointer', backgroundColor: '#eef4fa',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <img src={img} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>

                        {/* Права кнопка */}
                        <div onClick={handleNextImage} style={{ 
                            width: '40px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            border: '1px solid #e8e8e8', cursor: 'pointer', color: '#4bc0c8' 
                        }}>
                            <RightOutlined />
                        </div>
                    </div>

                    {/* Навігація між товарами */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #eee', padding: '15px 20px', marginTop: '30px', fontSize: '12px', fontWeight: 'bold' }}>
                        <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><LeftOutlined style={{ color: '#4bc0c8' }} /> ПОПЕРЕДНІЙ ТОВАР</span>
                        <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>НАСТУПНИЙ ТОВАР <RightOutlined style={{ color: '#4bc0c8' }} /></span>
                    </div>
                </Col>

                {/* ПРАВА КОЛОНКА: ІНФОРМАЦІЯ */}
                <Col xs={24} md={12} style={{ paddingLeft: '20px' }}>
                    <div style={{ fontSize: '24px', color: '#4bc0c8', marginBottom: '15px' }}>{translatedTitle || product.title}</div>
                    <div style={{ fontSize: '18px', color: '#000', marginBottom: '15px' }}>{t('price')} <b>{formatPrice(product.price)}</b></div>
                    <div style={{ fontSize: '13px', color: '#999', marginBottom: '30px' }}>{t('code')} {product.code || `PRS-0${product.id}`}</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e8e8e8', width: '120px', height: '40px' }}>
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ flex: 1, height: '100%', border: 'none', background: '#fff', cursor: 'pointer', color: '#888' }}>—</button>
                            <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid #e8e8e8', borderRight: '1px solid #e8e8e8', lineHeight: '40px' }}>{quantity}</div>
                            <button onClick={() => setQuantity(q => q + 1)} style={{ flex: 1, height: '100%', border: 'none', background: '#fff', cursor: 'pointer', color: '#888' }}>+</button>
                        </div>
                        
                        <div style={{ border: '1px solid #e8e8e8', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                            <HeartOutlined style={{ fontSize: '18px', color: '#000' }} />
                        </div>
                        
                        <button 
                            onClick={handleBuy}
                            style={{ 
                                backgroundColor: '#1a1a1a', color: '#fff', border: 'none', height: '40px', padding: '0 30px', 
                                fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textTransform: 'uppercase'
                            }}
                        >
                            <ShoppingCartOutlined style={{ fontSize: '18px' }} /> {t('buy')}
                        </button>
                    </div>

                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '20px' }}>{t('additionalInfo')}</div>
                    
                    <div style={{ fontSize: '13px', lineHeight: '2' }}>
                        <Row style={{ marginBottom: '10px' }}><Col span={8} style={{ fontWeight: 'bold' }}>{t('manufacturer')}</Col><Col span={16} style={{ color: '#555' }}>Wallish</Col></Row>
                        <Row style={{ marginBottom: '10px' }}><Col span={8} style={{ fontWeight: 'bold' }}>{t('category')}</Col><Col span={16} style={{ color: '#555' }}>{translatedCategory || product.category || '-'}</Col></Row>
                        <Row style={{ marginBottom: '10px' }}>
                            <Col span={8} style={{ fontWeight: 'bold' }}>{t('size')}</Col>
                            <Col span={16} style={{ color: '#555' }}>
                                S: 210x155x40 мм - 4 шт;<br/>
                                M: 330x220x50 мм - 2 шт;<br/>
                                L: 460x350x60 мм - 1 шт.
                            </Col>
                        </Row>
                        <Row style={{ marginBottom: '10px' }}><Col span={8} style={{ fontWeight: 'bold' }}>{t('characteristics')}</Col><Col span={16} style={{ color: '#555' }}>{product.description || 'Тришаровий гофрокартон білого кольору'}</Col></Row>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ProductPage;