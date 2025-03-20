import React, { useEffect, useState } from "react";
import s from "./OpenedResults.module.sass";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../axios";

function OpenedResults() {
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

  const [selectedImage, setSelectedImage] = useState(null);
  const [videos, setVideos] = useState();
  const [previews, setPreviews] = useState();
  const [criteria, setCriteria] = useState();

  const [grades, setGrades] = useState();

  const [juryRatings, setJuryRatings] = useState([]); // Массив с объектами { juryId, rating }

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

  const transformData = (data, portfolio) => {
    let portfolioIndex = 0; // Указатель на текущий элемент в портфолио
    if (data) {
      return data.reduce((result, count, index) => {
        if (index === 0 && count === null) return result; // Пропускаем первый элемент, если он null

        if (typeof count === "number") {
          // Берем count элементов из портфолио и увеличиваем индекс портфолио
          const images = portfolio.slice(
            portfolioIndex,
            portfolioIndex + count
          );
          portfolioIndex += count; // Обновляем индекс портфолио
          result.push(images);
        } else {
          // Если элемент null (кроме первого), добавляем пустой массив
          result.push([]);
        }

        return result;
      }, []);
    }
  };

  useEffect(() => {
    axios
      .get("/getJouries")
      .then((res) => res.data)
      .then((data) => {
        if (data) {
          let joury = data.find((elem) => elem._id == jouryId);
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
          console.log("current", data);
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

          setPortfolio(data.portfolio);
          if (
            data.application_data.imagesCount &&
            data.application_data.imagesCount.length >= 1
          ) {
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
  console.log(portfolio);

  const saveGrading = () => {
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
  };

  return (
    <div className={s.container}>
      {user && (
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
                  Instagram
                </p>
              )}
              {user.vk && (
                <p
                  className={s.socialMedia}
                  onClick={() => window.open(user.vk)}
                >
                  TikTok
                </p>
              )}
              {user.youtube && (
                <p
                  className={s.socialMedia}
                  onClick={() => window.open(user.youtube)}
                >
                  Youtube
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
                  <div className={s.bold}>{elem?.key}:</div>
                  <div className={s.text}>{elem?.value}</div>
                </div>
              ))}
            </div>
            <div className={s.right}>
              <img src={user.avatar} alt="" />
            </div>
          </div>
          {portfolio[0] && (
            <div className={s.projects}>
              {portfolio[0].map((elem1, index) => (
                <img
                  key={index}
                  src={elem1}
                  style={{ cursor: "pointer" }}
                  alt={`project ${index}`}
                  className={s.fullImage}
                  onClick={() => setSelectedImage(elem1)}
                />
              ))}
            </div>
          )}
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
                      {portfolio[elem + 1].map((elem1, index) => (
                        <img
                          key={index}
                          style={{ cursor: "pointer" }}
                          src={elem1}
                          alt={`project ${index}`}
                          onClick={() => setSelectedImage(elem1)}
                          className={s.fullImage}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {videos && videos.length >= 1 && (
            <div className={s.videosBlock}>
              <h1>Видео</h1>
              <div className={s.videos}>
                {videos &&
                  videos.map((elem, index) => (
                    <img
                      className={s.video}
                      src={previews?.[index]}
                      onClick={() => window.open(elem)}
                    ></img>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OpenedResults;
