import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './GameDetail.css';
import Header from '../Header/Header';

const GameDetail = () => {
    const { id } = useParams(); // Получаем ID игры из URL
    const [game, setGame] = useState(null);
    const [isPurchased, setIsPurchased] = useState(false); // Для проверки, куплена ли игра
    const [message, setMessage] = useState(''); // Для вывода сообщений
    const [userId, setUserId] = useState(null); // ID текущего пользователя

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserId(payload.userId);
            } catch (error) {
                console.error('Ошибка при парсинге токена:', error);
            }
        }
    }, []);

    useEffect(() => {
        fetch(`http://localhost:5000/api/games/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (typeof data.screenshotsUrl === 'string') {
                    data.screenshotsUrl = JSON.parse(data.screenshotsUrl);
                }
                setGame(data);
            })
            .catch((error) => {
                console.error('Ошибка при получении игры:', error);
            });
    }, [id]);

    useEffect(() => {
        if (userId) {
            fetch(`http://localhost:5000/api/purchased-games/user/${userId}/game/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            })
                .then((res) => {
                    if (res.status === 200) {
                        return res.json();
                    } else if (res.status === 404) {
                        return { purchased: false };
                    } else {
                        throw new Error('Ошибка при проверке покупки');
                    }
                })
                .then((data) => {
                    if (data.purchased) {
                        setIsPurchased(true);
                        setMessage('Вы уже купили эту игру.');
                    }
                })
                .catch((error) => {
                    console.error('Ошибка при проверке покупки:', error);
                });
        }
    }, [userId, id]);

    const handleBuyGame = () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id'); // Получаем userId из localStorage
    
        if (!token) {
            setMessage('Необходимо авторизоваться для покупки игры');
            return;
        }
    
        const gameName = 'Example Game Name'; // Здесь нужно взять реальное название игры (вместо 'Example Game Name')
    
        console.log('Token:', token);
        console.log('User ID:', userId); // Лог user ID
        console.log('Game ID:', id); // Лог game ID
        console.log('Game Name:', gameName); // Лог названия игры
    
        fetch('http://localhost:5000/api/buy-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
                gameId: id, 
                gameName, // Отправляем название игры
                userId // Отправляем userId
            }),
        })
        .then((res) => {
            console.log('Response Status:', res.status); // Лог статуса ответа
            return res.json().then((data) => ({ status: res.status, data }));
        })
        .then(({ status, data }) => {
            if (status === 200) {
                setIsPurchased(true);
                setMessage('Игра успешно куплена!');
            } else {
                setMessage(data.message || 'Ошибка при покупке игры');
            }
        })
        .catch((error) => {
            console.error('Ошибка при покупке игры:', error);
            setMessage('Ошибка при покупке игры');
        });
    };
    
    
    

    if (!game) {
        return <p>Loading...</p>;
    }

    return (
        <div className="game-detail-page">
            {/* Заголовок страницы */}
            <Header />

            {/* Основное содержимое страницы игры */}
            <div className="game-detail-container">
                {/* Обложка игры */}
                <img src={`http://localhost:5000${game.imageUrl}`} alt={game.title} className="game-image" />

                {/* Информация об игре */}
                <div className="game-info">
                    <h1>{game.title}</h1>
                    <p className="game-description">{game.description}</p>
                 
                    <p className="game-price">Цена: ${game.price}</p>

                    {/* Сообщение после покупки */}
                    {message && <p className="message">{message}</p>}

                    {/* Показываем кнопку покупки только если игра не куплена */}
                    {!isPurchased && (
                        <button className="buy-now-button" onClick={handleBuyGame}>
                            Buy Now
                        </button>
                    )}
                </div>

                {/* Трейлер игры */}
                <div className="game-trailer">
                    <h2>Watch Trailer</h2>
                    <video controls className="trailer-video">
                    <source src={`http://localhost:5000${game.trailerUrl}`} type="video/mp4" />
                    Your browser does not support the video tag.
                      
                    </video>
                </div>

                {/* Скриншоты игры */}
                <div className="game-screenshots">
                    <h2>Screenshots</h2>
                    <div className="screenshots-grid">
                        {game.screenshotsUrl && game.screenshotsUrl.length > 0 ? (
                            game.screenshotsUrl.map((screenshot, index) => (
                                <img
                                    key={index}
                                    src={`http://localhost:5000${screenshot}`}
                                    alt={`Screenshot ${index + 1}`}
                                    className="screenshot"
                                />
                            ))
                        ) : (
                            <p>Скриншоты отсутствуют</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameDetail;
