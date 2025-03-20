import React, { useEffect, useRef, useState } from "react";
import s from "./AuthorizationPage.module.sass";
import { useNavigate } from "react-router-dom";
import Questions from "../../components/Questions/Questions";
import axios from "../../axios";

function AuthorizationPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const [email, setEmail] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [user, setUser] = useState();

  const [code, setCode] = useState();
  const [isSecond, setIsSecond] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  const inputRef = useRef(null);

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleChangeCode = (e) => {
    setCode(e.target.value);
  };

  useEffect(() => {
    if (showCodeInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCodeInput]); // Focus input when showCodeInput changes to true

  const sendCode = () => {
    setShowCodeInput(true);
    axios
      .post("/auth/register", { email })
      .then((res) => res.data)
      .then((data) => {
        setUser(data);
      })
      .catch((err) => console.log(err));

    // Block the button and start a 60-second timer
    setIsButtonDisabled(true);
    setTimer(60);

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setIsButtonDisabled(false); // Unblock the button after 60 seconds
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const verifyCode = () => {
    console.log(user?._id, code);
    axios
      .post("/auth/verifyOTP", {
        userId: user?._id,
        otp: code,
      })
      .then((res) => res.data)
      .then((data) => {
        if (data.status === "VERIFIED") {
          navigate(`/cabinet/${user?._id}`);
          setTimeout(() => {
            window.location.href = window.location.href;
          }, 1000);
        } else {
          alert("Неверный код");
        }
      });
  };

  return (
    <div className={s.container}>
      <div className={s.innerContainer}>
        <div className={s.crumbs}>
          <img src="/images/fluent_arrow-up-28-filled.svg" alt="" />
          <p onClick={() => navigate("/")}>Вернуться назад</p>
        </div>
        <div className={s.title}>АВТОРИЗАЦИЯ</div>
        <div className={s.loginContainer}>
          <div className={s.title}>Учетная запись</div>
          <div className={s.par}>Укажите ваш рабочий Email для авторизации</div>

          <input
            type="text"
            className={s.input}
            placeholder="example@mail.com"
            onChange={handleChangeEmail}
            value={email}
          />

          <button
            onClick={sendCode}
            disabled={isButtonDisabled}
            style={
              isButtonDisabled ? { background: "#b0b0b0", width: "250px" } : {}
            }
          >
            {isButtonDisabled ? `ОТПРАВИТЬ КОД 00:${timer}` : "ОТПРАВИТЬ КОД"}
          </button>

          {showCodeInput && (
            <>
              <p className={s.codeText}>
                Мы отправили вам код на указанную почту. Пожалуйста, введите его
                ниже, чтобы продолжить.
              </p>
              <div className={s.inputCode}>
                <input
                  type="text"
                  className={s.input}
                  placeholder="Введите код из письма"
                  onChange={handleChangeCode}
                  style={{ border: "1px solid #020204" }}
                  ref={inputRef}
                />
                <button onClick={verifyCode}>ВОЙТИ</button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className={s.questions}>
        <Questions />
      </div>
    </div>
  );
}

export default AuthorizationPage;
