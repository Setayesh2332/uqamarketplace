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
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Redirection directe vers le profil sans validation
    navigate("/profile");
  };

  return (
    <MDBContainer
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", backgroundColor: "#E8F0F7" }}
    >
      <MDBRow className="w-100">
        <MDBCol col="12" className="d-flex justify-content-center">
          <MDBCard
            className="text-dark my-5 mx-auto"
            style={{
              borderRadius: "1rem",
              maxWidth: "400px",
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
              <h2 className="fw-bold mb-0 text-white">LOGIN</h2>
            </div>
            <MDBCardBody className="p-5 d-flex flex-column align-items-center mx-auto w-100">
              <p className="text-dark mb-5">
                Please enter your login and password!
              </p>

              <MDBInput
                wrapperClass="mb-4 mx-5 w-100"
                labelClass="text-dark"
                label="Email address"
                id="formControlLg"
                type="email"
                size="lg"
              />
              <MDBInput
                wrapperClass="mb-4 mx-5 w-100"
                labelClass="text-dark"
                label="Password"
                id="formControlLg"
                type="password"
                size="lg"
              />
              <p className="small mb-3 pb-lg-2 text-center">
                <a
                  className="text-dark fw-bold"
                  href="#!"
                  style={{ textDecoration: "none", color: "#1E3A5F" }}
                >
                  Forgot password?
                </a>
              </p>
              <MDBBtn
                className="mx-2 px-5 w-100"
                style={{ backgroundColor: "#1E3A5F", borderColor: "#1E3A5F" }}
                size="lg"
                onClick={handleLogin}
              >
                Login
              </MDBBtn>

              <div className="mt-4">
                <p className="mb-0 text-center">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="fw-bold"
                    style={{ textDecoration: "none", color: "#1E3A5F" }}
                  >
                    Sign Up
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

export default Login;
