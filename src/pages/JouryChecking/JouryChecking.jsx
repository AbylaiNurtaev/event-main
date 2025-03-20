import React, { useEffect, useState } from "react";
import s from "./JouryChecking.module.sass";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../axios";
import StarRating from "../../components/StarRating/StarRating";

function JouryChecking() {
  const navigate = useNavigate();
  const { applicationId, id } = useParams();
  const [access, setAccess] = useState(false);
  const [user, setUser] = useState();
  const [application, setApplcation] = useState();
  const [countProjects, setCountProjects] = useState([]);

  const jouryId = localStorage.getItem("id");
  const [showAllPhotos, setShowAllPhotos] = useState(true);

  const [portfolio, setPortfolio] = useState();
  const [graded, setGraded] = useState(true);
  const [documents, setDocuments] = useState();

  const [videos, setVideos] = useState();
  const [previews, setPreviews] = useState();
  const [criteria, setCriteria] = useState();
  const [newPortfolio, setNewPortfolio] = useState();
  console.log("CRITERIA", criteria);

  const [grades, setGrades] = useState();

  const [juryRatings, setJuryRatings] = useState([]); // Массив с объектами { juryId, rating }
  const [liked, setLiked] = useState(false);

  const [success, setSuccess] = useState(true);
  const [dis, setBtnDisabled] = useState(true);

  const toggleInput = (e) => {
    setSuccess(e.target.checked);
  };

  const handleRatingChange = (name, rating, category, projectId) => {
    setJuryRatings((prevRatings) => {
      const existingRating = prevRatings.find(
        (item) =>
          item.name === name &&
          item.category === category &&
          item.projectId === projectId &&
          item.applicationId == applicationId
      );

      if (existingRating) {
        return prevRatings.map((item) =>
          item.name === name &&
          item.category === category &&
          item.projectId === projectId &&
          item.applicationId == applicationId
            ? { ...item, rating, jouryId }
            : item
        );
      } else {
        return [
          ...prevRatings,
          { name, rating, category, projectId, jouryId, applicationId },
        ];
      }
    });
  };

  console.log("juryRate", juryRatings);

  const toggleFavorite = async () => {
    try {
      const action = liked ? "removeFavorite" : "addFavorite";
      const response = await axios.post(`/favorites/${action}`, {
        userId: jouryId,
        link: applicationId,
      });

      if (response.status === 200) {
        setLiked(!liked);
      }
    } catch (error) {
      console.error("Ошибка при изменении состояния избранного:", error);
      alert("Не удалось изменить состояние избранного.");
    }
  };

  const transformData = (data, portfolio) => {
    let portfolioIndex = 0; // Указатель на текущий элемент в портфолио

    return data.reduce((result, count, index) => {
      if (index === 0 && count === null) return result; // Пропускаем первый элемент, если он null

      if (typeof count === "number") {
        // Берем count элементов из портфолио и увеличиваем индекс портфолио
        const images = portfolio?.slice(portfolioIndex, portfolioIndex + count);
        portfolioIndex += count; // Обновляем индекс портфолио
        result.push(images);
      } else {
        // Если элемент null (кроме первого), добавляем пустой массив
        result.push([]);
      }

      return result;
    }, []);
  };

  useEffect(() => {
    axios
      .get("/getDeadline")
      .then((res) => res.data)
      .then((data) => {
        if (data && data.length > 0) {
          const today = new Date();
          const todayFormatted = today.toISOString().split("T")[0]; // "YYYY-MM-DD"
          const deadlineDate = data[data.length - 1].dateJoury;

          if (deadlineDate < todayFormatted) {
            // alert("Сроки подачи заявки истекли")
            setBtnDisabled(true); // Ставим кнопку неактивной, если дата прошла
          } else {
            setBtnDisabled(false); // Активируем кнопку, если дата в будущем
          }
        }
      })
      .catch((error) => {
        console.error("Ошибка при получении данных:", error);
      });
    axios
      .get("/getJouries")
      .then((res) => res.data)
      .then((data) => {
        if (data) {
          let joury = data.find((elem) => elem._id == jouryId);
          console.log("finded Joury", joury);
          if (joury.liked.includes(applicationId)) {
            setLiked(true);
          }

          if (joury) {
            setAccess(true);
          }
        }
      });

    axios
      .post(`/auth/getAllInfo`, { userId: id, application_id: applicationId })
      .then((res) => res.data)
      .then((data) => {
        if (data) {
          setApplcation(data);
          setUser({
            ...data.user,
            portfolio: data.portfolio,
            ...data.application_data,
          });
          let count = data.application_data.imagesCount;

          setDocuments(data.documents);
          setPreviews(data.previews);
          setVideos(data.application_data.videos);

          setPortfolio(transformData(count, data.portfolio));
          setNewPortfolio(data.portfolio);
          console.log("ПОРТФ", data.portfolio);
          for (
            let i = 0;
            i < data.application_data.imagesCount.length - 1;
            i++
          ) {
            setCountProjects((prev) => [
              ...prev,
              data.application_data.info.additionalFields.map(
                (elem) => elem[i]
              ),
            ]);
          }
        }
      });
  }, [id]);

  useEffect(() => {
    axios
      .get("/nom")
      .then((res) => res.data)
      .then((data) => {
        if (data) {
          let nom = data.find(
            (nomination) =>
              nomination._id == application?.application_data.info._id
          );
          if (nom) {
            console.log("NOM", nom.criteria[0]);
            setCriteria(nom.criteria[0]);
          }
        }
      });

    if (application) {
      axios
        .get(`/users/${application.user._id}/jury-ratings`)
        .then((res) => res.data)
        .then((data) => {
          if (data) {
            const filteredData = data.filter(
              (elem) => elem.applicationId == applicationId
            );
            console.log("filteredData", data);

            setJuryRatings(filteredData);
            if (data.length == 0) {
              setGraded(false);
            }
          }
        });
    }
  }, [application]);
  const [selectedImage, setSelectedImage] = useState(null);

  const saveGrading = () => {
    if (success) {
      try {
        axios
          .post(`/users/jury-ratings`, {
            userId: application.user._id,
            ratingData: juryRatings,
            graded,
            applicationId,
          })
          .then((res) => res.data)
          .then((data) => {
            if (data) {
              console.log(data);
              alert("Успешно сохранены оценки");
              window.location.reload();
            }
          });
      } catch (error) {
        alert("Ошибка оценивания");
      }
    } else {
      alert("Поставьте галочку на соглашение ");
    }
  };

  return (
    <div className={s.container}>
      {access == true && user && (
        <div className={s.innerContainer}>
          <div className={s.crumbs}>
            <img src="/images/fluent_arrow-up-28-filled.svg" alt="" />
            <p onClick={() => navigate(-1)}>Вернуться назад</p>
          </div>

          <div className={s.mainSide}>
            <div className={s.left}>
              <div className={s.title}>{user.name}</div>
              <div className={s.specialization}>{user.specialization}</div>
              {/* <div className={s.nomination}>{user.nomination}</div> */}
              <p className={s.soc}>Соцсети:</p>
              {user.instagram && (
                <p
                  className={s.socialMedia}
                  onClick={() => window.open(user.instagram)}
                >
                  Инстаграм
                </p>
              )}
              {user.vk && (
                <p
                  className={s.socialMedia}
                  onClick={() => window.open(user.vk)}
                >
                  Тикток
                </p>
              )}
              {user.youtube && (
                <p
                  className={s.socialMedia}
                  onClick={() => window.open(user.youtube)}
                >
                  Ютуб
                </p>
              )}
              {user.tiktok && (
                <p
                  className={s.socialMedia}
                  onClick={() => window.open(user.tiktok)}
                >
                  Другое
                </p>
              )}
              <p className={s.soc}>Телефон:</p>
              <div className={s.phone}>{user.phone}</div>
              <div className={s.row}>
                <div className={s.bold}>О себе:</div>
                <div className={s.text}>{user.about}</div>
              </div>
              <div className={s.row}>
                <div className={s.bold}>Награды:</div>
                <div className={s.text}>
                  {application.application_data.awards}
                </div>
              </div>
              {application.application_data.info.fields?.map((elem, index) => (
                <div className={s.row} key={index}>
                  <div className={s.bold}>{elem.key}:</div>
                  <div className={s.text}>{elem.value}</div>
                </div>
              ))}
            </div>
            <div className={s.right}>
              <img src={user.avatar} alt="" />
            </div>
          </div>
          {documents && documents.length >= 1 && (
            <div className={s.documents}>
              <h2>Приложенные документы</h2>
              {documents.map((elem, index) => (
                <div className={s.document} onClick={() => window.open(elem)}>
                  Документ {index + 1}
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
              marginTop: "200px",
            }}
          >
            {newPortfolio[0] &&
              newPortfolio[0].map((file, index) => (
                <img
                  key={index}
                  src={file}
                  alt="preview"
                  className={s.previewImage}
                  onClick={() => setSelectedImage(file)}
                  style={{
                    cursor: "pointer",
                    width: "300px",
                    height: "300px",
                    objectFit: "cover",

                    transition: "transform 0.2s ease-in-out",
                  }}
                />
              ))}
          </div>
          {selectedImage && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
              onClick={() => setSelectedImage(null)}
            >
              <img
                src={selectedImage}
                alt="Enlarged Preview"
                style={{
                  maxWidth: "90%",
                  maxHeight: "90%",
                  borderRadius: "10px",
                }}
              />
            </div>
          )}

          <div className={s.projects}>
            {countProjects &&
              countProjects.map((project, elem) => (
                <div className={s.project} key={elem}>
                  <div className={s.redTitle}>проект {elem + 1}</div>
                  <div className={s.title}>
                    {application.application_data.nomination}
                  </div>
                  {project.map((prj, index) => (
                    <div className={s.row} key={index}>
                      <div className={s.bold}>
                        {countProjects[0][index].key}:
                      </div>
                      <div className={s.text}>{prj?.value}</div>
                    </div>
                  ))}
                  {showAllPhotos && portfolio[elem] && (
                    <div className={s.projects}>
                      {newPortfolio[elem + 1] &&
                        newPortfolio[elem + 1].map((file, index) => (
                          <img
                            src={file}
                            alt="preview"
                            // className={s.previewImage}
                            style={{
                              width: "200px",
                              objectFit: "contain",
                              cursor: "pointer",

                              transition: "transform 0.2s ease-in-out",
                            }}
                            onClick={() => setSelectedImage(file)}
                          />
                        ))}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {videos &&
            videos.length >= 1 &&
            previews &&
            previews.length >= videos.length && (
              <div className={s.videosBlock}>
                <h1>Видео</h1>
                <div className={s.videos}>
                  {videos.map((elem, index) =>
                    previews[index] ? (
                      <img
                        key={index}
                        className={s.video}
                        src={previews[index]}
                        onClick={() => window.open(elem)}
                        alt={`Video preview ${index + 1}`}
                      />
                    ) : null
                  )}
                </div>
              </div>
            )}

          <div className={s.grading}>
            <button
              className={liked ? s.likedButton : s.defaultButton}
              onClick={toggleFavorite}
            >
              {liked ? "Убрать из избранного" : "Добавить в избранное"}
            </button>
            {!dis ? (
              <>
                <h1 className={s.title}>Голосование</h1>
                <h3 className={s.title}>Основное оценивание</h3>
              </>
            ) : (
              <h1 className={s.title}>Сроки голосования истекли</h1>
            )}
            {!dis &&
              criteria &&
              criteria.main &&
              criteria.main.map((elem, index) => (
                <div key={index} className={s.main}>
                  <p>{elem.name}</p>
                  <StarRating
                    currentRating={
                      juryRatings.find(
                        (jury) =>
                          jury.name === elem.name &&
                          jury.category === "main" &&
                          jury.applicationId == applicationId
                      )?.rating || 0
                    }
                    onRate={(rating) =>
                      handleRatingChange(elem.name, rating, "main", index)
                    }
                  />
                </div>
              ))}
            {!dis &&
              countProjects &&
              countProjects.map((prj, idx) => (
                <div className={s.prj}>
                  <h3 className={s.title}>Оценивание за проект {idx + 1}</h3>
                  {criteria &&
                    criteria.additional &&
                    criteria.additional.map((elem, index) => (
                      <div key={index} className={s.main}>
                        <p>{elem.name}</p>
                        <StarRating
                          name={elem.name}
                          currentRating={
                            juryRatings.find(
                              (jury) =>
                                jury.name === elem.name &&
                                jury.category === "additional" &&
                                jury.projectId === idx &&
                                jury.applicationId == applicationId
                            )?.rating || 0
                          }
                          onRate={(rating) =>
                            handleRatingChange(
                              elem.name,
                              rating,
                              "additional",
                              idx
                            )
                          }
                        />
                      </div>
                    ))}
                </div>
              ))}

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              {!dis && (
                <input type="checkbox" onChange={(e) => toggleInput(e)} />
              )}
              {!dis && (
                <p>
                  Ставя галочку, вы подтверждаете, что все данные,
                  предоставленные для оценки номинаций, остаются строго
                  конфиденциальными и не подлежат разглашению третьим лицам.
                </p>
              )}
            </div>

            {!dis && <button onClick={saveGrading}>Оценить</button>}
          </div>
        </div>
      )}
    </div>
  );
}

export default JouryChecking;
