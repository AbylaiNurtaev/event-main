import React, { useState } from 'react'
import s from './BalancePopup.module.sass'
import { useNavigate } from 'react-router-dom'

function 

BalancePopup() {
    const navigate = useNavigate()
    const [close, setClose] = useState(false)
  return (
    <>
{
    !close && 
    <div className={s.shadow}></div>
}    
    <div className={s.container} style={close ? {display: 'none'} : {}}>
        <div className={s.top}>
            <div className={s.title}>Внимание!</div>
            <img style={{cursor: 'pointer'}} onClick={() => setClose(true)} src="/images/Frame 67.svg" alt="" />
        </div>
        <div className={s.par}>Для участия в рейтинге Вам необходимо оплатить стоимость оформления заявки.</div>
        <button onClick={() => {navigate('/payment')}}>оплатить</button>
    </div>
    </>
  )
}

export default BalancePopup