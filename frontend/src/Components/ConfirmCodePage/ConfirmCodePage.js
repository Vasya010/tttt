import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './cont.css';

function ConfirmCodePage() {
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const navigate = useNavigate();

    const handleConfirm = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/confirm-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            if (response.ok) {
                alert('Подтверждение успешно!');
                navigate('/');
            } else {
                setErrorMessage('Неверный код. Пожалуйста, попробуйте снова.');
            }
        } catch (error) {
            setErrorMessage('Ошибка при подтверждении кода.');
        }
    };

    const handleResendCode = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/resend-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert('Код подтверждения отправлен повторно!');
                setIsCodeSent(true);
            } else {
                alert('Не удалось отправить код повторно. Пожалуйста, попробуйте позже.');
            }
        } catch (error) {
            alert('Ошибка при повторной отправке кода.');
        }
    };

    return (
    <div className='tety'>
        <div className="confirm-code-container1">
            <h2 className="tt1">Подтверждение аккаунта</h2>
            <div className="form-container5">
                <input
                    type="text"
                    placeholder="Введите код подтверждения"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="input-field"
                />
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <button className="confirm-button" onClick={handleConfirm}>Подтвердить</button>
                {!isCodeSent && (
                    <button className="resend-button" onClick={handleResendCode}>Отправить код повторно</button>
                )}
            </div>
        </div>
        </div>
    );
}

export default ConfirmCodePage;
