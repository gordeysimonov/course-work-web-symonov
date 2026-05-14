// Головна сторінка веб-ресурсу

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MusicList from '../components/MusicList';
import axios from 'axios';
import '../css/Home.css';

const Home = ({ user }) => {

    // Список категорій музичних файлів
    const [categories, setCategories] = useState([]);

    // Завантаження категорій із сервера
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div>

            {/* Блок категорій */}
            <h2>Категорії</h2>

            <div className="categories-container">

                {Array.isArray(categories) && categories.length > 0 ? (

                    categories.map((category) => (

                        // Картка категорії
                        <div key={category.id} className="category-card">

                            <Link to={`/category/${category.id}`}>

                                {/* Зображення категорії */}
                                {category.categoryImagePath && (
                                    <img
                                        src={`http://localhost:8080/api/categories/${category.id}/image`}
                                        alt={category.name}
                                    />
                                )}

                                <h3>{category.name}</h3>
                            </Link>
                        </div>
                    ))

                ) : (

                    // Повідомлення, якщо категорії відсутні
                    <p>Категорії не знайдені</p>
                )}
            </div>

            {/* Список музичних файлів */}
            <MusicList user={user} />

            {user ? (

                // Блок переходу до створення музичного файлу
                <div className="create-file-container">
                    <p>Щоб завантажити музику, перейдіть на сторінку створення файлу:</p>

                    <Link to="/create-file">
                        <button>Перейти до створення файлу</button>
                    </Link>
                </div>

            ) : (

                // Повідомлення для неавторизованого користувача
                <p>Увійдіть, щоб завантажувати музику.</p>
            )}
        </div>
    );
};

export default Home;