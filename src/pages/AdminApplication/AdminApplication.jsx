import React, { useEffect, useState } from 'react'
import s from './AdminApplication.module.sass'
import { useNavigate, useParams } from 'react-router-dom'
import axios from '../../axios'

import StarRating from '../../components/StarRating/StarRating'

function AdminApplication() {
    const { id } = useParams()
    const [nomination, setNomination] = useState()
    const navigate = useNavigate()

    const jouryId = localStorage.getItem('id')

    const [nameTitle, setNameTitle] = useState('')
    const [command, setCommand] = useState(false)
    const [multipleSelection, setMultipleSelection] = useState(false)

    const [fields, setFields] = useState([]) // Основные поля
    const [additionalFields, setAdditionalFields] = useState([]) // Дополнительные поля


    const [images, setImages] = useState()
    const [videos, setVideos] = useState()
    const [docs, setDocs] = useState()
    const [imagesText, setImagesText] = useState()
    const [videosText, setVideosText] = useState()
    const [docsText, setDocsText] = useState()
    const [par, setPar] = useState()

    const [newCriteria, setNewCriteria] = useState('')
    const [allCriteria, setAllCriteria] = useState()

    

    const addNewCriteria = (type1) => {
        axios.post('/addCriterion', { nominationId: id, name: newCriteria, type: type1 })
        .then(res => res.data)
        .then(data => {
            if(data){
                alert("Успешно добавлен критерий")
                window.location.reload()
        }else{
            alert("Ошибка")
        }
    })
    .catch(err => {
        alert("Ошибка")    
    })
    }


    const deleteCriteria = (name1, type1) => {
        axios.post('/deleteCriterion', { nominationId: id, name: name1, type: type1 })
        .then(res => res.data)
        .then(data => {
            if(data){
                alert("Успешно удален критерий")
                window.location.reload()
        }else{
            alert("Ошибка")
        }
    })
    .catch(err => {
        alert("Ошибка")    
    })
    }




    useEffect(() => {
        axios.get('/nom')
            .then((res) => res.data)
            .then(data => {
                console.log("data", data)
                console.log("id", id)
                return data.find((nomination) => nomination._id == id)
        })
            .then(nomination => {
                console.log(nomination)
                if (nomination) { // Проверяем, что nomination не undefined
                    setNomination(nomination);
                    setNameTitle(nomination.nameTitle); // Убедимся, что nameTitle существует
                    setMultipleSelection(nomination.multipleSelection); // Убедимся, что multipleSelection существует
                    setFields(nomination.fields); // Защита от отсутствия полей
                    setAdditionalFields(nomination.additionalFields); // Защита от отсутствия дополнительных полей
                    setCommand(false); // Защита от отсутствия команды
                    setImages(nomination.images)
                    setVideos(nomination.videos)
                    setDocs(nomination.docs)
                    setDocsText(nomination.docsText)
                    setImagesText(nomination.imagesText)
                    setVideosText(nomination.videosText)
                    setPar(nomination.par)

                    setAllCriteria(nomination.criteria[0])
                }
            })
            .catch(error => {
                console.error('Ошибка при загрузке номинации:', error);
            });
    }, [id]);

    const handleChange = (e, setter) => {
        setter(e.target.value)
    }


    const handleChangeCheckBox = (e, setter) => {
        setter(prev => !prev)
    }

    

    const handleChangeCommand = () => {
        setCommand(prev => !prev)
    }

    // Логика для основных полей
    const addField = () => {
        setFields([...fields, { key: '', value: '' }])
    }



    const handleFieldChange = (index, e) => {
        const updatedFields = [...fields]
        updatedFields[index].key = e.target.value
        setFields(updatedFields)
    }

    const removeField = (index) => {
        const updatedFields = fields.filter((_, i) => i !== index)
        setFields(updatedFields)
    }

    // Логика для дополнительных полей
    const addAdditionalField = () => {
        setAdditionalFields([...additionalFields, [{ key: '', value: '' }]])
    }

    const handleAdditionalFieldChange = (index, e) => {
        const updatedFields = [...additionalFields]
        updatedFields[index][0].key = e.target.value
        setAdditionalFields(updatedFields)
    }

    const removeAdditionalField = (index) => {
        const updatedFields = additionalFields.filter((_, i) => i !== index)
        setAdditionalFields(updatedFields)
    }

    const handleSave = () => {
        const dataToSave = {
            nameTitle,
            multipleSelection,
            command,
            fields: fields,
            additionalFields: additionalFields,
            images,
            videos,
            docs,
            imagesText,
            videosText,
            docsText,
            par
        }
        axios.post(`/nom/modify/${id}`, dataToSave)
            .then((res) => res.data)
            .then(data => {
                if (data) {
                    alert('Успешно сохранено')
                }
            })
            .catch((err) => {
                alert('Произошла ошибка')
            })
    }

    return (
        <div className={s.container}>
            {/* <div className={s.crumbs}>
                <img src="/images/fluent_arrow-up-28-filled.svg" alt="" />
                <p onClick={() => navigate(-1)}>Вернуться назад</p>
            </div> */}
            {
                nomination &&
                <div className={s.innerContainer}>
                    <div className={s.rows}>
                            <p>Возможность добавлять несколько проектов: </p>
                        <div className={s.row}>
                            <button style={multipleSelection == false || multipleSelection == "false" ? {background: "#066419"} : {}} onClick={() => setMultipleSelection(false)}>Отключить</button>
                            <button style={multipleSelection == 'one' || multipleSelection == "one" ? {background: "#066419"} : {}} onClick={() => setMultipleSelection('one')}>1 проект</button>
                            <button style={multipleSelection == true || multipleSelection == "true" ? {background: "#066419"} : {}} onClick={() => setMultipleSelection(true)}>Несколько проектов</button>
                        </div>
                        {
                            multipleSelection &&
                            <div>
                                <p>Изменить заголовок проектов: </p>
                                <input type="text" value={nameTitle} onChange={(e) => handleChange(e, setNameTitle)} />
                            </div>
                        }
                        {
                            multipleSelection &&
                            <div>
                                <p>Изменить описание проектов: </p>
                                <textarea type="text" value={par} onChange={(e) => handleChange(e, setPar)} />
                            </div>
                        }

                        {
                            multipleSelection &&
                            <div className={s.title}>Дополнительные поля</div>
                        }
                        {
                            multipleSelection && additionalFields &&
                            additionalFields.map((field, index) => (
                                <div key={index} className={s.fieldContainer}>
                                    <p>Название дополнительного поля:</p>
                                    <input
                                        type="text"
                                        value={field[0].key} // Используем field.key
                                        onChange={(e) => handleAdditionalFieldChange(index, e)}
                                    />
                                    <button className={s.deleteBtn} onClick={() => removeAdditionalField(index)}>
                                        <img src="/images/54324.png" style={{ width: "30px" }} alt="Удалить поле" />
                                    </button>
                                </div>
                            ))
                        }
                        {
                            multipleSelection &&
                            <button className={s.addBtn} onClick={addAdditionalField}>Добавить дополнительное поле</button>
                        }

                    </div>
                    <div className={s.title}>Основные поля</div>

                    {
                        fields.map((field, index) => (
                            <div key={index} className={s.fieldContainer} >
                                <p>Название поля:</p>
                                <input
                                    type="text"
                                    value={field.key} // Используем field.key
                                    onChange={(e) => handleFieldChange(index, e)}
                                />
                                <button className={s.deleteBtn} onClick={() => removeField(index)}>
                                    <img src="/images/54324.png" style={{ width: "30px" }} alt="Удалить поле" />
                                </button>
                            </div>
                        ))
                    }
                    
                    <button className={s.addBtn} onClick={addField}>Добавить поле</button>
                    <div className={s.rows}>
                        <div className={s.row}>
                            <input type="checkbox" checked={images} onChange={(e) => handleChangeCheckBox(e, setImages)}/>
                            <p>Изображения</p>
                        </div>
                            {
                                images && 
                                <textarea className={s.textInput} type="text" placeholder='Пояснение к изображениям' value={imagesText} onChange={(e) => handleChange(e, setImagesText)} />
                            }
                        <div className={s.row}>
                            <input type="checkbox" checked={docs}  onChange={(e) => handleChangeCheckBox(e, setDocs)}/>
                            <p>Документы</p>
                        </div>
                            {
                                docs && 
                                <textarea className={s.textInput} type="text" placeholder='Пояснение к документам' value={docsText} onChange={(e) => handleChange(e, setDocsText)} />
                            }
                        <div className={s.row}>

                            <input type="checkbox" checked={videos}  onChange={(e) => handleChangeCheckBox(e, setVideos)}/>
                            <p>Видео</p>
                        </div>
                            {
                                videos && 
                                <textarea className={s.textInput} type="text" placeholder='Пояснение к документам' value={videosText} onChange={(e) => handleChange(e, setVideosText)} />
                            }
                    </div>

                    {/* Раздел для дополнительных полей */}

                    <div className={s.title}>Критерия оценивания </div>
                    
                    

                    <div className={s.criteria}>
                        <h3>Основные критерий</h3>
                        { allCriteria &&
                            allCriteria.main && allCriteria.main.map((elem) => <div className={s.cr}><input value={elem.name}></input> <p onClick={() => deleteCriteria(elem.name, 'main')}>Удалить</p></div>)
                        }
        
                        <h3>Дополнительные критерий</h3>
                        { allCriteria &&
                            allCriteria.additional && allCriteria.additional.map((elem) => <div className={s.cr}><input value={elem.name}></input> <p onClick={() => deleteCriteria(elem.name, 'additional')}>Удалить</p></div>)
                        }
                        <input style={{marginTop: '50px'}} type="text" onChange={(e) => {handleChange(e, setNewCriteria)}} />
                        <div className={s.buttons}>
                            <button onClick={() => addNewCriteria('main')}>Добавить основную критерию</button>
                            <button onClick={() => addNewCriteria('additional')}>Добавить доп. критерию</button>
                        </div>
                    </div>

                    <button className={s.saveBtn} onClick={handleSave}>СОХРАНИТЬ</button>
                </div>
            }
        </div>
    )
}

export default AdminApplication
