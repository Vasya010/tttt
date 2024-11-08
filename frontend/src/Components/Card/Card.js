import React from 'react';
import './Card.css';

const Card = ({ image, title, text }) => {
    return (
        <div className="card">
            <div className="card-image" style={{ backgroundImage: `url(${image})` }}></div>
            <div className="card-content">
                <h2>{title}</h2>
                <p>{text}</p>
                <button className="buy-btn">Купить</button>
            </div>
            <div className="blood-effect"></div>
        </div>
    );
};

export default Card;
