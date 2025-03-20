import React, { useEffect, useState } from 'react';
import axios from '../../axios';
import s from './LikedPage.module.sass';

function LikedPage() {
    const jouryId = localStorage.getItem('id');
    const [users, setUsers] = useState();
    const [applications, setApplications] = useState(null);
    const [liked, setLiked] = useState();

    useEffect(() => {
        let allNominations = []; // Переменная объявлена на уровне useEffect

        axios.get('/getJouries')
            .then(res => res.data)
            .then(data => {
                if (data) {
                    let joury = data.find((elem) => elem._id == jouryId);
                    setLiked(joury.liked);
                    console.log("finded Joury", joury);
                }
            });

        axios.get('/getAllUsersWithAvatars')
            .then(res => res.data)
            .then(data => {
                allNominations = data.map(user =>
                    user.applications
                        ? user.applications.map((elem) => ({
                            ...elem.application_data, // Копируем все данные из application_data
                            userId: user._id, // Добавляем user._id как поле userId
                            applicationId: elem.application_id, // Добавляем application_id как поле applicationId
                            accepted: elem.accepted,
                            avatar: user.avatarUrl,
                        }))
                        : null
                ).filter(nomination => nomination && nomination.length >= 1).flat();

                setUsers(allNominations);

                // Фильтрация данных после установки liked
                if (liked) {
                    const filteredApplications = allNominations.filter(nomination =>
                        liked.includes(nomination.applicationId)
                    );
                    setApplications(filteredApplications);
                }
            });
    }, [liked]); // Добавляем зависимость liked

    return (
        <div className={s.container}>
            <h1>Ваши избранные номинации: </h1>

            <div className={s.applications}>
                {applications?.map((application) =>
                    <div
                        className={s.application}
                        onClick={() => window.open(`/jouryChecking/${application.applicationId}/${application.userId}`, '_blank')}
                        key={application.applicationId}
                    >
                        <img src={application.avatar} alt="" />
                        <h4>{application.fullName}</h4>
                        <p>{application.specialization}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LikedPage;
