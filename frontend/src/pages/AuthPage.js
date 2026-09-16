import React, { useState, useContext } from 'react';
import { Tabs, Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';

const { Title, Text } = Typography;

const AuthPage = ({ onAuthSuccess }) => {
    const [activeTab, setActiveTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useContext(LanguageContext);

    const handleSubmit = async (values) => {
        setLoading(true);

        try {
            const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || t('authError'));
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data.id,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                isAdmin: data.isAdmin
            }));

            onAuthSuccess && onAuthSuccess({
                id: data.id,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                isAdmin: data.isAdmin
            });

            message.success(activeTab === 'login' ? t('loginSuccess') : t('registerSuccess'));
            navigate(data.isAdmin ? '/admin' : '/');
        } catch (error) {
            message.error(error.message || t('authError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '520px', margin: '60px auto', padding: '0 20px' }}>
            <div style={{
                background: 'linear-gradient(135deg, #f2fffd 0%, #ffffff 100%)',
                border: '1px solid #dff7f4',
                borderRadius: '28px',
                boxShadow: '0 18px 45px rgba(75, 192, 200, 0.12)',
                padding: '30px 30px 22px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at top right, rgba(75,192,200,0.12), transparent 30%)',
                    pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '74px',
                            height: '74px',
                            borderRadius: '50%',
                            background: '#eafdfb',
                            border: '1px solid #9fe7df',
                            color: '#0a2a30',
                            fontWeight: 800,
                            fontSize: '26px',
                            marginBottom: '14px'
                        }}>
                            W
                        </div>
                        <Title level={2} style={{ textAlign: 'center', marginBottom: 10, color: '#00263b' }}>{t('authTitle')}</Title>
                        <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: '15px', marginBottom: 20 }}>
                            {t('authSubtitle')}
                        </Text>
                    </div>

                    <Tabs activeKey={activeTab} onChange={setActiveTab} centered
                        tabBarStyle={{ marginBottom: 16 }}
                        items={[
                            { key: 'login', label: t('loginTab') },
                            { key: 'register', label: t('registerTab') }
                        ]}
                    />

                    <Form layout="vertical" onFinish={handleSubmit}>
                        {activeTab === 'register' && (
                            <>
                                <Form.Item name="firstName" label={t('firstName')} rules={[{ required: true, message: t('enterYourName') }]}>
                                    <Input placeholder="John" />
                                </Form.Item>
                                <Form.Item name="lastName" label={t('lastName')} rules={[{ required: true, message: t('enterYourLastName') }]}>
                                    <Input placeholder="Smith" />
                                </Form.Item>
                                <Form.Item name="phone" label={t('phone')} rules={[{ required: true, message: t('enterYourPhone') }]}>
                                    <Input placeholder="+380..." />
                                </Form.Item>
                            </>
                        )}

                        <Form.Item name="email" label={t('email')} rules={[{ required: true, type: 'email', message: t('enterCorrectEmail') }]}>
                            <Input placeholder="example@mail.com" />
                        </Form.Item>

                        <Form.Item name="password" label={t('password')} rules={[{ required: true, min: 6, message: t('passwordHint') }]}>
                            <Input.Password placeholder={t('passwordPlaceholder')} />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            size="large"
                            style={{
                                height: '46px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #1f2d3d 0%, #4bc0c8 100%)',
                                border: 'none',
                                fontWeight: 700,
                                marginTop: '6px'
                            }}
                        >
                            {activeTab === 'login' ? t('signInButton') : t('signUpButton')}
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
