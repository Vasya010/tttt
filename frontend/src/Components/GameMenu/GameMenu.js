import React, { useEffect, useState } from 'react';
import './GameMenu.css';

const GameShop = () => {
    const [games, setGames] = useState([]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/games');
                const data = await res.json();
                // Проверка на наличие поля isDeleted
                const availableGames = data.filter(game => !game.isDeleted);
                setGames(availableGames);
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
            }
        };

        fetchGames();
    }, []);

    return (
        <section className="menu-section">
            <div className="menu-grid">
                {games.map((game) => (
                    <div key={game.id} className="menu-card">
                        <div className="menu-card-image">
                            {/* Используем тег img для отображения изображения */}
                            <img
                                src={`http://localhost:5000${game.imageUrl}`} // Убедитесь, что game.imageUrl начинается с корректного пути
                                alt={game.title}
                                style={{ width: '100%', height: 'auto' }} // Измените ширину и высоту по необходимости
                            />
                        </div>
                        <div className="menu-card-body">
                            <h3 className="menu-card-title">{game.title}</h3>
                            <p className="menu-card-price">${game.price}</p> {/* Цена из базы */}
                            <a href={`/buy/${game.id}`} className="menu-card-link">
                                Buy Now
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default GameShop;
