import React, { useEffect, useState } from "react";
import s from "./GradingPage.module.sass";
import axios from "../../axios";
import { FormControl, Select, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

function GradingPage() {
  const navigate = useNavigate();

  const id = localStorage.getItem("id");
  const [access, setAccess] = useState(false);
  const [user, setUser] = useState();

  const [users, setUsers] = useState();
  const [openedNomination, setOpenedNomination] = useState(null);

  const [applications, setApplications] = useState(null);
  const [jouryId, setJouryId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const checkJoury = async () => {
      setIsLoading(true);
      axios
        .post("/loginJoury", { id })
        .then((res) => res.data)
        .then((data) => {
          console.log(data);
          if (data.status == "success") {
            setAccess(true);
            setUser(data);
            setJouryId(data?._id);
          }
        });
    };

    if (id) {
      checkJoury();
    } else {
      alert("Просим вас авторизоваться");
    }

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
                avatar: user.avatarUrl,
              }))
            : null
        );
        let allNominations_2 = data
          .filter((elem) => elem?.jouryRate.some((rate) => rate?.jouryId == id))
          .map((user) =>
            user.applications
              ? user.applications.map((elem) => {
                  const isChecked = user.jouryRate.some(
                    (rate) =>
                      rate?.jouryId === id &&
                      rate?.applicationId === elem.application_id // сравниваем ID заявки
                  );
                  return {
                    ...elem.application_data,
                    userId: user._id,
                    applicationId: elem.application_id,
                    accepted: elem.accepted,
                    avatar: user.avatarUrl,
                    checked: isChecked,
                  };
                })
              : null
          );

        console.log(
          "AAAAAA",
          allNominations
            .filter((nomination) => nomination && nomination.length >= 1)
            .flat()
        );
        setUsers([
          ...Array.from(
            new Map(
              [
                ...allNominations
                  .filter(
                    (nomination) => nomination && nomination.length >= 1
                    // nomination.accepted == true
                  )
                  .flat(),
                ...allNominations_2
                  .filter(
                    (nomination) => nomination && nomination.length >= 1
                    // nomination.accepted == true
                  )
                  .flat(),
              ].map((item) => [item.applicationId, item])
            ).values()
          ),
        ]);
        setIsLoading(false);
      });
  }, []);

  console.log("applications", applications);
  useEffect(() => {
    let filteredApplications = users?.filter(
      (nomination) =>
        nomination?.nomination &&
        nomination.accepted == true &&
        openedNomination &&
        nomination.nomination.toLowerCase() == openedNomination.toLowerCase()
    );
    setApplications(filteredApplications);
    console.log("filteredApp", filteredApplications);
  }, [openedNomination]);

  const handleChangeNomination = (e) => {
    setOpenedNomination(e.target.value);
  };

  return (
    <>
      {access && (
        <div className={s.container}>
          <div className={s.innerContainer}>
            <div className={s.crumbs}>
              <img src="/images/fluent_arrow-up-28-filled.svg" alt="" />
              <p onClick={() => navigate(-1)}>Вернуться назад</p>
            </div>
            <div className={s.about}>
              <h1>номинанты</h1>
              <div className={s.par}>
                Жюри WEDS — признанные эксперты свадебной индустрии. Их
                профессионализм и независимость гарантируют объективность и
                высокий уровень рейтинга.
              </div>
            </div>

            <div className={s.boldText}>Правила голосования</div>
            <div className={s.mainInformation}>
              <div className={s.left}>
                — Жюри рейтинга формируется ежегодно и включает лидеров
                свадебной и event-индустрии: руководителей агентств, а также
                признанных экспертов среди ведущих, фотографов, видеографов,
                декораторов и стилистов. <br />
                <br />
                <br />— Оценивание проходит в онлайн-формате и осуществляется
                двумя составами жюри: основным и по категориям. Итоговый рейтинг
                рассчитывается на основе медианного значения выставленных
                оценок.
              </div>
              <div className={s.right}>
                — Каждый участник оценивается по четко сформулированным
                критериям по 10-балльной шкале (подробные критерии для каждой
                категории указаны ниже).
                <br />
                <br />— Каждый член жюри оценивает не менее 50 номинантов.
                Руководители агентств голосуют за участников во всех категориях,
                чтобы лучше узнать работу специалистов.
              </div>
            </div>

            <button
              style={{
                width: "200px",
                height: "40px",
                background: "black",
                color: "white",
                fontWeight: "bolder",
                border: "none",
                cursor: "pointer",
                marginTop: "30px",
              }}
              onClick={() => navigate("/likedNominations")}
            >
              Избранные номинации
            </button>

            <div className={s.categories}>
              <div className={s.category}>
                <h3>НОМИНАЦИЯ: </h3>
                {user.acceptedNominations && (
                  <FormControl style={{ width: "400px" }}>
                    <Select
                      id="nomination-select"
                      onChange={(e) => handleChangeNomination(e)}
                      displayEmpty
                      style={{ border: "none", outline: "none" }}
                    >
                      <MenuItem disabled hidden value="">
                        Выберите номинацию
                      </MenuItem>
                      {user.acceptedNominations.map((nomination, index) => (
                        <MenuItem key={index} value={nomination}>
                          {nomination}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </div>
            </div>
            {isLoading && (
              <div className={s.loading}>
                Пожалуйста, подождите...{" "}
                <img
                  style={{ width: "300px" }}
                  src="https://www.icegif.com/wp-content/uploads/2023/07/icegif-1262.gif"
                  alt=""
                />
              </div>
            )}

            <div className={s.applications}>
              {applications?.map((aplication) => (
                <div
                  className={s.application}
                  onClick={() =>
                    window.open(
                      `/jouryChecking/${aplication.applicationId}/${aplication.userId}`,
                      "_blank"
                    )
                  }
                >
                  <img src={aplication.avatar} alt="" />
                  <h4>{aplication.fullName}</h4>
                  <p>{aplication.specialization}</p>
                  {aplication.checked && (
                    <p style={{ color: "green" }}>Оценил</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GradingPage;
