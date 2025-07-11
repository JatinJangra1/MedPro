// import React, { useContext, useEffect, useState } from 'react'
// import { MdOutlineVisibility } from "react-icons/md";
// import { MdOutlineVisibilityOff } from "react-icons/md";
// import { AppContext } from '../context/AppContext';
// import { toast } from 'react-toastify';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// const Login = () => {
//   const navigate = useNavigate();
//   const {backendUrl,token,setToken} =useContext(AppContext); 
//   const [state,setState] =useState('Sign Up');
//   const [email,setEmail] = useState('');
//   const [password,setPassword] = useState('');
//   const [name,setName]  = useState(''); 
//   const [visibiltiy,setVisibility] = useState(false);
//   const onSubmitHandler = async(event)=>{
//     event.preventDefault();// after submitting form not reload the web page
//     try{
//       if(state==='Sign Up'){
//         // here we call register api
//         const {data} = await axios.post(backendUrl +'/api/user/register',{name,password,email});
//         if(data.success){
//           console.log("Token",data.token);
//           localStorage.setItem('token',data.token); 
//           setToken(data.token);
//         }
//         else{
//           toast.error(data.message);
//         }
//       }
//       else{
//         const {data} = await axios.post(backendUrl+'/api/user/login',{password,email});
//         if(data.success){
//           localStorage.setItem('token',data.token);
//           setToken(data.token);
//         }
//         else{
//           toast.error(data.message);
//         }
//       }
//     }
//     catch(err){
//       toast.error(err.message);
//     }
//   }

//   useEffect(()=>{
//     if(token){
//       navigate('/');
//     }
//   },[token])

//   return (
//     <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center '>
//       <div className='flex flex-col gap-3 m-auto items-start  p-8 min-w-[340px] sm:min-w-96  border rounded-xl text-zinc-600 text-sm shadow-lg'>
//         <p className='text-2xl font-semibold'>{state==='Sign Up'?"Create Account" : "Login"}</p>
//         <p>Please {state==='Sign Up'?"sign up" : "log in"} to book appointment</p>
//         {
//           state==='Sign Up'&& 
//            <div className='w-full'>
//           <p>Full Name </p>
//           <input className='border border-zinc-300 rounded w-full  p-2 mt-1' type="text" onChange={(e)=>setName(e.target.value)} value={name} />
//         </div>
//         }
       
//         <div className='w-full relative'>
//           <p>Email </p>
//           <input className='border border-zinc-300 rounded w-full  p-2 mt-1 pr-10' type="email" onChange={(e)=>setEmail(e.target.value)} value={email} />
//         </div>
//         <div className='w-full relative'>
//           <p>Password </p>
//           <input className='border border-zinc-300 rounded w-full  p-2 mt-1' type={visibiltiy ? 'text' : 'password'} onChange={(e)=>setPassword(e.target.value)} value={password} />
//           <span className='absolute right-3 top-[70%] translate-y-[-50%] cursor-pointer text-xl text-zinc-500' onClick={()=>setVisibility(!visibiltiy)} >
//             { 
//             visibiltiy ? <MdOutlineVisibilityOff  /> : <MdOutlineVisibility  />
//           }
//           </span>
          
//         </div>
//         <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>{state==='Sign Up' ? "Create Account" : "Login"}</button>
//         {
//           state==='Sign Up' ? <p>Already have an account? <span className='text-primary underline cursor-pointer' onClick={()=>setState('Login')}>Login here</span> </p> : <p>Create an new account? <span className='text-primary underline cursor-pointer' onClick={()=>setState('Sign Up')}>Click here</span> </p>
//         }
//       </div>
//     </form>
//   )
// }

// export default Login



import React, { useContext, useEffect, useState } from 'react';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, token, setToken } = useContext(AppContext);
  const [state, setState] = useState('Sign Up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email) return toast.error("Please enter email first");
    try {
      setLoading(true);
      const res = await axios.post(`${backendUrl}/api/user/send-otp`, { email });
      toast.success("OTP sent to email");
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (state === 'Sign Up') {
        if (!name || !email || !password || !otp) {
          return toast.error("All fields including OTP are required");
        }

        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
          otp
        });

        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          toast.success("Registered successfully");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password
        });

        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        } else {
          toast.error(data.message);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error occurred");
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Create Account" : "Login"}</p>
        <p>Please {state === 'Sign Up' ? "sign up" : "log in"} to book appointment</p>

        {state === 'Sign Up' && (
          <div className='w-full'>
            <p>Full Name</p>
            <input
              className='border border-zinc-300 rounded w-full p-2 mt-1'
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
        )}

        <div className='w-full relative'>
          <p>Email</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        {state === 'Sign Up' && (
          <div className='w-full'>
            <button
              type="button"
              onClick={sendOtp}
              className='text-blue-600 underline text-sm mt-1 mb-2'
              disabled={otpSent || loading}
            >
              {otpSent ? "OTP Sent ✅" : "Send OTP"}
            </button>
          </div>
        )}

        {state === 'Sign Up' && otpSent && (
          <div className='w-full'>
            <p>Enter OTP</p>
            <input
              className='border border-zinc-300 rounded w-full p-2 mt-1'
              type="text"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
            />
          </div>
        )}

        <div className='w-full relative'>
          <p>Password</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type={visibility ? 'text' : 'password'}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <span
            className='absolute right-3 top-[70%] translate-y-[-50%] cursor-pointer text-xl text-zinc-500'
            onClick={() => setVisibility(!visibility)}
          >
            {visibility ? <MdOutlineVisibilityOff /> : <MdOutlineVisibility />}
          </span>
        </div>

        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>
          {loading ? "Please wait..." : (state === 'Sign Up' ? "Create Account" : "Login")}
        </button>

        {state === 'Sign Up' ? (
          <p>Already have an account? <span className='text-primary underline cursor-pointer' onClick={() => setState('Login')}>Login here</span></p>
        ) : (
          <p>Create a new account? <span className='text-primary underline cursor-pointer' onClick={() => setState('Sign Up')}>Click here</span></p>
        )}
      </div>
    </form>
  );
};

export default Login;
