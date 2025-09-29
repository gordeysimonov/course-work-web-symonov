import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Notifications.css';

const Notifications = ({ user }) => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user) {
            axios.get(`http://localhost:8080/api/notifications/user/${user.sub}`)
                .then(response => {
                    const sortedNotifications = response.data.sort((a, b) => {
                        return new Date(b.dateReceiving) - new Date(a.dateReceiving);
                    });
                    setNotifications(sortedNotifications);
                    setFilteredNotifications(sortedNotifications);
                })
                .catch(error => {
                    console.error("Помилка при отриманні повідомлень:", error);
                });
        }
    }, [user]);

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
        if (event.target.value === 'unread') {
            setFilteredNotifications(notifications.filter(notification => notification.status === 'unread'));
        } else {
            setFilteredNotifications(notifications);
        }
    };

    const markAllAsRead = () => {
        axios.put(`http://localhost:8080/api/notifications/mark-all-read/${user.sub}`)
            .then(response => {
                setNotifications(prevNotifications => prevNotifications.map(notification => ({
                    ...notification,
                    status: 'read'
                })));
                setFilteredNotifications(prevNotifications => prevNotifications.map(notification => ({
                    ...notification,
                    status: 'read'
                })));
            })
            .catch(error => {
                console.error("Помилка при оновленні статусу всіх повідомлень:", error);
            });
    };

    const markAsRead = (id) => {
        axios.put(`http://localhost:8080/api/notifications/mark-read/${id}`)
            .then(response => {
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        notification.id === id ? { ...notification, status: 'read' } : notification
                    )
                );
                setFilteredNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        notification.id === id ? { ...notification, status: 'read' } : notification
                    )
                );
            })
            .catch(error => {
                console.error("Помилка при оновленні статусу повідомлення:", error);
            });
    };

    return (
        <div className="notifications-container">
            <h2>Ваші повідомлення</h2>

            <div>
                <label>Фільтрувати повідомлення: </label>
                <select value={filter} onChange={handleFilterChange}>
                    <option value="all">Показати всі</option>
                    <option value="unread">Показати непрочитані</option>
                </select>
            </div>

            <button onClick={markAllAsRead}>Позначити все, як прочитане</button>

            <ul>
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <li
                            key={notification.id}
                            style={{
                                fontWeight: notification.status === 'unread' ? 'bold' : 'normal',
                                color: notification.status === 'unread' ? 'red' : 'black'
                            }}
                        >
                            <div>
                                <p dangerouslySetInnerHTML={{ __html: notification.notificationText }}></p>
                                <small>{new Date(notification.dateReceiving).toLocaleString()}</small>
                            </div>
                            {notification.status === 'unread' && (
                                <button onClick={() => markAsRead(notification.id)}>Позначити як прочитане</button>
                            )}
                        </li>
                    ))
                ) : (
                    <p>Немає повідомлень</p>
                )}
            </ul>
        </div>
    );
};

export default Notifications;
