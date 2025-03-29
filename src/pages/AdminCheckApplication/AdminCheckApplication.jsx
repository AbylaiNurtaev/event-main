import React, { useEffect, useState } from "react";
import s from "./AdminCheckApplication.module.sass";
import { useNavigate, useParams } from "react-router-dom";
import Questions from "../../components/Questions/Questions";
import axios from "../../axios";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import LightGallery from "lightgallery/react";

// Импорт плагинов
import lgZoom from "lightgallery/plugins/zoom";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import fjGallery from "flickr-justified-gallery";

// Импорт стилей
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import StarRating from "../../components/StarRating/StarRating";

function AdminCheckApplication() {
  // useEffect(() => {
  //   fjGallery(document.querySelectorAll(".gallery"), {
  //     itemSelector: ".gallery__item",
  //     rowHeight: 180,
  //     lastRow: "start",
  //     gutter: 2,
  //     rowHeightTolerance: 0.1,
  //     calculateItemsHeight: false,
  //   });
  // }, []);
  const navigate = useNavigate();
  const { applicationId, id } = useParams();

  const [infoCopy, setInfoCopy] = useState();
  const [countProjects, setCountProjects] = useState([]);
  const [criteria, setCriteria] = useState();

  const [application, setApplication] = useState();
  const [juryRatings, setJuryRatings] = useState([]);
  const [graded, setGraded] = useState(false);

  const { jouryId } = useParams();

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

  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });

    axios
      .get("/nom")
      .then((res) => res.data)
      .then((data) => {
        setNominationsSettings(data);
        console.log("settings", data);
        const uniqueCategories = [
          ...new Set(data.map((item) => item.nomination[0])),
        ];
        setNominations(uniqueCategories);
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
        if (application && application.user._id) {
          axios
            .get(`/users/${application.user._id}/jury-ratings`)
            .then((res) => res.data)
            .then((data) => {
              if (data) {
                const filteredData = data.filter(
                  (elem) =>
                    elem.applicationId == applicationId &&
                    elem.jouryId == jouryId
                );
                console.log("filteredData", data);

                setJuryRatings(filteredData);
                if (data.length == 0) {
                  setGraded(false);
                }
              }
            });
        }
      });
  }, [applicationId, id, application]);
  const [isNew, setIsNew] = useState(true);
  console.log(juryRatings, "juryRatings");

  useEffect(() => {
    if (applicationId != "new") {
      setIsNew(false);
      const userId = id;
      axios
        .post("/auth/getAllInfo", {
          userId,
          application_id: applicationId,
        })
        .then((res) => res.data)
        .then((data) => {
          setLogo(data.user.logo);
          setPhoto(data.user.avatar);
          setDocuments(data.documents || []);
          setPreviews(data.previews);
          setVideos(data.application_data.videos);
          setApplication(data);
          console.log(
            "data.application_data.countOfProjects",
            data.application_data.countOfProjects
          );

          setAdditionalFields([]);
          const count = data.application_data?.countOfProjects;

          if (Number.isInteger(count)) {
            const fields = Array.from({ length: count }, (_, i) => ({
              key: `Field ${i + 1}`,
              value: "",
            }));
            setCountProjects(fields);
          } else {
            setCountProjects(count);
          }
          for (let i = 0; i < data.application_data.countOfProjects; i++) {
            setAdditionalFields((prev) => [{ key: "key" + i }, ...prev]);
          }

          const photos = data.portfolio;
          const counts = data.application_data.imagesCount;
          console.log("counts from useEffect", counts);
          setImagesCount(counts);
          const result = groupPhotos(photos, counts);
          setSelectedFiles(result);
          console.log("PORTFOLIO", data.portfolio);
          setNewPortfolio(data.portfolio);
        })
        .catch((err) => console.log(err));
      axios
        .post("/getApplication", {
          id: userId,
          application_id: applicationId,
        })
        .then((res) => res.data)
        .then((data) => {
          setAbout(data.application_data.about);
          setSpecialization(data.application_data.specialization);
          setFullName(data.application_data.fullName);
          setNomination(data.application_data.nomination);
          setCity(data.application_data.city);
          setWebsite(data.application_data.website);
          setPhone(data.application_data.phone);
          setService(data.application_data.about);
          setAwards(data.application_data.awards);
          setInstagram(data.application_data.instagram);
          setVk(data.application_data.vk);
          setYoutube(data.application_data.youtube);
          const count = data.application_data?.countOfProjects;

          if (Number.isInteger(count)) {
            const fields = Array.from({ length: count }, (_, i) => ({
              key: `Field ${i + 1}`,
              value: "",
            }));
            setCountProjects(fields);
          } else {
            setCountProjects(count);
          }
          setTiktok(data.application_data.tiktok);
          setInfo(data.application_data.info);
          setInfoCopy(data.application_data.info);
          console.log("data.application_data.info", data.application_data.info);
          setAdditionalFields(data.application_data.info.additionalFields);
        })
        .catch((err) => console.log(err));
    }
  }, [applicationId, id]);

  const [btnDisabled, setBtnDisabled] = useState(true);
  const [newPortfolio, setNewPortfolio] = useState([]);
  useEffect(() => {
    axios
      .post("/auth/getBalance", { id })
      .then((res) => res.data)
      .then((data) => {
        if (data.message == "success") {
          setBtnDisabled(false);
          axios
            .get("/getDeadline")
            .then((res) => res.data)
            .then((data) => {
              if (data && data.length > 0) {
                const today = new Date();
                const todayFormatted = today.toISOString().split("T")[0]; // "YYYY-MM-DD"
                const deadlineDate = data[data.length - 1].date;
                console.log("TRUE болуы керек", deadlineDate < todayFormatted);

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
        } else if (data.message == "no money") {
          setBtnDisabled(true);
        }
      });
  }, [applicationId, id]);

  const [nominations, setNominations] = useState();
  const [nominationsSettings, setNominationsSettings] = useState();

  // Состояния для всех полей формы
  const [nomination, setNomination] = useState("");
  const [specialization, setSpecialization] = useState("Декоратор");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [logo, setLogo] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [awards, setAwards] = useState("");
  const [service, setService] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [vk, setVk] = useState("");
  const [tiktok, setTiktok] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedNewFiles, setSelectedNewFiles] = useState([]);
  const [error, setError] = useState("");
  const [videos, setVideos] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [newVideos, setNewVideos] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [checkbox, setCheckBox] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [imagesCount, setImagesCount] = useState();

  const application_id = Date.now();
  const [info, setInfo] = useState();
  const [inputIdx, setInputIdx] = useState(1);

  const deleteVideo = (indexToRemove) => {
    const id = id;
    axios
      .delete(`/api/removePreview/${id}/${applicationId}/${indexToRemove}`)
      .then((res) => res.data)
      .then((data) => console.log(data))
      .catch((err) => console.log(err));

    // Создаем новый массив, исключая элемент с индексом indexToRemove
    const newArray = videos.filter((_, index) => index !== indexToRemove);
    setVideos(newArray);
    const newArrayPreview = previews.filter(
      (_, index) => index !== indexToRemove
    );
    setPreviews(newArrayPreview);
  };

  const deleteNewVideo = (indexToRemove) => {
    // Создаем новый массив, исключая элемент с индексом indexToRemove
    const newArray = newVideos.filter((_, index) => index !== indexToRemove);
    setNewVideos(newArray);
    const newArrayPreview = newPreviews.filter(
      (_, index) => index !== indexToRemove
    );
    setNewPreviews(newArrayPreview);
  };

  const handleChange = (e, setter) => {
    setter(e.target.value);
  };
  useEffect(() => {
    if (nominationsSettings && nominationsSettings.length > 0) {
      // Проверяем, если info пустой
      if (!info || Object.keys(info).length === 0) {
        const currentNomination = nominationsSettings[0]; // Берем первый элемент в списке
        // console.log("ТЕКУЩАЯ НОМИНАЦИЯ", currentNomination);

        if (isNew) setInfo(JSON.parse(JSON.stringify(currentNomination))); // Глубокое копирование
        setInfoCopy(JSON.parse(JSON.stringify(currentNomination))); // Глубокое копирование
      } else {
        // Если info не пустой, ищем текущую номинацию по значению nomination
        const currentNomination = nominationsSettings.find(
          (elem) =>
            elem.nomination[0].toLowerCase() === nomination.toLowerCase()
        );

        if (currentNomination) {
          console.log("ТЕКУЩАЯ НОМИНАЦИЯ", currentNomination);
          if (isNew) {
            setInfo(JSON.parse(JSON.stringify(currentNomination))); // Глубокое копирование
            setInfoCopy(JSON.parse(JSON.stringify(currentNomination))); // Глубокое копирование
          }
          // if(applicationId != 'new'){
          //     axios.post('/auth/getAllInfo', {
          //         userId,
          //         application_id: applicationId
          //     })
          //     .then((res) => res.data)
          //     .then(data => {

          //     })
          // }
        } else {
          console.warn("Номинация не найдена:", nomination);
        }
      }
    } else {
      console.warn("nominationsSettings пустой или не загружен");
    }
  }, [nomination, nominationsSettings, applicationId, id]); // Убираем info из зависимостей

  const handleChangeVideos = (e, idx) => {
    const value = e.target.value;
    const updatedTitles = [...videos]; // Создаем новый массив
    updatedTitles[idx] = value; // Обновляем нужный элемент
    setVideos(updatedTitles); // Обновляем состояние
  };

  const handleChangeNewVideos = (e, idx) => {
    const value = e.target.value;
    const updatedTitles = [...newVideos]; // Создаем новый массив
    updatedTitles[idx] = value; // Обновляем нужный элемент
    setNewVideos(updatedTitles); // Обновляем состояние
  };

  const handleFileUpload = async (e, setter, type) => {
    setter("/images/loadingGif.gif");
    const id = id;
    if (id) {
      const file = e.target.files[0];
      e.preventDefault();

      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", type); // Указываем тип (avatar или logo)

      await axios.post(`/uploadFile/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await axios
        .post("/auth/getUser", { userId: id, type })
        .then((res) => res.data)
        .then((data) => {
          console.log(data);
          setter(type == "avatar" ? data.avatar : data.logo); // Устанавливаем аватар или логотип
        });
    } else {
      alert("Просим вас авторизоваться");
    }
  };

  const handleChangeImageCount = (array, index, imageCount) => {
    // Если array не является массивом, инициализируем его как пустой массив
    const updatedArray = Array.isArray(array) ? [...array] : [];

    // Если значение по этому индексу уже есть, то добавляем к нему imageCount
    updatedArray[index] = (updatedArray[index] || 0) + imageCount;

    console.log("updatedArray", updatedArray);
    setImagesCount(updatedArray); // Обновляем состояние массива
  };

  const handleFileSelection = (e, idd) => {
    const files = Array.from(e.target.files);
    let index = idd;

    if (idd !== 0) {
      const str = idd;
      const matchedNumber = str.match(/\d+/); // находим число
      index = matchedNumber ? parseInt(matchedNumber[0], 10) + 1 : 0; // преобразуем в число и увеличиваем на 1
    }
    console.log("INDEX", index);
    handleChangeImageCount(imagesCount, index, files.length);
    // Ограничиваем количество файлов и их размер
    const validFiles = files.filter((file) => {
      const isValidSize = file.size <= 2 * 1024 * 1024; // Размер файла не более 2MB
      const isValidType = ["image/jpeg", "image/png"].includes(file.type); // Только .png и .jpg
      return isValidSize && isValidType;
    });

    // Ограничение на количество файлов
    if (validFiles.length + selectedFiles[index]?.length > 50) {
      setError("Вы не можете загрузить более 50 файлов.");
      return;
    }

    // Обновляем проект с нужным индексом
    setSelectedNewFiles((prevFiles) => {
      const updatedFiles = [...prevFiles]; // Копируем старый массив проектов
      updatedFiles[index] = [...(updatedFiles[index] || []), ...validFiles]; // Добавляем файлы в нужный проект
      return updatedFiles;
    });

    setError("");
  };

  // Функция для отправки файлов на сервер
  const handleSubmit = async () => {
    const id = id;

    if (selectedNewFiles.length === 0) {
      setError("Пожалуйста, выберите хотя бы один файл.");
      return;
    }

    const formData = new FormData();

    selectedNewFiles.forEach((file) => {
      for (let i = 0; i < file?.length; i++) {
        formData.append("images", file[i]);
      }
    }); // Добавляем файлы в FormData
    if (isNew) {
      formData.append("application_id", application_id);
    } else {
      formData.append("application_id", applicationId);
    }
    try {
      const response = await axios.post(
        `/api/uploadPortfolio/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Файлы успешно загружены:", response.data);
    } catch (error) {
      console.error("Ошибка загрузки файлов:", error);
    }
  };

  function groupPhotos(photos, counts) {
    let groupedPhotos = [];
    let currentIndex = 0;

    for (let count of counts) {
      // Извлекаем подмассив фотографий на основе числа в counts
      let group = photos.slice(currentIndex, currentIndex + count);
      groupedPhotos.push(group);

      // Обновляем текущий индекс для следующей группы
      currentIndex += count;
    }

    return groupedPhotos;
  }

  const deleteAdditionalInf = (index) => {
    let infoCopy1 = [...countProjects];
    infoCopy1.splice(index, 1);
    // Если необходимо сохранить изменения в original массиве
    console.log("infoCopy1", infoCopy1);
    setAdditionalFields(infoCopy1);
    setCountProjects(infoCopy1);
  };

  const handleSubmitDocuments = async () => {
    const id = id;

    if (newDocuments.length > 0) {
      const formData = new FormData();
      newDocuments.forEach(
        (file) => formData.append("documents", file)
        // formData.append('documentNames', file.name)
      ); // Добавляем файлы в FormData
      if (isNew) {
        formData.append("application_id", application_id);
      } else {
        formData.append("application_id", applicationId);
      }
      try {
        const response = await axios
          .post(`/api/uploadDocuments/${id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => res.data)
          .then((data) => console.log("ДОКУМЕНТЫ", data));
        console.log("Файлы успешно загружены:", response.data);
      } catch (error) {
        console.error("Ошибка загрузки файлов:", error);
      }
    }
  };

  const handlePreviewSelection = (e) => {
    const newFile = e.target.files[0];
    setPreviews((prevFiles) => {
      // Проверяем, является ли prevFiles массивом
      if (Array.isArray(prevFiles)) {
        return [...prevFiles, newFile];
      }
      // Если по какой-то причине prevFiles не массив, возвращаем новый массив с файлом
      return [newFile];
    });
  };

  const handleNewPreviewSelection = (e) => {
    setNewPreviews((prevFiles) => [...prevFiles, e.target.files[0]]); // Добавляем новые файлы к списку
  };

  // Функция для отправки файлов на сервер
  const handleSubmitPreview = async () => {
    const id = id;

    const formData = new FormData();
    if (newPreviews && newPreviews.length >= 1) {
      newPreviews.forEach((file) => formData.append("images", file)); // Добавляем файлы в FormData
    }
    if (isNew) {
      formData.append("application_id", application_id);
    } else {
      formData.append("application_id", applicationId);
    }
    try {
      const response = await axios.post(`/api/uploadPreview/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Файлы успешно загружены:", response.data);
    } catch (error) {
      console.error("Ошибка загрузки файлов:", error);
    }
  };

  const handleCheckBox = (e) => {
    setCheckBox((prev) => !prev);
  };
  const [newDocuments, setNewDocuments] = useState([]);
  const handleDocumentChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (documents && documents.length + selectedFiles.length > 10) {
      alert("Вы можете загрузить не более 10 файлов.");
      return;
    }
    setNewDocuments((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleDocumentRemove = (index) => {
    const id = id;
    setDocuments((prevFiles) => prevFiles.filter((_, i) => i !== index));
    if (!isNew) {
      axios
        .delete(`/api/deleteDocument/${id}/${applicationId}/${index}`)
        .then((res) => res.data)
        .then((data) => console.log("Удаление ", data))
        .catch((err) => console.log(err));
    }
  };
  const handleNewDocumentRemove = (index) => {
    setNewDocuments((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const [additionalFields, setAdditionalFields] = useState([]);

  const addAdditionalField = () => {
    setAdditionalFields((prev) => [
      ...prev,
      { key: `Field ${prev.length + 1}`, value: "" }, // Добавляем новый объект с ключом и пустым значением
    ]);
    setCountProjects((prev) => [
      ...prev,
      { key: `Field ${prev.length + 1}`, value: "" }, // Добавляем новый объект с ключом и пустым значением
    ]);
  };

  console.log(imagesCount);

  const SENDINFORMATION = async () => {
    if (btnDisabled) {
      alert("Пополните баланс");
    } else {
      const id = id;

      if (checkbox) {
        setDisabled(true);
        await handleSubmit();
        await handleSubmitPreview();
        await handleSubmitDocuments();

        if (isNew) {
          await axios
            .post("/createApplication", {
              application: {
                nomination,
                specialization,
                fullName,
                city,
                logo,
                photo,
                website,
                phone,
                // about,
                awards,
                service,
                instagram,
                youtube,
                tiktok,
                vk,
                videos: [...videos, ...newVideos],
                info: infoCopy,
                imagesCount,
                countOfProjects: additionalFields.length,
                // portfolio: selectedFiles
              },
              application_id: `${application_id}`,
              id: id,
              isNew,
            })
            .then((res) => {
              alert("Ваша заявка успешно отправлена");
              setDisabled(false);
              window.location.href = window.location.href;
            });
        } else {
          await axios
            .post("/updateApplication", {
              application: {
                nomination,
                specialization,
                fullName,
                city,
                logo,
                photo,
                website,
                phone,
                // about,
                awards,
                service,
                instagram,
                youtube,
                tiktok,
                vk,
                countOfProjects: additionalFields.length,
                videos: [...videos, ...newVideos],
                info: infoCopy,
                imagesCount,
                // portfolio: selectedFiles
              },
              application_id: `${applicationId}`,
              id: id,
            })
            .then((res) => {
              alert("Ваша заявка успешно обновлена");
              setDisabled(false);
              window.location.href = window.location.href;
            });
        }
      } else {
        alert("Подтвердите своё согласие на публикацию");
      }
    }
  };

  const handleRemoveImage = (array, index) => {
    const updatedArray = [...array]; // Создаем копию массива

    // Уменьшаем значение по указанному индексу, если оно больше 0
    if (updatedArray[index] > 0) {
      updatedArray[index] = updatedArray[index] - 1;
    }

    console.log("updatedArray after removal:", updatedArray);
    setImagesCount(updatedArray); // Обновляем состояние массива
  };
  const [isOpen, setIsOpen] = useState(false);

  const deletePortfolioImage = (projectIndex, fileIndex) => {
    // const id = id
    // // Считаем общий индекс элемента
    // const totalFileIndex = selectedFiles.slice(0, projectIndex).reduce((total, project) => total + project.length, 0) + fileIndex;
    // // Убираем файл по индексу из интерфейса
    // handleRemoveImage(imagesCount, projectIndex);
    // // Обновляем состояние файлов
    // setSelectedFiles((prevFiles) =>
    //     prevFiles.map((project, idx) => {
    //         if (idx === projectIndex) {
    //             // Убираем файл по индексу из проекта
    //             return project.filter((file, fIdx) => fIdx !== fileIndex);
    //         }
    //         return project; // Оставляем остальные проекты без изменений
    //     })
    // );
    // // Удаляем файл с сервера
    // axios.delete(`/api/deletePortfolio/${id}/${applicationId}/${totalFileIndex}`)
    //     .then((res) => res.data)
    //     .then(data => console.log("УДАЛЕНИЕ", data))
    //     .catch((err) => console.log(err));
  };

  const deleteNewPortfolioImage = (projectIndex, fileIndex) => {
    // handleRemoveImage(imagesCount, projectIndex)
    // setSelectedNewFiles((prevFiles) =>
    //     prevFiles.map((project, idx) => {
    //         if (idx === projectIndex) {
    //             // Убираем файл по индексу из проекта
    //             return project.filter((file, fIdx) => fIdx !== fileIndex);
    //         }
    //         return project; // Оставляем остальные проекты без изменений
    //     })
    // );
  };

  console.log("additionalFields", additionalFields);

  const handleFieldChange = (index, e) => {
    if (!infoCopy || !infoCopy.fields) {
      console.error("Поля не найдены в объекте infoCopy");
      return;
    }

    const updatedFields = [...infoCopy.fields];

    // Обновляем значение для конкретного поля
    updatedFields[index] = {
      ...updatedFields[index],
      value: e.target.value,
    };

    // Обновляем состояние с новыми значениями полей
    setInfoCopy({
      ...infoCopy,
      fields: updatedFields,
    });
  };

  console.log("last", infoCopy);
  const handleAddFieldChange = (outerIndex, innerIndex, e) => {
    setInfoCopy((prevInfo) => {
      if (!prevInfo || !prevInfo.additionalFields) {
        console.error("Проблема с данными в info или additionalFields");
        return prevInfo;
      }

      // Клонируем состояние для безопасного обновления
      const updatedFields = [...prevInfo.additionalFields];

      // Клонируем внутренний массив полей, чтобы не мутировать его напрямую
      const updatedInnerFields = [...updatedFields[outerIndex]];

      // Обновляем конкретное поле по innerIndex
      updatedInnerFields[innerIndex] = {
        ...updatedInnerFields[innerIndex],
        value: e.target.value, // Обновляем только значение
      };

      // Присваиваем обновленный внутренний массив на его место
      updatedFields[outerIndex] = updatedInnerFields;

      return {
        ...prevInfo,
        additionalFields: updatedFields,
      };
    });
    // setAdditionalFields
  };

  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      const transformedPhotos = await Promise.all(
        newPortfolio.map(async (project) => {
          if (project.length === 0) return [];

          const images = await Promise.all(
            project.map(
              (src) =>
                new Promise((resolve) => {
                  const img = new Image();
                  img.src = src;
                  img.onload = () =>
                    resolve({
                      src,
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                    });
                })
            )
          );

          return images;
        })
      );

      setPhotos(transformedPhotos);
    };

    loadImages();
  }, []);
  console.log(photos, "--------");

  return (
    <div className={s.container}>
      <div className={s.innerContainer}>
        <div className={s.crumbs}>
          <img src="/images/fluent_arrow-up-28-filled.svg" alt="" />
          <p onClick={() => navigate(-1)}>Вернуться назад</p>
        </div>
        <div className={s.title}>Заявка на участие</div>
        <div className={s.par}>
          Вы сможете отредактировать текущую заявку позже до наступления
          дедлайна.
        </div>
        <div className={s.boldText}>Основная информация</div>
        <div className={s.mainInformation}>
          <div className={s.block}>
            <p>
              Номинация <span>*</span>{" "}
              {nomination.length == 0 && (
                <span>
                  <br />
                  выберите номинацию *
                </span>
              )}
            </p>
            <div className={s.selectWrapper}>
              {nominations && (
                <select
                  value={nomination}
                  disabled={true}
                  onChange={(e) => handleChange(e, setNomination)}
                >
                  {nominations.map((elem, index) => (
                    <option value={elem}>{elem}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className={s.block}>
            <p>
              Ваша специализация: <span>*</span>{" "}
              {false && (
                <span>
                  <br />
                  заполните обязательное поле *
                </span>
              )}
            </p>
            <div className={s.selectWrapper}>
              <select
                value={specialization}
                disabled={true}
                onChange={(e) => handleChange(e, setSpecialization)}
              >
                <option value="Декоратор">
                  {specialization ? specialization : "не выбрано"}
                </option>
                <option value="Стиль">Стиль</option>
                <option value="Узату той года">Узату той года</option>
                <option value="Фото года">Фото года</option>
                <option value="Стиль">Свадебный фотограф года</option>
                <option value="Локации">Локации</option>
              </select>
            </div>
          </div>
          <div className={s.block}>
            <p>
              Ваши Имя и Фамилия: <span>*</span>{" "}
              {false && (
                <span>
                  <br />
                  заполните обязательное поле *
                </span>
              )}
            </p>
            <input
              type="text"
              disabled={true}
              value={fullName}
              onChange={(e) => handleChange(e, setFullName)}
            />
          </div>
          <div className={s.block}>
            <p>
              Город: <span>*</span>{" "}
              {false && (
                <span>
                  <br />
                  заполните обязательное поле *
                </span>
              )}
            </p>
            <input
              type="text"
              disabled={true}
              value={city}
              onChange={(e) => handleChange(e, setCity)}
            />
          </div>
          <div className={s.block}>
            <p>
              Логотип: <span>*</span>{" "}
              {false && (
                <span>
                  <br />
                  заполните обязательное поле *
                </span>
              )}
            </p>
            <label htmlFor="logo-upload">
              <img
                src={logo ? logo : "/images/male-placeholder-image.jpeg"}
                alt="images"
              />
            </label>
            <input
              type="file"
              disabled={true}
              id="logo-upload"
              accept="image/*"
              hidden={true}
              onChange={(e) => handleFileUpload(e, setLogo, "logo")}
            />
          </div>
          <div className={s.block}>
            <p>
              Ваше фото: <span>*</span>{" "}
              {false && (
                <span>
                  <br />
                  заполните обязательное поле *
                </span>
              )}
            </p>
            <label htmlFor="photo-upload">
              <img
                src={photo ? photo : "/images/male-placeholder-image.jpeg"}
                alt="images"
              />
            </label>
            <input
              type="file"
              disabled={true}
              id="photo-upload"
              accept="image/*"
              hidden={true}
              onChange={(e) => handleFileUpload(e, setPhoto, "avatar")}
            />
          </div>
          <div className={s.block}>
            <p>
              Сайт: <span>*</span>{" "}
              {false && (
                <span>
                  <br />
                  заполните обязательное поле *
                </span>
              )}
            </p>
            <input
              type="text"
              disabled={true}
              value={website}
              onChange={(e) => handleChange(e, setWebsite)}
            />
          </div>
          <div className={s.block}>
            <p>
              Номер телефона: <span>*</span>{" "}
              {false && (
                <span>
                  <br />
                  заполните обязательное поле *
                </span>
              )}
            </p>
            <input
              type="text"
              disabled={true}
              value={phone}
              onChange={(e) => handleChange(e, setPhone)}
            />
          </div>
          {/* <div className={s.block}>
                        <p>о салоне/мастере: <span>*</span> {false && <span><br />заполните обязательное поле *</span>}</p>
                        <input type="text" disabled={true} value={about} onChange={(e) => handleChange(e, setAbout)} />
                    </div> */}
          <div className={s.block}>
            <p>
              Награды и достижения: <span>*</span>{" "}
              {false && (
                <span>
                  <br />
                  заполните обязательное поле *
                </span>
              )}
            </p>
            {awards && awards.length >= 30 ? (
              <textarea
                type="text"
                disabled={true}
                value={awards}
                onChange={(e) => handleChange(e, setAwards)}
              />
            ) : (
              <input
                type="text"
                disabled={true}
                value={awards}
                onChange={(e) => handleChange(e, setAwards)}
              />
            )}
          </div>
          <div className={s.block}>
            <p>
              Сервис для клиентов: <span>*</span>{" "}
              {false && (
                <span>
                  <br />
                  заполните обязательное поле *
                </span>
              )}
            </p>
            <input
              type="text"
              disabled={true}
              value={service}
              onChange={(e) => handleChange(e, setService)}
            />
          </div>
          {info &&
            info.fields &&
            info.fields.map((field, index) => (
              <div key={index} className={s.block}>
                <p>
                  {`${field.key}`}
                  <span> *</span>
                </p>
                {infoCopy?.fields[index]?.value?.length >= 30 ? (
                  <textarea
                    disabled={true}
                    type="text"
                    value={
                      infoCopy.fields && infoCopy.fields[index]
                        ? infoCopy.fields[index].value
                        : ""
                    } // Проверяем, существует ли элемент fields[index]
                    onChange={(e) => handleFieldChange(index, e)}
                  />
                ) : (
                  <input
                    disabled={true}
                    type="text"
                    value={
                      infoCopy.fields && infoCopy.fields[index]
                        ? infoCopy.fields[index].value
                        : ""
                    } // Проверяем, существует ли элемент fields[index]
                    onChange={(e) => handleFieldChange(index, e)}
                  />
                )}
              </div>
            ))}
        </div>
        <div className={s.boldText}>Социальные сети</div>
        <div className={s.socialMedias}>
          <div className={s.block}>
            <p>Ссылка на Instagram: </p>
            <input
              disabled={true}
              value={instagram}
              onChange={(e) => handleChange(e, setInstagram)}
              type="text"
            />
          </div>
          <div className={s.block}>
            <p>Ссылка на Youtube: </p>
            <input
              disabled={true}
              value={youtube}
              type="text"
              onChange={(e) => handleChange(e, setYoutube)}
            />
          </div>
          <div className={s.block}>
            <p>Ссылка на VK: </p>
            <input
              disabled={true}
              value={vk}
              type="text"
              onChange={(e) => handleChange(e, setVk)}
            />
          </div>
          <div className={s.block}>
            <p>Ссылка на TikTok: </p>
            <div className={s.saveBlock}>
              <input
                disabled={true}
                value={tiktok}
                type="text"
                onChange={(e) => handleChange(e, setTiktok)}
              />
            </div>
          </div>
        </div>
        {infoCopy && infoCopy.images && infoCopy.images == true && (
          <label className={s.photosBlock} htmlFor="portfolio">
            <div className={s.boldText}>ФОТОГРАФИИ</div>
            <input
              type="file"
              disabled={true}
              hidden={true}
              multiple
              id="portfolio"
              onChange={(e) => handleFileSelection(e, 0)}
              accept=".png, .jpg"
            />
            <div className={s.inputBlock}>
              <p>Перетащите или нажмите для загрузки фото</p>
              <p>Ограничение не более 50 файлов весом по 2 MB (.png, .jpg)</p>
            </div>
          </label>
        )}
        {error && <div className={s.errorMessage}>{error}</div>}{" "}
        {/* Отображение ошибки */}
        {/* {selectedFiles[0] && selectedFiles[0].length >= 1 && (
          <p>Загруженные файлы:</p>
        )} */}
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
          {infoCopy &&
            infoCopy.images &&
            infoCopy.images == true &&
            newPortfolio[0] &&
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
        {infoCopy?.docs == true && (
          <div className={s.addDocument}>
            <div className={s.boldText}>Документы</div>
            <label htmlFor="document-input" className={s.inputBlock}>
              <p>Перетащите или нажмите для загрузки документов</p>
              <p>Ограничение не более 10 файлов весом по 25 MB (.pdf)</p>
            </label>

            <input
              id="document-input"
              type="file"
              multiple
              accept=".pdf"
              onChange={handleDocumentChange}
              style={{ display: "none" }}
              disabled={true}
            />
            <ul className={s.fileList}>
              {infoCopy?.docs == true &&
                documents &&
                documents.map((file, index) => (
                  <li key={index}>
                    <img src="/images/hugeicons_pdf-02.svg" alt="" />
                    <span onClick={() => (window.location.href = file)}>
                      {typeof file === "string"
                        ? decodeURIComponent(
                            file.split("/").pop().split("?")[0]
                          )
                        : file.name}
                    </span>
                    {isNew ? (
                      <span className={s.size}>
                        {(file.size / (1024 * 1024)).toFixed(2)}MB
                      </span>
                    ) : null}

                    {/* <img className={s.closeBtn} style={!isNew ? {marginLeft: '30px'}: {} } onClick={() => handleDocumentRemove(index)} src="/images/ph_plus-light (1).svg" alt="" /> */}
                  </li>
                ))}
              {newDocuments &&
                newDocuments.map((file, index) => (
                  <li key={index}>
                    <img src="/images/hugeicons_pdf-02.svg" alt="" />
                    <span onClick={() => (window.location.href = file)}>
                      {typeof file === "string"
                        ? decodeURIComponent(
                            file.split("/").pop().split("?")[0]
                          )
                        : file.name}
                    </span>
                    {isNew ? (
                      <span className={s.size}>
                        {(file.size / (1024 * 1024)).toFixed(2)}MB
                      </span>
                    ) : null}

                    <img
                      className={s.closeBtn}
                      style={!isNew ? { marginLeft: "30px" } : {}}
                      onClick={() => handleNewDocumentRemove(index)}
                      src="/images/ph_plus-light (1).svg"
                      alt=""
                    />
                  </li>
                ))}
            </ul>
          </div>
        )}
        {photos?.[0] && photos?.[0].length > 1 && (
          <>
            <p>dsadsa</p>
            <RowsPhotoAlbum photos={photos[0]} />
          </>
        )}
        <div className={s.videosBlock}>
          <div className={s.boldText}>Видео</div>
          {videos &&
            videos.map((elem, index) => (
              <div className={s.videoBlock} key={index}>
                <div className={s.left}>
                  <div className={s.deleteBlock}>
                    <p>Ссылка на видео</p>
                    {/* <p className={s.delete} onClick={() => deleteVideo(index)}>Удалить</p> */}
                  </div>
                  <input
                    onChange={(e) => {
                      handleChangeVideos(e, index);
                    }}
                    value={videos[index]}
                    type="text"
                    placeholder="Youtube, Vimeo"
                  />
                </div>
                <label className={s.right} htmlFor={"prevInput" + index}>
                  {previews?.[index] ? (
                    <img src={previews[index]} alt="" />
                  ) : (
                    <>
                      <p>Превью для видео</p>
                      <p>Вес не более 2 MB (.png, .jpg)</p>
                    </>
                  )}
                </label>
                <input
                  type="file"
                  hidden={true}
                  id={"prevInput" + index}
                  onChange={(e) => handlePreviewSelection(e)}
                  disabled={true}
                />
              </div>
            ))}
          {newVideos &&
            newVideos.map((elem, index) => (
              <div className={s.videoBlock} key={index}>
                <div className={s.left}>
                  <div className={s.deleteBlock}>
                    <p>Ссылка на видео</p>
                    {/* <p className={s.delete} onClick={() => deleteNewVideo(index)}>Удалить</p> */}
                  </div>
                  <input
                    onChange={(e) => {
                      handleChangeNewVideos(e, index);
                    }}
                    value={newVideos[index]}
                    type="text"
                    placeholder="Youtube, Vimeo"
                  />
                </div>
                <label className={s.right} htmlFor={"prevInput2" + index}>
                  {newPreviews[index] ? (
                    <img src={URL.createObjectURL(newPreviews[index])} alt="" />
                  ) : (
                    <>
                      <p>Превью для видео</p>
                      <p>Вес не более 2 MB (.png, .jpg)</p>
                    </>
                  )}
                </label>
                <input
                  type="file"
                  hidden={true}
                  id={"prevInput2" + index}
                  onChange={(e) => handleNewPreviewSelection(e)}
                />
              </div>
            ))}
          <button
            className={s.addBtn}
            disabled={true}
            onClick={() => setNewVideos((prev) => [...prev, ""])}
          >
            <img src="/images/ph_plus-light 11.svg" alt="" />
            Добавить ссылку
          </button>
        </div>
        {additionalFields &&
          countProjects.map((elem, index) => (
            <div className={s.additionalFields} key={index}>
              <h1 className={s.title}>
                {"Проект"} {index + 1}
                <div
                  className={s.delete}
                  onClick={() => deleteAdditionalInf(index)}
                >
                  Удалить
                </div>
              </h1>

              {infoCopy &&
                infoCopy.additionalFields.map((field, idx) => (
                  <div key={`additional-${idx}`} className={s.additionalFields}>
                    <div className={s.block}>
                      <p>
                        {`${field[0].key}`}
                        <span> *</span>
                      </p>
                      {field[index]?.value &&
                      field[index]?.value.length >= 30 ? (
                        <textarea
                          type="text"
                          disabled={true}
                          value={field[index]?.value || ""}
                          onChange={(e) => handleAddFieldChange(idx, index, e)}
                          style={{ height: "200px", lineHeight: "25px" }}
                        />
                      ) : (
                        <input
                          type="text"
                          disabled={true}
                          value={field[index]?.value || ""}
                          onChange={(e) => handleAddFieldChange(idx, index, e)}
                        />
                      )}
                      {/* <input
                        type="text"
                        disabled={true}
                        value={field[index]?.value || ""} // Проверяем существование элемента field[0] и выводим его значение
                        onChange={(e) => handleAddFieldChange(idx, index, e)} // Передаем правильный индекс
                      /> */}
                    </div>
                  </div>
                ))}
              <label className={s.photosBlock} htmlFor={`portfolio${index}`}>
                <div className={s.boldText}>ФОТОГРАФИИ</div>
                <input
                  type="file"
                  hidden={true}
                  disabled={true}
                  multiple
                  id={`portfolio${index}`}
                  onChange={(e) => handleFileSelection(e, `portfolio${index}`)}
                  accept=".png, .jpg"
                />
                <div className={s.inputBlock}>
                  <p>Перетащите или нажмите для загрузки фото</p>
                  <p>
                    Ограничение не более 50 файлов весом по 2 MB (.png, .jpg)
                  </p>
                </div>
              </label>
              <p>Загруженные фотографии</p>
              <div className={s.previewBlock}>
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
                  {infoCopy &&
                    // infoCopy.images &&
                    // infoCopy.images === true &&
                    newPortfolio[
                      infoCopy?.images == true ? index + 1 : index
                    ] &&
                    newPortfolio[
                      infoCopy?.images == true ? index + 1 : index
                    ]?.map((file, index1) => {
                      // Определяем индекс строки
                      const rowIndex = Math.floor(index1 / 7);
                      // Определяем позицию внутри строки
                      const positionInRow = index1 % 7;

                      // Логика для определения классов
                      const className = positionInRow < 4 ? s.small : s.large;

                      // Проверяем, является ли file объектом File или строкой (ссылкой)
                      const imageUrl =
                        file instanceof File ? URL.createObjectURL(file) : file;

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
                </LightGallery>
              </div>
            </div>
          ))}
        {info && info.multipleSelection && (
          <button className={s.addProject} onClick={addAdditionalField}>
            Добавить {info.nameTitle}
          </button>
        )}
        {/* <div className={s.checkboxBlock}>
                    <input type="checkbox" id='access' value={checkbox} onChange={(e) => handleCheckBox(e)} />
                    <label htmlFor='access'> Я подтверждаю своё согласие на публикацию предоставленных данных</label>
                </div> */}
        <div className={s.btnWrapper}>
          {/* <button
        className={s.sendBtn}
        onClick={SENDINFORMATION}
        disabled={disabled || btnDisabled} // Прямое использование свойства "disabled"
        style={(disabled || btnDisabled) ? { backgroundColor: "#DCA9A9", cursor: "default" } : {}}
    >
        {isNew ? <p>ОТПРАВИТЬ ЗАЯВКУ</p> : <p>СОХРАНИТЬ</p>}
        {isNew ? <p>- 1 ед. из вашего баланса</p> : null}
    </button> */}
          {disabled && (
            <img style={{ width: "100px" }} src="/images/loadingGif.gif" />
          )}
        </div>
      </div>

      <div className={s.grading}>
        {jouryId ? (
          <>
            <h1 className={s.title}>Голосование</h1>
            <h3 className={s.title}>Основное оценивание</h3>
          </>
        ) : (
          <></>
        )}
        {criteria &&
          jouryId &&
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
        {jouryId &&
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
                      onRate={(rating) => console.log("not available")}
                    />
                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
}

export default AdminCheckApplication;
