import React from 'react'
import { Route, Routes } from 'react-router';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import CallPage from './pages/CallPage.jsx';
import ChatPage from './pages/ChatPage';
import OnboardingPage from './pages/OnboardingPage.jsx';
import toast, {Toaster} from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';



const App = () => {

  //transtack query
  //axios
  const {data, isLoading, error, refetch} = useQuery({
    queryKey: ["todos"],
    queryFn: async ()=> {
      const res = await axios.get("https://jsonplaceholder.cypress.io/todos/1")
      return res.data;
    },
  });

  console.log({data});
  console.log({isLoading});
  console.log({error});

  return (
    <div className=' h-screen' data-theme="night" >
      <Routes>
       <Route path="/" element={<HomePage />}/>
       <Route path="/signup" element={<SignUpPage />}/>
       <Route path="/login" element={<LoginPage />}/>
       <Route path="/notification" element={<NotificationsPage />}/>
       <Route path="/call" element={<CallPage />}/>
       <Route path="/chat" element={<ChatPage />}/>
       <Route path="/onboarding" element={<OnboardingPage />}/>
      </Routes>
      <Toaster/>     
    </div>
  )
};

export default App