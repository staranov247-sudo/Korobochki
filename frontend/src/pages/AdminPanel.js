import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Popconfirm, message, Typography, Upload, Tabs, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AdminPanel = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isProductModalVisible, setIsProductModalVisible] = useState(false);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [categoryForm] = Form.useForm();

    const getCategoryLabel = (category, parentMap = {}) => {
        if (!category) return 'Без батьківської';
        if (!category.parentId) return category.name;
        const parent = parentMap[category.parentId];
        return parent ? `${parent.name} / ${category.name}` : category.name;
    };

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            fetch('http://localhost:5000/api/products', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
            }).then(res => res.json()),
            fetch('http://localhost:5000/api/categories', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
            }).then(res => res.json()),
            fetch('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
            }).then(res => res.json())
        ]).then(([productsData, categoriesData, usersData]) => {
            setProducts(Array.isArray(productsData) ? productsData : []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            setUsers(Array.isArray(usersData) ? usersData : []);
            setLoading(false);
        }).catch(() => {
            message.error('Помилка завантаження даних');
            setProducts([]);
            setCategories([]);
            setUsers([]);
            setLoading(false);
        });
    };

    useEffect(() => { fetchData(); }, []);

    // Спеціальна функція для правильного збору файлів з компонента Upload
    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    // --- ЛОГІКА ДЛЯ ТОВАРІВ ---
    const handleSaveProduct = () => {
        form.validateFields().then(values => {
            const formData = new FormData();
            formData.append('title', values.title);
            if (values.title_en) formData.append('title_en', values.title_en);
            if (values.description_en) formData.append('description_en', values.description_en);
            formData.append('category', values.category);
            formData.append('price', values.price);
            
            if (values.description) formData.append('description', values.description);
            if (values.code) formData.append('code', values.code);

            // Правильно пакуємо всі фотографії для відправки
            if (values.images && values.images.length > 0) {
                values.images.forEach(file => {
                    if (file.originFileObj) {
                        formData.append('images', file.originFileObj);
                    }
                });
            }

            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem ? `http://localhost:5000/api/products/${editingItem.id}` : 'http://localhost:5000/api/products';

            fetch(url, { method, body: formData })
                .then(res => {
                    if (!res.ok) throw new Error('Помилка сервера');
                    return res.json();
                })
                .then(() => {
                    message.success('Товар успішно збережено!');
                    setIsProductModalVisible(false);
                    fetchData();
                })
                .catch(() => message.error('Не вдалося зберегти товар'));
        });
    };

    const deleteProduct = (id) => {
        fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' }).then(() => fetchData());
    };

    // --- ЛОГІКА ДЛЯ КАТЕГОРІЙ ---
    const handleSaveCategory = () => {
        categoryForm.validateFields().then(values => {
            const formData = new FormData();
            formData.append('name', values.name);
            if (values.parentId) formData.append('parentId', String(values.parentId));

            if (values.image && values.image.length > 0 && values.image[0].originFileObj) {
                formData.append('image', values.image[0].originFileObj);
            }

            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem ? `http://localhost:5000/api/categories/${editingItem.id}` : 'http://localhost:5000/api/categories';

            fetch(url, { method, body: formData })
                .then(res => {
                     if (!res.ok) throw new Error('Помилка сервера');
                     return res.json();
                })
                .then(() => {
                    message.success('Категорію збережено');
                    setIsCategoryModalVisible(false);
                    fetchData();
                })
                .catch(() => message.error('Не вдалося зберегти категорію'));
        });
    };

    const deleteCategory = (id) => {
        fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' }).then(() => fetchData());
    };

    const productColumns = [
        { title: 'Фото', dataIndex: 'imageUrl', render: (url) => <img src={url} alt="img" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} /> },
        { title: 'Назва', dataIndex: 'title' },
        { title: 'Категорія', dataIndex: 'category' },
        { title: 'Артикул', dataIndex: 'code' },
        { title: 'Ціна (₴)', dataIndex: 'price' },
        {
            title: 'Дії', render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => { setEditingItem(record); form.setFieldsValue(record); setIsProductModalVisible(true); }} />
                    <Popconfirm title="Видалити?" onConfirm={() => deleteProduct(record.id)}><Button danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            )
        }
    ];

    const parentMap = categories.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {});

    const categoryColumns = [
        { title: 'Фото', dataIndex: 'imageUrl', render: (url) => <img src={url} alt="img" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} /> },
        { title: 'Назва', dataIndex: 'name', render: (_, record) => getCategoryLabel(record, parentMap) },
        { title: 'Батьківська', dataIndex: 'parentId', render: (value) => value ? (parentMap[value]?.name || '—') : 'Головна категорія' },
        {
            title: 'Дії', render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => { setEditingItem(record); categoryForm.setFieldsValue({ ...record, parentId: record.parentId || undefined }); setIsCategoryModalVisible(true); }} />
                    <Popconfirm title="Видалити?" onConfirm={() => deleteCategory(record.id)}><Button danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            )
        }
    ];

    const toggleAdminAccess = async (userId, isAdmin) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}/admin`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({ isAdmin })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не вдалося змінити роль');
            }

            message.success(isAdmin ? 'Доступ до адмінки надано' : 'Доступ до адмінки знято');
            fetchData();
        } catch (error) {
            message.error(error.message || 'Помилка');
        }
    };

    const userColumns = [
        { title: 'Ім’я', render: (_, record) => `${record.firstName} ${record.lastName}` },
        { title: 'Пошта', dataIndex: 'email' },
        { title: 'Телефон', dataIndex: 'phone' },
        {
            title: 'Адмін', dataIndex: 'isAdmin', render: (value) => value ? 'Так' : 'Ні'
        },
        {
            title: 'Дії', render: (_, record) => (
                <Button
                    type={record.isAdmin ? 'default' : 'primary'}
                    danger={record.isAdmin}
                    onClick={() => toggleAdminAccess(record.id, !record.isAdmin)}
                >
                    {record.isAdmin ? 'Зняти доступ' : 'Надати доступ'}
                </Button>
            )
        }
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <Title level={2}>Адмін-панель</Title>
            
            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="📦 Товари" key="1">
                    <Button type="primary" style={{ marginBottom: '15px' }} onClick={() => { setEditingItem(null); form.resetFields(); setIsProductModalVisible(true); }}>Додати товар</Button>
                    <Table columns={productColumns} dataSource={products} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />
                </Tabs.TabPane>

                <Tabs.TabPane tab="📁 Категорії" key="2">
                    <Button type="primary" style={{ marginBottom: '15px' }} onClick={() => { setEditingItem(null); categoryForm.resetFields(); setIsCategoryModalVisible(true); }}>Додати категорію</Button>
                    <Table columns={categoryColumns} dataSource={categories} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />
                </Tabs.TabPane>

                <Tabs.TabPane tab="👤 Користувачі" key="3">
                    <Table columns={userColumns} dataSource={users} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />
                </Tabs.TabPane>
            </Tabs>

            <Modal title={editingItem ? 'Редагувати товар' : 'Додати товар'} open={isProductModalVisible} onOk={handleSaveProduct} onCancel={() => setIsProductModalVisible(false)}>
                <Form form={form} layout="vertical">
                <Form.Item name="title" label="Назва (UK)" rules={[{ required: true, message: 'Введіть назву' }]}><Input /></Form.Item>
                    {/* НОВЕ ПОЛЕ */}
                    <Form.Item name="title_en" label="Назва (EN)"><Input placeholder="Наприклад: Postcard with hearts" /></Form.Item>
                    
                    <Form.Item name="category" label="Категорія" rules={[{ required: true, message: 'Оберіть категорію' }]}>
                        <Select placeholder="Оберіть категорію">
                            {categories.map(cat => <Select.Option key={cat.id} value={cat.name}>{cat.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                    
                    <Form.Item name="code" label="Артикул (необов'язково)"><Input placeholder="Згенерується автоматично" /></Form.Item>
                    <Form.Item name="price" label="Ціна (₴)" rules={[{ required: true, message: 'Введіть ціну' }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                    
                    <Form.Item name="description" label="Опис (UK)"><Input.TextArea rows={3} /></Form.Item>
                    {/* НОВЕ ПОЛЕ */}
                    <Form.Item name="description_en" label="Опис (EN)"><Input.TextArea rows={3} placeholder="Description in English..." /></Form.Item>
                    <Form.Item name="title" label="Назва" rules={[{ required: true, message: 'Введіть назву' }]}><Input /></Form.Item>
                    <Form.Item name="category" label="Категорія" rules={[{ required: true, message: 'Оберіть категорію' }]}>
                        <Select placeholder="Оберіть категорію">
                            {categories.map(cat => <Select.Option key={cat.id} value={cat.name}>{cat.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="code" label="Артикул (Code)"><Input placeholder="Наприклад: PRS-046" /></Form.Item>
                    <Form.Item name="price" label="Ціна (₴)" rules={[{ required: true, message: 'Введіть ціну' }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="description" label="Опис"><Input.TextArea rows={3} /></Form.Item>
                    
                    {/* ВАЖЛИВО: додано valuePropName та getValueFromEvent */}
                    <Form.Item name="images" label="Фотографії (до 5 шт)" valuePropName="fileList" getValueFromEvent={normFile}>
                        <Upload beforeUpload={() => false} multiple maxCount={5} listType="picture">
                            <Button icon={<UploadOutlined />}>Обрати файли</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title={editingItem ? 'Редагувати категорію' : 'Додати категорію'} open={isCategoryModalVisible} onOk={handleSaveCategory} onCancel={() => setIsCategoryModalVisible(false)}>
                <Form form={categoryForm} layout="vertical">
                    <Form.Item name="name" label="Назва категорії" rules={[{ required: true, message: 'Введіть назву' }]}><Input /></Form.Item>
                    <Form.Item name="parentId" label="Батьківська категорія">
                        <Select allowClear placeholder="Головна категорія">
                            {categories.map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>{getCategoryLabel(cat, parentMap)}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="image" label="Фото обкладинки" valuePropName="fileList" getValueFromEvent={normFile}>
                        <Upload beforeUpload={() => false} maxCount={1} listType="picture">
                            <Button icon={<UploadOutlined />}>Обрати файл</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminPanel;