import React, { useEffect, useState } from 'react'
import s from './OpenedJoury.module.sass'
import { useNavigate, useParams } from 'react-router-dom'
import axios from '../../axios'

function OpenedJoury() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [user, setUser] = useState()
    const [showAllPhotos, setShowAllPhotos] = useState(false) // State to toggle photo visibility

    useEffect(() => {
        axios.post('/auth/getAllInfoPerson', { userId: id })
            .then((res) => res.data)
            .then(data => {
                console.log(data)
                setUser(data)
            })
    }, [id])

    const handleImageClick = () => {
        setShowAllPhotos(true) // Show all photos when the fourth image is clicked
    }

    return (
        <div className={s.container}>
            <div className={s.innerContainer}>
                <div className={s.top}>
                    <div className={s.crumbs}>
                        <img src="/images/fluent_arrow-up-28-filled.svg" alt="" />
                        <p onClick={() => navigate('/joury')}>Вернуться к жюри</p>
                    </div>
                </div>

                {user && (
                    <div className={s.mainSide}>
                        <div className={s.left}>
                            <div className={s.title}>{user.name}</div>
                            {/* <div className={s.nomination}>{user.nomination}</div> */}
                            {
                                (user.instagram || user.vk || user.youtube || user.tiktok) &&
                                
                                <p className={s.soc}>Соцсети:</p>
                            }
                            {user.instagram && (
                                <p className={s.socialMedia} onClick={() => window.open(user.instagram)}>Instagram</p>
                            )}
                            {user.vk && (
                                <p className={s.socialMedia} onClick={() => window.open(user.vk)}>Vk</p>
                            )}
                            {user.youtube && (
                                <p className={s.socialMedia} onClick={() => window.open(user.youtube)}>Youtube</p>
                            )}
                            {user.tiktok && (
                                <p className={s.socialMedia} onClick={() => window.open(user.tiktok)}>Tiktok</p>
                            )}
                            <div className={s.about} dangerouslySetInnerHTML={{ __html: user.about.replace(/\n/g, '<br />') }} />
                        <p style={{ marginTop: "40px", marginBottom: "20px" }}>Судит номинации:</p>
                        <p>
                            {
                                user?.acceptedNominations.map((elem, idx) => <span style={{ height: "10px", lineHeight: "30px" }} className={s.soc}>{idx != 0 ? `, ${elem}`: elem} </span>)
                            }
                        </p>

                        </div>
                        <div className={s.right}>
                            <img src={user.avatar} alt="" />
                        </div>
                    </div>
                )}

                {user && (
                    <div className={s.projectsSide}>
                        {
                            user.portfolio && user.portfolio.length >= 1 &&
                            
                            <div className={s.title}>ПРОЕКТЫ</div>
                        }
                        <div className={s.projects}>
                            {!showAllPhotos && user.portfolio && user.portfolio.slice(0, 4).map((elem, index) => (
                                <div key={index} className={s.projectImageWrapper}>
                                    <img 
                                        src={elem} 
                                        alt="project" 
                                        className={index === 3 ? s.lastImage : ''} 
                                        onClick={index === 3 ? handleImageClick : undefined} // Attach click handler
                                    />
                                    {index === 3 && user.portfolio.length > 4 && (
                                        <div className={s.overlay} onClick={handleImageClick}>
                                            <span className={s.overlayText}>+{user.portfolio.length - 4} фото</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {showAllPhotos && user.portfolio && (
                            <div className={s.projects}>
                                {user.portfolio.map((elem, index) => (
                                    <img key={index} src={elem} alt={`project ${index}`} className={s.fullImage} />
                                ))}
                                {/* <button className={s.closeButton} onClick={() => setShowAllPhotos(false)}>Закрыть</button> */}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default OpenedJoury;
