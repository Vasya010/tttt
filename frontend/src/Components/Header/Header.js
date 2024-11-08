// Header.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaUser, FaDownload } from 'react-icons/fa';
import './Header.css';

const DownloadLauncherButton = () => {
  const navigate = useNavigate();

  const handleDownloadClick = useCallback(() => {
    navigate('/launcher');
  }, [navigate]);

  return (
    <Button variant="warning" className="ms-2" onClick={handleDownloadClick}>
      <FaDownload className="me-1" />
      Скачать лаунчер
    </Button>
  );
};

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Dropdown align="end" className="ms-2">
      <Dropdown.Toggle variant="secondary" id="dropdown-language">
        🌐 {i18n.language.toUpperCase()}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => changeLanguage('en')}>EN</Dropdown.Item>
        <Dropdown.Item onClick={() => changeLanguage('ru')}>RU</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
  
    if (token) {
      fetch('http://localhost:5000/api/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Токен недействителен или истек');
          } else if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data && data.username) {
            setUsername(data.username);
            setIsAuthenticated(true);
          } else {
            throw new Error('Пользователь не найден');
          }
        })
        .catch(error => {
          console.error('Ошибка при получении данных пользователя:', error.message);
          localStorage.removeItem('token');
          navigate('/user'); // Перенаправление на страницу входа
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);  // Завершение загрузки, если токен отсутствует
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUsername('');
    navigate('/user');
  }, [navigate]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Navbar bg="dark" expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand href="/" className="custom-logo">
          {t('welcome')}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
          <Nav.Link as={Link} to="/news">{t('news')}</Nav.Link>
            <Nav.Link href="/TrailerGame">{t('videos')}</Nav.Link>
            <Nav.Link href="/support">{t('support')}</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <Nav.Link href="#user-profile">
                  <FaUser className="me-1" />
                  {username}
                </Nav.Link>
                <Nav.Link href="#premium">{t('premium')}</Nav.Link>
                <Nav.Link href="#settings">{t('settings')}</Nav.Link>
                <Button variant="danger" onClick={handleLogout}>Выйти</Button>
              </>
            ) : (
              <>
                <Nav.Link href="/user">
                  <FaUser className="me-1" />
                  Войти
                </Nav.Link>
                <Nav.Link href="/register">
                  <FaUser className="me-1" />
                  Зарегистрироваться
                </Nav.Link>
              </>
            )}
          </Nav>
          <DownloadLauncherButton />
          <LanguageSwitcher />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
