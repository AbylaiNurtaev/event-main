import React, { useState, useEffect } from "react";
import s from "./AdminNominations.module.sass";
import axios from "../../axios";
import { useNavigate } from "react-router-dom";

function AdminNominations() {
  const [allNominations, setAllNominations] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false); // Состояние для редактирования
  const [info, setInfo] = useState([{ text: "", percentage: "" }]);

  const [moreText, setMoreText] = useState("");
  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prevCategories) => [...prevCategories, newCategory]); // Добавляем новую категорию в список
      setNewCategory(""); // Очищаем текстовое поле
    }
  };

  const navigate = useNavigate();
  const [newNomination, setNewNomination] = useState({
    nomination: "",
    category: "",
    moreText: "",
    information: [],
  });
  const [editNomination, setEditNomination] = useState(null); // Состояние для текущей редактируемой номинации

  useEffect(() => {
    axios
      .get("/nom")
      .then((res) => res.data)
      .then((data) => {
        setAllNominations(data); // сохраняем все номинации

        // Извлекаем уникальные категории из данных, разворачивая массивы с помощью flatMap
        const uniqueCategories = [
          ...new Set(data.flatMap((item) => item.category)),
        ];

        setCategories(uniqueCategories); // сохраняем уникальные категории
      })
      .catch((err) => console.error("Error fetching nominations:", err)); // обработка ошибки
  }, []);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => {
    setIsPopupOpen(false);
    setInfo([{ text: "", percentage: "" }]);
    setMoreText("");
  };

  const openEditPopup = (nomination) => {
    setEditNomination(nomination);
    setInfo(nomination.information); // Установить информацию для редактирования
    setMoreText(nomination.moreText || ""); // Установить дополнительный текст для редактирования
    setIsEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setIsEditPopupOpen(false);
    setEditNomination(null);
    setInfo([{ text: "", percentage: "" }]);
    setMoreText("");
  };

  const handleChange = (e) => {
    setNewNomination({
      ...newNomination,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    // Если категория выбрана
    if (e.target.checked) {
      setEditNomination((prev) => ({
        ...prev,
        [name]: [...prev[name], value], // Добавляем значение в массив
      }));
    } else {
      setEditNomination((prev) => ({
        ...prev,
        [name]: prev[name].filter((item) => item !== value), // Удаляем значение из массива
      }));
    }
  };

  const handleEditChangeInput = (e) => {
    const { name, value, type, checked } = e.target;

    setEditNomination((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? [...prev[name], value]
            : prev[name].filter((item) => item !== value)
          : value, // обновляем текстовое поле
    }));
  };

  const handleEditNewChange = (e) => {
    const { name, value } = e.target;

    // Если категория выбрана
    if (e.target.checked) {
      setNewNomination((prev) => ({
        ...prev,
        [name]: [...prev[name], value], // Добавляем значение в массив
      }));
    } else {
      setNewNomination((prev) => ({
        ...prev,
        [name]: prev[name].filter((item) => item !== value), // Удаляем значение из массива
      }));
    }
  };

  const handleInfoChange = (index, e) => {
    const { name, value } = e.target;
    const updatedInfo = [...info];
    updatedInfo[index][name] = value;
    setInfo(updatedInfo);
  };

  const addInfoField = () => {
    setInfo([...info, { text: "", percentage: "" }]);
  };

  const removeInfoField = (index) => {
    const updatedInfo = info.filter((_, i) => i !== index);
    setInfo(updatedInfo);
  };

  // Обработчик изменения текста для новой номинации
  const handleChangeText = (e) => {
    setMoreText(e.target.value);
    setNewNomination({
      ...newNomination,
      moreText: e.target.value, // обновляем поле moreText в объекте newNomination
    });
  };

  // Обработчик изменения текста для редактируемой номинации
  const handleEditTextChange = (e) => {
    setMoreText(e.target.value);
    setEditNomination({
      ...editNomination,
      moreText: e.target.value, // обновляем поле moreText в объекте editNomination
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/nom", {
        ...newNomination,
        information: info,
      });
      setAllNominations([...allNominations, response.data]);
      setNewNomination({
        nomination: "",
        category: [""],
        moreText: "",
        information: [],
      });
      closePopup();
    } catch (error) {
      console.error("Ошибка при добавлении номинации:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/nom/update/${editNomination._id}`, {
        ...editNomination,
        information: info,
      });
      const updatedNominations = allNominations.map((nom) =>
        nom._id === editNomination._id
          ? { ...editNomination, information: info }
          : nom
      );
      setAllNominations(updatedNominations);
      closeEditPopup();
    } catch (error) {
      console.error("Ошибка при редактировании номинации:", error);
    }
  };

  const deleteNomination = (id) => {
    axios
      .delete(`/nom/${id}`)
      .then((res) => res.data)
      .then((data) => {
        if (data) {
          let filtered = allNominations.filter((elem) => elem._id !== id);
          setAllNominations(filtered);
        }
      });
  };

  const handleChangeMultiple = (e) => {
    const { options } = e.target;
    const selectedCategories = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCategories.push(options[i].value);
      }
    }

    setNewNomination((prevNomination) => ({
      ...prevNomination,
      category: selectedCategories, // Обновляем массив выбранных категорий
    }));
  };

  return (
    <div className={s.container}>
      <div className={s.innerContainer}>
        <div className={s.top}>
          <h2>Номинации</h2>
          <button onClick={openPopup}>Добавить номинацию</button>
        </div>
        <div className={s.nominations}>
          {categories.map((category, index) => (
            <div key={index} className={s.categoryBlock}>
              <h3>{category}</h3>
              <div className={s.nominationList}>
                {allNominations
                  .filter((nomination) =>
                    nomination.category.includes(category)
                  ) // проверяем, содержит ли массив категорий выбранную категорию
                  .map((nomination, idx) => (
                    <div key={idx} className={s.nomination}>
                      <p onClick={() => openEditPopup(nomination)}>
                        {nomination.nomination}
                      </p>
                      <p
                        onClick={() =>
                          navigate(`/adminApplication/${nomination._id}`)
                        }
                      >
                        Управление
                      </p>
                      <p onClick={() => deleteNomination(nomination._id)}>
                        Удалить
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup для добавления новой номинации */}
      {isPopupOpen && (
        <div className={s.popupBackground}>
          <div className={s.popup}>
            <h3>Добавить новую номинацию</h3>
            <form onSubmit={handleSubmit}>
              <div className={s.formGroup}>
                <label>Номинация</label>
                <input
                  type="text"
                  name="nomination"
                  value={newNomination.nomination}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={s.formGroup}>
                <label>Категория</label>
                <div>
                  {categories.map((elem) => (
                    <label key={elem}>
                      <input
                        type="checkbox"
                        name="category"
                        value={elem}
                        // checked={editNomination.category.includes(elem)} // Проверяем, выбрана ли категория
                        onChange={handleEditNewChange}
                      />
                      {elem}
                    </label>
                  ))}
                </div>
                <div>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)} // Обновляем состояние для новой категории
                    placeholder="Введите новую категорию"
                  />
                  <button onClick={handleAddCategory}>
                    Добавить категорию
                  </button>
                </div>
                <input
                  type="text"
                  name="category"
                  value={newNomination.category}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={s.formGroup}>
                <label>Информация</label>
                {info.map((elem, index) => (
                  <div key={index} className={s.infoItem}>
                    <div className={s.inputs}>
                      <textarea
                        style={{ width: "300px", height: "300px" }}
                        type="text"
                        name="text"
                        placeholder="Текст"
                        value={elem.text}
                        onChange={(e) => handleInfoChange(index, e)}
                        required
                      />
                      {/* <input
                                                type="text"
                                                name="percentage"
                                                placeholder="Процент"
                                                value={elem.percentage}
                                                onChange={(e) => handleInfoChange(index, e)}
                                                required
                                            /> */}
                    </div>
                    <button
                      type="button"
                      className={s.remove}
                      onClick={() => removeInfoField(index)}
                    >
                      <img src="/images/54324.png" alt="Удалить" />
                    </button>
                  </div>
                ))}
                <button type="button" className={s.add} onClick={addInfoField}>
                  Добавить информацию
                </button>
                <div className={s.addText}>
                  <p>Добавить дополнительный текст</p>
                  <textarea
                    value={moreText}
                    onChange={handleChangeText}
                  ></textarea>
                </div>
              </div>

              <div className={s.buttons}>
                <button type="submit">Добавить</button>
                <button type="button" onClick={closePopup}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup для редактирования номинации */}
      {isEditPopupOpen && (
        <div className={s.popupBackground}>
          <div className={s.popup}>
            <h3>Редактировать номинацию</h3>
            <form onSubmit={handleEditSubmit}>
              <div className={s.formGroup}>
                <label>Номинация</label>
                <input
                  type="text"
                  name="nomination"
                  value={editNomination.nomination}
                  onChange={handleEditChangeInput}
                  required
                />
              </div>
              <div className={s.formGroup}>
                <label>Категория</label>
                <div>
                  {categories.map((elem) => (
                    <label key={elem}>
                      <input
                        type="checkbox"
                        name="category"
                        value={elem}
                        checked={editNomination.category.includes(elem)} // Проверяем, выбрана ли категория
                        onChange={handleEditChange}
                      />
                      {elem}
                    </label>
                  ))}
                </div>
                <div>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)} // Обновляем состояние для новой категории
                    placeholder="Введите новую категорию"
                  />
                  <button onClick={handleAddCategory}>
                    Добавить категорию
                  </button>
                </div>
              </div>
              <div className={s.formGroup}>
                <label>Информация</label>
                {info.map((elem, index) => (
                  <div key={index} className={s.infoItem}>
                    <div className={s.inputs}>
                      <input
                        type="text"
                        name="text"
                        placeholder="Текст"
                        value={elem.text}
                        onChange={(e) => handleInfoChange(index, e)}
                        required
                      />
                      <input
                        type="text"
                        name="percentage"
                        placeholder="Процент"
                        value={elem.percentage}
                        onChange={(e) => handleInfoChange(index, e)}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className={s.remove}
                      onClick={() => removeInfoField(index)}
                    >
                      <img src="/images/54324.png" alt="Удалить" />
                    </button>
                  </div>
                ))}
                <button type="button" className={s.add} onClick={addInfoField}>
                  Добавить информацию
                </button>
                <div className={s.addText}>
                  <p>Добавить дополнительный текст</p>
                  <textarea
                    value={moreText}
                    onChange={handleEditTextChange}
                  ></textarea>
                </div>
              </div>

              <div className={s.buttons}>
                <button type="submit">Сохранить изменения</button>
                <button type="button" onClick={closeEditPopup}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNominations;
