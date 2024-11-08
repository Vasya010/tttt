import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import styles from './RegisterPage.module.css';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('');
    const [gender, setGender] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate(); // Используем useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !email || !phone || !country || !gender || !password || !confirmPassword) {
            alert('Пожалуйста, заполните все поля!');
            return;
        }

        if (password !== confirmPassword) {
            alert('Пароли не совпадают!');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    phone,
                    country,
                    gender,
                    password,
                }),
            });

            if (response.ok) {
                alert('Регистрация успешна!');
                navigate('/confirm-code'); // Перенаправление на страницу подтверждения
            } else {
                const errorMessage = await response.text();
                alert(errorMessage);
            }
        } catch (error) {
            alert('Произошла ошибка при регистрации. Попробуйте еще раз.');
        }
    };

    return (
        <div className={styles.container1}>
            <h1 className={styles.title}>Регистрация</h1>
            <p className={styles.description}>Заполните форму для создания учетной записи.</p>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Имя пользователя"
                    className={styles.input}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Электронная почта"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="tel"
                    placeholder="Номер телефона"
                    className={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <select
                    className={styles.input}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                >
                    <option value="">Выберите страну</option>
                    <option value="RU">Россия</option>
                    <option value="KG">Кыргызстан</option>
                    <option value="US">США</option>
                    <option value="KZ">Казахстан</option>
                    <option value="UA">Украина</option>
                </select>
                <select
                    className={styles.input}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                >
                    <option value="">Пол</option>
                    <option value="male">Мужчина</option>
                    <option value="female">Женщина</option>
                    <option value="other">Другое</option>
                </select>
                <input
                    type="password"
                    placeholder="Пароль"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Повторите пароль"
                    className={styles.input}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="submit" className={styles.button}>Зарегистрироваться</button>
            </form>
        </div>
    );
}

export default RegisterPage;
