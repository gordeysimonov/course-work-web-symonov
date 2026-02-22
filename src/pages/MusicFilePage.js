import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { PlayerContext } from '../context/PlayerContext';
import StarRating from '../components/StarRating';
import '../css/MusicFilePage.css';

const MusicFilePage = ({ user }) => {
    const { musicFileId } = useParams();
    const [musicFiles, setMusicFiles] = useState([]);
    const [musicFile, setMusicFile] = useState(null);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [error, setError] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    const { playTrack } = useContext(PlayerContext);

    // ⭐ Рейтинг
    const [averageRate, setAverageRate] = useState(0);
    const [ratesCount, setRatesCount] = useState(0);

    // ✦ Завантаження всіх файлів
    useEffect(() => {
        axios.get('http://localhost:8080/api/music-files')
            .then((response) => {
                setMusicFiles(response.data);
            })
            .catch((error) => {
                console.error('Error fetching music files:', error);
            });
    }, []);

    // ✦ Знаходимо конкретний файл
    useEffect(() => {
        if (musicFiles.length > 0) {
            setMusicFile(musicFiles.find(f => f.id === parseInt(musicFileId)));
        }
    }, [musicFileId, musicFiles]);

    // ✦ Завантажуємо коментарі
    useEffect(() => {
        if (musicFileId) {
            axios.get(`http://localhost:8080/api/music-files/${musicFileId}/comments`)
                .then((response) => setComments(response.data))
                .catch((error) => console.error('Error fetching comments:', error));
        }
    }, [musicFileId]);

    // ⭐ Завантажуємо рейтинг
    useEffect(() => {
        if (musicFileId) {
            axios
                .get(`http://localhost:8080/api/rates/file/${musicFileId}/average`)
                .then(res => setAverageRate(res.data.averageRate))
                .catch(err => console.error("Error fetching average rate:", err));

            axios
                .get(`http://localhost:8080/api/rates/file/${musicFileId}`)
                .then(res => setRatesCount(res.data.length))
                .catch(err => console.error("Error fetching rates count:", err));
        }
    }, [musicFileId]);

    // ✦ Коментар — зміна
    const handleCommentChange = (event) => setComment(event.target.value);

    // ✦ Додавання коментаря
    const handleAddComment = () => {
        if (!comment.trim()) return;

        if (!parseInt(musicFileId) || !user?.sub) {
            setError('Не вдалося знайти ідентифікатор музичного файлу або користувача.');
            return;
        }

        axios.post('http://localhost:8080/api/comments/add', {
            musicFileId,
            userId: user.sub,
            commentText: comment,
        })
            .then((response) => {
                setComment('');
                setError('');
                setComments([...comments, response.data]);
            })
            .catch(() => setError('Не вдалося додати коментар. Спробуйте ще раз.'));
    };

    // ✦ Видалення
    const handleDeleteComment = (commentId) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей коментар?')) {
            axios.delete(`http://localhost:8080/api/comments/${commentId}`)
                .then(() => setComments(comments.filter(c => c.id !== commentId)))
                .catch(() => {});
        }
    };

    // ✦ Почати редагування
    const handleEditComment = (commentId, currentText) => {
        setEditingCommentId(commentId);
        setEditingCommentText(currentText);
    };

    // ✦ Зберегти редагування
    const handleSaveComment = () => {
        if (editingCommentText.trim() === '') return;

        axios.put(
            `http://localhost:8080/api/comments/${editingCommentId}`,
            editingCommentText,
            { headers: { 'Content-Type': 'text/plain' } }
        )
            .then(() => {
                setComments(comments.map(c =>
                    c.id === editingCommentId ? { ...c, commentText: editingCommentText } : c
                ));
                setEditingCommentId(null);
                setEditingCommentText('');
            })
            .catch(err => console.error("Error updating comment", err));
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    return (
        <div className="music-file-page">
            {musicFile ? (
                <div className="content">
                    <h2 className="music-title">{musicFile.title}</h2>
                    <h3>Виконавець: {musicFile.artist}</h3>
                    <p><strong>Рік випуску:</strong> {musicFile.year}</p>

                    {musicFile.uploadedBy && (
                        <p>
                            <strong>Завантажено: </strong>
                            <Link to={
                                user?.sub === musicFile.uploadedBy.id.toString()
                                    ? '/profile'
                                    : `/user-profile/${musicFile.uploadedBy.id}`
                            }>
                                {musicFile.uploadedBy.name || 'Анонім'}
                            </Link>
                        </p>
                    )}

                    {musicFile.genres?.length > 0 && (
                        <p><strong>Жанри:</strong> {musicFile.genres.map(g => g.genre).join(' • ')}</p>
                    )}

                    {musicFile.tags?.length > 0 && (
                        <p><strong>Теги:</strong> {musicFile.tags.map(t => t.tagName).join(' • ')}</p>
                    )}

                    {musicFile.coverImage && (
                        <img
                            src={`data:image/jpeg;base64,${musicFile.coverImage}`}
                            alt="Cover"
                            className="cover-image"
                        />
                    )}

                    {/* Рейтинг */}
                    <div className="rating-wrapper">
                        <p className="rating-info">
                            Оцінка: {averageRate.toFixed(1)} ({ratesCount} відгуків)
                        </p>

                        <StarRating
                            musicFileId={musicFile.id}
                            user={user}
                            averageRate={averageRate}
                            onRateChange={(newRate) => {
                                axios.get(`http://localhost:8080/api/rates/file/${musicFile.id}/average`)
                                    .then(res => setAverageRate(res.data.averageRate))
                                    .catch(err => console.error(err));

                                axios.get(`http://localhost:8080/api/rates/file/${musicFile.id}`)
                                    .then(res => setRatesCount(res.data.length))
                                    .catch(err => console.error(err));
                            }}
                        />
                    </div>

                    {/* Play */}
                            <button
                                className="play-btn"
                                onClick={() =>
                                    playTrack({
                                        id: musicFile.id,
                                        src: `http://localhost:8080/api/music-files/${musicFile.id}`,
                                        coverImage: musicFile.coverImage,
                                        title: musicFile.title,
                                    })
                                }
                            >
                                ▶ Play
                            </button>

                            {/* Коментарі */}
                            {user ? (
                                <div className="comment-container">
                                    <label htmlFor="comment">Ваш коментар:</label>
                                    <textarea
                                        id="comment"
                                        value={comment}
                                        onChange={handleCommentChange}
                                        placeholder="Напишіть свій коментар..."
                                        className="comment-input"
                                    />
                                    <button onClick={handleAddComment} className="comment-button">
                                        Додати коментар
                                    </button>
                                </div>
                            ) : (
                                <p>Щоб залишити коментар, будь ласка, увійдіть у систему.</p>
                            )}

                            {error && <p className="error">{error}</p>}

                            <div className="comments-list">
                                <h3>Коментарі:</h3>

                                {comments.length > 0 ? (
                                    comments.map(comment => (
                                        <div key={comment.id} className="comment-item">
                                            {editingCommentId === comment.id ? (
                                                <div>
                                            <textarea
                                                value={editingCommentText}
                                                onChange={(e) => setEditingCommentText(e.target.value)}
                                                className="comment-input"
                                            />
                                                    <button onClick={handleSaveComment} className="comment-button">
                                                        Зберегти
                                                    </button>
                                                    <button onClick={handleCancelEdit} className="comment-button">
                                                        Скасувати
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p>
                                                        <strong>
                                                            <Link to={
                                                                user?.sub === comment.userId.id.toString()
                                                                    ? '/profile'
                                                                    : `/user-profile/${comment.userId.id}`
                                                            }>
                                                                {comment.userId.name}
                                                            </Link>
                                                        </strong>: {comment.commentText}
                                                    </p>
                                                    <p className="comment-date">
                                                        {new Date(comment.postDate).toLocaleString()}
                                                    </p>

                                                    {(user && (user.sub === comment.userId.id.toString() || user.roles.includes('ADMIN'))) && (
                                                        <div>
                                                            <button
                                                                onClick={() => handleEditComment(comment.id, comment.commentText)}
                                                                className="edit-button"
                                                            >
                                                                Редагувати
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="delete-button"
                                                            >
                                                                Видалити
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p>Коментарів поки що немає. Будьте першим!</p>
                                )}
                            </div>
                </div>
            ) : (
                <p>Не вдалося знайти інформацію про пісню.</p>
            )}
        </div>
    );
};

export default MusicFilePage;
