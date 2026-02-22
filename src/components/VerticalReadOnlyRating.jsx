import React from 'react';
import '../css/StarRating.css';
import '../css/VerticalRating.css';

const VerticalReadOnlyRating = ({ averageRate }) => {
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 10; i++) {
            stars.push(
                <div
                    key={i}
                    className={`star ${averageRate >= i ? 'full' : 'empty'}`}
                >
                    ★
                </div>
            );
        }
        return stars;
    };

    return (
        <div className="vertical-rating">
            <div className="vertical-stars">
                {renderStars()}
            </div>
            <div className="vertical-rate-value">
                {averageRate.toFixed(1)}
            </div>
        </div>
    );
};

export default VerticalReadOnlyRating;
