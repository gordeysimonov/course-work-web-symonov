import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/AddToPlaylistModal.css";

const AddToPlaylistModal = ({ trackId, user, onClose }) => {
    const [playlists, setPlaylists] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const token = localStorage.getItem("jwtToken");
                if (!user?.sub || !token) {
                    setMessage("Для використання цієї функції потрібно увійти в акаунт.");
                    return;
                }

                setLoading(true);

                // Отримуємо всі плейлисти користувача
                const { data: userPlaylists } = await axios.get(
                    `http://localhost:8080/api/playlists/user/${user.sub}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!Array.isArray(userPlaylists) || userPlaylists.length === 0) {
                    setMessage("У вас ще немає створених плейлистів.");
                    setPlaylists([]);
                    return;
                }

                // Отримуємо всі треки
                const { data: allTracks } = await axios.get(
                    "http://localhost:8080/api/music-files",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Будуємо масив плейлистів із ознакою, чи є трек у ньому
                const playlistsWithFlag = userPlaylists.map((pl) => {
                    const hasTrack = allTracks.some(
                        (file) =>
                            file.id === trackId &&
                            file.playlists?.some((p) => p.id === pl.id)
                    );
                    return { ...pl, hasTrack };
                });

                setPlaylists(playlistsWithFlag);
            } catch (error) {
                console.error("❌ Помилка при завантаженні плейлистів:", error.response || error);
                setMessage("Не вдалося завантажити ваші плейлисти. Спробуйте пізніше.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [trackId, user]);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Керування плейлистами</h3>

                {loading && <p>Завантаження списку плейлистів...</p>}
                {!loading && message && <p>{message}</p>}

                {!loading && playlists.length > 0 && (
                    <ul className="playlist-list">
                        {playlists.map((pl) => (
                            <li key={pl.id}>
                                <span>{pl.name}</span>
                                {pl.hasTrack ? (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await axios.delete(
                                                    `http://localhost:8080/api/playlists/${pl.id}/remove-music/${trackId}`,
                                                    { headers: { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` } }
                                                );

                                                // оновлюємо прапорець
                                                setPlaylists((prev) =>
                                                    prev.map((p) =>
                                                        p.id === pl.id ? { ...p, hasTrack: false } : p
                                                    )
                                                );
                                            } catch (error) {
                                                console.error("❌ Error removing:", error);
                                            }
                                        }}
                                    >
                                        Прибрати
                                    </button>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await axios.post(
                                                    `http://localhost:8080/api/playlists/${pl.id}/add-music/${trackId}`,
                                                    {},
                                                    { headers: { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` } }
                                                );

                                                // оновлюємо прапорець
                                                setPlaylists((prev) =>
                                                    prev.map((p) =>
                                                        p.id === pl.id ? { ...p, hasTrack: true } : p
                                                    )
                                                );
                                            } catch (error) {
                                                console.error("❌ Error adding:", error);
                                            }
                                        }}
                                    >
                                        Додати
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="modal-actions">
                    <button onClick={() => onClose(false)}>Закрити</button>
                </div>
            </div>
        </div>
    );
};

export default AddToPlaylistModal;
