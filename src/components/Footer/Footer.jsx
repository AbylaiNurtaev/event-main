import React from 'react'
import s from './Footer.module.sass'

function Footer() {
  return (
    <div className={s.container}>
        <div className={s.left}>
            <div className={s.top}>
                <p style={{cursor: "pointer"}} onClick={() => window.open("/documents/Правила сайта (1).pdf", '_blank' )}>Положение о рейтинге</p>
                <p>|</p>
                <p style={{cursor: "pointer"}} onClick={() => window.open("/documents/Политика_конфиденциальности_и_обработки_персональных_данных_docx.pdf", '_blank' )}>Политика конфиденциальности</p>
            </div>
            <div className={s.top} style={{marginTop: '-10px'}}>
                <p style={{cursor: "pointer"}} onClick={() => window.open("/documents/Оферта.pdf", '_blank' )}>Оферта</p>
                <p>|</p>
                <p style={{cursor: "pointer"}} onClick={() => window.open("/documents/Размещение на сайте.docx.pdf", '_blank' )}>Размещение на сайте</p>
            </div>
            <p className={s.bottom}>Главный свадебный рейтинг в Казахстане</p>
        </div>

        <div className={s.right}>
            <div className={s.top}>
                <p>Контакты</p>
                <p>|</p>
                <p>+7-700-100-50-50</p>
                <p>|</p>
                <p>info@weds.kz</p>
            </div>

            <div className={s.bottom}>
                <button className={s.partnerBtn} onClick={() => window.location.href = 'https://wa.me/77070701904'}>стать партнёром</button>
                <img onClick={() => window.location.href = 'https://www.instagram.com/weds_kz'} src="/images/soc_med/instagram.svg" alt="" />
                <img onClick={() => window.location.href = 'https://web.telegram.org/a/#-1002242207327'} src="/images/soc_med/telegram.svg" alt="" />
                <img onClick={() => window.location.href = 'https://wa.me/77777670832?text=%D0%94%D0%BE%D0%B1%D1%80%D1%8B%D0%B9%20%D0%B4%D0%B5%D0%BD%D1%8C!%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B1%D1%8B%D1%82%D1%8C%20%D0%B7%D1%80%D0%B8%D1%82%D0%B5%D0%BB%D0%B5%D0%BC!%20'} style={{width: "18px", height: '18px', marginTop: '4px'}} src="/images/soc_med/whatsapp-white-icon.png" alt="" />
                
            </div>
        </div>
    </div>
  )
}

export default Footer