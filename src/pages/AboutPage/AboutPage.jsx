import React, { useEffect, useState } from "react";
import s from "./AboutPage.module.sass";
import { useNavigate } from "react-router-dom";
import Questions from "../../components/Questions/Questions";
import Joury from "../../components/Joury/Joury";
import axios from "../../axios";

function AboutPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const [peoples, setPeoples] = useState();
  const persons = [
    {
      name: "Айгерим Магауова",
      img: "/images/organizators/telegram-cloud-document-2-5202005573633071188.svg",
      par: "Руководитель проекта",
    },
    {
      name: "Ирина Волкова",
      img: "/images/organizators/telegram-cloud-document-2-5188467205355887716 (1).svg",
      par: "Креативный продюссер",
    },
    {
      name: "Алина Никифорова",
      img: "/images/organizators/telegram-cloud-document-2-5202122757520773474 (1).svg",
      par: "Руководитель SMM-отдела",
    },
    {
      name: "Кульжамбекова Карина",
      img: "/images/organizators/telegram-cloud-document-2-5201814640861926161 (2).svg",
      par: "SMM-менеджер",
    },
  ];

  const [position, setPosition] = useState(0); // Начальное состояние позиции

  const [jouries, setCurrentJouries] = useState();

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

  const [deadline, setDeadline] = useState("");
  function formatDate(dateString) {
    // Создаем объект Date из строки
    const date = new Date(dateString);

    // Массив с названиями месяцев
    const months = [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ];

    // Извлекаем день и месяц
    const day = date.getDate(); // Число дня
    const month = months[date.getMonth()]; // Название месяца

    // Формируем строку "2 ноября"
    return `${day} ${month}`;
  }

  useEffect(() => {
    axios
      .get("/getDeadline")
      .then((res) => res.data)
      .then((data) => {
        setFrmDate(formatDate(data[data.length - 1].date));
        setDeadline(data[data.length - 1]);
      });
  }, []);

  const [categories, setCategories] = useState(["Все"]);
  const [nominations, setNominations] = useState([]); // стейт для всех номинаций
  const [filteredNominations, setFilteredNominations] = useState([]); // стейт для отфильтрованных номинаций
  const [selectedCategory, setSelectedCategory] = useState("Все"); // выбранная категория
  const [frmDate, setFrmDate] = useState("");

  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });

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

  const [openedPopupIndex, setOpenedPopupIndex] = useState(null);
  const [currentNomination, setCurrentNomination] = useState("");

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

  const closePopup = () => {
    document.body.style.overflowY = "scroll";
    setOpenedPopupIndex(null);
  };

  return (
    <div className={s.container}>
      <div className={s.crumbs}>
        <p onClick={() => navigate("/")}>Главная</p>
        <p>|</p>
        <p>О рейтинге</p>
      </div>
      <div className={s.about}>
        <h1>О РЕЙТИНГЕ</h1>
        <p>
          Национальный рейтинг специалистов свадебного рынка Казахстана,
          основанный на оценках 100 ведущих экспертов в свадьбах и традиционной
          казахской культуре.
        </p>
      </div>

      <div className={s.history}>
        <div className={s.left}>
          <h1>ИСТОРИЯ</h1>
          <p>
            В 2019 году мы создали TOP10Astana, а в 2023 году мы впервые провели
            премию Wedding Awards Kz - масштабное событие с мощной обратной
            связью. Мы пробовали разные форматы, совершали ошибки, делали выводы
            и совершенствовали формат.
          </p>
        </div>

        <div className={s.right}>
          <h1>ЦИФРЫ</h1>
          <div className={s.blocks}>
            <div className={s.block}>
              <h1>2023</h1>
              <p>
                Основание рейтинга, начало новой эры в свадебной индустрии
                Казахстана.
              </p>
            </div>
            <div className={s.block}>
              <h1>38</h1>
              <p>Количество награжденных номинаций.</p>
            </div>
            <div className={s.block}>
              <h1>170+</h1>
              <p>Количество принятых участников.</p>
            </div>
            <div className={s.block}>
              <h1>100+</h1>
              <p>Количество жюри.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={s.goals}>
        <div className={s.title}>ЦЕЛИ И ЗАДАЧИ</div>
        <p className={s.par}>
          Будем честны: сейчас мы доросли до действительно независимого и
          уникального рейтинга. Мы творческие и самобытные, а значит идеальный
          рейтинг специалистов и идеальную церемонию можем создать только мы
          сами. И нам важно, чтобы нам доверяли не просто разнообразные
          специалисты со всего мира... Нам должны доверять наши клиенты. Поэтому
          в 2024 году мы создали WEDS - мощную инфраструктуру для развития
          свадебных специалистов, которая включает в себя РЕЙТИНГ WEDS, журнал о
          современных свадьбах в Казахстане WEDS MEDIA, образовательный проект
          WEDS FORUM и многое другое. И, конечно, Церемонию награждения
          победителей рейтинга WEDS.
        </p>
        <div className={s.schedule}>Расписание</div>

        <div className={s.dates}>
          <div className={s.date}>
            {deadline && (
              <div className={s.title}>
                {deadline.deadline} {deadline.month}
              </div>
            )}
            <div className={s.subTitle}>Форум</div>
            <p className={s.par}>
              Церемония - Мерседес Центр Астана
              <br />
              Кабанбай батыр проспект, 1<br />
              The St. Regis Astana
            </p>
          </div>
          <img className={s.desktopArrow} src="/images/strelka.svg" alt="" />
          <img
            className={s.mobileStrelka}
            src="/images/Line 4 (1).svg"
            alt=""
          />
          <div className={s.date} style={{ marginLeft: "56px" }}>
            {deadline && (
              <div className={s.title}>
                {deadline.deadline2} {deadline.month}
              </div>
            )}
            <div className={s.subTitle}>ЦЕРЕМОНИЯ</div>
            <p className={s.par}>
              Проспект Туран, 61
              <br />
              North Star of Kazakhstan
            </p>
          </div>
        </div>

        <div className={s.dates}>
          <div className={s.date}>
            <div className={s.title}>{frmDate ? frmDate : " "}</div>
            <div className={s.subTitle}>Крайние сроки подачи заявок</div>
          </div>
        </div>
      </div>

      <div className={s.redBlock}>
        <div className={s.title}>Преимущества рейтинга</div>
        <p className={s.par}>
          Усовершенствованная система номинаций, подачи заявок, критериев и
          оценки, формирования итогового рейтинга WEDS. Прозрачность: заявки
          участников и итоговые оценки будут опубликованы на портале WEDS,
          Отдельное внимание посвящено блоку номинаций, связанных с национальной
          культурой и традициями, Оценка работ участников разносторонними
          специалистами из Казахстана, СНГи зарубежных стран, а также эскпертами
          по национальной культуре и традициям. Меньше формальных требований,
          больше профессионализма жюри. Открытость, большое количество обратной
          связи от участников и жюри, которую мы активно учитываем. Эффективный
          нетворкинг и мотивация к росту.
        </p>
      </div>

      <div className={s.criterion}>
        <div className={s.joury}>
          <Joury></Joury>
        </div>

        <div className={s.organizers}>
          <h1 className={s.title}>ОРГАНИЗАТОРЫ</h1>
          <div className={s.citation}>
            <img src="/images/leftScobe.svg" alt="" />
            <p>
              Команда WEDS — это люди, влюблённые в своё дело. Мы создаём
              события, которые вдохновляют, и развиваем индустрию, в основе
              которой лежит доверие
            </p>
            <img src="/images/rightScobe.svg" alt="" />
          </div>
          <div className={s.mainPerson}>
            <img
              src="/images/organizators/telegram-cloud-document-2-5204348302199378728@2x.png"
              alt=""
            />
            <h5>КАНАТ АЯГАНОВ</h5>
            <p>Основатель WEDS</p>
          </div>
          <div className={s.persons}>
            {persons.map((elem, index) => (
              <div className={s.person} key={index}>
                <img src={elem.img} alt="" />
                <h5>{elem.name}</h5>
                <p>{elem.par}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* <div className={s.partners}>
                <h1 className={s.title}>ПАРТНЕРЫ</h1>
                <p className={s.par}>WEDS благодарит наших партнеров — лидеров свадебной индустрии, за поддержку и вклад в проведение ивента. Вместе мы создаем яркие и значимые события для всего сообщества.</p>
                <img className={s.row} src="/images/row.svg" alt="" />
                <div className={s.rowDiv}>
                    <img className={s.rowMobile} src="/images/row.svg" alt="" />
                </div>
            </div> */}
      <div className={s.questions}>
        <Questions></Questions>
      </div>
    </div>
  );
}

export default AboutPage;
