import React from "react";
import s from "./StarRating.module.sass";
const StarRating = ({ currentRating, onRate }) => {
  const stars = Array(10).fill(0); // 10 звезд

  return (
    <div className={s.rating}>
      {stars.map((_, index) => (
        <span
          key={index}
          onClick={() => onRate(index + 1)}
          className={s.star}
          style={{
            color: index < currentRating ? "darkred" : "lightgray",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
