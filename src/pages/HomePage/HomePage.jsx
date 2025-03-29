import React, { useEffect, useState } from "react";
import s from "./HomePage.module.sass";
import Joury from "../../components/Joury/Joury";
import Questions from "../../components/Questions/Questions";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";

import image from "../../Group 21.png";
function HomePage() {
  function isDateValid(selectedDate) {
    const today = new Date();
    const maxDate = new Date(today);

    // Установите максимальную дату (например, 7 дней с сегодняшнего дня)
    maxDate.setDate(today.getDate() + 7);

    // Приведем выбранную дату к объекту Date
    const selected = new Date(selectedDate);

    // Проверяем, является ли дата валидной
    if (selected < today || selected > maxDate) {
      return false; // Дата недействительна
    }

    return true; // Дата корректна
  }

  // sdadsads
  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const navigate = useNavigate();
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    axios
      .get("/getDeadline")
      .then((res) => res.data)
      .then((data) => {
        setDeadline(data[data.length - 1]);
      });
  }, []);

  // useEffect(() => {
  //     axios.post('/create-payment', {
  //         external_order_id: 123,
  //         total_amount: 1333,
  //     })
  //     .then(res => {
  //         console.log('Response from server:', res.data);
  //     })
  //     .catch(err => {
  //         console.error('Error:', err.response ? err.response.data : err.message);
  //     });
  // }, []);

  return (
    <div className={s.container}>
      <div className={s.innerContainer}>
        {/* <img src="/images/white-back.svg" className={s.light} alt="" /> */}
        <h1 className={s.title}>WEDS</h1>

        {/* <h1 className={s.redTitle}>НОВЫЕ ТРЕНДЫ</h1> */}

        <div className={s.mobileLines}>
          <img
            style={{ width: "100%" }}
            src="/images/IMG (1).png"
            alt=""
            loading="lazy"
          />
        </div>

        <div className={s.buttons}>
          <button
            className={s.right}
            onClick={() => navigate("/application/new")}
          >
            УЧАСТВОВАТЬ
            <br className={s.mobileBR} /> В РЕЙТИНГЕ - 2024
          </button>
          <button
            className={s.left}
            onClick={() => window.open("https://wedsforum.kz")}
          >
            БИЛЕТ НА ФОРУМ
          </button>
        </div>

        {/* <img className={s.images} src={image} alt="" /> */}
        {/* <div className={s.lines}>
                <img src="/images/Frame 121.svg" alt="" />
                <img src="/images/Frame 120.svg" alt="" />
            </div> */}

        <div className={s.infoBlock}>
          <div className={s.left}>
            <div className={s.title}>О РЕЙТИНГЕ</div>
            <p className={s.par}>
              Мы — независимый рейтинг, объединяющий свадебных профессионалов и
              формирующая стандарты индустрии.
              <br />
              <br />
              <br />
              Победителем может стать любая компания или частное лицо,
              предлагающие качественные свадебные услуги. Жюри, состоящее из
              признанных экспертов свадебного бизнеса, ежегодно обновляется.
              Участие в рейтинге — это престиж для любого свадебного
              профессионала!
            </p>
            <button onClick={() => navigate("/about")}>
              ПОДРОБНЕЕ О РЕЙТИНГЕ
            </button>
          </div>
          <div className={s.right}>
            <div className={s.title}>РАСПИСАНИЕ</div>
            <div className={s.date}>
              {deadline.deadline} {deadline.month}
            </div>
            <div className={s.subTitle}>ФОРУМ</div>
            <p className={s.par}>
              Церемония - Мерседес Центр Астана
              <br />
              <br />
              Кабанбай батыр проспект, 1<br />
              <br />
              The St. Regis Astana
            </p>
            <button
              style={{ height: "50px", width: "250px" }}
              onClick={() =>
                (window.location.href =
                  "https://wa.me/77777670832?text=%D0%94%D0%BE%D0%B1%D1%80%D1%8B%D0%B9%20%D0%B4%D0%B5%D0%BD%D1%8C!%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B1%D1%8B%D1%82%D1%8C%20%D0%B7%D1%80%D0%B8%D1%82%D0%B5%D0%BB%D0%B5%D0%BC!%20")
              }
            >
              СТАТЬ ЗРИТЕЛЕМ
            </button>
            <div className={s.images}>
              {/* <img src="/images/Line 4 (1).svg" alt="" /> */}
              <img
                src="/images/—Pngtree—cute gold decoration ribbon_8438236 3 (1).svg"
                alt=""
              />
            </div>
            {/* <img className={s.fetil} src="/images/Frame 23.svg" alt="" /> */}
            {deadline && (
              <div className={s.date1}>
                {deadline.deadline2} {deadline.month}
              </div>
            )}
            <div className={s.subTitle}>ЦЕРЕМОНИЯ</div>
            <p className={s.par}>
              Проспект Туран, 61
              <br />
              <br />
              North Star of Kazakhstan
            </p>
            <button
              onClick={() =>
                (window.location.href =
                  "https://api.whatsapp.com/send/?phone=77777670832&text=%D0%94%D0%BE%D0%B1%D1%80%D1%8B%D0%B9+%D0%B4%D0%B5%D0%BD%D1%8C%21+%D0%A5%D0%BE%D1%87%D1%83+%D0%B1%D1%8B%D1%82%D1%8C+%D0%B7%D1%80%D0%B8%D1%82%D0%B5%D0%BB%D0%B5%D0%BC%21+&type=phone_number&app_absent=0")
              }
            >
              КУПИТЬ БИЛЕТ НА ЦЕРЕМОНИЮ
            </button>
          </div>
        </div>

        <img className={s.image} src="/images/image (4).svg" alt="" />

        {/* <div className={s.partners}>
                <h1 className={s.title}>ПАРТНЕРЫ</h1>
                <p className={s.par}>WEDS благодарит наших партнеров — лидеров свадебной индустрии, за поддержку и вклад в проведение ивента. Вместе мы создаем яркие и значимые события для всего сообщества.</p>
                

                <img className={s.row} src="/images/row.svg" alt="" />
                <div className={s.rowDiv}>
                    <img className={s.mobileRow} src="/images/row.svg" alt="" />
                </div>
                
            </div> */}

        <div className={s.joury}>
          <Joury></Joury>
        </div>

        <Questions></Questions>
      </div>
    </div>
  );
}

export default HomePage;
