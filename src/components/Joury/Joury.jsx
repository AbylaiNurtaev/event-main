import React, { useEffect, useState } from 'react';
import s from './Joury.module.sass';
import axios from '../../axios'
import { useNavigate } from 'react-router-dom';

function Joury() {
    const [peoples, setPeoples] = useState()
    const [isMobile, setIsMobile] = useState(false);
    const navigate =  useNavigate()

    useEffect(() => {
        // axios.get('/getJouries')
        // .then(res => res.data)
        // .then(data => {
        //     setPeoples(data)    
        // })
        axios.get('/getJouriesWithAvatars')
            .then(res => res.data)
            .then(data => {
                data.sort((a, b) => a.order - b.order); 
                console.log('dataJoury', data);
                
                setPeoples(data);
            })
    }, [])

    useEffect(() => {
      const mediaQuery = window.matchMedia('(max-width: 767px)'); // Определяем мобильные устройства по ширине экрана
  
      const handleDeviceChange = (e) => {
        setIsMobile(e.matches);
      };
  
      // Проверяем начальное состояние
      setIsMobile(mediaQuery.matches);
  
      // Добавляем слушатель для отслеживания изменений
      mediaQuery.addListener(handleDeviceChange);
  
      // Удаляем слушатель при размонтировании компонента
      return () => {
        mediaQuery.removeListener(handleDeviceChange);
      };
    }, []);

    const [currentIndex, setCurrentIndex] = useState(0);

    const moveToRight = () => {
        if(isMobile){
            setCurrentIndex(prevIndex => (prevIndex + 1) % peoples.length);
        }
        else{
            setCurrentIndex(prevIndex => (prevIndex + 3) % peoples.length)
        }
    };

    const moveToLeft = () => {
        if(isMobile){

            setCurrentIndex(prevIndex => (prevIndex - 1 + peoples.length) % peoples.length);
        }
        else{
            setCurrentIndex(prevIndex => (prevIndex - 3 + peoples.length) % peoples.length)
        }
    };

    return (
        <div className={s.joury}>
            <h1 className={s.title}>ЖЮРИ</h1>
            <p className={s.par}>Жюри WEDS — признанные эксперты свадебной индустрии. Их профессионализм и независимость гарантируют объективность и высокий уровень рейтинга.</p>
            <div className={s.buttons}>
                <img className={s.leftBtn} onClick={moveToLeft} src="/images/Frame 2.svg" alt="Left" />
                <img className={s.rightBtn} onClick={moveToRight} src="/images/Frame 2.svg" alt="Right" />
            </div>

            <div className={s.peoples}>
                {peoples && peoples.map((elem, index) => (
                    <div
                        key={index}
                        className={`${s.block} ${index === currentIndex ? s.active : ''}`}
                        style={{ transform: `translateX(${(index - currentIndex) * 66.66}%)` }}
                        onClick={() => navigate(`/joury/${elem._id}`)}
                    >
                        <img src={elem.avatarUrl} alt="" />
                        <h4>{elem.name}</h4>
                        <p>{elem.job}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Joury;
