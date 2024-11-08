import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState(''); // Для роли пользователя

  const navigate = useNavigate();

  // Обработчик изменения ввода
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Ошибка входа');
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Проверка обязательных данных
      if (!data.token || !data.userId || typeof data.isAdmin !== 'boolean') {
        setError('Ошибка: Отсутствует token, userId или isAdmin в ответе');
        setLoading(false);
        return;
      }

      // Проверка прав администратора
      if (!data.isAdmin) {
        setError('У вас нет прав администратора');
        setLoading(false);
        return;
      }

      // Сохраняем данные в localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.userId);
      localStorage.setItem('username', data.username);
      localStorage.setItem('isAdmin', data.isAdmin);

      setIsAdmin(true);
      setRole('admin'); // Устанавливаем роль
      navigate('/Adminpage');
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='admin-page'>
      <div className='login-box'>
        <h1 className='heading'>Вход в Админку</h1>
        {error && <div className="error-message">{error}</div>}
        {isAdmin && <div className="role-message">Роль пользователя: {role}</div>}
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label className='form-label' htmlFor='username'>Имя пользователя</label>
            <input
              type='text'
              id='username'
              name='username'
              className='form-input'
              value={username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className='form-group'>
            <label className='form-label' htmlFor='password'>Пароль</label>
            <input
              type='password'
              id='password'
              name='password'
              className='form-input'
              value={password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className='action-buttons'>
            <button type='submit' className='submit-button' disabled={loading}>
              {loading ? 'Загрузка...' : 'Войти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;
