import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../redux/features/userSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

useEffect(() => {
  const getUser = async () => {
    try {
      console.log("ProtectedRoute: fetching user");
      // avoid toggling global loading here — it unmounts Routes and causes remount loops
      const res = await axios.post(
        "/api/v1/user/getUserData",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("ProtectedRoute: getUser response", res.data);
      if (res.data.success) {
        dispatch(setUser(res.data.data));
      } else {
        localStorage.clear();
        // optional: navigate to login if needed
      }
    } catch (error) {
      localStorage.clear();
      console.log(error);
    }
  };

  const token = localStorage.getItem("token");
  if (!user && token) {
    getUser();
  }
}, [user, dispatch]);

  if (localStorage.getItem("token")) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}