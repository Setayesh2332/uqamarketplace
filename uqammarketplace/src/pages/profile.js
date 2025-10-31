import React, { useState } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  // Données d'exemple (à remplacer par les données de l'utilisateur)
  const [user] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@uqam.ca",
    studyCycle: "Bachelor",
    schoolYear: "2nd Year",
    joinDate: "2024-10-31",
    phone: "+1 (514) 987-6543",
    avatar: "https://via.placeholder.com/150",
  });

  const handleLogout = () => {
    navigate("/");
  };

  const handleEdit = () => {
    console.log("Edit profile");
  };

  return (
    <MDBContainer
      fluid
      style={{
        minHeight: "100vh",
        backgroundColor: "#E8F0F7",
        paddingTop: "40px",
        paddingBottom: "40px",
      }}
    >
      {/* Header */}
      <MDBRow className="mb-5">
        <MDBCol
          col="12"
          className="d-flex justify-content-between align-items-center px-4"
        >
          <h1 className="text-dark fw-bold" style={{ fontSize: "2.5rem" }}>
            My Profile
          </h1>
          <MDBBtn
            style={{ backgroundColor: "#1E3A5F", borderColor: "#1E3A5F" }}
            size="sm"
            onClick={handleLogout}
          >
            <MDBIcon fas icon="sign-out-alt" className="me-2" />
            Logout
          </MDBBtn>
        </MDBCol>
      </MDBRow>

      {/* Profile Card */}
      <MDBRow className="mb-4">
        <MDBCol lg="8" className="mx-auto">
          <MDBCard
            style={{
              boxShadow: "0 15px 40px rgba(30, 58, 95, 0.1)",
              borderRadius: "1.5rem",
              overflow: "hidden",
            }}
          >
            {/* Header bleu avec gradient */}
            <div
              style={{
                background: "linear-gradient(135deg, #1E3A5F 0%, #2d5a8c 100%)",
                height: "120px",
                borderRadius: "1.5rem 1.5rem 0 0",
              }}
            ></div>

            <MDBCardBody className="p-5">
              <MDBRow className="mb-4">
                {/* Avatar */}
                <MDBCol md="4" className="text-center">
                  <div
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      backgroundColor: "#1E3A5F",
                      margin: "-20px auto 25px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "48px",
                      boxShadow: "0 10px 30px rgba(30, 58, 95, 0.2)",
                    }}
                  >
                    <MDBIcon fas icon="user" />
                  </div>
                  <h3
                    className="text-dark fw-bold"
                    style={{ fontSize: "1.5rem" }}
                  >
                    {user.firstName} {user.lastName}
                  </h3>
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.95rem" }}
                  >
                    {user.studyCycle}
                  </p>
                </MDBCol>

                {/* Informations */}
                <MDBCol md="8">
                  <MDBRow className="mb-4">
                    <MDBCol sm="6">
                      <p
                        className="text-muted small mb-2"
                        style={{ letterSpacing: "0.5px" }}
                      >
                        EMAIL
                      </p>
                      <p
                        className="text-dark fw-bold"
                        style={{ fontSize: "1.05rem" }}
                      >
                        {user.email}
                      </p>
                    </MDBCol>
                    <MDBCol sm="6">
                      <p
                        className="text-muted small mb-2"
                        style={{ letterSpacing: "0.5px" }}
                      >
                        PHONE
                      </p>
                      <p
                        className="text-dark fw-bold"
                        style={{ fontSize: "1.05rem" }}
                      >
                        {user.phone}
                      </p>
                    </MDBCol>
                  </MDBRow>

                  <MDBRow className="mb-4">
                    <MDBCol sm="6">
                      <p
                        className="text-muted small mb-2"
                        style={{ letterSpacing: "0.5px" }}
                      >
                        STUDY CYCLE
                      </p>
                      <p
                        className="text-dark fw-bold"
                        style={{ fontSize: "1.05rem" }}
                      >
                        {user.studyCycle}
                      </p>
                    </MDBCol>
                    <MDBCol sm="6">
                      <p
                        className="text-muted small mb-2"
                        style={{ letterSpacing: "0.5px" }}
                      >
                        SCHOOL YEAR
                      </p>
                      <p
                        className="text-dark fw-bold"
                        style={{ fontSize: "1.05rem" }}
                      >
                        {user.schoolYear}
                      </p>
                    </MDBCol>
                  </MDBRow>

                  <MDBRow>
                    <MDBCol sm="6">
                      <p
                        className="text-muted small mb-2"
                        style={{ letterSpacing: "0.5px" }}
                      >
                        MEMBER SINCE
                      </p>
                      <p
                        className="text-dark fw-bold"
                        style={{ fontSize: "1.05rem" }}
                      >
                        {new Date(user.joinDate).toLocaleDateString()}
                      </p>
                    </MDBCol>
                  </MDBRow>
                </MDBCol>
              </MDBRow>

              {/* Boutons d'action */}
              <MDBRow
                className="mt-5 pt-4"
                style={{ borderTop: "2px solid #f0f0f0" }}
              >
                <MDBCol className="d-flex gap-3">
                  <MDBBtn
                    style={{
                      backgroundColor: "#1E3A5F",
                      borderColor: "#1E3A5F",
                    }}
                    onClick={handleEdit}
                  >
                    <MDBIcon fas icon="edit" className="me-2" />
                    Edit Profile
                  </MDBBtn>
                </MDBCol>
              </MDBRow>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      {/* Additional Info Cards */}
      <MDBRow>
        <MDBCol lg="8" className="mx-auto">
          <MDBRow>
            <MDBCol md="6" className="mb-4">
              <MDBCard
                style={{
                  boxShadow: "0 8px 20px rgba(30, 58, 95, 0.08)",
                  borderRadius: "1.2rem",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(30, 58, 95, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(30, 58, 95, 0.08)";
                }}
              >
                <MDBCardBody className="text-center p-4">
                  <MDBIcon
                    fas
                    icon="book"
                    size="2x"
                    className="mb-3"
                    style={{ color: "#1E3A5F" }}
                  />
                  <h5 className="text-dark fw-bold mb-2">My Courses</h5>
                  <p className="text-muted mb-3">View your enrolled courses</p>
                  <MDBBtn
                    size="sm"
                    outline
                    style={{ borderColor: "#1E3A5F", color: "#1E3A5F" }}
                  >
                    View
                  </MDBBtn>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            <MDBCol md="6" className="mb-4">
              <MDBCard
                style={{
                  boxShadow: "0 8px 20px rgba(30, 58, 95, 0.08)",
                  borderRadius: "1.2rem",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(30, 58, 95, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(30, 58, 95, 0.08)";
                }}
              >
                <MDBCardBody className="text-center p-4">
                  <MDBIcon
                    fas
                    icon="heart"
                    size="2x"
                    className="mb-3"
                    style={{ color: "#1E3A5F" }}
                  />
                  <h5 className="text-dark fw-bold mb-2">Saved Items</h5>
                  <p className="text-muted mb-3">Your bookmarked listings</p>
                  <MDBBtn
                    size="sm"
                    outline
                    style={{ borderColor: "#1E3A5F", color: "#1E3A5F" }}
                  >
                    View
                  </MDBBtn>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Profile;
