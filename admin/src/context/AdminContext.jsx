import { createContext, useState } from "react";
import axios from "axios";
export const AdminContext = createContext();
import { toast } from "react-toastify";
const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  //   console.log("aToken inside context:", aToken);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const backendUrl = "https://medpro-backend.onrender.com";

  // testing
  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {}, // body (empty in this case)
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
        }
      );
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Function to change doctor availablity using API
  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: {
          Authorization: `Bearer ${aToken}`,
        },
      });
      if (data.success) {
        setAppointments(data.appointments);
        console.log(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId },
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
        }
      );
      if (data.success) {
        console.log(data);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${aToken}`,
        },
      });
      if (data.success) {
        setDashData(data.dashData);
        console.log(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };
  //testing end

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    setDoctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData
  };
  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};
export default AdminContextProvider;
