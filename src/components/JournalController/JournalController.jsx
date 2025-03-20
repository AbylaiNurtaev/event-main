import React, { useEffect, useState } from 'react'
import s from './JournalController.module.sass'
import axios from '../../axios'
import { useNavigate } from 'react-router-dom'
import mongoose from 'mongoose';
function JournalController() {

    const [allArticles, setAllArticles] = useState()
    

    useEffect(() => {
        axios.get('/getJournal')
        .then(res => res.data)
        .then(data => {
            if(data){
                setAllArticles(data)
            }
        })
    }, [])

    const deleteArticle = (id) => {
        axios.post('/deleteJournal', {
            id
        })
        .then(res => res.data)
        .then(data => {
            if(data){
                alert('Успешна удалена статья')
                setAllArticles(prev => prev.filter(elem => elem._id !== id))
            }
        })
        .catch(err => alert('произошла ошибка'))
        
    }


  return (
    <div className={s.container}>
        <div className={s.top}>
            <h1>Журнал</h1>
            <button 
    onClick={() => {
        const newId = new mongoose.Types.ObjectId(); // Генерируем новый ObjectId
        window.open(`/journal/${newId}`);
    }}
>Добавить</button>
        </div>

        <div className={s.articles}>
            {   allArticles && 
                allArticles.map((elem, idx) => 
                    <div className={s.article} key={idx}>
                        <p onClick={() => window.open(`/journal/${elem._id}`)}>{elem.title}</p>
                        <p onClick={() => deleteArticle(elem._id)}>Удалить</p>
                    </div>
                )
            }
        </div>
    </div>
  )
}

export default JournalController
