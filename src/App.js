import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EditMusic from './pages/EditMusic';
import CreateFilePage from './pages/CreateFilePage';
import ProfilePage from './pages/ProfilePage';
import UserProfile from './pages/UserProfile';
import CategoryPage from './pages/CategoryPage'; // Додаємо імпорт сторінки категорії
import PlaylistPage from './pages/PlaylistPage'; // Додано для сторінки плейлиста
import PlaylistCreatePage from './pages/PlaylistCreatePage'; // Додано для сторінки створення плейлиста
import AddMusicToPlaylist from "./pages/AddMusicToPlaylist";
import MusicFilePage from "./pages/MusicFilePage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import FollowersPage from "./pages/FollowersPage";
import Notifications from "./pages/Notifications";

const App = () => {
    const [user, setUser] = useState(null);

    // Перевіряємо токен при старті додатку
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            try {
                const decoded = jwtDecode(token); // Використовуємо jwtDecode
                if (decoded.exp * 1000 < Date.now()) {
                    // Якщо токен просрочений, очищаємо localStorage
                    localStorage.removeItem('jwtToken');
                    setUser(null);
                } else {
                    setUser(decoded); // Зберігаємо дані користувача
                }
            } catch (error) {
                console.error('Invalid token', error);
                localStorage.removeItem('jwtToken');
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setUser(null); // Очищаємо дані користувача при виході
    };

    return (
        <Router>
            <Header user={user} onLogout={handleLogout} />
            <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/login" element={<Login onLogin={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/edit/:id" element={<EditMusic />} />
                <Route path="/create-file" element={<CreateFilePage user={user} />} />
                <Route path="/profile" element={<ProfilePage user={user} />} />
                <Route path="/user-profile/:userId" element={<UserProfile user={user} />} />
                <Route path="/category/:id" element={<CategoryPage />} /> {/* Додаємо маршрут для категорії */}
                <Route path="/playlist/:playlistId" element={<PlaylistPage user={user} />} /> {/* Додаємо маршрут для плейлиста */}
                <Route path="/create-playlist" element={<PlaylistCreatePage user={user} />} /> {/* Додаємо маршрут для створення плейлиста */}
                <Route path="/add-music-to-playlist/:playlistId" element={<AddMusicToPlaylist user={user} />} />
                <Route path="/music-file/:musicFileId" element={<MusicFilePage user={user} />} />
                <Route path="/subscriptions" element={<SubscriptionsPage user={user} />} />
                <Route path="/followers" element={<FollowersPage user={user} />} />
                <Route path="/my-notifications" element={<Notifications user={user} />} />
            </Routes>
        </Router>
    );
};

export default App;
