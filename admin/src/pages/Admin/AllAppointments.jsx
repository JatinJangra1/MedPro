import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets_admin/assets";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  return (
    <div className="w-full max-w-6xl mx-auto my-6 px-4">
      <h2 className="mb-4 text-xl font-semibold text-gray-700">All Appointments</h2>

      <div className="bg-white rounded-md shadow border text-sm max-h-[80vh] min-h-[60vh] overflow-y-auto">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center py-3 px-6 border-b bg-gray-100 text-gray-600 font-medium">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>

        {/* Appointments */}
        {appointments.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center gap-4 sm:gap-0 py-4 px-6 border-b text-gray-700 hover:bg-gray-50 transition"
          >
            {/* Index */}
            <p className="font-medium">{index + 1}</p>

            {/* Patient */}
            <div className="flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={item.userData?.image || "/default-avatar.png"}
                alt={item.userData?.name || "User"}
              />
              <p>{item.userData?.name || "Unknown"}</p>
            </div>

            {/* Age */}
            <p>{item.userData?.dob ? calculateAge(item.userData.dob) : "N/A"}</p>

            {/* Date & Time */}
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>

            {/* Doctor */}
            <div className="flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-full object-cover bg-gray-200"
                src={item.docData?.image || "/default-avatar.png"}
                alt={item.docData?.name || "Doctor"}
              />
              <p>{item.docData?.name || "Unknown"}</p>
            </div>

            {/* Fees */}
            <p>{currency}{item.amount}</p>

            {/* Actions */}
            {item.cancelled ? (
              <p className="text-red-500 text-xs font-semibold">Cancelled</p>
            ) :item.isCompleted ?<p className="text-green-500 text-xs font-semibold">Completed</p> :(
              <img
                onClick={() => cancelAppointment(item._id)}
                className="w-6 h-6 cursor-pointer hover:scale-105 transition-transform"
                src={assets.cancel_icon}
                alt="Cancel"
                title="Cancel Appointment"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAppointments;
