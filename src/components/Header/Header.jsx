import React, { useEffect, useState } from 'react'
import s from './Header.module.sass'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from '../../axios'
import { type } from '@testing-library/user-event/dist/type'

function Header() {


    const navigate = useNavigate()

    const [burgerMenu, setBurgerMenu] = useState()
    const [user, setUser] = useState()

    const scrollDownMobile = () => {
        setBurgerMenu(false)
        window.scroll({
            behavior: "smooth",
            top: document.body.scrollHeight - 2300
        })
    }
    const scrollDown = () => {
        window.scroll({
            behavior: "smooth",
            top: document.body.scrollHeight - 1300
        })
    }


    const id = localStorage.getItem('id')

    const [deadline, setDeadline] = useState("")
    const [dateJoury, setDateJoury] = useState(null)


    function isDateInFuture(dateString) {
        const inputDate = new Date(dateString); // Преобразуем строку в объект Date
        const today = new Date(); // Текущая дата
    
        // Обнуляем время, чтобы сравнивать только даты
        today.setHours(0, 0, 0, 0);
        inputDate.setHours(0, 0, 0, 0);
    
    
        return inputDate > today; // true, если дата из будущего
    }

    useEffect(() => {
        axios.get('/getDeadline')
        .then(res => res.data)
        .then(data => {
            
            setDeadline(data[data.length-1])
            setDateJoury(isDateInFuture(data[data.length-1].dateJoury))
            console.log(data[data.length-1])
    })
    }, [])

    console.log('dateJoury', dateJoury);
    
    
    const location = useLocation()
    useEffect(() => {
        setTimeout(() => {
            const id = localStorage.getItem('id')
            axios.post('/auth/getUser', {userId: id, type: 'logo'})
            .then((res) => res.data)
            .then(data => {
                console.log("dsds", data, id)
                setUser(data)
        })
        }, 1000)

    }, [])


    return (<>
        <div className={s.container}>
            <img src="/images/Logo.svg" onClick={() => navigate('/')} alt="logo" className={s.logo} />
            <p className={s.par}>Главный свадебный рейтинг в Казахстане</p>
            <div className={s.links}>
                <p onClick={() => navigate('/about')} style={location && location.pathname == "/about" ? { color: '#f4444a' } : {}}>О рейтинге</p>
                <p onClick={() => navigate('/critery')} style={location && location.pathname == "/critery" ? { color: '#f4444a' } : {}}>Критерии</p>
                <p onClick={() => navigate('/nominations')} style={location && location.pathname == "/nominations" ? { color: '#f4444a' } : {}}>Номинации</p>
                <p onClick={() => navigate('/joury')} style={location && location.pathname == "/joury" ? { color: '#f4444a' } : {}}>Жюри</p>
                {
                    dateJoury == false &&
                    <p onClick={() => navigate('/results')} style={location && location.pathname == "/results" ? { color: '#f4444a' } : {}}>Результаты</p>
                }
                <p onClick={() => navigate('/journal')} style={location && location.pathname == "/journal" ? { color: '#f4444a' } : {}}>Журнал</p>
                <p onClick={scrollDown}>Вопросы и ответы</p>
                <p onClick={() => navigate('/contacts')} style={location && location.pathname == "/contacts" ? { color: '#f4444a' } : {}}>Контакты</p>
            </div>

            <div className={s.date} onClick={user?.name ? () => navigate('/application/new') : () => navigate('/login')}>
                {
                    deadline && 
                    <p className={s.dataText}>{deadline.deadline}-{deadline.deadline2}</p>
                }
                <div>
                    {
                        deadline &&
                        <p>{deadline.month}</p>
                    }
                    <button >подать заявку</button>
                </div>
            </div>

            {
                user?.name ?
                    <div style={{cursor: "pointer"}} className={s.name}>
                        <h5 onClick={() => {navigate(`/cabinet/${user._id}`)}}>{user.name}</h5>
                        <p onClick={() => {navigate('/payment')}}>Баланс: {user && user.balance} заявок</p>
                    </div> :
                    <div className={s.exit} onClick={() => {navigate('/login')}}>
                        <img src="/images/exit.svg" alt="exit" />
                        <p>ВОЙТИ</p>
                    </div>
            }
            <button className={s.viewBtn} onClick={() => window.location.href="https://api.whatsapp.com/send/?phone=77777670832&text=%D0%94%D0%BE%D0%B1%D1%80%D1%8B%D0%B9+%D0%B4%D0%B5%D0%BD%D1%8C%21+%D0%A5%D0%BE%D1%87%D1%83+%D0%B1%D1%8B%D1%82%D1%8C+%D0%B7%D1%80%D0%B8%D1%82%D0%B5%D0%BB%D0%B5%D0%BC%21+&type=phone_number&app_absent=0"}>
                СТАТЬ ЗРИТЕЛЕМ
            </button>
        </div>

        <div className={s.mobileContainer}>
            {/* <img src="/images/white-back.svg" className={s.light} alt="" /> */}
            <img onClick={() => navigate('/')} className={s.logo} src='/images/Logo (1).svg'></img>
            <img className={s.burgerMenuBtn} onClick={() => setBurgerMenu(true)} src='/images/nimbus_menu.svg'></img>
            {
                burgerMenu &&
                <div className={s.burgerMenu}>
                    <div className={s.inner}>
                        <div className={s.closeDiv}>

                            <img src="/images/clarity_close-line.svg" onClick={() => setBurgerMenu(false)} alt="" className={s.close} />
                        </div>
                        
                        {
                            user?.name ?
                                <div className={s.name}>
                                    <h5 onClick={() => {navigate(`/cabinet/${user._id}`); setBurgerMenu(false)}}>{user.name}</h5>
                                    <p  onClick={() => {navigate('/payment'); setBurgerMenu(false)}}>Баланс: {user && user.balance} заявок</p>
                                </div> :
                                <div className={s.exit} onClick={() => {navigate('/login'); setBurgerMenu(false)}}>
                                    <img src="/images/exit.svg" alt="exit" />
                                    <p>ВОЙТИ</p>
                                </div>
                        }

                        <div className={s.links}>
                            <p onClick={() => { navigate('/about'); setBurgerMenu(false) }} style={location && location.pathname == "/about" ? { color: '#f4444a' } : {}}>О рейтинге</p>
                            <p onClick={() => { navigate('/critery'); setBurgerMenu(false) }} style={location && location.pathname == "/critery" ? { color: '#f4444a' } : {}}>Критерии</p>
                            <p onClick={() => { navigate('/nominations'); setBurgerMenu(false) }} style={location && location.pathname == "/nominations" ? { color: '#f4444a' } : {}}>Номинации</p>
                            <p onClick={() => { navigate('/journal'); setBurgerMenu(false) }} style={location && location.pathname == "/journal" ? { color: '#f4444a' } : {}}>Журнал</p>
                            <p onClick={() => { navigate('/joury'); setBurgerMenu(false) }} style={location && location.pathname == "/joury" ? { color: '#f4444a' } : {}}>Жюри</p>
                            {
                                dateJoury == false &&
                                <p onClick={() => {navigate('/results'); ; setBurgerMenu(false)}} style={location && location.pathname == "/results" ? { color: '#f4444a' } : {}}>Результаты</p>
                            }
                            <p onClick={scrollDownMobile}>Вопросы и ответы</p>
                            <p onClick={() => { navigate('/contacts'); setBurgerMenu(false) }} style={location && location.pathname == "/contacts" ? { color: '#f4444a' } : {}}>Контакты</p>
                        </div>

                        <div className={s.date} onClick={user?.name ? () => {navigate('/application/new'); setBurgerMenu(false)} : () => {navigate('/login'); setBurgerMenu(false)}}>
                {
                    deadline && 
                    <p className={s.dataText}>{deadline.deadline}-{deadline.deadline2}</p>
                }
                <div>
                    {
                        deadline &&
                        <p>{deadline.month}</p>
                    }
                    <button >подать заявку</button>
                </div>
            </div>
                        <button className={s.viewBtn} onClick={() => window.location.href="https://api.whatsapp.com/send/?phone=77777670832&text=%D0%94%D0%BE%D0%B1%D1%80%D1%8B%D0%B9+%D0%B4%D0%B5%D0%BD%D1%8C%21+%D0%A5%D0%BE%D1%87%D1%83+%D0%B1%D1%8B%D1%82%D1%8C+%D0%B7%D1%80%D0%B8%D1%82%D0%B5%D0%BB%D0%B5%D0%BC%21+&type=phone_number&app_absent=0"}>
                СТАТЬ ЗРИТЕЛЕМ
                    </button>


                    </div>
                </div>
            }
        </div>


    </>
    )
}

export default Header