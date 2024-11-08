import React from 'react';
import './CardContainer.css';
import Card from '../Card/Card';
import img1 from '../images/Scri1.png';
import img2 from '../images/Sring2.png'

const CardContainer = () => {
    const cards = [
        {
            image: img1, // убрал фигурные скобки
            title: 'Card 1',
            text: 'This is the first card.'
        },
        {
            image: img2,
            title: 'Card 2',
            text: 'This is the second card.'
        },
        {
            image: 'https://via.placeholder.com/300',
            title: 'Card 3',
            text: 'This is the third card.'
        }
    ];

    return (
        <div className="container">
            <h1 className="news-title">Latest News</h1>
            <div className="cards-container">
                {cards.map((card, index) => (
                    <Card key={index} image={card.image} title={card.title} text={card.text} />
                ))}
            </div>
        </div>
    );
};

export default CardContainer;
