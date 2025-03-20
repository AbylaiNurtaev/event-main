import React, { useEffect, useState } from 'react';

function ThanksPage() {
    const [timer, setTimer] = useState(5);

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        // Жёсткая перезагрузка при истечении таймера
        if (timer === 0) {
            window.location.href = '/'; // Перезагрузка страницы
        }

        return () => clearInterval(countdown);
    }, [timer]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            fontFamily: 'Arial, sans-serif' 
        }}>
            <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                borderRadius: '8px', 
                backgroundColor: '#fff', 
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' 
            }}>
                <h1 style={{ color: '#4CAF50' }}>Спасибо за покупку!</h1>
                <p style={{ margin: '10px 0' }}>Благодарим вас за ваш заказ!</p>
                <p style={{ margin: '10px 0' }}>Через {timer} секунд вы будете направлены на главную страницу.</p>
                <button 
                    onClick={() => window.location.href = '/'} // Жёсткая перезагрузка
                    style={{ 
                        padding: '10px 20px', 
                        marginTop: '20px', 
                        backgroundColor: '#4CAF50', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer', 
                        fontSize: '16px' 
                    }}
                >На главную</button>
            </div>
        </div>
    );
}

export default ThanksPage;
