import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import axios from "../axiosConfig";
import { message, Table } from "antd";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);

  // Get All Doctors
  const getDoctors = async () => {
    try {
      const res = await axios.get("/api/v1/admin/getAllDoctors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
      message.error("Error fetching doctors");
    }
  };

  // Approve Doctor
  const handleAccountStatus = async (record, status) => {
    try {
      const res = await axios.post(
        "/api/v1/admin/changeAccountStatus",
        {
          doctorId: record._id,
          userId: record.userId,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        message.success(res.data.message);
        getDoctors();
      }
    } catch (error) {
      console.log(error);
      message.error("Something Went Wrong");
    }
  };

  // Delete Doctor
  const handleDeleteDoctor = async (id) => {
    try {
      const res = await axios.delete(
        `/api/v1/admin/deleteDoctor/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        message.success(res.data.message);
        getDoctors();
      }
    } catch (error) {
      console.log(error);
      message.error("Error deleting doctor");
    }
  };

  useEffect(() => {
    getDoctors();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record) => (
        <span>
          {record.firstName} {record.lastName}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Phone",
      dataIndex: "phone",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex gap-2">
          {record.status === "pending" ? (
            <>
              <button
                className="btn btn-success me-2"
                onClick={() =>
                  handleAccountStatus(record, "approved")
                }
              >
                Approve
              </button>

              <button
                className="btn btn-danger"
                onClick={() =>
                  handleDeleteDoctor(record._id)
                }
              >
                Delete
              </button>
            </>
          ) : (
            <button
              className="btn btn-danger"
              onClick={() =>
                handleDeleteDoctor(record._id)
              }
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <h1 className="text-center m-3">All Doctors</h1>

      <Table
        columns={columns}
        dataSource={doctors}
        rowKey="_id"
      />
    </Layout>
  );
};

export default Doctors;