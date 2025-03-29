import React, { useEffect, useState } from "react";
import s from "./JouryChecking.module.sass";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../axios";
import StarRating from "../../components/StarRating/StarRating";

import lgThumbnail from "lightgallery/plugins/thumbnail";
// Импорт стилей
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import LightGallery from "lightgallery/react";

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
  const [juryRatingsText, setJuryRatingsText] = useState([]);
  console.log("CRITERIA", criteria);

  const [grades, setGrades] = useState();

  const [juryRatings, setJuryRatings] = useState([]); // Массив с объектами { juryId, rating }
  const [liked, setLiked] = useState(false);

  const [success, setSuccess] = useState(false);
  const [dis, setBtnDisabled] = useState(true);

  const [count, setCount] = useState(0);
  const [users, setUsers] = useState();
  const [infoCopy, setInfoCopy] = useState(null);
  const toggleInput = (e) => {
    setSuccess(e.target.checked);
  };

  const handleRatingChange = (name, rating, category, projectId) => {
    setJuryRatings((prevRatings) => {
      const existingRating = prevRatings.find(
        (item) =>
          item.name == name &&
          item.category == category &&
          item.projectId == projectId &&
          item.applicationId == applicationId
      );

      if (existingRating) {
        return prevRatings.map((item) =>
          item.name == name &&
          item.category == category &&
          item.projectId == projectId &&
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

  console.log("infoCopy", infoCopy);

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

    return data?.reduce((result, count, index) => {
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
          if (joury?.liked?.includes(applicationId)) {
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
          setInfoCopy(data.application_data.info);
          console.log("ПОРТФ", data);
          let count123 = Array.isArray(data.application_data.countOfProjects)
            ? data.application_data.countOfProjects.length
            : typeof data.application_data.countOfProjects === "number"
            ? data.application_data.countOfProjects
            : 0;
          for (let i = 0; i < count123; i++) {
            setCountProjects((prev) => [
              ...prev,
              data.application_data.info.additionalFields.map(
                (elem) => elem[i]
              ),
            ]);
          }

          const count1 = data.application_data?.countOfProjects;

          if (Number.isInteger(count)) {
            const fields = Array.from({ length: count1 }, (_, i) => ({
              key: `Field ${i + 1}`,
              value: "",
            }));
            setCount(fields);
          } else {
            setCount(count1);
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
              (elem) =>
                elem.applicationId == applicationId && elem.jouryId == id
            );
            console.log("filteredData", data);

            // setJuryRatings(filteredData);
            if (data.length == 0) {
              setGraded(false);
            }
          }
        });
    }
  }, [application]);
  const [selectedImage, setSelectedImage] = useState(null);
  console.log("countProjects", countProjects);
  useEffect(() => {
    if (!applicationId || !id) return;

    axios
      .get(`/users/${id}/jury-ratings`)
      .then((res) => res.data)
      .then((data) => {
        if (data) {
          const filteredData = data.filter(
            (elem) =>
              elem.applicationId == applicationId && elem.jouryId == jouryId
          );

          console.log("Загруженные оценки", filteredData);

          setJuryRatings(filteredData);
          if (filteredData.length === 0) {
            setGraded(false);
          }
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки оценок:", err);
      });
  }, [applicationId, id]);

  const saveGrading = () => {
    if (success) {
      console.log("juryRatings", juryRatings);
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

  useEffect(() => {
    const ratings = juryRatings
      .filter((elem) => elem.jouryId == jouryId)
      .map((elem) => elem.rating);

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;
    setJuryRatingsText(averageRating);
  }, [juryRatings]);

  return (
    <div className={s.container}>
      {access == true && user && (
        <div className={s.innerContainer}>
          {/* <div className={s.crumbs}>
            <img src="/images/fluent_arrow-up-28-filled.svg" alt="" />
            <p onClick={() => navigate(-1)}>Вернуться назад</p>
          </div> */}

          <div className={s.mainSide}>
            <div className={s.left}>
              <div className={s.title}>{user.name}</div>
              <div className={s.specialization}>{user.specialization}</div>
              {/* <div className={s.nomination}>{user.nomination}</div> */}
              <p className={s.soc} style={{ color: "black" }}>
                Город: {user?.city}
              </p>

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
              {application.application_data.awards && (
                <div className={s.row}>
                  <div className={s.bold}>Награды:</div>
                  <div className={s.text}>
                    {application.application_data.awards}
                  </div>
                </div>
              )}
              {/* {application.application_data.info.fields?.map((elem, index) => (
                <div className={s.row} key={index}>
                  <div className={s.bold}>{elem.key}:</div>
                  <div className={s.text}>{elem.value}</div>
                </div>
              ))} */}
            </div>
            <div className={s.right}>
              <img src={user.avatar} alt="" />
            </div>
          </div>
          {application.application_data.info.docs == true &&
            documents &&
            documents.length >= 1 && (
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
            <LightGallery
              plugins={[lgThumbnail]}
              mode="lg-fade"
              // onInit={onInit}
              speed={500}
              pager={true}
              thumbnail={true}
              galleryId={"nature"}
              autoplayFirstVideo={false}
              elementClassNames={s.gallery}
              mobileSettings={{
                controls: false,
                showCloseIcon: false,
                download: false,
                rotate: false,
              }}
            >
              {/* <div> */}
              {infoCopy?.images == true &&
                newPortfolio?.[0] &&
                newPortfolio[0]?.map((file, index) => {
                  const rowIndex = Math.floor(index / 7);
                  const positionInRow = index % 7;
                  const className = positionInRow < 4 ? s.small : s.large;
                  const imageUrl =
                    file instanceof File ? URL.createObjectURL(file) : file;

                  if (imageUrl === "NEW_FILES") return null;

                  return (
                    <a
                      data-lg-size="300-240"
                      key={index}
                      className={`gallery__item`}
                      data-src={imageUrl}
                      data-sub-html={`<p>Фото ${index + 1}</p>`}
                    >
                      <img
                        src={imageUrl}
                        alt="preview"
                        className={"img-responsive"}
                      />
                    </a>
                  );
                })}
              {/* </div> */}
            </LightGallery>
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
            {infoCopy &&
              countProjects &&
              countProjects?.map((project, elem) => (
                <div className={s.project} key={elem}>
                  <div className={s.title}>проект {elem + 1}</div>

                  {/* {project?.map((prj, index) => (
                    <div className={s.row} key={index}>
                      <div className={s.bold}>
                        {countProjects?.[0]?.[index]?.key || "—"}:
                      </div>
                      <div className={s.text}>{prj?.value}</div>
                    </div>
                  ))} */}

                  {showAllPhotos && portfolio?.[elem] && (
                    <div className={s.projects}>
                      <LightGallery
                        plugins={[lgThumbnail]}
                        mode="lg-fade"
                        // onInit={onInit}
                        speed={500}
                        pager={true}
                        thumbnail={true}
                        galleryId={"nature"}
                        autoplayFirstVideo={false}
                        elementClassNames={s.gallery}
                        mobileSettings={{
                          controls: false,
                          showCloseIcon: false,
                          download: false,
                          rotate: false,
                        }}
                      >
                        {/* <div> */}
                        {newPortfolio[
                          infoCopy?.images == true ? elem + 1 : elem
                        ] &&
                          newPortfolio[
                            infoCopy?.images == true ? elem + 1 : elem
                          ]?.map((file, index) => {
                            const rowIndex = Math.floor(index / 7);
                            const positionInRow = index % 7;
                            const className =
                              positionInRow < 4 ? s.small : s.large;
                            const imageUrl =
                              file instanceof File
                                ? URL.createObjectURL(file)
                                : file;

                            if (imageUrl === "NEW_FILES") return null;

                            return (
                              <a
                                data-lg-size="300-240"
                                key={index}
                                className={`gallery__item`}
                                data-src={imageUrl}
                                data-sub-html={`<p>Фото ${index + 1}</p>`}
                              >
                                <img
                                  src={imageUrl}
                                  alt="preview"
                                  className={"img-responsive"}
                                />
                              </a>
                            );
                          })}
                        {/* </div> */}
                      </LightGallery>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {videos && videos.length >= 1 && (
            <div className={s.videosBlock}>
              <h1>Видео</h1>
              <div className={s.videos}>
                {videos.map((elem, index) => (
                  <img
                    key={index}
                    className={s.video}
                    src={
                      previews?.[index] ||
                      "https://www.lmfebui.com/assets/images/video-thumbnail.png"
                    }
                    onClick={() => window.open(elem)}
                    alt={`Video preview ${index + 1}`}
                  />
                ))}
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
                  {criteria && criteria.additional.length > 0 && (
                    <h3 className={s.title}>Оценивание за проект {idx + 1}</h3>
                  )}
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
                                jury.name == elem.name &&
                                jury.category == "additional" &&
                                jury.projectId == idx &&
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

            {/* <p>Общая оценка: {Math.round(juryRatingsText)}</p> */}
            <p>Финальная оценка: {juryRatingsText?.toFixed(1)}</p>

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
                <input
                  style={{ width: "50px", height: "50px" }}
                  type="checkbox"
                  onChange={(e) => toggleInput(e)}
                />
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
