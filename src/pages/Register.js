import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

const Register = () => {

    // Дані форми реєстрації
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');

    // Повідомлення про помилки валідації
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Навігація між сторінками
    const navigate = useNavigate();

    // Перевірка складності пароля
    const validatePassword = (password) => {
        if (password.length < 6) {
            return 'Пароль має бути не менше 6 символів.';
        }

        if (!/\d/.test(password)) {
            return 'Пароль має містити хоча б одну цифру.';
        }

        return '';
    };

    // Обробка відправлення форми
    const handleSubmit = (e) => {
        e.preventDefault();

        // Очищення попередніх помилок
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        // Валідація пароля
        const passwordValidationResult = validatePassword(password);

        if (passwordValidationResult) {
            setPasswordError(passwordValidationResult);
            return;
        }

        // Перевірка співпадіння паролів
        if (password !== confirmPassword) {
            setConfirmPasswordError('Паролі не співпадають.');
            return;
        }

        // Надсилання запиту на реєстрацію
        axios.post(
            'http://localhost:8080/register',
            { name, email, password },
            { headers: { 'Content-Type': 'application/json' } }
        )
            .then(() => {

                // Перехід на сторінку входу після успішної реєстрації
                alert('Реєстрація успішна!');
                navigate('/login');
            })

            .catch((error) => {

                // Обробка помилок реєстрації
                if (error.response) {
                    const status = error.response.status;

                    if (status === 409) {
                        const message = error.response.data?.message;

                        if (message?.includes('name')) {
                            setNameError('Це ім’я вже зайняте.');

                        } else if (message?.includes('email')) {
                            setEmailError('Ця електронна адреса вже використовується.');

                        } else {
                            alert('Помилка реєстрації: конфлікт.');
                        }

                    } else {
                        alert(`Помилка реєстрації: ${status}`);
                    }

                } else if (error.request) {
                    alert('Помилка: сервер не відповідає. Перевірте з’єднання.');

                } else {
                    alert(`Помилка: ${error.message}`);
                }
            });
    };

    return (
        <div className="login-page">
            <div className="login-container">

                {/* Форма реєстрації */}
                <form onSubmit={handleSubmit} className="login-form">

                    <h2>Реєстрація</h2>

                    {/* Поле імені користувача */}
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Ім'я"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={`input-field ${nameError ? 'input-error' : ''}`}
                        />

                        {nameError && <p className="error-message">{nameError}</p>}
                    </div>

                    {/* Поле електронної пошти */}
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={`input-field ${emailError ? 'input-error' : ''}`}
                        />

                        {emailError && <p className="error-message">{emailError}</p>}
                    </div>

                    {/* Поле пароля */}
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={`input-field ${passwordError ? 'input-error' : ''}`}
                        />

                        {passwordError && <p className="error-message">{passwordError}</p>}
                    </div>

                    {/* Поле підтвердження пароля */}
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Підтвердьте пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={`input-field ${confirmPasswordError ? 'input-error' : ''}`}
                        />

                        {confirmPasswordError && (
                            <p className="error-message">{confirmPasswordError}</p>
                        )}
                    </div>

                    {/* Кнопка реєстрації */}
                    <button type="submit" className="submit-button">
                        Зареєструватися
                    </button>

                    {/* Перехід до сторінки входу */}
                    <p className="register-text">
                        Вже є обліковий запис?

                        <span
                            className="register-link"
                            onClick={() => navigate('/login')}
                        >
                            Увійти
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;