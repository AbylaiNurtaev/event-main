import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import s from './JouryPage.module.sass';

import Questions from '../../components/Questions/Questions';
import axios from '../../axios';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

function JouryPage() {
    const navigate = useNavigate();
    const [peoples, setPeoples] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredPeoples, setFilteredPeoples] = useState([]);
    const [filteredPeoples2, setFilteredPeoples2] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('ВСЕ');

    // Загружаем категории
    useEffect(() => {
        axios.get('/nom')
            .then(res => {
                const data = res.data;
                
                const uniqueCategories = [...new Set(data.flatMap(item => item.nomination))];
                setCategories(['ВСЕ', ...uniqueCategories]); // Добавляем "ВСЕ" как дефолтное значение
            });
    }, []);

    // Загружаем жюри
    useEffect(() => {
        axios.get('/getJouriesWithAvatars')
            .then(res => res.data)
            .then(data => {
                if (data) {
                    data.sort((a, b) => a.order - b.order); 
                    setPeoples(data);
                    
                    const filtered = data.filter(person => person.additionalJoury == false);
                    const filtered2 = data.filter(person => person.additionalJoury == true);
                    setFilteredPeoples(filtered);
                    setFilteredPeoples2(filtered2);
                }
            });
    }, []);

    // Обработчик изменения категории
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    
        if (category === 'ВСЕ') {
            const filtered = peoples.filter(person => person.additionalJoury == false);
            const filtered2 = peoples.filter(person => person.additionalJoury == true);
            setFilteredPeoples(filtered);
            setFilteredPeoples2(filtered2);
        } else {
            // Приводим к одному регистру для корректного сравнения
            const filtered = peoples.filter(person =>
                person.acceptedNominations?.some(nomination =>
                    nomination.toLowerCase() === category.toLowerCase()
                ) && person.additionalJoury == false
            );
            const filtered2 = peoples.filter(person =>
                person.acceptedNominations?.some(nomination =>
                    nomination.toLowerCase() === category.toLowerCase()
                ) && person.additionalJoury == true
            );
            setFilteredPeoples(filtered);
            setFilteredPeoples2(filtered2);
        }
    };
    

    return (
        <div className={s.container}>
            <div className={s.crumbs}>
                <p onClick={() => navigate('/')}>Главная</p>
                <p>|</p>
                <p>Жюри</p>
            </div>
            <div className={s.about}>
                <h1>Жюри премии</h1>
                <div className={s.selectBlock}>
                    <h3>КАТЕГОРИЯ: </h3>
                    {/* <select     style={{
    }} onChange={(e) => handleCategoryChange(e.target.value)} value={selectedCategory}>
                        {categories.map((category, index) => (
                            <option style={{ fontSize: '17px' }} key={index} value={category}>{category}</option>
                        ))}
                    </select> */}
                    <FormControl style={{ width: "400px" }}>
                    <Select
                        id="demo-simple-select"
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        style={{border: 'none', outline: "none" }}
                    >
                        {categories.map((category, index) => (
                            <MenuItem style={{ fontSize: '17px' }} key={index} value={category}>{category}</MenuItem>
                        ))}
                    </Select>
                    </FormControl>
                </div>
                <p className={s.par}>
                    Жюри WEDS — признанные эксперты свадебной индустрии. Их профессионализм и независимость гарантируют объективность и высокий уровень премии.
                </p>
            </div>
                {/* {
                    filteredPeoples.length > 0 &&
                    <h3 style={{marginTop: '30px', marginBottom: "30px", color: "#ca252a"}} className={s.peoples}>Основное жюри</h3>
                } */}
            <div className={s.peoples} id="peoples">
                {filteredPeoples.length > 0 ? (
                    filteredPeoples.map((elem, index) => (
                        <div key={index} className={s.block} onClick={() => navigate(`/joury/${elem._id}`)}>
                            <img src={elem.avatarUrl} alt="" />
                            <h4>{elem.name}</h4>
                            <p>{elem.job}</p>
                        </div>
                    ))
                ) : (
                    <p>Для данной номинации еще не назначены жюри</p>
                )}
            </div>
                {
                    filteredPeoples2.length > 0 &&
                    <h3 style={{marginTop: '30px', marginBottom: "30px", color: "#ca252a"}} className={s.peoples}>Жюри по категории</h3>
                }
                <div className={s.peoples} style={{marginTop: 0}}>
                    {filteredPeoples2.length > 0 &&
                        filteredPeoples2.map((elem, index) => (
                            <div key={index} className={s.block} onClick={() => navigate(`/joury/${elem._id}`)}>
                                <img src={elem.avatarUrl} alt="" />
                                <h4>{elem.name}</h4>
                                <p>{elem.job}</p>
                            </div>
                        ))}
                </div>
            <div className={s.questions}>
                <Questions />
            </div>
        </div>
    );
}

export default JouryPage;
