import React from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
} from "mdb-react-ui-kit";
import { Link } from "react-router-dom";

function SignUp() {
  return (
    <MDBContainer
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "#E8F0F7",
        paddingTop: "20px",
        paddingBottom: "20px",
      }}
    >
      <MDBRow className="w-100">
        <MDBCol col="12" className="d-flex justify-content-center">
          <MDBCard
            className="text-dark my-5 mx-auto"
            style={{
              borderRadius: "1rem",
              maxWidth: "500px",
              backgroundColor: "#F5F5F5",
              boxShadow: "0 10px 30px rgba(30, 58, 95, 0.15)",
            }}
          >
            <div
              style={{
                backgroundColor: "#1E3A5F",
                height: "80px",
                borderRadius: "1rem 1rem 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h2 className="fw-bold mb-0 text-white">SIGN UP</h2>
            </div>
            <MDBCardBody className="p-5 d-flex flex-column align-items-center mx-auto w-100">
              <p className="text-dark mb-5 text-center">Create your account!</p>

              <MDBRow className="w-100">
                <MDBCol md="6">
                  <MDBInput
                    wrapperClass="mb-4"
                    labelClass="text-dark"
                    label="First Name *"
                    id="firstName"
                    type="text"
                    size="lg"
                  />
                </MDBCol>
                <MDBCol md="6">
                  <MDBInput
                    wrapperClass="mb-4"
                    labelClass="text-dark"
                    label="Last Name *"
                    id="lastName"
                    type="text"
                    size="lg"
                  />
                </MDBCol>
              </MDBRow>

              <MDBInput
                wrapperClass="mb-4 w-100"
                labelClass="text-dark"
                label="UQAM Email *"
                id="email"
                type="email"
                size="lg"
                placeholder="example@uqam.ca"
              />

              <MDBInput
                wrapperClass="mb-4 w-100"
                labelClass="text-dark"
                label="Password *"
                id="password"
                type="password"
                size="lg"
              />

              <MDBInput
                wrapperClass="mb-4 w-100"
                labelClass="text-dark"
                label="Confirm Password *"
                id="confirmPassword"
                type="password"
                size="lg"
              />

              <MDBInput
                wrapperClass="mb-4 w-100"
                labelClass="text-dark"
                label="Study Cycle *"
                id="studyCycle"
                type="select"
                size="lg"
              >
                <option value="">Select Study Cycle</option>
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
                <option value="phd">PhD</option>
                <option value="certificate">Certificate</option>
              </MDBInput>

              <MDBInput
                wrapperClass="mb-4 w-100"
                labelClass="text-dark"
                label="School Year *"
                id="schoolYear"
                type="select"
                size="lg"
              >
                <option value="">Select School Year</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </MDBInput>

              <MDBBtn
                className="mx-2 px-5 w-100"
                style={{ backgroundColor: "#1E3A5F", borderColor: "#1E3A5F" }}
                size="lg"
              >
                Sign Up
              </MDBBtn>

              <div className="mt-4">
                <p className="mb-0 text-center">
                  Already have an account?{" "}
                  <Link
                    to="/"
                    className="fw-bold"
                    style={{ textDecoration: "none", color: "#1E3A5F" }}
                  >
                    Login
                  </Link>
                </p>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default SignUp;
