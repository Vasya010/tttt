import React from 'react';
import './Cover.css';
import image11 from '../images/Scri1.png'
import { useTranslation } from 'react-i18next';


const Cover = () => {
    const { t } = useTranslation();
    return (
        <div className="image-container">
            <img src={image11} alt="Cover" className="background-image" />
            <div className="overlay"></div>
            <div className="content">
                <h1>{t('glavtr')}</h1>
               
                <a href="#explore" className="btn explore-btn">{t('aboutkg')}</a>
            </div>
        </div>
    );
}

export default Cover;
