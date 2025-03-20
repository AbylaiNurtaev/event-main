import React, { useEffect, useState } from 'react'
import s from './AdminPage.module.sass'
import axios from '../../axios'
import AdminNominations from '../../components/AdminNominations/AdminNominations'
import AddJoury from '../../components/AddJoury/AddJoury'
import AddDeadline from '../../components/AddDeadline/AddDeadline'
import AllUsers from '../../components/AllUsers/AllUsers'
import Applications from '../../components/Applications/Applications'
import JournalController from '../../components/JournalController/JournalController'



function AdminPage() {
    const id = localStorage.getItem('id')
    const[access, setAccess] = useState(false)
    const [header, setHeader] = useState("Добавить жюри")


    useEffect(() => {
        if(id){
            axios.post('/loginAdmin', { id: id })
            .then((res) => res.data)
            .then(data => {
                if(data){
                    setAccess(true)
                }
            })
            .catch((err) => console.log(err.message))
        }else{
            alert("Авторизуйтесь пожалуйста")
        }

    }, [])



  return (
    <>
        {
            access && 
            <div className={s.container}>
                <div className={s.header}>
                    <p onClick={() => setHeader("Добавить жюри")}>Добавить жюри</p>
                    <p onClick={() => setHeader("Номинации")}>Номинации</p>
                    <p onClick={() => setHeader("Сроки подачи")}>Сроки подачи</p>
                    <p onClick={() => setHeader("Пользователи")}>Пользователи</p>
                    <p onClick={() => setHeader("Заявки")}>Заявки</p>
                    <p onClick={() => setHeader("Журнал")}>Журнал</p>
                    
                </div>
                <div className={s.innerContainer}>
                    {
                        header == "Номинации" && <AdminNominations/>
                    }
                    {
                        header == "Добавить жюри" && <AddJoury/>
                    }
                    {
                        header == "Сроки подачи" && <AddDeadline/>
                    }
                    {
                        header == "Пользователи" && <AllUsers/>
                    }
                    {
                        header == "Заявки" && <Applications/>
                    }
                    {
                        header == "Журнал" && <JournalController/>
                    }
                </div>
            </div>
        }
    </>
  )
}

export default AdminPage