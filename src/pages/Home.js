import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MusicList from '../components/MusicList';
import axios from 'axios';
import '../css/Home.css';

const Home = ({ user }) => {
    const [categories, setCategories] = useState([]);
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
            <h2>Категорії</h2>
            <div className="categories-container">
                {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                        <div key={category.id} className="category-card">
                            <Link to={`/category/${category.id}`}>
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
                    <p>Категорії не знайдені</p>
                )}
            </div>

            <MusicList user={user} />
            {user ? (
                <div className="create-file-container">
                    <p>Щоб завантажити музику, перейдіть на сторінку створення файлу:</p>
                    <Link to="/create-file">
                        <button>Перейти до створення файлу</button>
                    </Link>
                </div>
            ) : (
                <p>Увійдіть, щоб завантажувати музику.</p>
            )}
        </div>
    );
};

export default Home;
