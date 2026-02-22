 import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../css/EditMusic.css'; // Стилі

const EditMusic = () => {
    const { id } = useParams(); // Отримуємо ID з URL
    const navigate = useNavigate();
    const location = useLocation();
    const [file, setFile] = useState(null);
    const [allFiles, setAllFiles] = useState([]);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [newCoverImage, setNewCoverImage] = useState(null);
    const [year, setYear] = useState('');
    const user = location.state?.user; // Інформація про користувача
    const previousPage = location.state?.from || '/';

    useEffect(() => {
        axios.get('http://localhost:8080/api/music-files')
            .then((response) => {
                setAllFiles(response.data);
            })
            .catch((error) => console.error('Error fetching all files:', error));
    }, []);

    useEffect(() => {
        if (!id || allFiles.length === 0) return;

        const foundFile = allFiles.find((file) => file.id === Number(id));
        if (foundFile) {
            setFile(foundFile);
            setTitle(foundFile.title);
            setArtist(foundFile.artist);
            setCoverImage(foundFile.coverImage);
            setYear(foundFile.year);
        }
    }, [allFiles, id]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const updatedData = new FormData();
        updatedData.append('title', title);
        updatedData.append('artist', artist);
        updatedData.append('year', year);
        if (newCoverImage) updatedData.append('coverImage', newCoverImage);

        if (!user || !user.sub) return;

        axios.put(`http://localhost:8080/api/music-files/${id}`, updatedData, {
            headers: {
                'userId': Number(user.sub),
                'roles': user.roles,
            }
        })
            .then(() => navigate(previousPage))
            .catch((error) => {
                console.error('Error updating file:', error);
                alert(error.response?.data || 'Не вдалося оновити файл');
            });
    };

    const getCoverImage = () => {
        if (newCoverImage) {
            return URL.createObjectURL(newCoverImage);
        } else if (coverImage) {
            return `data:image/jpeg;base64,${coverImage}`;
        } else {
            return 'path/to/default/cover-image.jpg';
        }
    };

    if (!file) return <div>Завантаження...</div>;

    return (
        <div className="edit-music-page">
            <h2>Редагувати файл</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Назва</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <p><strong>Поточна назва:</strong> {file.title}</p>
                </div>
                <div>
                    <label htmlFor="artist">Виконавець</label>
                    <input
                        type="text"
                        id="artist"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                    />
                    <p><strong>Поточний виконавець:</strong> {file.artist}</p>
                </div>
                <div>
                    <label htmlFor="year">Рік випуску</label>
                    <input
                        type="number"
                        id="year"
                        value={year}
                        min="0"
                        max="2024"
                        onChange={(e) => setYear(e.target.value)}
                    />
                    <p><strong>Поточний рік:</strong> {file.year}</p>
                </div>
                <div>
                    <h3>Обкладинка</h3>
                    <img
                        src={getCoverImage()}
                        alt="Cover Preview"
                        width="100"
                        height="100"
                    />
                    <input
                        type="file"
                        id="coverImage"
                        accept="image/*"
                        onChange={(e) => setNewCoverImage(e.target.files[0])}
                    />
                </div>
                <button type="submit">Зберегти зміни</button>
            </form>
        </div>
    );
};

export default EditMusic;
