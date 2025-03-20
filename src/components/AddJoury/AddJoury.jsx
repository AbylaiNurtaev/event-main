import React, { useEffect, useState } from 'react';
import s from './AddJoury.module.sass';
import axios from '../../axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function AddJoury() {
  const [email, setEmail] = useState('');
  const [allJouries, setAllJouries] = useState([]);
  const [nominations, setNominations] = useState([]);
  const [selectedNominations, setSelectedNominations] = useState({});
  const [activeIndex, setActiveIndex] = useState(null);
  const [users, setUsers] = useState();

  useEffect(() => {
    axios.get('/getJouries')
      .then(res => res.data)
      .then(data => {
        if (data) {
          data.sort((a, b) => a.order - b.order); 
          setAllJouries(data);

          const initialNominations = {};
          data.forEach(joury => {
            initialNominations[joury.email] = joury.acceptedNominations || [];
          });
          setSelectedNominations(initialNominations);
        }
      });


    axios.get('/nom')
      .then(res => res.data)
      .then(data => {
        const allNominations = [...new Set(data.map(item => item.nomination[0]))];
        setNominations(allNominations);
      });

    axios.get('/getAllUsers')
      .then(res => res.data)
      .then(data => {
        let allNominations = data.map(user =>
          user.applications
            ? user.applications.map((elem) => ({
              ...elem.application_data,
              userId: user._id,
              applicationId: elem.application_id,
              accepted: elem.accepted
            }))
            : null
        );
        setUsers(allNominations.filter(nomination => nomination && nomination.length >= 1).flat());
      });
  }, []);

  const exportToExcel = () => {
    const data = allJouries.map((joury, index) => ({
      '№': index + 1,
      'Email': joury.email,
      'Имя': joury.name || 'Не указано',
      'Оценено заявок': `${joury.jouryCounter} / ${
        users &&
        users.filter(user =>
          joury.acceptedNominations.map(n => n.toLowerCase()).includes(user.nomination.toLowerCase())
        ).length
      }`,
      'Номинации': (joury.acceptedNominations || []).join(', '),
      'Дополнительный жюри': joury.additionalJoury ? 'Да' : 'Нет',
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Жюри');
  
    // Генерация и сохранение файла
    XLSX.writeFile(workbook, 'Жюри.xlsx');
  };

  const addJoury = async () => {
    axios.post('/setJoury', { email })
      .then(res => res.data)
      .then(data => {
        alert(data.message);
        window.location.reload();
      })
      .catch(() => alert("Не удалось зарегистрировать жюри"));
  };

  const deleteJoury = async (email) => {
    axios.post('/deleteJoury', { email })
      .then(res => res.data)
      .then(data => {
        alert(data.message);
        let newJouries = allJouries.filter(joury => joury.email !== email);
        setAllJouries(newJouries);
      })
      .catch(() => alert("Не удалось удалить жюри"));
  };

  const handleChangeJoury = (e) => {
    setEmail(e.target.value);
  };

  const handleNominationChange = (email, nomination) => {
    setSelectedNominations((prevState) => {
      const jouryNominations = prevState[email] || [];
      return {
        ...prevState,
        [email]: jouryNominations.includes(nomination)
          ? jouryNominations.filter(n => n !== nomination)
          : [...jouryNominations, nomination],
      };
    });
  };

  const saveNominations = async (email) => {
    const acceptedNominations = selectedNominations[email] || [];
    axios.post('/setJouryNomination', { email, acceptedNominations })
      .then(res => res.data)
      .then(data => {
        alert(data.message);
        setActiveIndex();
      })
      .catch(() => alert("Не удалось сохранить номинации"));
  };

  const setStatusJoury = async (status, email) => {
    axios.post('/setJouryStatus', { email, status })
      .then(res => res.data)
      .then(data => {
        if (data) {
          window.location.reload();
        }
      })
      .catch(() => alert('Ошибка выставления'));
  };

  // Обработка изменения порядка
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedJouries = Array.from(allJouries);
    const [movedItem] = reorderedJouries.splice(result.source.index, 1);
    reorderedJouries.splice(result.destination.index, 0, movedItem);

    setAllJouries(reorderedJouries);
    
  };

  const saveOrder = async () => {
    axios.post('/updateJouryOrder', { jouries: allJouries })
      .then(res => res.data)
      .then(data => {
        alert(data.message);
      })
      .catch(() => alert("Не удалось сохранить порядок"));
  };
  

  return (
    <div className={s.container}>
      <p>Введите email жюри:</p>
      <input type="text" onChange={handleChangeJoury} />
      <button onClick={addJoury} className={s.add}>Дать роль Жюри</button>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="jouryList">
          {(provided) => (
            <div className={s.blocks} {...provided.droppableProps} ref={provided.innerRef}>
              {allJouries.map((elem, index) => (
                <Draggable key={elem.email} draggableId={elem.email} index={index}>
                  {(provided) => (
                    <div
                      className={s.block}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className={s.top}>
                        <p onClick={() => { activeIndex !== null ? setActiveIndex(null) : setActiveIndex(index); }}>{elem.name || "не указано имя"}</p>
                        <p>оценил {elem?.jouryCounter} / {users && users.filter(user => elem?.acceptedNominations.map(n => n?.toLowerCase()).includes(user.nomination?.toLowerCase())).length} заявок</p>
                        <p>судит {elem.acceptedNominations.length} номинации </p>
                        <p>
                          <input type="checkbox" checked={elem.additionalJoury} onChange={(e) => setStatusJoury(e.target.checked, elem.email)} />
                          доп жюри
                        </p>
                        <p onClick={() => deleteJoury(elem.email)}>Удалить</p>
                      </div>

                      <div className={s.bottom} style={activeIndex === index ? { display: 'flex' } : { display: "none" }}>
                        <p onClick={() => setActiveIndex(null)} style={{ marginBottom: "40px", cursor: "pointer" }}>X</p>
                        {nominations && nominations.map((nomination) => (
                          <div className={s.nominations} key={nomination}>
                            <input
                              type="checkbox"
                              checked={selectedNominations[elem.email]?.includes(nomination) || false}
                              onChange={() => handleNominationChange(elem.email, nomination)}
                            />
                            <p>{nomination}</p>
                          </div>
                        ))}
                        {nominations && <button onClick={() => saveNominations(elem.email)}>Сохранить номинации</button>}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button onClick={saveOrder} className={s.saveOrder}>Сохранить порядок</button>
      <button onClick={exportToExcel} style={{ marginBottom: "50px" }} className={s.exportButton}>Экспорт в Excel</button>

    </div>
  );
}

export default AddJoury;
