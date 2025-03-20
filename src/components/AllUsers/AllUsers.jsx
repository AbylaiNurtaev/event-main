import React, { useEffect, useState } from "react";
import s from "./AllUsers.module.sass";
import axios from "../../axios";
import * as XLSX from "xlsx";

function AllUsers() {
  const [users, setUsers] = useState([]);
  const [opened, setOpened] = useState(null);
  const [balanceInputs, setBalanceInputs] = useState({});

  useEffect(() => {
    axios
      .get("/getAllUsers")
      .then((res) => res.data)
      .then((data) => {
        console.log(data);
        setUsers(data);
      });
  }, []);

  const exportToExcel = () => {
    const data = users.map((user, index) => ({
      "№": index + 1,
      Имя: user.name || "(не указано имя)",
      Баланс: user.balance || 0,
      Почта: user.email || "Не указана",
      Телефон: user.phone || "Не указан",
      Заявки:
        user.applications.length > 0
          ? user.applications
              .map(
                (app) =>
                  `${app.application_data.nomination}: ${
                    app.application_data.accepted ? "Одобрена" : "Не одобрена"
                  }`
              )
              .join(", ")
          : "Нет заявок",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Пользователи");

    XLSX.writeFile(workbook, "Пользователи.xlsx");
  };

  const updateBalance = (userId, newBalance) => {
    axios
      .post("/updateBalance", { userId, balance: newBalance })
      .then((res) => {
        console.log(res.data);
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, balance: newBalance } : user
          )
        );
      })
      .then((data) => alert("Успешно обновлен баланс"))
      .catch((err) => console.error(err));
  };

  const handleBalanceInputChange = (e, userId) => {
    const newBalance = e.target.value;
    setBalanceInputs((prev) => ({
      ...prev,
      [userId]: newBalance,
    }));
  };

  const handleUpdateClick = (userId) => {
    const newBalance = parseFloat(balanceInputs[userId]);
    if (!isNaN(newBalance)) {
      updateBalance(userId, newBalance);
    } else {
      alert("Введите корректное числовое значение для баланса.");
    }
  };

  return (
    <div className={s.container}>
      <div className={s.users}>
        <p className={s.text}>
          <b>Итого: {users?.length} человек</b>
        </p>
        <button
          style={{
            background: "black",
            color: "white",
            width: "250px",
            height: "40px",
            border: "none",
            marginBottom: "30px",
            cursor: "pointer",
          }}
          onClick={exportToExcel}
        >
          Экспорт в Excel
        </button>
        {users &&
          users.map((user, index) => (
            <div className={s.peopleWrapper} key={index}>
              <div
                className={s.people}
                onClick={() => setOpened(opened === index ? null : index)}
              >
                <p style={{ width: "200px" }} className={s.name}>
                  {user.name && user.name !== ""
                    ? user.name
                    : "(не указано имя)"}
                </p>
                <input
                  style={{ width: "100px" }}
                  type="text"
                  defaultValue={user.balance}
                  onChange={(e) => handleBalanceInputChange(e, user._id)}
                />
                <button
                  style={{
                    marginLeft: "10px",
                    marginRight: "10px",
                    background: "black",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleUpdateClick(user._id)}
                >
                  Обновить
                </button>
                <p style={{ width: "300px" }}>Почта: {user?.email}</p>
                <p style={{ width: "200px" }}>{user?.phone}</p>
              </div>

              {opened === index && (
                <div className={s.nominations}>
                  {user.applications.length === 0 ? (
                    <p>Нету поданных заявок</p>
                  ) : (
                    user.applications.map((elem, i) => (
                      <p key={i}>
                        {elem.application_data?.nomination
                          ? elem.application_data?.nomination
                          : "НЕ УКАЗАЛИ НОМИНАЦИЮ"}{" "}
                        {elem.application_data?.accepted
                          ? "Одобрена"
                          : "Не одобрена"}
                      </p>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default AllUsers;
