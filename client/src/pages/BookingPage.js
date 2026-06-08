import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useParams } from "react-router-dom";
import axios from "axios";
import { DatePicker, message, TimePicker } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const dispatch = useDispatch();

  const getUserData = async () => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/getDoctorById",
        { doctorId: params.doctorId },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAvailability = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/booking-availbility",
        { doctorId: params.doctorId, date, time },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
    }
  };

  // ============ PAYMENT + BOOKING ============
  const handleBooking = async () => {
    try {
      if (!date || !time) {
        return message.error("Please select date and time");
      }
      dispatch(showLoading());

      const orderRes = await axios.post(
        "/api/payment/order",
        { amount: doctors.feesPerCunsaltation },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());

      if (!orderRes.data.success) {
        return message.error("Unable to create payment order");
      }

      const order = orderRes.data.order;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Doctor Appointment",
        description: `Consultation fee for Dr. ${doctors.firstName}`,
        order_id: order.id,
        handler: async function (response) {
          await verifyAndBook(response);
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#3399cc" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Payment failed");
    }
  };

  const verifyAndBook = async (paymentResponse) => {
    try {
      dispatch(showLoading());

      const verifyRes = await axios.post(
        "/api/payment/verify",
        paymentResponse,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!verifyRes.data.success) {
        dispatch(hideLoading());
        return message.error("Payment verification failed");
      }

      
      const combinedDateTime = moment(date, "DD-MM-YYYY")
        .set({
          hour: moment(time, "HH:mm").hours(),
          minute: moment(time, "HH:mm").minutes(),
          second: 0,
        })
        .toISOString();

      const res = await axios.post(
        "/api/v1/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctors,
          userInfo: user,
          date: combinedDateTime, 
          time: time,          
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());

      if (res.data.success) {
        message.success("Payment successful & " + res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something went wrong");
    }
  };
  // ============ END PAYMENT + BOOKING ============

  useEffect(() => {
    getUserData();
    //eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <h3>Booking Page</h3>
      <div className="container m-2">
        {doctors && (
          <div>
            <h4>
              Dr.{doctors.firstName} {doctors.lastName}
            </h4>
            <h4>Fees : {doctors.feesPerCunsaltation}</h4>
            <h4>
              Timings : {doctors.timings && doctors.timings[0]} -{" "}
              {doctors.timings && doctors.timings[1]}
            </h4>
            <div className="d-flex flex-column w-50">
              {/* ✅ dateString is already "DD-MM-YYYY" from format prop */}
              <DatePicker
                className="m-2"
                format="DD-MM-YYYY"
                onChange={(value, dateString) => setDate(dateString)}
              />
          
              <TimePicker
                format="HH:mm"
                className="m-2"
                onChange={(value, timeString) => setTime(timeString)}
              />
              <button
                className="btn btn-primary mt-2"
                onClick={handleAvailability}
              >
                Check Availability
              </button>
              <button className="btn btn-dark mt-2" onClick={handleBooking}>
                Pay & Book Now
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingPage;