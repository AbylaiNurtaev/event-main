import React, { useEffect, useState } from 'react'
import s from './AddDeadline.module.sass'
import axios from '../../axios'

function AddDeadline() {
    const [deadline, setDeadline] = useState("")
    const [deadline2, setDeadline2] = useState("")
    const [month, setMonth] = useState("")

    const [date, setDate] = useState()
    const [dateJoury, setDateJoury] = useState()

    const handleChange = (e, setter) => {
        setter(e.target.value)
    }

    useEffect(() => {
        axios.get('/getDeadline')
        .then(res => res.data)
        .then(data => {
            console.log(data)
            setDeadline(data[data.length-1].deadline)
            setDeadline2(data[data.length-1].deadline2)
            setMonth(data[data.length-1].month)
            setDate(data[data.length-1].date)
            setDateJoury(data[data.length-1].dateJoury)
    })
    }, [])

    const submitDeadline = () => {
        if(deadline.length > 0 && deadline2.length > 0 && month.length > 0){
            axios.post('/setDeadline', {deadline, deadline2, month, date, dateJoury})
            .then(res => res.data)
            .then(data => {
                if(data){
                    alert("Успешно обновлены сроки")
                }
            })
        }
        else{
            alert("Заполните все поля")
        }
    }
  return (
    <div className={s.container}>
        
                <p className={s.title}>Дата проведения мероприятия</p>
                <input type="text" placeholder='Первый день'  value={deadline} onChange={(e) => {handleChange(e, setDeadline)}}/>
                <input type="text" placeholder='Второй день' value={deadline2} onChange={(e) => {handleChange(e, setDeadline2)}}/>
                <input type="text" placeholder='Месяц' value={month} onChange={(e) => {handleChange(e, setMonth)}}/>
                <p className={s.title}>Дата подачи заявок</p>
                <input type="date" value={date} onChange={(e) => handleChange(e, setDate)}/>
                <p className={s.title}>Дата оценок жюри</p>
                <input type="date" value={dateJoury} onChange={(e) => handleChange(e, setDateJoury)}/>
                <button onClick={submitDeadline}>Выставить даты</button>
            
    </div>
  )
}

export default AddDeadline