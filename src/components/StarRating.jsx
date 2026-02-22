import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/StarRating.css';

const StarRating = ({ musicFileId, user, averageRate, onRateChange }) => {
    const [userRate, setUserRate] = useState(0);
    const [displayValue, setDisplayValue] = useState(averageRate);
    const [hoverValue, setHoverValue] = useState(0);

    useEffect(() => {
        if (!user) return;

        axios.get(`http://localhost:8080/api/rates/file/${musicFileId}`)
            .then(res => {
                const rates = res.data;
                const myRate = rates.find(r => r.user.id.toString() === user.sub);
                if (myRate) {
                    setUserRate(myRate.value);
                    setDisplayValue(myRate.value);
                } else {
                    setDisplayValue(averageRate);
                }
            })
            .catch(err => console.error(err));
    }, [musicFileId, user, averageRate]);

    useEffect(() => {
        if (hoverValue === 0) {
            setDisplayValue(userRate || averageRate);
        }
    }, [hoverValue, userRate, averageRate]);

    const handleMouseEnter = (value) => {
        if (!user) return;
        setHoverValue(value);
        setDisplayValue(value);
    };

    const handleMouseLeave = () => {
        setHoverValue(0);
        setDisplayValue(userRate || averageRate);
    };

    const handleClick = async (value) => {
        if (!user) return;

        if (userRate === value) {
            // удалить оценку
            try {
                await axios.delete(`http://localhost:8080/api/rates/remove`, {
                    params: { userId: user.sub, musicFileId }
                });
                setUserRate(0);
                setDisplayValue(averageRate);
                onRateChange && onRateChange(0);
            } catch (err) {
                console.error(err);
            }
        } else {
            // добавить / обновить
            try {
                await axios.post(`http://localhost:8080/api/rates/add`, null, {
                    params: { userId: user.sub, musicFileId, value }
                });
                setUserRate(value);
                setDisplayValue(value);
                onRateChange && onRateChange(value);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 10; i++) {
            const fill = displayValue >= i ? 'full' : 'empty';

            stars.push(
                <span
                    key={i}
                    className={`star ${fill}`}
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(i)}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    return <div className="star-rating">{renderStars()}</div>;
};

export default StarRating;

