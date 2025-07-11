import React, { useContext } from "react";
import { useState } from "react";
import { assets } from "../assets/assets_admin/assets";
import { AdminContext } from "../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../context/DoctorContext";
import { MdOutlineVisibility } from "react-icons/md";
import { MdOutlineVisibilityOff } from "react-icons/md";
const Login = () => {
  const [state, setState] = useState("Admin");
  const [visibiltiy, setVisibility] = useState(false);
  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmitHandler(event) {
    event.preventDefault(); // for not reloading the web page
    try {
      if (state === "Admin") {
        //logic to login the Admin
        const { data } = await axios.post(backendUrl + "/api/admin/login", {
          email,
          password,
        });
        if (data.success == true) {
          console.log(data.token);
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
          // toast.success('hi');
        } else {
          // console.log(data.message);
          toast.error(data.message);
        }
      } else {
        // logic to login the Doctor
        const { data } = await axios.post(backendUrl + "/api/doctor/login", {
          email,
          password,
        });
        if (data.success) {
          console.log(data.token);
          localStorage.setItem("dToken", data.token);
          setDToken(data.token);
        } else {
          console.log(data.message);
          toast.error(data.message);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  }

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-[80vh] flex items-center "
    >
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary">{state} </span>Login
        </p>
        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="email"
            required
            value={email}
          />
        </div>
        <div className="w-full relative">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type={visibiltiy ? "text" : "password"}
            required
            value={password}
          />
          <span
            className="absolute right-3 top-[70%] translate-y-[-50%] cursor-pointer text-xl text-zinc-500"
            onClick={() => setVisibility(!visibiltiy)}
          >
            {visibiltiy ? <MdOutlineVisibilityOff /> : <MdOutlineVisibility />}
          </span>
        </div>
        <button className="bg-primary text-white w-full py-2 rounded-md text-base">
          Login
        </button>
        {state === "Admin" ? (
          <p>
            Doctor Login?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Doctor")}
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Admin Login?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Admin")}
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
