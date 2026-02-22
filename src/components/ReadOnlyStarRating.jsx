import React from 'react';
import '../css/StarRating.css';

const ReadOnlyStarRating = ({ averageRate, ratesCount }) => {
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 10; i++) {
            stars.push(
                <span
                    key={i}
                    className={`star ${averageRate >= i ? 'full' : 'empty'}`}
                >
          ★
        </span>
            );
        }
        return stars;
    };

    return (
        <div className="rating-wrapper">
            <p className="rating-info">
                Оцінка: {averageRate.toFixed(1)} ({ratesCount} відгуків)
            </p>
            <div className="star-rating">
                {renderStars()}
            </div>
        </div>
    );
};

export default ReadOnlyStarRating;
