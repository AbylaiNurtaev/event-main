import React, { useEffect, useState } from 'react'
import s from './OpenedJournal.module.sass'
import { useNavigate, useParams } from 'react-router-dom'
import axios from '../../axios'

function OpenedJournal() {

    const { id } = useParams()
    const navigate = useNavigate()
    const [article, setArticle] = useState()

    useEffect(() => {
        axios.get(`/getJournalById/${id}`)
        .then(res => res.data)
        .then(data => {
            if(data){
                setArticle(data)
            }
        })
    }, [])

  return (
    <div className={s.container}>
        <div className={s.innerContainer}>
            <div className={s.crumbs}>
                <img src="/images/fluent_arrow-up-28-filled.svg" alt="" />
                <p onClick={() => navigate('/journal')}>Вернуться назад</p>
            </div>
            <div className={s.title}>{article?.title}</div>
            <div className={s.par}>{article?.par}</div>
            <div className={s.content} dangerouslySetInnerHTML={{ __html: article?.text }} />
            <button
            className={s.share}
                onClick={() => {
                    if (navigator.share) {
                    navigator.share({
                        title: document.title, // Название страницы
                        text: "Посмотрите эту страницу!",
                        url: window.location.href, // Текущий URL
                    })
                    .then(() => console.log('Успешно поделились!'))
                    .catch((error) => console.error('Ошибка при попытке поделиться:', error));
                    } else {
                    alert('Ваш браузер не поддерживает функцию "Поделиться".');
                    }
                }}
                >
                <img src="https://cdn-icons-png.flaticon.com/512/54/54628.png" alt="" />Поделиться этой статьей
                </button>
        </div>
    </div>
  )
}

export default OpenedJournal
