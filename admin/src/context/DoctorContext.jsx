
import axios from "axios";
import { createContext } from "react";
import { toast } from "react-toastify";
import { useState } from "react";
export const DoctorContext = createContext()

const DoctorContextProvider = (props)=>{

    const backendUrl = "https://medpro-backend.onrender.com";
    const [dToken, setDToken] = useState(
        localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
      );
    // const [dToken,setDToken] = useState(''); 
    const [appointments,setAppointments] = useState([]);
    const [dashData,setDashData] = useState(false);
    const [profileData,setProfileData] = useState(false);
    const getAppointments = async()=>{
        try{
            const {data} = await axios.get(backendUrl+'/api/doctor/appointments', {
        headers: {
          Authorization: `Bearer ${dToken}`,
        },
      })

            if(data.success){
                setAppointments(data.appointments);
                console.log(data.appointments);
            }
            else{
                toast.error(data.message);
            }
        }
        catch(err){
            console.log(err);
            toast.error(err.message);
        }
    }

    const completeAppointment = async(appointmentId)=>{
        try{
            const {data} = await axios.post(backendUrl+'/api/doctor/complete-appointment',{appointmentId}, {
        headers: {
          Authorization: `Bearer ${dToken}`,
        },
      })
            if(data.success){
                toast.success(data.message);
                getAppointments();
            }
            else{
                toast.error(data.message)
            }
        }
        catch(err){
            console.log(err);
            toast.error(err.message);
        }
    }
    const cancelAppointment = async(appointmentId)=>{
        try{
            const {data} = await axios.post(backendUrl+'/api/doctor/cancel-appointment',{appointmentId},{
        headers: {
          Authorization: `Bearer ${dToken}`,
        },
      });
            if(data.success){
                toast.success(data.message);
                getAppointments();
            }
            else{
                toast.error(data.message);
            }
        }
        catch(err){
            console.log(err);
            toast.error(err.message);
        }
    }
    const getDashData = async()=>{
        try{
            const {data} = await axios.get(backendUrl+'/api/doctor/dashboard',{
        headers: {
          Authorization: `Bearer ${dToken}`,
        },
      })    
            if(data.success){
                setDashData(data.dashData);
                console.log(data.dashData);
            }
            else{
                toast.error(data.message);
            }
        }
        catch(err){
            console.log(err);
            toast.error(err.message);
        }
    }
    const getProfileData = async()=>{
        try{
            const {data} = await axios.get(backendUrl+'/api/doctor/profile',{
        headers: {
          Authorization: `Bearer ${dToken}`,
        },
      });
            if(data.success){
                setProfileData(data.profileData);
                console.log(data.profileData);
            }
        }
        catch(err){
            console.log(err);
            toast.error(err.message);
        }
    }
    const value = {
        dToken,
        setDToken,
        backendUrl,
        appointments,
        setAppointments, 
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData,
        setDashData,
        getDashData,
        profileData,
        setProfileData,
        getProfileData
    }
    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )

}
export default DoctorContextProvider
