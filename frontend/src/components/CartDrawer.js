import React, { useContext } from 'react';
import { Drawer, Button, List, Typography, Divider } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';

const { Text, Title } = Typography;

const CartDrawer = ({ visible, onClose }) => {
    const { cartItems, removeFromCart, updateQuantity, totalPrice } = useContext(CartContext);
    const { t, formatPrice } = useContext(LanguageContext);

    return (
        <Drawer
            title={t('yourCart')}
            placement="right"
            onClose={onClose}
            open={visible}
            width={400}
        >
            {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Text type="secondary" style={{ fontSize: '16px' }}>{t('emptyCart')}</Text>
                </div>
            ) : (
                <>
                    <List
                        itemLayout="horizontal"
                        dataSource={cartItems}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item.id)} />
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<img src={item.imageUrl} alt={item.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />}
                                    title={<Text strong>{item.title}</Text>}
                                    description={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                                            <Button size="small" icon={<MinusOutlined />} onClick={() => updateQuantity(item.id, -1)} />
                                            <Text>{item.quantity}</Text>
                                            <Button size="small" icon={<PlusOutlined />} onClick={() => updateQuantity(item.id, 1)} />
                                            <Text strong style={{ marginLeft: '10px', color: '#1890ff' }}>{formatPrice(item.price * item.quantity)}</Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                    <Divider />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <Title level={4} style={{ margin: 0 }}>{t('total')}</Title>
                        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>{formatPrice(totalPrice)}</Title>
                    </div>
                    <Button type="primary" size="large" block style={{ height: '50px', fontSize: '16px' }}>
                        {t('checkout')}
                    </Button>
                </>
            )}
        </Drawer>
    );
};

export default CartDrawer;