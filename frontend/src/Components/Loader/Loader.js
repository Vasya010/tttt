import React, { useEffect, useState } from 'react';
import './Loader.css';

const Loader = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Эмуляция загрузки, замените на реальную логику
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3000); // Загрузка длится 3 секунды

        return () => clearTimeout(timer);
    }, []);

    if (!loading) {
        return null; // Загрузочный экран исчезает после завершения загрузки
    }

    return (
        <div className="loader">
            <div className="spinner"></div>
            <h2>Loading...</h2>
        </div>
    );
};

export default Loader;
