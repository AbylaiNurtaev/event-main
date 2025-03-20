import React, { useEffect } from 'react'
import s from './PaymentPage.module.sass'
import Questions from '../../components/Questions/Questions';
import axios from '../../axios'
import { useNavigate } from 'react-router-dom';

function PaymentPage() {
    const navigate = useNavigate()

    useEffect(() => {
        window.scroll({
            top: 0,
            behavior: "smooth"
        })
        const token = localStorage.getItem('token')
        if(!token){
            navigate('/login')
        }
    }, [])

    const id = localStorage.getItem('id');


    const payment = (price, balance) => {
        const script = document.createElement('script');
        script.src = 'https://js.fortebank.com/widget/be_gateway.js';
        script.async = true;
        document.body.appendChild(script);

    
        script.onload = () => {
            const payment = () => {
                const params = {
                    checkout_url: "https://securepayments.fortebank.com",
                    checkout: {
                        iframe: true,
                        test: false,
                        transaction_type: "payment",
                        public_key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7xa91g419KpJcfquSsg9GA+XDgSTFx+qLizNtaP598l337QGdWlwfQgFCm9GNLSx1yB8XC3hnPlwtEtLbxVjLQVYxJX+zPHmRmII7AOiacTyzzUPqyNhYdE4uNmDn16nBCRsl9nWgD3/Tol62StOvlZyWmDET/7zLvUAhdNKSQ/1nH4HwUS4zC5oSEYO6qkLikI+H7fo1Ezxeu0VejG6d2vlrqWoe36dK9wDejuBiogm8tw4AxSsp/rhuqLRClDyMx4gRXYSmDiPGI5uB08Mn5KDrlll1jXDbOjjXQNuyH35ukYWagiRdUxI4F7Jh3PmOMIO6VT/0ommn5DZ92OIEwIDAQAB",
                        order: {
                            amount: price,
                            currency: "KZT",
                            description: "Payment description",
                            tracking_id: "my_transaction_id"
                        },
                    },
                    closeWidget: function(status) {
                        console.debug('Widget closed with status:', status);
    
                        if (status === 'successful') {
                            axios.post('/auth/payment', {
                                id,
                                price: balance
                            })
                            .then((res) => res.data)
                            .then(data => {
                                if(data){
                                    navigate('/thanks')
                                }
                            })
                            .catch(err => console.log(err))
                            
                            // Здесь можно добавить дополнительную логику, например, редирект на другую страницу или уведомление пользователя
                        } else if (status === 'cancelled') {
                            console.log('Оплата отменена');
                        } else {
                            console.log('Ошибка при оплате или неопределенный статус');
                        }
                    }
                };
                new window.BeGateway(params).createWidget();
            };
    
            // Запускаем функцию оплаты
            payment();
        };
    
        return () => {
            document.body.removeChild(script);
        };
    };
    

  return (
    <div className={s.container}>
        <div className={s.innerContainer}>
        <div className={s.title}>ОПЛАТИТЬ</div>
        <div className={s.packets}>
            <div className={s.packet}>
                <div className={s.price}>120 000 ТЕНГЕ</div>
                <div className={s.value}>1 номинация</div>
                <button onClick={() => payment(12000000, 1)}>ОПЛАТИТЬ</button>
            </div>
            <div className={s.packet}>
                <div className={s.price}>210 000 ТЕНГЕ</div>
                <div className={s.value}>2 номинация</div>
                <button onClick={() => payment(21000000, 2)}>ОПЛАТИТЬ</button>
            </div>
            <div className={s.packet}>
                <div className={s.price}>300 000 ТЕНГЕ</div>
                <div className={s.value}>3 номинация</div>
                <button onClick={() => payment(30000000, 3)}>ОПЛАТИТЬ</button>
            </div>
            <div className={s.packet}>
                <div className={s.price}>380 000 ТЕНГЕ</div>
                <div className={s.value}>4 номинация</div>
                <button onClick={() => payment(38000000, 4)}>ОПЛАТИТЬ</button>
            </div>

        </div>
        </div>
        <div className={s.questions}>
            <Questions/>
        </div>
    </div>
  )
}

export default PaymentPage