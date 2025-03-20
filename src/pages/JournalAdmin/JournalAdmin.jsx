import React, { useEffect, useState, useRef } from 'react';
import s from './JournalAdmin.module.sass';
import axios from '../../axios';
import { useParams } from 'react-router-dom';
import JoditEditor from 'jodit-react';

function JournalAdmin() {
    const { id } = useParams();
    const editorRef = useRef(null); // Ссылка на редактор
    const [article, setArticle] = useState(null);
    const [title, setTitle] = useState('');
    const [par, setPar] = useState('');
    const [content, setContent] = useState(''); // Для хранения текста из редактора
    const [localFile, setLocalFile] = useState(null);

    const [avatarSrc, setAvatarSrc] = useState('');


    useEffect(() => {
        if (id !== 'new') {
            axios
                .get(`/getJournalById/${id}`)
                .then((res) => res.data)
                .then((data) => {
                    if (data) {
                        setArticle(data);
                        setTitle(data.title || '');
                        setPar(data.par || '');
                        setContent(data.text || ''); // Устанавливаем текст из статьи
                        setAvatarSrc(data.img || '/images/male-placeholder-image.jpeg');
                    }
                })
                .catch((err) => console.log('Произошла ошибка'));
        }
    }, [id]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setLocalFile(file); // Сохраняем локальный файл для отображения предпросмотра

        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'avatar');

        axios
            .post(`/uploadArticlePhoto/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((res) => {
                const { fileUrl } = res.data;
                setAvatarSrc(fileUrl); // Обновляем URL изображения
            })
            .catch((err) => console.log(err.message));
    };

    const sendInfo = () => {
        const dataToSend = {
            title,
            par,
            text: content, // Содержимое из редактора
        };

        if (id != 'new') {
            axios
                .post('/updateJournal', {
                    ...dataToSend,
                    id,
                })
                .then(() => alert('Данные сохранены!'))
                .catch(() => alert('Ошибка сохранения данных!'));
        } else {
            axios
                .post('/createJournal', {
                    ...dataToSend,
                })
                .then(() => alert('Данные сохранены!'))
                .catch(() => alert('Ошибка сохранения данных!'));
        }
    };

    return (
        <div className={s.container}>
            <div className={s.form}>
                <button className={s.saveBtn} onClick={sendInfo}>Сохранить</button>

                <label htmlFor="file-upload">
                    <img
                        src={localFile ? URL.createObjectURL(localFile) : avatarSrc}
                        alt="Avatar"
                        style={{ border: '1px solid #1001' }}
                    />
                </label>
                <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileUpload}
                    accept="image/*"
                    hidden={true}
                />

                <input
                    className={s.input}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Заголовок"
                />
                <input
                    className={s.input}
                    type="text"
                    value={par}
                    onChange={(e) => setPar(e.target.value)}
                    placeholder="Подзаголовок"
                />

                <JoditEditor
                    ref={editorRef}
                    value={content}
                    // config={config}
                    onBlur={(newContent) => {
                        console.log('Blur content:', newContent);
                        setContent(newContent);
                    }}
                    onChange={(newContent) => {
                        console.log('Change content:', newContent);
                        setContent(newContent);
                    }}
                />

            </div>
        </div>
    );
}

export default JournalAdmin;
