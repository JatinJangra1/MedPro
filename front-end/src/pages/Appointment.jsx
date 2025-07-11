import React, { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { useState } from 'react';
import { assets } from '../assets/assets_frontend/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'
import axios from 'axios'
const Appointment = () => {
  const {docId } = useParams();
  const {doctors,backendUrl,token,getDoctorsData} = useContext(AppContext);
  const daysOfWeek = ['SUN','MON','TUE','WED','THU','FRI','SAT']; 
  const[docInfo,setDocInfo] = useState(null);
  const fetchDocInfo = async()=>{
     const docInfo = doctors.find(doc =>doc._id===docId);
     setDocInfo(docInfo);
     console.log(docInfo);
  }
  const [docSlots,setDocSlots] = useState([]);
  const [slotIndex,setSlotIndex] = useState(0);
  const [slotTime,setSlotTime] = useState('');
  const navigate = useNavigate();
  // const getAvailableSlots = async()=>{
  //   setDocSlots([])
  //   // getting current date
  //    let today = new Date();
  //    for(let i=0;i<7;i++){
  //     //getting date with index
  //     let currentDate = new Date(today);
  //     currentDate.setDate(today.getDate()+i);
  //     // setting end time of date with index
  //     let endTime = new Date();
  //     endTime.setDate(today.getDate()+i);
  //     endTime.setHours(21,0,0,0)
  //     // setting hours
  //     if(today.getDate()==currentDate.getDate()){
  //       currentDate.setHours(currentDate.getHours()>10 ?currentDate.getHours+1 :10);
  //       currentDate.setMinutes(currentDate.getMinutes()>30 ? 30 :0)
  //     }
  //     else{
  //       currentDate.setHours(10);
  //       currentDate.setMinutes(0);
  //     }

  //     let timeSlots = [];
  //     while(currentDate<endTime){
  //       let formattedTime  = currentDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
  //       // add slots to array
  //       timeSlots.push({
  //         dateTime :new Date(currentDate),
  //         time :formattedTime
  //       })
  //       // increment current time by 30 minuts
  //       currentDate.setMinutes(currentDate.getMinutes()+30);
  //     }
  //     setDocSlots(prev=>([...prev,timeSlots]));
  //    }
     

  // }
const bookAppointment = async()=>{
  // console.log('hi');
  if(!token){
    toast.warn('Login to book Appointment');
    return navigate('/login');
  }
  try{
    const date = docSlots[slotIndex][0].dateTime;
    let day = date.getDate();
    let month = date.getMonth()+1;// add 1 to make 1 based indexing results
    let year = date.getFullYear();
    const slotDate = day + "_" + month +"_" + year;
    console.log(slotDate);
    const {data} = await axios.post(backendUrl+'/api/user/book-appointment',{docId,slotDate,slotTime},{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
    if(data.success){
        toast.success(data.message);
        getDoctorsData();
        navigate('/my-appointments');
    }
    else{
      toast.error(data.message)
      // res.json({
      //   success:false,
      //   message :''
      // })
    }

  }catch(err){
    console.log(err);
    toast.error(err.message);

  }
}

const getAvailableSlots = async () => {
  const allSlots = [];
  let today = new Date();

  for (let i = 0; i < 7; i++) {
    let currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    let endTime = new Date();
    endTime.setDate(today.getDate() + i);
    endTime.setHours(21, 0, 0, 0);

    if (today.getDate() == currentDate.getDate()) {
      currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
      currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
    } else {
      currentDate.setHours(10);
      currentDate.setMinutes(0);
    }

    let timeSlots = [];
    while (currentDate < endTime) {
      let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let day = currentDate.getDate();
      let month = currentDate.getMonth()+1;
      let year = currentDate.getFullYear();
      const slot_date = day +'_' +month +'_' +year;
      const slotTime = formattedTime;
      const isSlotAvailable = !(docInfo?.slotsBooked?.[slot_date]?.includes(slotTime));

        if (isSlotAvailable) {
          timeSlots.push({
            dateTime: new Date(currentDate),
            time: formattedTime,
          });
        }
      // add slot to array
      
      currentDate.setMinutes(currentDate.getMinutes() + 30);
    }

    allSlots.push(timeSlots);
  }

  setDocSlots(allSlots); // Call once
};


  useEffect(()=>{
    if (doctors.length) {
      fetchDocInfo();
    }
  },[doctors,docId])

  useEffect(()=>{
    getAvailableSlots()
  },[docInfo])

  useEffect(()=>{
    console.log(docSlots);
  },[docSlots])
  if (!docInfo) return <p>Loading...</p>;
  return (
    <div >
      {/* Doctor Details */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0 '>
          {/* Doc Info : Name degree and Experience */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>{docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>

        <div className='flex gap-2 items-center text-sm mt-1 text-gray-600'>
          <p>{docInfo.degree} - {docInfo.speciality}</p>
          <button className='py-0.5 px-2 border tex-xs rounded-full hover:cursor-default'>{docInfo.experience}</button>
        </div>
        {/* Doctor About text */}
        <div>
          <p className='flex gap-1 items-center text-sm font-medium text-gray-900 mt-3'>About <img className='w-3' src={assets.info_icon} alt="" /></p>
          <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>

        </div>
        <div >
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>₹{docInfo.fees}</span>
          </p>
        </div>
      </div>
    </div>
    {/* Booking Slots */}
    {/* <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700 '>
      <p>Booking Slots</p>
      <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
        {
          docSlots.length>0 && docSlots.map((item,index)=>{
            return <div className={`text-center py-5 min-w-16 rounded-full cursor-pointer ${slotIndex===index ? "bg-primary text-white" :'border border-gray-200'}`} key={index}>
              <p>{item[0] && daysOfWeek[item[0].dateTime.getDay()] }</p>   
              <p>{item[0] && item[0].dateTime.getDate()}</p>                  
              </div>
          })
        }
      </div>
    </div> */}

    {/* Booking Slots */}
<div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700 '>
  <p>Booking Slots</p>
  <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
    {docSlots.length > 0 && docSlots.map((item, index) => (
      <div
        key={index}
        onClick={() => setSlotIndex(index)}
        className={`text-center py-5 min-w-16 rounded-full cursor-pointer px-4 ${
          slotIndex === index ? "bg-primary text-white" : 'border border-gray-200'
        }`}
      >
        <p>{item[0] && daysOfWeek[item[0].dateTime.getDay()]}</p>
        <p>{item[0] && item[0].dateTime.getDate()}</p>
      </div>
    ))}
  </div>
  <div className='flex items-center gap-3 overflow-x-scroll mt-4'>
    {docSlots.length && docSlots[slotIndex].map((item,index)=>{
      return <p onClick={()=>setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time===slotTime ? 'bg-primary text-white' :'text-gray-400 border border-gray-300'}`} key={index}>
        {item.time.toLowerCase()}
      </p>
    })}
  </div>
  <button className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6' onClick={bookAppointment}>Book an appointment</button>
</div>
    {/* Listing related doctors */}
    <RelatedDoctors docId = {docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointment
