import React, { useEffect, useState } from "react";
import s from "./JouryApplications.module.sass";
import axios from "../../axios";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx"; // Добавляем библиотеку для экспорта в Excel

function JouryApplications() {
  const [users, setUsers] = useState([]);
  const [nominations, setNominations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { email } = useParams();
  const [jouryId, setJouryId] = useState(null);
  useEffect(() => {
    axios
      .get("/getJouries")
      .then((res) => res?.data.find((elem) => elem.email == email))
      .then((data) => {
        setJouryId(data._id);
      });
    axios
      .get("/getAllUsers")
      .then((res) => res.data)
      .then((data) => {
        let allNominations = data.filter((elem) => elem?.jouryRate.map((rate) => rate?.jouryId == jouryId).length > 0).map((user) =>
          user.applications
            ? user.applications.map((elem) => ({
                ...elem.application_data,
                userId: user._id,
                applicationId: elem.application_id,
                accepted: elem.accepted,
              }))
            : null
        );
        console.log("data", data);
        setUsers(
          allNominations
            .filter((nomination) => nomination && nomination.length >= 1)
            .flat()
        );
      });

    axios
      .get("/nom")
      .then((res) => res.data)
      .then((data) => {
        if (data) {
          let tempNominations = [];
          for (let i = 0; i < data.length; i++) {
            tempNominations.push(data[i].nomination[0]);
          }
          setNominations(tempNominations);
        }
      });
  }, []);

  const handleAccessApplication = async (elem) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/accessApplication", {
        userId: elem.userId,
        applicationId: elem.applicationId,
      });

      if (response.data.application) {
        setIsLoading(false);
        elem.accepted = !elem.accepted;
        setUsers([...users]);
      }
    } catch (error) {
      console.log("Error updating application:", error);
    }
  };

  // Функция экспорта в Excel
  const exportToExcel = () => {
    const dataForExport = users.map((user) => ({
      "Полное имя": user.fullName,
      Номинация: user.nomination,
      "ID пользователя": user.userId,
      "ID заявки": user.applicationId,
      Статус: user.accepted ? "Одобрено" : "Не одобрено",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    XLSX.writeFile(workbook, "Applications.xlsx");
  };

  return (
    <div className={s.container}>
      <div className={s.applications}>
        <button
          onClick={exportToExcel}
          style={{
            background: "black",
            color: "white",
            width: "250px",
            height: "40px",
            border: "none",
            marginBottom: "30px",
            cursor: "pointer",
            marginTop: "40px",
          }}
          className={s.exportBtn}
        >
          Экспорт в Excel
        </button>
        <div className={s.nominations}>
          {nominations &&
            nominations?.map((nomination, index) => (
              <div className={s.nomination} key={index}>
                <p>
                  <b>
                    {nomination} -{" "}
                    {
                      users.filter(
                        (elem) =>
                          elem?.nomination?.toLowerCase() ===
                          nominations?.[index]?.toLowerCase()
                      ).length
                    }
                  </b>
                </p>
                {users
                  .filter(
                    (elem) =>
                      elem.nomination?.toLowerCase() ===
                      nominations[index]?.toLowerCase()
                  )
                  .map((elem, idx) => (
                    <div
                      key={idx}
                      className={s.nominationBlock}
                      style={{ paddingBottom: "10px" }}
                    >
                      <p>{elem.fullName}</p>
                      <div className={s.buttons}>
                        <button
                          onClick={() =>
                            window.open(
                              `/applicationChecking/${elem.applicationId}/${elem.userId}`,
                              "_blank"
                            )
                          }
                        >
                          Посмотреть заявку
                        </button>
                        <button
                          style={{
                            background: elem.accepted ? "#5ea45e" : "gray",
                          }}
                          onClick={() => handleAccessApplication(elem)}
                          className={s.accessApplicationBtn}
                        >
                          {isLoading
                            ? "..."
                            : elem.accepted === false ||
                              elem.accepted === undefined
                            ? "Одобрить заявку"
                            : "Заявка одобрена"}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default JouryApplications;
