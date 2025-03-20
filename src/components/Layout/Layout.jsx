import React from 'react'
import Header from '../Header/Header'
import s from './Layout.module.sass'
import { Outlet } from 'react-router-dom'
import Footer from '../Footer/Footer'

function Layout() {
  return (
    <div className={s.big}>
      <div className={s.container}>
        <div className={s.header}>
          <Header></Header>
        </div>
          <div className={s.outlet}>
            <Outlet></Outlet><Footer></Footer>
          </div>
      </div>
    </div>
  )
}

export default Layout