import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import CustomPlayer from '../components/CustomAudioPlayer'; // Імпортуємо кастомний програвач (якщо вже створений)
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

    useEffect(() => {
        axios.get('http://localhost:8080/api/music-files')
            .then((response) => {
                setMusicFiles(response.data);
            })
            .catch((error) => {
                console.error('Error fetching music files:', error);
            });
    }, []);

    useEffect(() => {
        if (musicFiles.length > 0) {
            const file = musicFiles.find(file => file.id === parseInt(musicFileId));
            setMusicFile(file);
        }
    }, [musicFileId, musicFiles]);

    useEffect(() => {
        if (musicFileId) {
            axios
                .get(`http://localhost:8080/api/music-files/${musicFileId}/comments`)
                .then((response) => {
                    setComments(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching comments:', error);
                });
        }
    }, [musicFileId]);

    const handleCommentChange = (event) => {
        setComment(event.target.value);
    };

    const handleAddComment = () => {
        if (!comment.trim()) return;

        if (!parseInt(musicFileId) || !user?.sub) {
            setError('Не вдалося знайти ідентифікатор музичного файлу або користувача.');
            return;
        }

        const newComment = {
            musicFileId: musicFileId,
            userId: user?.sub,
            commentText: comment,
        };

        axios.post('http://localhost:8080/api/comments/add', newComment)
            .then((response) => {
                setComment('');
                setError('');
                setComments([...comments, response.data]);
            })
            .catch((error) => {
                setError('Не вдалося додати коментар. Спробуйте ще раз.');
            });
    };

    const handleDeleteComment = (commentId) => {
        const confirmDelete = window.confirm('Ви впевнені, що хочете видалити цей коментар?');
        if (confirmDelete) {
            axios.delete(`http://localhost:8080/api/comments/${commentId}`)
                .then(() => {
                    setComments(comments.filter((comment) => comment.id !== commentId));
                })
                .catch((error) => {
                });
        }
    };

    const handleEditComment = (commentId, currentText) => {
        setEditingCommentId(commentId);
        setEditingCommentText(currentText);
    };

    const handleSaveComment = () => {
        if (editingCommentText.trim() === '') {
            return;
        }

        const updatedComment = {
            id: editingCommentId,
            commentText: editingCommentText,
        };

        axios.put(`http://localhost:8080/api/comments/${editingCommentId}`, updatedComment)
            .then((response) => {
                setComments(comments.map(comment =>
                    comment.id === editingCommentId ? { ...comment, commentText: editingCommentText } : comment
                ));
                setEditingCommentId(null);
                setEditingCommentText('');
            })
            .catch((error) => {
            });
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
                            <Link to={user?.sub === musicFile.uploadedBy.id.toString()
                                ? '/profile'
                                : `/user-profile/${musicFile.uploadedBy.id}`}>
                                {musicFile.uploadedBy.name || 'Анонім'}
                            </Link>
                        </p>
                    )}

                    {musicFile.genres && musicFile.genres.length > 0 && (
                        <p><strong>Жанри:</strong> {musicFile.genres.map(genre => genre.genre).join(' • ')}</p>
                    )}

                    {musicFile.tags && musicFile.tags.length > 0 && (
                        <p><strong>Теги:</strong> {musicFile.tags.map(tag => tag.tagName).join(' • ')}</p>
                    )}

                    {musicFile.coverImage && (
                        <img
                            src={`data:image/jpeg;base64,${musicFile.coverImage}`}
                            alt="Cover"
                            className="cover-image"
                        />
                    )}

                    {/* Використовуємо кастомний програвач */}
                    <CustomPlayer src={`http://localhost:8080/api/music-files/${musicFile.id}`} />

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
                            <button onClick={handleAddComment} className="comment-button">Додати коментар</button>
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
                                            <button onClick={handleSaveComment} className="comment-button">Зберегти</button>
                                            <button onClick={handleCancelEdit} className="comment-button">Скасувати</button>
                                        </div>
                                    ) : (
                                        <div>
                                            <p><strong><Link
                                                to={user?.sub === comment.userId.id.toString()
                                                    ? '/profile'  // Якщо це поточний користувач
                                                    : `/user-profile/${comment.userId.id}`}  // Якщо це інший користувач
                                            >
                                                {comment.userId.name}
                                            </Link>
                                            </strong>: {comment.commentText}</p>
                                            <p className="comment-date">
                                                {new Date(comment.postDate).toLocaleString()}
                                            </p>
                                            {user && (user.sub === comment.userId.id.toString() || user.roles.includes('ADMIN')) && (
                                                <div>
                                                    <button onClick={() => handleEditComment(comment.id, comment.commentText)} className="edit-button">Редагувати</button>
                                                    <button onClick={() => handleDeleteComment(comment.id)} className="delete-button">Видалити</button>
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
