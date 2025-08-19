import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PandaIcon } from 'lucide-react';
import  { useState } from 'react'
// import { login } from '../lib/api.js';
import { Link } from 'react-router';
import useLogin from '../hooks/useLogin.js';
import ForgotPassword from '../components/ForgotPassword';

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // const queryClient = useQueryClient();

//  const {mutate: loginMutation ,isPending, error} =useMutation({
//   mutationFn: login,
//   onSuccess: ()=> queryClient.invalidateQueries({queryKey: ["authUser"]})
//  });

const {isPending, error, loginMutation} = useLogin();

 const handleLogin =(e) => {
  e.preventDefault();
  loginMutation(loginData);
 }

 if (showForgotPassword) {
   return (
     <div className='h-screen flex items-center justify-center p-4 sm:p-6 md:p-8' data-theme ='forest'>
       <div className='border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden'>
         <div className='w-full lg:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col'>
           <ForgotPassword onBack={() => setShowForgotPassword(false)} />
         </div>
         {/* IMAGE SECTION */}
         <div className='hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center'>
           <div className='max-w-md p-8'>
             {/* ILLUSTRATION */}
             <div className='relative aspect-square max-w-sm mx-auto'>
               <img src="/i.png" alt="Language connection illustration" className='w-full h-full'/>
             </div>

             <div className='text-center space-y-3 mt-6'>
               <h2 className='text-xl font-semibold'>Connect with adventurous partners worldwide</h2>
               <p className='opacity-70'>
                 Practice conversation, adventurous, make-friends and improve your communication skills with MeeterUp
               </p>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 }

  return (
    <div  className='h-screen flex items-center justify-center p-4 sm:p-6 md:p-8' data-theme ='forest'>
      <div  className='border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden'>
        {/* LOGIN FORM SECTION */}
        <div className='w-full lg:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col'>
        {/* LOGO */ }
        <div className='mb-4 flex items-center justify-start gap-2' >
          <PandaIcon className=' size-9 text-primary' />
          <span className='text-3xl font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking=wider'>
            MeeterUp
          </span>
        </div>
        {/* ERROR IF ANY */}
        {error && (
          <div className='alert alert-error mb-4' >
            <span>{error.response.data}</span>
          </div>
        )}

        <div className='w-full'>
          <form onSubmit={handleLogin}>
            <div className='space-y-4' >
              <div>
                <h2 className='text-xl font-semibold'>Welcome back</h2>
                <p className='text-sm opacity-70' >
                  Sign in to your account to continue your adventurous journey
                </p>
              </div>
              <div className='flex flex-col gap-3'>
                {/* EMAIL */}
                <div className='form-control w-full space-y-2' >
                  <label className="label">
                    <span className='label-text' >Email</span>
                  </label>
                  <input 
                  type="email" 
                  placeholder='hello@example.com'
                  className='input input-bordered w-full'
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                  />             
                </div>
                {/* PASSWORD */}
                <div className='form-control w-full space-y-2' >
                  <label className="label">
                    <span className='label-text' >Password</span>
                  </label>
                  <input 
                  type="password" 
                  placeholder='********'
                  className='input input-bordered w-full'
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                  />             
                </div>

                {/* Forgot Password Link */}
                <div className='text-right'>
                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className='text-sm text-primary hover:underline'
                  >
                    Forgot your password?
                  </button>
                </div>

                <button type='submit' className='btn btn-primary w-full' disabled={isPending} >
                  {isPending ? (
                    <>
                    <span className='loading loading-spinner loading-xs' ></span>
                    Signing in...
                    </>
                  ): (
                    "Sign In"
                  )}
                </button>

                <div className='text-center mt-4' >
                  <p className='text-sm'>
                    Dont't have an account?{" "}
                    <Link to='/signup' className='text-primary hover:underline'>
                      Create one
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
        </div>
        {/*  IMAGE SECTION */}
        <div className='hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center'>
          <div className='max-w-md p-8'>
            {/* ILLUSTRATION */}
            <div className='relative aspect-square max-w-sm mx-auto'>
              <img src="/i.png" alt="Language connection illustration" className='w-full h-full'/>
            </div>

            <div className='text-center space-y-3 mt-6'>
              <h2 className='text-xl font-semibold'>Connect with adventurous partners worldwide</h2>
              <p className='opacity-70'>
                Practice conversation, adventurous, make-friends and improve your communication skills with MeeterUp
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage