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
import CategoryPage from './pages/CategoryPage';
import PlaylistPage from './pages/PlaylistPage';
import PlaylistCreatePage from './pages/PlaylistCreatePage';
import AddMusicToPlaylist from "./pages/AddMusicToPlaylist";
import MusicFilePage from "./pages/MusicFilePage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import FollowersPage from "./pages/FollowersPage";
import Notifications from "./pages/Notifications";
import Chat from './pages/Chat';
import { PlayerProvider } from './context/PlayerContext';

const App = () => {
    const [user, setUser] = useState(null);

    // Перевіряємо токен при старті додатку
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('jwtToken');
                    setUser(null);
                } else {
                    setUser(decoded);
                }
            } catch (error) {
                console.error('Invalid token', error);
                localStorage.removeItem('jwtToken');
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setUser(null);
    };

    return (
        <Router>
            {/* ✅ user передаємо у PlayerProvider */}
            <PlayerProvider user={user}>
                <Header user={user} onLogout={handleLogout} />
                <Routes>
                    <Route path="/" element={<Home user={user} />} />
                    <Route path="/login" element={<Login onLogin={setUser} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/edit/:id" element={<EditMusic />} />
                    <Route path="/create-file" element={<CreateFilePage user={user} />} />
                    <Route path="/profile" element={<ProfilePage user={user} />} />
                    <Route path="/user-profile/:userId" element={<UserProfile user={user} />} />
                    <Route path="/category/:id" element={<CategoryPage user={user} />} />
                    <Route path="/playlist/:playlistId" element={<PlaylistPage user={user} />} />
                    <Route path="/create-playlist" element={<PlaylistCreatePage user={user} />} />
                    <Route path="/add-music-to-playlist/:playlistId" element={<AddMusicToPlaylist user={user} />} />
                    <Route path="/music-file/:musicFileId" element={<MusicFilePage user={user} />} />
                    <Route path="/subscriptions" element={<SubscriptionsPage user={user} />} />
                    <Route path="/followers" element={<FollowersPage user={user} />} />
                    <Route path="/my-notifications" element={<Notifications user={user} />} />
                    <Route path="/chats" element={<Chat user={user} />} />
                </Routes>
            </PlayerProvider>
        </Router>
    );
};

export default App;
