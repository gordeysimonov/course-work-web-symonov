import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/SubscriptionsPage.css';

const SubscriptionsPage = ({ user }) => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);

    useEffect(() => {
        if (!user) return;
        axios.get('http://localhost:8080/api/users')
            .then((response) => {
                setAllUsers(response.data);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
            });

        axios.get(`http://localhost:8080/api/subscriptions/subscriptions/${user.sub}`)
            .then((response) => {
                setSubscriptions(response.data);
            })
            .catch((error) => {
                console.error('Error fetching subscriptions:', error);
            });
    }, [user]);

    useEffect(() => {
        if (subscriptions.length === 0 || allUsers.length === 0) return;

        const subscribedUsers = allUsers.filter(u =>
            subscriptions.some(sub => sub.subscribedTo.id === u.id)
        );
        setFilteredSubscriptions(subscribedUsers);
    }, [subscriptions, allUsers]);

    const handleUnsubscribe = (subscriptionId) => {
        const confirmUnsubscribe = window.confirm('Ви впевнені, що хочете відписатися?');
        if (confirmUnsubscribe) {
            axios.delete(`http://localhost:8080/api/subscriptions/${user.sub}/${subscriptionId}`)
                .then(() => {
                    setFilteredSubscriptions(filteredSubscriptions.filter(sub => sub.id !== subscriptionId));
                })
                .catch((error) => {
                    console.error('Error unsubscribing:', error);
                });
        }
    };

    return (
        <div className="subscriptions-page">
            <h2 className="subscriptions-heading">Мої підписки</h2>
            {filteredSubscriptions.length === 0 ? (
                <p className="no-subscriptions">У вас немає підписок.</p>
            ) : (
                <ul className="subscriptions-list">
                    {filteredSubscriptions.map((subscription) => (
                        <li key={subscription.id} className="subscription-item">
                            <img
                                src={`data:image/jpeg;base64,${subscription.profilePicture}`}
                                alt="Profile"
                                className="subscription-profile-picture"
                            />
                            <Link to={`/user-profile/${subscription.id}`} className="subscription-name">
                                {subscription.name}
                            </Link>
                            <button
                                onClick={() => handleUnsubscribe(subscription.id)}
                                className="unsubscribe-button"
                            >
                                Відписатися
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SubscriptionsPage;
