import React from 'react'
import { Navigate, Route, Routes } from 'react-router';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import CallPage from './pages/CallPage.jsx';
import ChatPage from './pages/ChatPage';
import OnboardingPage from './pages/OnboardingPage.jsx';
import toast, {Toaster} from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from './lib/axios.js';



const App = () => {

  //transtack query
  //axios
  const {data: authData, isLoading, error} = useQuery({
    queryKey: ["authUser"],
    queryFn: async ()=> {
      const res = await axiosInstance.get("/auth/me");
      return res.data;
    },
    retry: false, //auth check
  });
const authUser =authData?.user

  return (
    <div className=' h-screen' data-theme="night" >
      <Routes>
       <Route path="/" element={authUser? <HomePage /> : <Navigate to={"/login"} />}/>
       <Route path="/signup" element={!authUser?<SignUpPage />: <Navigate to="/"/>}/>
       <Route path="/login" element={!authUser?<LoginPage />: <Navigate to= "/" />}/>
       <Route path="/notification" element={authUser?<NotificationsPage/>: <Navigate to={"/login"} />}/>
       <Route path="/call" element={authUser?<CallPage />:<Navigate to={"/login"} />}/>
       <Route path="/chat" element={authUser?<ChatPage />:<Navigate to={"/login"} />}/>
       <Route path="/onboarding" element={authUser?<OnboardingPage />: <Navigate to={"/login"} />}/>
      </Routes>
      <Toaster/>     
    </div>
  )
};

export default App