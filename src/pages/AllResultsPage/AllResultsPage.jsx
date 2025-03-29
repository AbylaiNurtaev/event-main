import React, { useEffect, useState } from "react";
import s from "./AllResultsPage.module.sass";
import axios from "../../axios";
import { useNavigate, useParams } from "react-router-dom";

function AllResultsPage() {
  const [categories, setCategories] = useState();
  const [users, setUsers] = useState();
  const [nominations, setNominations] = useState();
  const { title } = useParams();
  const decodedTitle = decodeURIComponent(title);

  const navigate = useNavigate();

  useEffect(() => {
    // Получение всех номинаций с сервера
    axios.get("/nom").then((res) => {
      const data = res.data;
      // Извлечение уникальных категорий из полученных данных
      const uniqueCategories = [
        ...new Set(data.flatMap((item) => item.nomination[0])),
      ];
      // Преобразуем Set обратно в массив
      setCategories([...uniqueCategories]);
    });
  }, []);
  function calculateAverageRating(nominations) {
    return nominations.map((nomination) => {
      const { applicationId, jouryRate, fullName, avatarUrl, userId } =
        nomination;

      // Фильтруем только те оценки, где application_id и applicationId совпадают
      const validRatings = jouryRate.filter(
        (rate) => rate.applicationId == applicationId
      );
      console.log("validRatings", jouryRate);

      // Отдельно собираем оценки по категориям
      const mainRatings = validRatings
        .filter((rate) => rate.category === "main")
        .map((rate) => rate.rating);

      const additionalRatings = validRatings
        .filter((rate) => rate.category === "additional")
        .map((rate) => rate.rating);

      // Вычисляем среднее для main
      const mainAverage =
        mainRatings.length > 0
          ? mainRatings.reduce((sum, rating) => sum + rating, 0) /
            mainRatings.length
          : 0;

      // Разбиваем additional на тройки и вычисляем среднее для каждой тройки
      const additionalGroupAverages = [];
      for (let i = 0; i < additionalRatings.length; i += 3) {
        const group = additionalRatings.slice(i, i + 3);
        if (group.length > 0) {
          const groupAverage =
            group.reduce((sum, rating) => sum + rating, 0) / group.length;
          additionalGroupAverages.push(groupAverage);
        }
      }

      // Среднее из групп additional
      const additionalAverage =
        additionalGroupAverages.length > 0
          ? additionalGroupAverages.reduce((sum, avg) => sum + avg, 0) /
            additionalGroupAverages.length
          : 0;

      // Итоговое среднее между main и additional
      const finalAverage =
        mainRatings.length > 0 || additionalRatings.length > 0
          ? (mainAverage + additionalAverage) / 2
          : 0;

      return {
        applicationId,
        mainAverage,
        additionalAverage,
        finalAverage,
        fullName,
        avatarUrl,
        nomination: nomination.nomination,
        userId,
      };
    });
  }

  useEffect(() => {
    axios
      .get("/getAllUsersWithAvatars")
      .then((res) => res.data)
      .then((data) => {
        let allNominations = data.map((user) =>
          user.applications
            ? user.applications.map((elem) => ({
                ...elem.application_data, // Копируем все данные из application_data
                userId: user._id, // Добавляем user._id как поле userId
                applicationId: elem.application_id, // Добавляем application_id как поле applicationId
                accepted: elem.accepted,
                jouryRate: user.jouryRate,
                avatarUrl: user.avatarUrl,
                applicationId: elem.application_id,
              }))
            : null
        );
        const nominations = allNominations
          .filter((nomination) => nomination && nomination.length >= 1)
          .flat();
        const result = calculateAverageRating(nominations);
        console.log("result", result);
        setUsers(result);
      });

    axios
      .get("/nom")
      .then((res) => res.data)
      .then((data) => {
        if (data) {
          let tempNominations = [];
          for (let i = 0; i < data.length; i++) {
            tempNominations.push(data[i].nomination[0]); // Get the first nomination
          }
          setNominations(tempNominations);
        }
      });
  }, []);

  return (
    <div className={s.container}>
      <div className={s.innerContainer}>
        <div className={s.crumbs}>
          Главная {"\u00A0"}
          {"\u00A0"}|{"\u00A0"}
          {"\u00A0"} Результаты
        </div>
        <div className={s.title}>РЕЗУЛЬТАТЫ</div>

        <div className={s.mainTitle}>{decodedTitle}</div>
        {decodedTitle && (
          <div className={s.nomination}>
            {/* <p><b>{selectedCategory} - {users.filter((elem) => elem.nomination.toLowerCase() == selectedCategory.toLowerCase()).length}</b></p> */}
            {users &&
              users
                .filter(
                  (elem) =>
                    elem.nomination?.toLowerCase() ===
                    decodedTitle?.toLowerCase()
                )
                .sort((a, b) => b.finalAverage - a.finalAverage) // Сортировка по убыванию finalAverage
                .map((elem, idx) => (
                  <div
                    className={s.nominationBlock}
                    style={{ paddingBottom: "10px" }}
                    onClick={() =>
                      navigate(
                        `/openedResults/${elem.applicationId}/${elem.userId}`
                      )
                    }
                  >
                    <img src={elem.avatarUrl} alt="photo" />
                    <div className={s.number}>{idx + 1}</div>
                    <p>{elem.fullName}</p>
                    <div className={s.grade}>
                      <img src="/images/Star 1.svg" alt="" />
                      <p>
                        {elem.finalAverage
                          ? elem.finalAverage.toString().slice(0, 4)
                          : null}
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllResultsPage;
