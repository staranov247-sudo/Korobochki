import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Badge, Space, Dropdown, message, Typography } from 'antd';
import { 
    MenuOutlined, DownOutlined, FacebookOutlined, InstagramOutlined, 
    UserOutlined, HeartOutlined, ShoppingCartOutlined, SearchOutlined, RightOutlined 
} from '@ant-design/icons';
import Catalog from './pages/Catalog';
import ProductPage from './pages/ProductPage';
import AdminPanel from './pages/AdminPanel';
import AuthPage from './pages/AuthPage';
import { CartProvider, CartContext } from './context/CartContext';
import { LanguageProvider, LanguageContext } from './context/LanguageContext';
import CartDrawer from './components/CartDrawer';

const { Content, Footer } = Layout;
const { Title } = Typography;

const hoverStyles = `
  .logo-hover { border: 1px solid #e8e8e8; transition: all 0.4s ease !important; }
  .logo-hover:hover { border-color: #4bc0c8 !important; }
  .logo-hover .logo-text { color: #000; transition: all 0.4s ease; }
  .logo-hover:hover .logo-text { color: #4bc0c8 !important; }
  .nav-link { color: #00263b; text-decoration: none; font-weight: 700; position: relative; padding-bottom: 5px; transition: color 0.3s ease; cursor: pointer; }
  .nav-link:hover { color: #4bc0c8 !important; }
  .nav-link::after { content: ''; position: absolute; width: 100%; height: 2px; bottom: 0; left: 0; background-color: #4bc0c8; transform: scaleX(0); transition: transform 0.3s ease; }
  .nav-link:hover::after { transform: scaleX(1); }
`;

