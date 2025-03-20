import React from "react";

const StarRating = ({ currentRating, onRate }) => {
    const stars = Array(10).fill(0); // 10 звезд

    return (
        <div>
            {stars.map((_, index) => (
                <span
                    key={index}
                    onClick={() => onRate(index + 1)} // Передаем только значение rating
                    style={{
                        cursor: 'pointer',
                        color: index < currentRating ? 'darkred' : 'lightgray',
                        fontSize: "50px"
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;
