import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './User.css';

function UserPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/'); // Если токен есть, перенаправляем на главную
    }
  }, [navigate]);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || 'Ошибка входа'); // Выводим сообщение об ошибке
        return;
      }

      const data = await response.json();

      if (!data.token || !data.userId) {
        alert('Отсутствует токен или userId в ответе');
        return;
      }

      localStorage.setItem('token', data.token); 
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('email', email);
      navigate('/');
    } catch (error) {
      alert('Произошла ошибка. Попробуйте еще раз.');
    }
  };

  return (
    <div className="background-container1">
      <div className="form-container">
        <h1 className='claski1'>Вход</h1>
        <div className="card1">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label5" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="input-field"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="label5" htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                className="input-field"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="button-group">
              <button type="submit" className="button">Войти</button>
            </div>
          </form>
          <div className="register-link">
            <p>Нет аккаунта? <Link to="/register">Регистрация</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserPage;
