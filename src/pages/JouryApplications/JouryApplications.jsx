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
  const [joury, setJoury] = useState(null);
  useEffect(() => {
    axios
      .get("/getJouries")
      .then((res) => res?.data.find((elem) => elem.email == email))
      .then((data) => {
        setJouryId(data._id);
        console.log("data", data);
        setJoury(data);
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

  useEffect(() => {
    if (joury != null && nominations.length > 0) {
      axios
        .get("/getAllUsers")
        .then((res) => res.data)
        .then((data) => {
          let allNominations = data
            .filter(
              (elem) =>
                elem?.jouryRate.map((rate) => rate?.jouryId == jouryId).length >
                0
            )
            .map((user) =>
              user.applications
                ? user.applications.map((elem) => {
                    const isChecked = user.jouryRate.some(
                      (rate) =>
                        rate?.jouryId === jouryId &&
                        rate?.applicationId === elem.application_id // сравниваем ID заявки
                    );
                    return {
                      ...elem.application_data,
                      userId: user._id,
                      applicationId: elem.application_id,
                      accepted: elem.accepted,
                      avatar: user.avatarUrl,
                      checked: isChecked,
                    };
                  })
                : null
            );

          const lowerCaseAccepted =
            joury?.acceptedNominations?.map((n) => n?.toLowerCase()) || [];
          // console.log("joury?.lowerCaseAccepted", lowerCaseAccepted);

          const allNominations_2 = data.flatMap((user, userIndex) => {
            // console.log(`👤 User #${userIndex}: ${user._id}`);

            const filteredApplications = user.applications?.filter(
              (app, appIndex) => {
                const nomination =
                  app.application_data?.nomination?.toLowerCase();
                const isAccepted = lowerCaseAccepted.includes(nomination);

                // console.log(
                //   `  📄 App #${appIndex} nomination: "${nomination}" -> ${
                //     isAccepted ? "✅ accepted" : "❌ rejected"
                //   }`
                // );

                return isAccepted;
              }
            );

            const mapped =
              filteredApplications?.map((app) => {
                const result = {
                  ...app.application_data,
                  userId: user._id,
                  applicationId: app.application_id,
                  accepted: app.accepted,
                };
                // console.log("    ✅ Added application:", result);
                return result;
              }) || [];

            return mapped;
          });

          console.log("allNominations_2", allNominations_2);
          const all = [...(allNominations_2 || []), ...(allNominations || [])];

          // Расплющим, если это массив массивов:
          const flat = all.flat().filter(Boolean); // удалим null/undefined

          // Удалим дубликаты по applicationId:
          const uniqueById = Array.from(
            new Map(flat.map((item) => [item.applicationId, item])).values()
          );

          setUsers(uniqueById);
        });
    }
  }, [joury, nominations]);

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

  console.log("users", users);
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
                              `/applicationChecking/${elem.applicationId}/${elem.userId}/${jouryId}`,
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
                        {elem.checked && (
                          <p style={{ color: "green" }}>Оценил</p>
                        )}
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
