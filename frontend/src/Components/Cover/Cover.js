import React from 'react';
import './Cover.css';
import image11 from '../images/Scri1.png'

const Cover = () => {
    return (
        <div className="image-container">
            <img src={image11} alt="Cover" className="background-image" />
            <div className="overlay"></div>
            <div className="content">
                <h1>Добро пожаловать на наш сайт</h1>
               
                <a href="#explore" className="btn explore-btn">О нас</a>
            </div>
        </div>
    );
}

export default Cover;
