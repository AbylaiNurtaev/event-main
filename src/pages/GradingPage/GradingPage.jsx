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

  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const checkJoury = async () => {
      axios
        .post("/loginJoury", { id })
        .then((res) => res.data)
        .then((data) => {
          console.log(data);
          if (data.status == "success") {
            setAccess(true);
            setUser(data);
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
        console.log(
          allNominations
            .filter((nomination) => nomination && nomination.length >= 1)
            .flat()
        );
        setUsers(
          allNominations
            .filter((nomination) => nomination && nomination.length >= 1)
            .flat()
        );
      });
  }, []);

  useEffect(() => {
    let filteredApplications = users?.filter(
      (nomination) =>
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
                высокий уровень премии.
              </div>
            </div>

            <div className={s.boldText}>Правила голосования</div>
            <div className={s.mainInformation}>
              <div className={s.left}>
                — Жюри рейтинга ежегодно формируется из числа лидеров свадебной
                и event индустрии, включая руководителей агентств и признанных
                экспертов среди ведущих, фотографов, видеографов, декораторов и
                стилистов. <br />
                <br />
                <b>— ПЕРВЫЙ ЭТАП</b> оценки осуществляется большим и executive
                жюри в онлайн формате.
                <br />
                <br />
                <b>— ВТОРОЙ ЭТАП</b> — оффлайн встреча, на которой executive
                жюри утверждают первые 10 мест в каждой категории и номинации в
                категории Площадки. Рейтинг формируется исходя из медианного
                значения оценок жюри.
                <br />
                <br />— Жюри оценивают участников исходя из критерий{" "}
                <b>ПО 10-ТИ БАЛЬНОЙ ШКАЛЕ</b> (ниже указаны критерии и
                требования к каждой категории).
              </div>
              <div className={s.right}>
                — каждый член жюри оценивает не менее 100 номинантов. Агентствам
                для оценки доступны все участники, специалистов оценивают только
                свои категории (фотографы-только фотографов, видеографы-только
                видеографов)
                <br />
                <br />— Алгоритмы нашего сайта автоматически предлагают членам
                жюри оцениваютучастников{" "}
                <b>С НАИМЕНЬШИМ КОЛИЧЕСТВОМ ГОЛОСОВ.</b>
                <br />
                <br />— Если по каким-то причинам вы не можете профессионально
                оценить участника-вы имеете{" "}
                <b>ВОЗМОЖНОСТЬ ДОБРОВОЛЬНО ВОЗДЕРЖАТЬСЯ</b> от оценки и
                пропустить участника.
                <br />
                <br />— Голосование в этом году можно провести анонимно или
                открыто. В последнем случае ваше имя, оценки и комментарии будут
                предоставлены номинантам рейтинга.
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
