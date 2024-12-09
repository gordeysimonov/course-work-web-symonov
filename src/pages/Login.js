import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../css/Login.css';

const Login = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8080/login', { name, password })
            .then((response) => {
                const token = response.data.token;
                localStorage.setItem('jwtToken', token);  // Зберігаємо токен в localStorage

                // Декодуємо токен і зберігаємо дані користувача
                const decoded = jwtDecode(token);
                onLogin(decoded); // Передаємо декодовані дані користувача

                navigate('/'); // Перехід на головну сторінку
            })
            .catch(() => alert('Невірні дані для входу'));
    };

    return (
        <div className="login-page"> {/* Додаємо клас login-page */}
            <div className="login-container">
                <form onSubmit={handleSubmit} className="login-form">
                    <h2>Авторизація</h2>
                    <input
                        type="text"
                        placeholder="Ім'я"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="input-field"
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input-field"
                    />
                    <button type="submit" className="submit-button">Увійти</button>

                    {/* Текст і посилання на реєстрацію */}
                    <p className="register-text">
                        Ще немає облікового запису?
                        <span
                            className="register-link"
                            onClick={() => navigate('/register')}
                        >
                            Створити
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
