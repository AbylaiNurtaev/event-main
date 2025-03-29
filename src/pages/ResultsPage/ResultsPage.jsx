import React, { useEffect, useState } from "react";
import s from "./ResultsPage.module.sass";
import axios from "../../axios";
import { useNavigate } from "react-router-dom";

function ResultsPage() {
  const [categories, setCategories] = useState();
  const [selectedCategory, setSelectedCategory] = useState(
    "Стилист по прическам года"
  );

  const [users, setUsers] = useState();
  const [nominations, setNominations] = useState();

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
      const {
        applicationId,
        jouryRate,
        fullName,
        avatarUrl,
        userId,
        city,
        portfolio,
      } = nomination;

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
        mainRatings.length > 0 && additionalRatings.length > 0
          ? (mainAverage + additionalAverage) / 2
          : mainRatings.length > 0
          ? mainAverage
          : additionalRatings.length > 0
          ? additionalAverage
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
        city,
        portfolio,
      };
    });
  }

  useEffect(() => {
    axios
      .get("/getAllUsersWithAvatars")
      .then((res) => res.data)
      .then((data) => {
        console.log("DATA", data[0]);
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
                portfolio: user?.portfolio,
              }))
            : null
        );
        const nominations = allNominations
          .filter((nomination) => nomination && nomination.length >= 1)
          .flat();

        const result = calculateAverageRating(nominations);
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

  console.log("users", users);

  return (
    <div className={s.container}>
      <div className={s.innerContainer}>
        <div className={s.crumbs}>
          Главная {"\u00A0"}
          {"\u00A0"}|{"\u00A0"}
          {"\u00A0"} Результаты
        </div>
        <div className={s.title}>РЕЗУЛЬТАТЫ</div>

        <div className={s.row}>
          {categories &&
            categories.map((category, index) => (
              <h5
                key={index}
                className={selectedCategory == category ? s.active : ""}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </h5>
            ))}
        </div>

        <img src="/images/image (2).svg" alt="" className={s.peoplesImage} />

        <div className={s.mainTitle}>{selectedCategory}</div>
        {selectedCategory && (
          <div className={s.firstPlaces}>
            {users &&
              users
                .filter(
                  (elem) =>
                    elem.nomination?.toLowerCase() ===
                    selectedCategory?.toLowerCase()
                )
                .sort((a, b) => b.finalAverage - a.finalAverage) // Сортировка по убыванию finalAverage
                .splice(0, 3)
                .map((elem, idx) => (
                  <div
                    className={s.block}
                    onClick={() =>
                      navigate(
                        `/openedResults/${elem.applicationId}/${elem.userId}`
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <div className={s.top}>
                      <div className={s.left}>
                        <div className={s.logo}>
                          <img src={elem.avatarUrl} alt="logo" />
                          <div className={s.number}>{idx + 1}</div>
                        </div>

                        <div className={s.nameBlock}>
                          <div className={s.name}>{elem.fullName}</div>
                          <div className={s.city}>{elem.city}</div>
                        </div>
                      </div>

                      <div className={s.grade}>
                        <img src="/images/Star 1.svg" alt="" />
                        <p>
                          {elem.finalAverage
                            ? elem.finalAverage.toString().slice(0, 4)
                            : null}
                        </p>
                      </div>
                    </div>

                    <div className={s.bottom}>
                      {console.log("портфолио", elem)}
                      {elem.portfolio &&
                        elem.portfolio
                          .slice(0, 3)
                          .map((elem) => <img src={elem} alt="image" />)}
                    </div>
                  </div>
                ))}
          </div>
        )}
        <h1 className={s.titleAll}>ВСЕ ПОБЕДИТЕЛИ</h1>
        {selectedCategory && (
          <div className={s.nomination}>
            {/* <p><b>{selectedCategory} - {users.filter((elem) => elem.nomination.toLowerCase() == selectedCategory.toLowerCase()).length}</b></p> */}
            {users &&
              users
                .filter(
                  (elem) =>
                    elem.nomination?.toLowerCase() ===
                    selectedCategory?.toLowerCase()
                )
                .sort((a, b) => b.finalAverage - a.finalAverage) // Сортировка по убыванию finalAverage
                .splice(3, 11)
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
                    <div className={s.number}>{idx + 4}</div>
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
        {users &&
          users.filter(
            (elem) =>
              elem.nomination?.toLowerCase() === selectedCategory?.toLowerCase()
          ).length > 11 && (
            <button
              onClick={() =>
                navigate(`/allResults/${encodeURIComponent(selectedCategory)}`)
              }
              className={s.showAllBtn}
            >
              ВСЕ ПОБЕДИТЕЛИ
            </button>
          )}
      </div>
    </div>
  );
}

export default ResultsPage;
