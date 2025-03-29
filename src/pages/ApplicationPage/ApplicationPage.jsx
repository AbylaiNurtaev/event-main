import React, { useEffect, useState } from "react";
import s from "./ApplicationPage.module.sass";
import { useNavigate, useParams } from "react-router-dom";
import Questions from "../../components/Questions/Questions";
import axios from "../../axios";
import BalancePopup from "../../components/BalancePopup/BalancePopup";

function ApplicationPage() {
  const navigate = useNavigate();
  const [nomination, setNomination] = useState("");
  const { applicationId } = useParams();

  const [infoCopy, setInfoCopy] = useState();
  const [countProjects, setCountProjects] = useState([]);
  const [btnDisabled, setBtnDisabled] = useState(true);
  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });

    axios
      .get("/nom")
      .then((res) => res.data)
      .then((data) => {
        console.log("settings", data);
        setNominationsSettings(data);
        const uniqueCategories = [
          ...new Set(data.map((item) => item.nomination[0])),
        ];
        setNominations(uniqueCategories);
      });
  }, []);
  const [isNew, setIsNew] = useState(true);
  const [disabled2, setDisabled2] = useState(false);

  useEffect(() => {
    if (applicationId != "new") {
      setIsNew(false);
      setBtnDisabled(false);
      setPopup(false);
      const userId = localStorage.getItem("id");
      axios
        .post("/auth/getAllInfo", {
          userId,
          application_id: applicationId,
        })
        .then((res) => res.data)
        .then((data) => {
          console.log("accepted", data?.accepted);
          if (data?.accepted == true) {
            setDisabled2(true);
          }
          setLogo(data.user.logo);
          setPhoto(data.user.avatar);
          setDocuments(data.documents || []);
          setPreviews(data.previews);
          setVideos(data.application_data.videos);

          setAdditionalFields([]);
          console.log("countOFPRJ", data.application_data.countOfProjects);
          const count = data.application_data?.countOfProjects;

          if (Number.isInteger(count) && count > 0) {
            const fields = Array.from({ length: count }, (_, i) => ({
              key: `Field ${i + 1}`,
              value: "",
            }));
            setCountProjects(fields);
          } else {
            setCountProjects(count);
          }
          // setCountProjects(data.application_data.countOfProjects);
          for (let i = 0; i < data.application_data.countOfProjects; i++) {
            setAdditionalFields((prev) => [{ key: "key" + i }, ...prev]);
          }

          const photos = data.portfolio;
          const counts = data.application_data.imagesCount;
          console.log("counts from useEffect", counts);
          setImagesCount(counts);
          const result = groupPhotos(photos, counts);
          console.log("result", result);
          setSelectedFiles(result);
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

          setTiktok(data.application_data.tiktok);
          setInfo(data.application_data.info);
          setInfoCopy(data.application_data.info);

          setAdditionalFields(data.application_data.info.additionalFields);
          const count = data.application_data?.countOfProjects;

          if (Number.isInteger(count) && count > 0) {
            const fields = Array.from({ length: count }, (_, i) => ({
              key: `Field ${i + 1}`,
              value: "",
            }));
            setCountProjects(fields);
          } else {
            setCountProjects(count);
          }
          // if (
          //   data.application_data.multipleSelection == true ||
          //   data.application_data.multipleSelection == "true"
          // ) {
          //   setCountProjects([]);
          // }
        })
        .catch((err) => console.log(err));
    }
  }, [applicationId]);
  console.log("COUNT COUNT", countProjects);

  useEffect(() => {
    const id = localStorage.getItem("id");
    axios
      .post("/auth/getBalance", { id })
      .then((res) => res.data)
      .then((data) => {
        if (data.message == "success") {
          if (applicationId != "new") {
            setBtnDisabled(false);

            setPopup(false);
          } else {
            setPopup(false);
            setBtnDisabled(false);
          }
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
          if (applicationId != "new") {
            setBtnDisabled(false);
            setPopup(false);
          } else {
            setPopup(true);
            setBtnDisabled(true);
          }
        }
      });

    axios
      .post("/auth/getAllInfoPerson", { userId: id })
      .then((res) => res.data)
      .then((data) => {
        if (data && applicationId == "new") {
          setTiktok(data.tiktok);
          setInstagram(data.instagram);
          setVk(data.vk);
          setYoutube(data.youtube);
          setPhone(data.phone);
          setFullName(data.name);
          setCity(data.city);
          setLogo(data.logo);
          setPhoto(data.avatar);
          setWebsite(data.sait);
        }
      });
  }, []);

  const [nominations, setNominations] = useState();
  const [nominationsSettings, setNominationsSettings] = useState();

  // Состояния для всех полей формы

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
  console.log("newPreviews", previews);

  const [checkbox, setCheckBox] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [imagesCount, setImagesCount] = useState();

  const application_id = Date.now();
  const [info, setInfo] = useState();

  const [newPortfolio, setNewPortfolio] = useState([]);

  const deleteVideo = (indexToRemove) => {
    const id = localStorage.getItem("id");
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
          if (currentNomination.multipleSelection == "one") {
            setCountProjects(["one"]);
          }
          if (isNew) {
            if (currentNomination.multipleSelection == "one") {
              setCountProjects(["one"]);
            }
            setInfo(JSON.parse(JSON.stringify(currentNomination))); // Глубокое копирование
            setInfoCopy(JSON.parse(JSON.stringify(currentNomination))); // Глубокое копирование
          }
        } else {
          console.warn("Номинация не найдена:", nomination);
        }
      }
    } else {
      console.warn("nominationsSettings пустой или не загружен");
    }
  }, [nomination, nominationsSettings]); // Убираем info из зависимостей

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
    const id = localStorage.getItem("id");
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

    setImagesCount(updatedArray); // Обновляем состояние массива
  };

  const handleFileSelection = (e, id) => {
    const files = Array.from(e.target.files);
    let index = id;

    console.log("INDEX PHOTO", index);

    handleChangeImageCount(imagesCount, index, files.length);
    // Ограничиваем количество файлов и их размер
    const validFiles = files.filter((file) => {
      const isValidSize = file.size <= 8 * 1024 * 1024; // Размер файла не более 2MB
      // const isValidType = ["image/jpeg", "image/png"].includes(file.type); // Только .png и .jpg
      return isValidSize;
    });

    // Ограничение на количество файлов
    // if (validFiles.length + selectedFiles[index]?.length > 50) {
    //   setError("Вы не можете загрузить более 50 файлов.");
    //   return;
    // }

    setNewPortfolio((prevPortfolio) => {
      const updatedPortfolio = [...prevPortfolio]; // Копируем старый массив

      if (!updatedPortfolio[index]) {
        updatedPortfolio[index] = []; // Если массива нет, создаем его
      }

      updatedPortfolio[index] = [...updatedPortfolio[index], ...validFiles]; // Добавляем файлы в нужный массив
      return updatedPortfolio;
    });

    console.log("newPortfolio", newPortfolio);
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
    const id = localStorage.getItem("id");

    try {
      const formData = new FormData();
      let orderedPortfolio = []; // Храним все файлы в порядке загрузки
      let newFileIndexes = []; // Храним индексы новых файлов

      const fixedPortfolio = newPortfolio.map((group) =>
        Array.isArray(group) ? group : []
      );

      console.log("newPortfolio перед циклом:", newPortfolio);

      fixedPortfolio.forEach((group, groupIndex) => {
        const groupData = [];

        group.forEach((file, fileIndex) => {
          if (typeof file === "string") {
            groupData.push(file);
          } else {
            formData.append("newImages", file);
            newFileIndexes.push({ groupIndex, fileIndex });
            groupData.push("NEW_FILE");
          }
        });

        orderedPortfolio.push(groupData);
      });

      console.log("ДОШЛОООО");

      formData.append("orderedPortfolio", JSON.stringify(orderedPortfolio));
      formData.append("newFileIndexes", JSON.stringify(newFileIndexes));
      formData.append("application_id", isNew ? application_id : applicationId);

      const response = await axios.post(
        `/api/uploadPortfolio/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // setNewPortfolio(response.data.portfolio);
    } catch (error) {
      console.error("Ошибка загрузки файлов:", error);
    }
  };

  function groupPhotos(photos, counts) {
    let groupedPhotos = [];
    let currentIndex = photos.length; // Начинаем с конца массива

    for (let i = counts.length - 1; i >= 0; i--) {
      let count = counts[i];
      let start = Math.max(0, currentIndex - count); // Убеждаемся, что не выходим за границы
      let group = photos.slice(start, currentIndex);
      groupedPhotos.unshift(group); // Добавляем в начало, чтобы сохранить порядок

      currentIndex = start; // Смещаем индекс
    }

    return groupedPhotos;
  }

  const deleteAdditionalInf = (index) => {
    let infoCopy1 = [...countProjects];
    infoCopy1.splice(index, 1);
    // Если необходимо сохранить изменения в original массиве
    setAdditionalFields(infoCopy1);
    setCountProjects((prev) => prev.filter((_, idx) => idx !== index));
  };
  console.log("disabled", disabled, "btnDisabled", btnDisabled);
  const handleSubmitDocuments = async () => {
    const id = localStorage.getItem("id");

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
      } catch (error) {
        console.error("Ошибка загрузки файлов:", error);
      }
    }
  };

  const handlePreviewSelection = async (e, index) => {
    const userId = localStorage.getItem("id");
    const file = e.target.files?.[0];
    if (!file) return;

    // 1) Обновляем превью в состоянии (для мгновенного отображения)
    setPreviews((prev) => {
      const copy = Array.isArray(prev) ? [...prev] : [];
      copy[index] = file;
      return copy;
    });

    // 2) Если хотите сразу отправлять запрос:
    // Создаём FormData
    const formData = new FormData();
    formData.append("images", file); // multer поле 'images'
    formData.append("application_id", applicationId);
    formData.append("index", index); // <-- Это нужно для $set
    console.log("func");

    try {
      await axios.post(`/api/uploadPreview/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // success
    } catch (e) {
      console.error("Ошибка", e);
    }
  };

  const handleNewPreviewSelection = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewPreviews((prev) => {
      const copy = [...prev];
      copy[index] = file;
      return copy;
    });
  };

  // Функция для отправки файлов на сервер
  const handleSubmitPreview = async () => {
    const id = localStorage.getItem("id");

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
    const id = localStorage.getItem("id");
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
      ...(prev || []),
      { key: `Field ${(prev || []).length + 1}`, value: "" },
    ]);
    setCountProjects((prev) => [
      ...(prev || []),
      { key: `Field ${(prev || []).length + 1}`, value: "" },
    ]);
  };

  const SENDINFORMATION = async () => {
    if (nomination == "") {
      alert("Выберите номинацию");
    } else {
      if (btnDisabled && isNew) {
        alert("Пополните баланс");
      } else {
        const id = localStorage.getItem("id");

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
                  awards,
                  service: "",
                  instagram,
                  youtube,
                  tiktok,
                  vk,
                  videos: [...videos, ...newVideos],
                  info: infoCopy,
                  imagesCount,
                  countOfProjects: countProjects,
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
                  awards,
                  service: "",
                  instagram,
                  youtube,
                  tiktok,
                  vk,
                  countOfProjects: countProjects,
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
    }
  };

  const [popUp, setPopup] = useState(false);

  const handleRemoveImage = (array, index) => {
    const updatedArray = [...array]; // Создаем копию массива

    // Уменьшаем значение по указанному индексу, если оно больше 0
    if (updatedArray[index] > 0) {
      updatedArray[index] = updatedArray[index] - 1;
    }

    console.log("updatedArray after removal:", updatedArray);
    setImagesCount(updatedArray); // Обновляем состояние массива
  };

  const deletePortfolioImage = (sectionIndex, fileIndex) => {
    console.log("Удаление изображения", sectionIndex, fileIndex);
    const id = localStorage.getItem("id");

    // Проверяем, существует ли секция и файл в ней
    if (!newPortfolio[sectionIndex] || !newPortfolio[sectionIndex][fileIndex]) {
      console.error("Ошибка: файл не найден");
      return;
    }

    // Получаем URL или объект файла
    const fileToDelete = newPortfolio[sectionIndex][fileIndex];

    // Обновляем состояние newPortfolio
    setNewPortfolio((prevPortfolio) => {
      return prevPortfolio.map((section, idx) => {
        if (idx === sectionIndex) {
          return section.filter((_, fIdx) => fIdx !== fileIndex);
        }
        return section;
      });
    });

    // Удаляем файл с сервера только если это ссылка (значит, загружено на сервер)
    if (typeof fileToDelete === "string") {
      axios
        .delete(
          `/api/deletePortfolio/${id}/${applicationId}/${sectionIndex}/${fileIndex}`
        )
        .then((res) => console.log("Удаление с сервера:", res.data))
        .catch((err) => console.error("Ошибка удаления:", err));
    }
  };

  const deleteNewPortfolioImage = (projectIndex, fileIndex) => {
    handleRemoveImage(imagesCount, projectIndex);
    setSelectedNewFiles((prevFiles) =>
      prevFiles.map((project, idx) => {
        if (idx === projectIndex) {
          // Убираем файл по индексу из проекта
          return project.filter((file, fIdx) => fIdx !== fileIndex);
        }
        return project; // Оставляем остальные проекты без изменений
      })
    );
  };

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

  useEffect(() => {
    if (nomination != "") {
      setDisabled2(false);
    } else {
      setDisabled2(true);
    }
  }, [nomination]);
  console.log("countProjects", countProjects);

  return (
    <div className={s.container}>
      <div className={s.innerContainer}>
        <div className={s.crumbs} onClick={() => navigate(-1)}>
          <img src="/images/fluent_arrow-up-28-filled.svg" alt="" />
          <p>Вернуться назад</p>
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
              Номинация <span></span>{" "}
              {nomination.length == 0 && (
                <span>
                  <br />
                  выберите номинацию{" "}
                </span>
              )}
            </p>
            <div className={s.selectWrapper}>
              {nominations && (
                <select
                  value={nomination}
                  // disabled={isNew ? false : true}
                  onChange={(e) => handleChange(e, setNomination)}
                >
                  <option value="" disabled selected>
                    Выберите вашу номинацию
                  </option>
                  {[...nominations]
                    .sort((a, b) => a.localeCompare(b)) // Сортировка по алфавиту
                    .map((elem, index) => (
                      <option key={index} value={elem}>
                        {elem}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>
          <div className={s.block}>
            <p>
              Ваша специализация: <span></span>{" "}
              {false && (
                <span>
                  <br />
                  заполните обязательное поле{" "}
                </span>
              )}
            </p>
            <div className={s.selectWrapper}>
              <select
                value={specialization}
                onChange={(e) => handleChange(e, setSpecialization)}
              >
                <option selected value="Декоратор">
                  Декоратор
                </option>
                <option value="Артист">Артист</option>
                <option value="Ведущий">Ведущий</option>
                <option value="Видеограф">Видеограф</option>
                <option value="Визажист">Визажист</option>
                <option value="Организатор">Организатор</option>
                <option value="Площадка (Ресторан)">Площадка (Ресторан)</option>
                <option value="Свадебный салон">Свадебный салон</option>
                <option value="Стилист">Стилист</option>
                <option value="Фотограф">Фотограф</option>
              </select>
            </div>
          </div>
          {infoCopy &&
            infoCopy.nomination[0] &&
            infoCopy.nomination[0] != "Творческий проект года (съемка)" && (
              <>
                <div className={s.block}>
                  <p>
                    Имя/Название: <span></span>{" "}
                    {false && (
                      <span>
                        <br />
                        заполните обязательное поле{" "}
                      </span>
                    )}
                  </p>
                  <input
                    type="text"
                    value={fullName}
                    disabled={disabled2}
                    onChange={(e) => handleChange(e, setFullName)}
                  />
                </div>

                <div className={s.block}>
                  <p>
                    Город: <span></span>{" "}
                    {false && (
                      <span>
                        <br />
                        заполните обязательное поле{" "}
                      </span>
                    )}
                  </p>
                  <input
                    type="text"
                    value={city}
                    disabled={disabled2}
                    onChange={(e) => handleChange(e, setCity)}
                  />
                </div>
                <div className={s.block}>
                  <p>
                    Логотип: <span></span>{" "}
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
                    id="logo-upload"
                    accept="image/*"
                    hidden={true}
                    onChange={(e) => handleFileUpload(e, setLogo, "logo")}
                  />
                </div>
                <div className={s.block}>
                  <p>
                    Ваше фото: <span></span>{" "}
                    {false && (
                      <span>
                        <br />
                        заполните обязательное поле *
                      </span>
                    )}
                  </p>
                  <label htmlFor="photo-upload">
                    <img
                      src={
                        photo ? photo : "/images/male-placeholder-image.jpeg"
                      }
                      alt="images"
                    />
                  </label>
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    hidden={true}
                    onChange={(e) => handleFileUpload(e, setPhoto, "avatar")}
                  />
                </div>
                <div className={s.block}>
                  <p>
                    Сайт: (не обязательно){" "}
                    {false && (
                      <span>
                        <br />
                        заполните обязательное поле *
                      </span>
                    )}
                  </p>
                  <input
                    type="text"
                    value={website}
                    disabled={disabled2}
                    onChange={(e) => handleChange(e, setWebsite)}
                  />
                </div>
                <div className={s.block}>
                  <p>
                    Номер телефона: <span></span>{" "}
                    {false && (
                      <span>
                        <br />
                        заполните обязательное поле *
                      </span>
                    )}
                  </p>
                  <input
                    type="text"
                    value={phone}
                    disabled={disabled2}
                    onChange={(e) => handleChange(e, setPhone)}
                  />
                </div>
                <div className={s.block}>
                  <p>
                    Награды и достижения: <span></span>{" "}
                    {false && (
                      <span>
                        <br />
                        заполните обязательное поле *
                      </span>
                    )}
                  </p>
                  <input
                    disabled={disabled2}
                    type="text"
                    value={awards}
                    onChange={(e) => handleChange(e, setAwards)}
                  />
                </div>
              </>
            )}
          {info &&
            info.fields &&
            info.fields.map((field, index) => (
              <div key={index} className={s.block}>
                <p>
                  {`${field.key}`}
                  <span> </span>
                </p>
                <input
                  type="text"
                  disabled={disabled2}
                  value={
                    infoCopy.fields && infoCopy.fields[index]
                      ? infoCopy.fields[index].value
                      : ""
                  } // Проверяем, существует ли элемент fields[index]
                  onChange={(e) => handleFieldChange(index, e)}
                />
              </div>
            ))}
        </div>
        <div className={s.boldText}>Социальные сети</div>
        <div className={s.socialMedias}>
          <div className={s.block}>
            <p>Ссылка на Instagram: </p>
            <input
              disabled={disabled2}
              value={instagram}
              onChange={(e) => handleChange(e, setInstagram)}
              type="text"
            />
          </div>
          <div className={s.block}>
            <p>Ссылка на TikTok: </p>
            <input
              disabled={disabled2}
              value={youtube}
              type="text"
              onChange={(e) => handleChange(e, setYoutube)}
            />
          </div>
          <div className={s.block}>
            <p>Ссылка на Youtube: </p>
            <input
              value={vk}
              disabled={disabled2}
              type="text"
              onChange={(e) => handleChange(e, setVk)}
            />
          </div>
          <div className={s.block}>
            <p>Другое: </p>
            <div className={s.saveBlock}>
              <input
                value={tiktok}
                disabled={disabled2}
                type="text"
                onChange={(e) => handleChange(e, setTiktok)}
              />
            </div>
          </div>
        </div>
        {infoCopy && infoCopy.images && infoCopy.images == true && (
          <label className={s.photosBlock} htmlFor="portfolio">
            <div className={s.boldText}>ФОТОГРАФИИ</div>
            {infoCopy.imagesText && (
              <p style={{ marginTop: "10px" }}>{infoCopy.imagesText}</p>
            )}
            <div
              className={s.blockImage}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                marginTop: "20px",
              }}
            ></div>
            <input
              type="file"
              hidden={true}
              multiple
              id="portfolio"
              onChange={(e) => handleFileSelection(e, 0)}
              accept=".png, .jpg"
            />
            <div className={s.inputBlock}>
              <p>Перетащите или нажмите для загрузки фото</p>
              <p>Ограничение не более 50 файлов весом по 8 MB (.png, .jpg)</p>
            </div>
          </label>
        )}
        {error && <div className={s.errorMessage}>{error}</div>}{" "}
        <div className={s.previewBlock}>
          {infoCopy &&
            infoCopy.images &&
            infoCopy.images === true &&
            newPortfolio[0] &&
            newPortfolio[0].map((file, index) => {
              // Определяем индекс строки
              const rowIndex = Math.floor(index / 7);
              // Определяем позицию внутри строки
              const positionInRow = index % 7;

              // Логика для определения классов
              const className = positionInRow < 4 ? s.small : s.large;

              // Проверяем, является ли file объектом File или строкой (ссылкой)
              const imageUrl =
                file instanceof File ? URL.createObjectURL(file) : file;

              return (
                <div
                  key={index}
                  className={className}
                  style={imageUrl == "NEW FILES" ? { display: "none" } : {}}
                >
                  <img
                    src={imageUrl}
                    alt="preview"
                    className={s.previewImage}
                  />
                  {!disabled2 && (
                    <img
                      onClick={() => deletePortfolioImage(0, index)}
                      className={s.closeBtn}
                      src="/images/closeBtn.svg"
                      alt="close"
                    />
                  )}
                </div>
              );
            })}
        </div>
        {/* {
                    infoCopy && infoCopy.docs &&
                    infoCopy.docs == true &&  */}
        {infoCopy && infoCopy.docs && infoCopy.docs == true && (
          <div className={s.addDocument}>
            <div className={s.boldText}>Документы</div>
            {infoCopy && infoCopy.docsText && (
              <p style={{ marginTop: "10px" }}>{infoCopy.docsText}</p>
            )}
            <label htmlFor="document-input" className={s.inputBlock}>
              <p>Перетащите или нажмите для загрузки документов</p>
              <p>Ограничение не более 10 файлов весом по 250 MB (.pdf)</p>
            </label>

            <input
              id="document-input"
              type="file"
              multiple
              accept=".pdf"
              onChange={handleDocumentChange}
              style={{ display: "none" }}
            />
            <ul className={s.fileList}>
              {documents.length >= 1 && <p>Загруженные документы: </p>}
              {documents &&
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

                    <img
                      className={s.closeBtn}
                      style={!isNew ? { marginLeft: "30px" } : {}}
                      onClick={() => handleDocumentRemove(index)}
                      src="/images/ph_plus-light (1).svg"
                      alt=""
                    />
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
        {/* } */}
        {infoCopy && infoCopy.videos && infoCopy.videos == true && (
          <div className={s.videosBlock}>
            <div className={s.boldText}>Видео</div>
            {infoCopy.videosText && (
              <p style={{ marginTop: "10px" }}>{infoCopy.videosText}</p>
            )}
            {videos &&
              videos.map((elem, index) => (
                <div className={s.videoBlock} key={index}>
                  <div className={s.left}>
                    <div className={s.deleteBlock}>
                      <p>Ссылка на видео</p>
                      <p
                        className={s.delete}
                        onClick={() => deleteVideo(index)}
                      >
                        Удалить
                      </p>
                    </div>
                    <input
                      disabled={disabled2}
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
                      <img
                        src={
                          previews[index] instanceof File
                            ? URL.createObjectURL(previews[index])
                            : previews[index]
                        }
                        alt=""
                      />
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
                    onChange={(e) => handlePreviewSelection(e, index)}
                  />
                </div>
              ))}
            {newVideos &&
              newVideos.map((elem, index) => (
                <div className={s.videoBlock} key={index}>
                  <div className={s.left}>
                    <div className={s.deleteBlock}>
                      <p>Ссылка на видео</p>
                      <p
                        className={s.delete}
                        onClick={() => deleteNewVideo(index)}
                      >
                        Удалить
                      </p>
                    </div>
                    <input
                      disabled={disabled2}
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
                      <img
                        src={URL.createObjectURL(newPreviews[index])}
                        alt=""
                      />
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
                    onChange={(e) => handleNewPreviewSelection(e, index)}
                  />
                </div>
              ))}
            <button
              className={s.addBtn}
              onClick={() => setNewVideos((prev) => [...prev, ""])}
            >
              <img src="/images/ph_plus-light 11.svg" alt="" />
              Добавить ссылку
            </button>
          </div>
        )}
        {additionalFields &&
          countProjects &&
          countProjects?.map((elem, index) => (
            <div className={s.additionalFields} key={index}>
              <h1 className={s.title}>
                {(infoCopy && infoCopy.nameTitle) || "Проект"} {index + 1}
                <div
                  className={s.delete}
                  onClick={() => deleteAdditionalInf(index)}
                >
                  Удалить
                </div>
              </h1>
              <p className={s.parText} style={{ marginTop: "20px" }}>
                {infoCopy && infoCopy.par}
              </p>

              {infoCopy &&
                infoCopy.additionalFields.map((field, idx) => (
                  <div key={`additional-${idx}`} className={s.additionalFields}>
                    <div className={s.block}>
                      <p>
                        {`${field[0].key}`}
                        <span> *</span>
                      </p>
                      <input
                        disabled={disabled2}
                        type="text"
                        value={field[index]?.value || ""} // Проверяем существование элемента field[0] и выводим его значение
                        onChange={(e) => handleAddFieldChange(idx, index, e)} // Передаем правильный индекс
                      />
                    </div>
                  </div>
                ))}
              <label className={s.photosBlock} htmlFor={index}>
                <div className={s.boldText}>ФОТОГРАФИИ</div>
                <input
                  type="file"
                  hidden={true}
                  multiple
                  id={index}
                  onChange={(e) =>
                    handleFileSelection(
                      e,
                      infoCopy?.images == true ? index + 1 : index
                    )
                  }
                  accept=".png, .jpg"
                />
                <div className={s.inputBlock}>
                  <p>Перетащите или нажмите для загрузки фото</p>
                  <p>
                    Ограничение не более 50 файлов весом по 8 MB фыв(.png, .jpg)
                  </p>
                </div>
              </label>

              <div className={s.previewBlock}>
                {infoCopy &&
                  // infoCopy.images &&
                  // infoCopy.images === true &&
                  newPortfolio[infoCopy?.images == true ? index + 1 : index] &&
                  newPortfolio[
                    infoCopy?.images == true ? index + 1 : index
                  ].map((file, index1) => {
                    const positionInRow = index % 7;

                    // Логика для определения классов
                    const className = positionInRow < 4 ? s.small : s.large;

                    // Проверяем, является ли file объектом File или строкой (ссылкой)
                    const imageUrl =
                      file instanceof File ? URL.createObjectURL(file) : file;

                    return (
                      <div key={index1} className={className}>
                        <img
                          src={imageUrl}
                          alt="preview"
                          className={s.previewImage}
                        />
                        {
                          !disabled2 &&
                        <img
                          onClick={() =>
                            deletePortfolioImage(
                              infoCopy?.images == true ? index + 1 : index,
                              index1
                            )
                          }
                          className={s.closeBtn}
                          src="/images/closeBtn.svg"
                          alt="close"
                        />
                        }
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        {info &&
          (info.multipleSelection == "true" ||
            info.multipleSelection == true) && (
            <button className={s.addProject} onClick={addAdditionalField}>
              Добавить {info.nameTitle}
            </button>
          )}
        <div className={s.checkboxBlock}>
          <input
            type="checkbox"
            id="access"
            value={checkbox}
            onChange={(e) => handleCheckBox(e)}
          />
          <label htmlFor="access">
            {" "}
            Я подтверждаю своё согласие на публикацию предоставленных данных
          </label>
        </div>
        <div className={s.btnWrapper}>
          <button
            className={s.sendBtn}
            onClick={SENDINFORMATION}
            disabled={disabled || btnDisabled || disabled2} // Прямое использование свойства "disabled"
            style={
              disabled || btnDisabled || disabled2
                ? { backgroundColor: "#DCA9A9", cursor: "default" }
                : {}
            }
          >
            {isNew ? <p>ОТПРАВИТЬ ЗАЯВКУ</p> : <p>СОХРАНИТЬ</p>}
            {isNew ? <p>- 1 ед. из вашего баланса</p> : null}
          </button>
          {disabled && (
            <img style={{ width: "100px" }} src="/images/loadingGif.gif" />
          )}
        </div>
      </div>
      {popUp && (
        <div className={s.balancePopup}>
          <BalancePopup />
        </div>
      )}

      <div className={s.questions}>
        <Questions />
      </div>
    </div>
  );
}

export default ApplicationPage;
