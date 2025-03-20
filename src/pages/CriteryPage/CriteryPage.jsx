import React, { useEffect, useState } from "react";
import s from "./CriteryPage.module.sass";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";

function CriteryPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState(["Все"]);
  const [selectedCategory, setSelectedCategory] = useState("Все"); // выбранная категория
  const [nominations, setNominations] = useState([]); // стейт для всех номинаций
  const [filteredNominations, setFilteredNominations] = useState([]); // стейт для отфильтрованных номинаций
  const [openedPopupIndex, setOpenedPopupIndex] = useState(null);
  const [currentNomination, setCurrentNomination] = useState("");
  const [peoples, setPeoples] = useState();
  const [jouries, setCurrentJouries] = useState();

  const closePopup = () => {
    document.body.style.overflowY = "scroll";
    setOpenedPopupIndex(null);
  };

  useEffect(() => {
    // Фильтрация номинаций по выбранной категории
    if (selectedCategory === "Все") {
      setFilteredNominations(nominations);
    } else {
      setFilteredNominations(
        nominations.filter((nomination) =>
          nomination.category.includes(selectedCategory)
        )
      );
    }
  }, [selectedCategory, nominations]);

  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
    axios
      .get("/getJouriesWithAvatars")
      .then((res) => res.data)
      .then((data) => {
        if (data) {
          setPeoples(data);
        }
      });
  }, []);

  const filteringJouries = (currentNomination) => {
    let jouries = peoples.filter((elem) =>
      elem.acceptedNominations.some((nomination) =>
        nomination.toLowerCase().includes(currentNomination.toLowerCase())
      )
    );
    setCurrentJouries(jouries);

    console.log("Подходящие жюри", jouries);
  };

  const togglePopup = async (index, nomination) => {
    await setCurrentNomination(nomination[0]);
    console.log(nomination);
    filteringJouries(nomination[0]);
    document.body.style.overflowY = "hidden";
    if (openedPopupIndex === index) {
      setOpenedPopupIndex(null); // закрыть, если тот же элемент
    } else {
      setOpenedPopupIndex(index); // открыть попап для определенного элемента
    }
  };

  useEffect(() => {
    // Получение всех номинаций с сервера
    axios.get("/nom").then((res) => {
      const data = res.data;

      // Извлечение уникальных категорий из полученных данных
      const uniqueCategories = [
        ...new Set(data.flatMap((item) => item.category)),
      ];

      // Обновляем состояние с уникальными категориями
      setCategories((prev) => [...new Set([...prev, ...uniqueCategories])]);
      setNominations(data); // сохраняем все номинации
      setFilteredNominations(data); // отображаем все номинации по умолчанию
    });

    // Сброс overflow при размонтировании
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  return (
    <div className={s.container}>
      <div className={s.innerContainer}>
        <div className={s.title}>КРИТЕРИИ</div>
        <p className={s.par}>
          Критерии для участия в премии WEDS помогают нам объективно оценить
          достижения и уровень профессионализма в свадебной индустрии. Они
          разработаны, чтобы подчеркнуть ключевые качества и достижения, которые
          отличают лучших специалистов и компании. Эти критерии позволяют нам не
          только выбрать победителей, но и продемонстрировать высокие стандарты,
          к которым стремится вся индустрия.
        </p>
        <div className={s.row}>
          {categories &&
            categories.map((category, index) => (
              <h5
                key={index}
                className={selectedCategory === category ? s.active : ""}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </h5>
            ))}
        </div>

        <div className={s.blocks}>
          {filteredNominations &&
            filteredNominations.map((elem, index) => (
              <div key={elem._id} className={s.block}>
                <h4 className={s.title}>{elem.nomination}</h4>
                <div className={s.list}>
                  {elem.information &&
                    elem.information.map((elem, i) => (
                      <p key={i} className={s.par1}>
                        - {elem.text}
                      </p>
                    ))}
                </div>
                <button onClick={() => togglePopup(index, elem.nomination)}>
                  ПОДРОБНЕЕ
                </button>
                {openedPopupIndex === index && <div className={s.shadow}></div>}
                {openedPopupIndex === index && (
                  <div className={s.popup}>
                    <div className={s.topSide}>
                      <div className={s.title}>{elem.nomination[0]}</div>
                      <div className={s.right}>
                        <button onClick={() => navigate("/application/new")}>
                          ПОДАТЬ ЗАЯВКУ
                        </button>
                        <img
                          src="/images/Frame 3.svg"
                          onClick={closePopup}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className={s.topMobileSide}>
                      <div className={s.top}>
                        <div className={s.title}>{elem.nomination[0]}</div>
                        <img
                          src="/images/Frame 3.svg"
                          onClick={closePopup}
                          alt=""
                        />
                      </div>
                      <button onClick={() => navigate("/application/new")}>
                        ПОДАТЬ ЗАЯВКУ
                      </button>
                    </div>
                    <div className={s.mainSide}>
                      <div className={s.title}>Критерии и оценки</div>
                      <div
                        className={s.information}
                        style={{ marginTop: "40px" }}
                      >
                        {elem.information &&
                          elem.information.map((item) => (
                            <div>— {item.text}</div>
                          ))}
                        <p className={s.par} style={{ marginTop: "40px" }}>
                          {elem.moreText.split("\n").map((line, index) => (
                            <React.Fragment key={index}>
                              {line}
                              <br />
                            </React.Fragment>
                          ))}
                        </p>
                      </div>
                      {jouries && jouries.length >= 1 && (
                        <div className={s.title}>Оценивающие жюри</div>
                      )}
                      <div className={s.peoples} id="peoples">
                        <div className={s.peoples}>
                          {jouries &&
                            jouries.map((elem, index) => (
                              <div
                                key={index}
                                className={`${s.block} ${
                                  index === currentIndex ? s.active : ""
                                }`}
                                // style={{
                                //   transform: `translateX(${
                                //     (index - currentIndex) * 66.66
                                //   }%)`,
                                // }}
                                onClick={() => navigate(`/joury/${elem._id}`)}
                              >
                                <img src={elem.avatarUrl} alt="" />
                                <h4>{elem.name}</h4>
                                <p>{elem.nomination}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default CriteryPage;
