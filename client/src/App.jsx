
import React, { useEffect, useState } from 'react'
import { Route, Router , Routes} from 'react-router'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import NotificationPage from './pages/NotificationPage'
import ChatPage from './pages/ChatPage'
import OnBoardingPage from './pages/OnBoardingPage'
import CallPage from './pages/CallPage'
import toast, { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from './lib/axios'


const App = () => {
 
 const {data}=useQuery({queryKey:["todos"],

  queryFn:async() =>{
    const res=await axiosInstance.get(`http://localhost:5001/api/auth/me`)

    return res.data;
  }
 })

 console.log({data});



  return (
    <div className='h-screen' data-theme="synthwave" >
      <h2>hello</h2>
      <button  onClick={()=>toast.success('Hello world!')}>Crate a toast</button>
       <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/sign-up' element={<SignUpPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/Notification' element={<NotificationPage/>}/>
        <Route path='/chat' element={<ChatPage/>}/>
        <Route path='/onBoarding' element={<OnBoardingPage/>}/>
      <Route path='/call' element={<CallPage/>}/>

       </Routes>
        <Toaster position="top-center" reverseOrder={false} />
    </div>
  )
}

export default App
