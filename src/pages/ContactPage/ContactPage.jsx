import React, { useEffect } from 'react'
import s from './ContactPage.module.sass'
import { useNavigate } from 'react-router-dom'
import Questions from '../../components/Questions/Questions'

function ContactPage() {
    const navigate = useNavigate()

    useEffect(() => {
        window.scroll({
            top: 0,
            behavior: "smooth"
        })
    }, [])

  return (
    <div className={s.container}>
            <div className={s.crumbs}>
                <p onClick={() => navigate('/')}>Главная</p>
                <p>|</p>
                <p>Контакты</p>
            </div>
            <div className={s.about}>
                <h1>Контакты</h1>
            </div>

            <div className={s.contacts}>
                <div className={s.left}>
                    <div className={s.gray}>WEDS</div>
                    <div className={s.title}>АДРЕС</div>
                    <p>​г. Астана, улица Гейдара Алиева, 14</p>
                </div>
                <div className={s.middle}>
                    <div className={s.gray}>Редакция</div>
                    <div className={s.title}>Weds Astana</div>
                    <p>+7 707 070 1904</p>
                    <p>weds.astana@gmail.com </p>
                    <p>@wedsastana</p>
                </div>
                {/* <div className={s.right}>
                    <div className={s.gray}>Реклама и спецпроекты</div>
                    <div className={s.title}>Марк Носач</div>
                    <p>+7-700-200-60-50</p>
                    <p>mark@weds.kz</p>
                    <p>@mark</p>
                </div> */}
            </div>

            <img className={s.img} src="/images/image (13).svg" alt="" loading='lazy' />
            <div className={s.questions}>

                <Questions/>
            </div>
    </div>
                
  )
}

export default ContactPage