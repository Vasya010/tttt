import React from 'react';
import './Footer.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import UnrealLogo from '../../images/png-transparent-unreal-engine-4-htc-vive-unreal-match-3-others-miscellaneous-text-trademark.png';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-logo">
                    <a href="/" className="logo-text">VorlodGames Studio</a>
                </div>

                <div className="footer-links">
                    <a href="/about">{t('about_us')}</a>
                    <a href="/contact">{t('contact')}</a>
                    <a href="/privacy">{t('privacy_policy')}</a>
                    <a href="/terms">{t('terms_of_service')}</a>
                </div>

                <div className="footer-engines">
                    <p>{t('our_engines')}</p>
                    <a href="https://unity.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-unity" title="Unity Engine"></i>
                    </a>
                    <a href="https://unrealengine.com" target="_blank" rel="noopener noreferrer">
                        <img src={UnrealLogo} alt="Unreal Engine" title="Unreal Engine" className="engine-logo" />
                    </a>
                </div>

                <div className="footer-social">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-facebook"></i>
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <i className="fa-brands fa-vk"></i>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-instagram"></i>
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-linkedin"></i>
                    </a>
                </div>

                <div className="footer-contact">
                    <p>{t('all_rights_reserved')}</p>
                    <p>{t('email')}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
