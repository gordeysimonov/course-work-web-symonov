import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Header.css';
import { PlayerContext } from '../context/PlayerContext';

const Header = ({ user, onLogout }) => {
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [hasUnreadChats, setHasUnreadChats] = useState(false); // ✅ стан для чатів
    const [userName, setUserName] = useState(null);
    const navigate = useNavigate();
    const { closeTrack } = useContext(PlayerContext);

    useEffect(() => {
        if (user && user.sub) {
            axios.get(`http://localhost:8080/api/users/${user.sub}`)
                .then(res => setUserName(res.data.name))
                .catch(() => setUserName(null));
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            const intervalId = setInterval(async () => {
                try {
                    // 🔴 Повідомлення
                    const notificationsRes = await axios.get(`http://localhost:8080/api/notifications/user/${user.sub}`);
                    const unreadNotifications = notificationsRes.data.filter(n => n.status === 'unread');
                    setHasUnreadNotifications(unreadNotifications.length > 0);

                    // 🔵 Чати
                    const chatsRes = await axios.get(`http://localhost:8080/api/chats/user/${user.sub}`);
                    const chats = chatsRes.data;

                    let hasUnread = false;
                    for (let chat of chats) {
                        const unreadRes = await axios.get(
                            `http://localhost:8080/api/messages/unread/${chat.id}`,
                            { params: { userId: user.sub } }
                        );
                        if (unreadRes.data > 0) {
                            hasUnread = true;
                            break;
                        }
                    }
                    setHasUnreadChats(hasUnread);
                } catch (err) {
                    console.error(err);
                }
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [user]);

    const handleLogout = () => {
        onLogout();
        closeTrack();
        navigate("/");
    };

    return (
        <header className="header">
            <div className="logo">
                <h1><Link to="/">MusicApp</Link></h1>
            </div>
            <nav className="nav">
                {user ? (
                    <div className="user-actions">
                        <span>Привіт, {userName}!</span>

                        <Link to="/profile" className="profile-link">
                            <button className="action-button">Перейти до профілю</button>
                        </Link>

                        <button onClick={handleLogout} className="action-button">Вийти</button>

                        <Link to="/chats" className="chats-link">
                            <button className="action-button">
                                Чати
                                {hasUnreadChats && <span className="notification-badge"></span>}
                            </button>
                        </Link>

                        <Link to="/my-notifications" className="notifications-link" state={{ user }}>
                            <button className="action-button">
                                Повідомлення
                                {hasUnreadNotifications && <span className="notification-badge"></span>}
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