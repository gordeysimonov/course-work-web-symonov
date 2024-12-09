import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/FollowersPage.css'; // Імпорт стилів

const FollowersPage = ({ user }) => {
    const [followers, setFollowers] = useState([]);  // Список підписників
    const [allUsers, setAllUsers] = useState([]);    // Всі користувачі
    const [filteredFollowers, setFilteredFollowers] = useState([]); // Відфільтровані підписники

    useEffect(() => {
        if (!user) return;

        // Отримання всіх користувачів
        axios.get('http://localhost:8080/api/users')
            .then((response) => {
                setAllUsers(response.data);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
            });

        // Отримання підписників користувача
        axios.get(`http://localhost:8080/api/subscriptions/subscribers/${user.sub}`)
            .then((response) => {
                setFollowers(response.data);
            })
            .catch((error) => {
                console.error('Error fetching followers:', error);
            });
    }, [user]);

    // Фільтрація користувачів на основі підписників
    useEffect(() => {
        if (followers.length === 0 || allUsers.length === 0) return;

        // Фільтрація користувачів, які є підписниками
        const followerUsers = allUsers.filter(u =>
            followers.some(follower => follower.subscriber.id === u.id)  // Перевірка, чи є користувач серед підписників
        );
        setFilteredFollowers(followerUsers);
    }, [followers, allUsers]);

    return (
        <div className="followers-page">
            <h2 className="followers-heading">Мої підписники</h2>
            {filteredFollowers.length === 0 ? (
                <p className="no-followers">У вас немає підписників.</p>
            ) : (
                <ul className="followers-list">
                    {filteredFollowers.map((follower) => (
                        <li key={follower.id} className="follower-item">
                            <img
                                src={`data:image/jpeg;base64,${follower.profilePicture}`}
                                alt="Profile"
                                className="follower-profile-picture"
                            />
                            <Link to={`/user-profile/${follower.id}`} className="follower-name">
                                {follower.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FollowersPage;
