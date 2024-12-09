import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Header.css'; // Стилі для Header

const Header = ({ user, onLogout }) => {
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const intervalId = setInterval(() => {
                axios.get(`http://localhost:8080/api/notifications/user/${user.sub}`)
                    .then(response => {
                        const unreadNotifications = response.data.filter(notification => notification.status === 'unread');
                        setHasUnreadNotifications(unreadNotifications.length > 0);
                    })
                    .catch(error => console.error("Помилка при отриманні повідомлень:", error));
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [user]);

    const handleLogout = () => {
        onLogout();
        navigate("/"); // Перенаправляємо на головну сторінку
    };

    return (
        <header className="header">
            <div className="logo">
                <h1>MusicApp</h1>
            </div>
            <nav className="nav">
                {user ? (
                    <div className="user-actions">
                        <span>Привіт, {user.username}!</span>

                        {/* Кнопка для переходу до профілю */}
                        <Link to="/profile" className="profile-link">
                            <button className="action-button">Перейти до профілю</button>
                        </Link>

                        {/* Кнопка для виходу */}
                        <button onClick={handleLogout} className="action-button">Вийти</button>

                        {/* Кнопка для переходу до повідомлень */}
                        <Link to="/my-notifications" className="notifications-link" state={{ user }}>
                            <button className="action-button">
                                Повідомлення
                                {hasUnreadNotifications && (
                                    <span className="notification-badge"></span>
                                )}
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="user-actions">
                        <Link to="/login" className="auth-link">
                            <button className="action-button">Авторизація</button>
                        </Link>
                        <Link to="/register" className="auth-link">
                            <button className="action-button">Реєстрація</button>
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
