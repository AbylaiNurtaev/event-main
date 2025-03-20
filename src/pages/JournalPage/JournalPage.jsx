import React, { useEffect, useState } from 'react'
import s from './JournalPage.module.sass'
import { useNavigate } from 'react-router-dom'
import axios from '../../axios'

function JournalPage() {

  const navigate = useNavigate()

  const [articles, setArticles] = useState()

  useEffect(() => {
    axios.get('/getJournals')
    .then(res => res.data)
    .then(data => {
      if(data){
        console.log(data);
        
        setArticles(data)
      }
    })
    .catch(err => alert('Произошла ошибка'))
  }, [])

  return (
    <div className={s.container}>
        <div className={s.innerContainer}>
          <div className={s.crumbs}>
              <img src="/images/fluent_arrow-up-28-filled.svg" alt="" />
              <p onClick={() => navigate('/')}>Вернуться назад</p>
            </div>

            <div className={s.title}><span>ЖУРНАЛ</span> WEDS</div>

            <div className={s.articles}>
            {articles?.length >= 1  ?
              articles.map((elem, idx) => {
                const className =
                  idx % 3 === 0
                    ? `${s.article1}` // Для 1, 4, 7, ...
                    : `${s.article2}`; // Для 2, 3, 5, 6, ...

                return (
                  <div className={className} key={idx} onClick={() => navigate(`/openedArticle/${elem._id}`)}>
                    <img src={elem.img} alt="" />
                    <div className={s.title}>{elem.title}</div>
                    <div className={s.par}>{elem.par}</div>
                  </div>
                );
              })
            :
            <div className={s.articles}>
              <img src="/images/journal.png" style={{ width: "100%" }} alt="" />
            </div>
            }

            </div>
        </div>
    </div>
  )
}

export default JournalPage