// --- ШАПКА ---
const TopHeader = ({ openCart }) => {
    const { totalItems } = useContext(CartContext);
    const { t, lang, changeLanguage, currency, changeCurrency } = useContext(LanguageContext); // Витягуємо перекладач
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);

        Promise.all([
            fetch('http://localhost:5000/api/categories').then(res => res.json()),
            fetch('http://localhost:5000/api/products').then(res => res.json())
        ])
        .then(([catsData, prodsData]) => {
            setCategories(Array.isArray(catsData) ? catsData : []);
            setProducts(Array.isArray(prodsData) ? prodsData : []);
        })
        .catch(() => { setCategories([]); setProducts([]); });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const langMenu = [
        { key: 'uk', label: 'UK (Українська)' }, 
        { key: 'en', label: 'EN (English)' }
    ];
    const currMenu = [{ key: 'uah', label: 'UAH' }, { key: 'usd', label: 'USD' }, { key: 'eur', label: 'EUR' }];

    const catalogMenuOverlay = (
        <div style={{ background: '#fff', border: '1px solid #4bc0c8', width: '420px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', marginTop: '1px', maxHeight: '500px', overflowY: 'auto' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#000', fontWeight: '500', fontSize: '15px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#4bc0c8'} onMouseOut={e => e.currentTarget.style.color = '#000'}>
                    <span>{t('newProducts')} ({Array.isArray(products) ? products.length : 0})</span>
                </div>
            </Link>
            {Array.isArray(categories) && categories.map((cat) => {
                const count = Array.isArray(products) ? products.filter(p => p.category && p.category.toLowerCase() === cat.name.toLowerCase()).length : 0;
                return (
                    <Link to="/" key={cat.id} style={{ textDecoration: 'none' }}>
                        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#000', fontWeight: '500', fontSize: '15px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#4bc0c8'} onMouseOut={e => e.currentTarget.style.color = '#000'}>
                            <span>{cat.name} ({count})</span>
                            <DownOutlined style={{ color: '#4bc0c8', fontSize: '12px' }} />
                        </div>
                    </Link>
                );
            })}
        </div>
    );

    return (
        <div style={{ background: '#fff', position: 'sticky', top: 0, zIndex: 100, boxShadow: isScrolled ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.4s ease' }}>
            <style>{hoverStyles}</style>
            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', maxHeight: isScrolled ? '0px' : '100px', opacity: isScrolled ? 0 : 1, overflow: 'hidden', paddingTop: isScrolled ? '0px' : '15px', paddingBottom: isScrolled ? '0px' : '15px', transition: 'all 0.4s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: 1 }}>
                        <div onClick={() => {}} style={{ cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: '#00263b' }}>
                            <MenuOutlined style={{ fontSize: '20px' }} /> {t('menu')}
                        </div>
                        
                        {/* ПЕРЕМИКАЧ МОВИ ПРАЦЮЄ */}
                        <Dropdown menu={{ items: langMenu, onClick: (e) => changeLanguage(e.key) }} trigger={['click']}>
                            <div style={{ cursor: 'pointer', fontWeight: '800', color: '#00263b', textTransform: 'uppercase' }}>
                                {lang} <DownOutlined style={{ fontSize: '10px', color: '#4bc0c8', fontWeight: 'bold' }} />
                            </div>
                        </Dropdown>
                        
                        <div style={{ fontSize: '13px', fontWeight: '800', lineHeight: '1.4', color: '#00263b' }}>
                            <div>+38 068 494 17 49</div>
                            <div>INFO@WALLISHCOMPANY.COM</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: 1, justifyContent: 'flex-end' }}>
                        <Space size="large" style={{ color: '#000' }}>
                            <FacebookOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
                            <InstagramOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
                            <span style={{ fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', fontFamily: 'serif', fontStyle: 'italic' }}>p</span>
                        </Space>
                        <Dropdown menu={{ items: currMenu, onClick: (e) => changeCurrency(e.key) }} trigger={['click']}>
                            <div style={{ cursor: 'pointer', fontWeight: '800', color: '#00263b' }}>{currency.toUpperCase()} <DownOutlined style={{ fontSize: '10px', color: '#4bc0c8', fontWeight: 'bold' }} /></div>
                        </Dropdown>
                        <Space size="large" style={{ color: '#000' }}>
                            <UserOutlined onClick={() => navigate('/admin')} style={{ fontSize: '22px', cursor: 'pointer' }} />
                            <HeartOutlined style={{ fontSize: '22px', cursor: 'pointer' }} />
                            <Badge count={totalItems} showZero size="small" color="#4bc0c8">
                                <ShoppingCartOutlined style={{ fontSize: '24px', cursor: 'pointer' }} onClick={openCart} />
                            </Badge>
                        </Space>
                    </div>
                </div>

                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: isScrolled ? '5px' : '10px', zIndex: 20, transition: 'all 0.4s ease' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <div className="logo-hover" style={{ width: isScrolled ? '60px' : '140px', height: isScrolled ? '60px' : '140px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="logo-text" style={{ fontFamily: 'cursive', fontSize: isScrolled ? '16px' : '32px' }}>Wallish</span>
                        </div>
                    </Link>
                </div>

                <div style={{ borderTop: isScrolled ? 'none' : '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px', padding: '0 20px', transition: 'all 0.4s ease' }}>
                    <div style={{ display: 'flex', gap: '40px', flex: 1, alignItems: 'center' }}>
                        <Dropdown dropdownRender={() => catalogMenuOverlay} trigger={['hover']} placement="bottomLeft">
                            <div style={{ background: '#eafffa', border: '1px solid #4bc0c8', color: '#00263b', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px', width: '200px', height: '40px', cursor: 'pointer' }}>
                                <span>{t('catalog')}</span>
                                <RightOutlined style={{ color: '#4bc0c8', fontSize: '12px' }} />
                            </div>
                        </Dropdown>
                        <Link to="/" className="nav-link">{t('cooperation')}</Link>
                    </div>
                    <div style={{ display: 'flex', gap: '40px', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Link to="/" className="nav-link">{t('discounts')}</Link>
                        <Link to="/" className="nav-link">{t('contacts')}</Link>
                        <SearchOutlined style={{ fontSize: '20px', color: '#4bc0c8', cursor: 'pointer' }} />
                    </div>
                </div>
            </div> 
        </div>
    );
};

// --- ФУТЕР ---
const SiteFooter = () => {
    const { t } = useContext(LanguageContext); // Витягуємо перекладач

    return (
        <Footer style={{ padding: 0, background: '#fff' }}>
            <div style={{ textAlign: 'center', padding: '60px 20px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: '#00263b' }}>
                    {t('subscribeTitle')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    <input type="text" placeholder={t('subscribePlaceholder')} style={{ flex: 1, padding: '12px 20px', border: '1px solid #e8e8e8', outline: 'none', borderRight: 'none' }} />
                    <button style={{ backgroundColor: '#1a1a1a', color: '#fff', border: 'none', padding: '0 30px', fontWeight: 'bold', cursor: 'pointer' }}>{t('subscribeBtn')}</button>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <div style={{ color: '#4bc0c8', fontWeight: 'bold', marginBottom: '20px' }}>{t('menu')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', fontWeight: '500' }}>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('about')}</Link>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('cooperation')}</Link>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('discounts')}</Link>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('siteMap')}</Link>
                    </div>
                </div>
                <div style={{ flex: 1, minWidth: '150px', marginTop: '42px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', fontWeight: '500' }}>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('payment')}</Link>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('newsroom')}</Link>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('contacts')}</Link>
                    </div>
                </div>
                <div style={{ flex: 1, minWidth: '150px', borderLeft: '1px solid #f0f0f0', paddingLeft: '30px' }}>
                    <div style={{ color: '#4bc0c8', fontWeight: 'bold', marginBottom: '20px' }}>{t('catalog')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', fontWeight: '500' }}>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('handmadeCards')}</Link>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('handmadeEnvelopes')}</Link>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('miniCards')}</Link>
                    </div>
                </div>
                <div style={{ flex: 1, minWidth: '150px', marginTop: '42px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', fontWeight: '500' }}>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('miniEnvelopes')}</Link>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('paper')}</Link>
                        <Link to="/" style={{ color: '#00263b', textDecoration: 'none' }}>{t('stickers')}</Link>
                    </div>
                </div>
                <div style={{ flex: 1, minWidth: '250px', fontSize: '13px', fontWeight: 'bold', lineHeight: '1.6', color: '#00263b' }}>
                    <div>+38 068 494 17 49</div>
                    <div style={{ marginBottom: '15px' }}>+38 063 691 77 74</div>
                    <div style={{ marginBottom: '15px' }}>INFO@WALLISHCOMPANY.COM</div>
                    <div style={{ marginBottom: '20px' }}>03061, УКРАЇНА, М.КИЇВ,<br/>ПРОСПЕКТ ВІДРАДНИЙ 95-П, ОФ. 2, 2 ПОВЕРХ</div>
                </div>
            </div>
        </Footer>
    );
};

// --- ГОЛОВНИЙ КОМПОНЕНТ ---
const App = () => {
    const [cartVisible, setCartVisible] = useState(false);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const requireAuth = (element) => {
        if (!user) {
            return <AuthPage onAuthSuccess={setUser} />;
        }
        return element;
    };

    return (
        <LanguageProvider>
            <CartProvider>
                <BrowserRouter>
                    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                        <TopHeader openCart={() => setCartVisible(true)} />

                        <Content style={{ padding: '60px 20px 40px', background: '#fafafa', flex: 1 }}>
                            <Routes>
                                <Route path="/" element={<Catalog />} />
                                <Route path="/product/:id" element={<ProductPage />} />
                                <Route path="/login" element={<AuthPage onAuthSuccess={setUser} />} />
                                <Route path="/admin" element={user?.isAdmin ? <AdminPanel /> : <AuthPage onAuthSuccess={setUser} />} />
                            </Routes>
                        </Content>

                        <SiteFooter />
                        <CartDrawer visible={cartVisible} onClose={() => setCartVisible(false)} />
                    </div>
                </BrowserRouter>
            </CartProvider>
        </LanguageProvider>
    );
};

export default App;