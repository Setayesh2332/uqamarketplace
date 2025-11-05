import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MDBContainer, MDBCard, MDBCardBody } from "mdb-react-ui-kit";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import "./signUp.css";
import "./auth-transitions.css";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  studyCycle: "",
  schoolYear: "",
};

const initialErrors = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  studyCycle: "",
  schoolYear: "",
};

// Fonctions de validation (avec traduction)
const validateName = (name, t) => {
  if (!name.trim()) {
    return t("validation.required");
  }
  if (name.length > 50) {
    return t("validation.nameMaxLength");
  }
  if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(name)) {
    return t("validation.nameInvalidChars");
  }
  return "";
};

const validateEmail = (email, t) => {
  if (!email.trim()) {
    return t("validation.required");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return t("validation.emailInvalid");
  }
  const emailLower = email.toLowerCase();
  if (!emailLower.endsWith(".uqam.ca")) {
    return t("validation.emailUQAM");
  }
  return "";
};

const validatePassword = (password, t) => {
  if (!password) {
    return t("validation.required");
  }
  if (password.length < 8) {
    return t("validation.passwordMinLength");
  }
  if (!/[a-z]/.test(password)) {
    return t("validation.passwordLowercase");
  }
  if (!/[A-Z]/.test(password)) {
    return t("validation.passwordUppercase");
  }
  if (!/[0-9]/.test(password)) {
    return t("validation.passwordDigit");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    return t("validation.passwordSymbol");
  }
  return "";
};

const validatePasswordMatch = (password, confirmPassword, t) => {
  if (!confirmPassword) {
    return t("validation.passwordConfirm");
  }
  if (password !== confirmPassword) {
    return t("validation.passwordMatch");
  }
  return "";
};

const validateSelect = (value, fieldName, t) => {
  if (!value) {
    return t("validation.selectField", { fieldName });
  }
  return "";
};

function SignUp() {
  const location = useLocation();
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ submitting: false, error: "", success: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [animationClass, setAnimationClass] = useState("auth-card-enter-from-left");
  const navigate = useNavigate();
  const { signUp } = useAuth();

  useEffect(() => {
    // Si on vient de login, animer depuis la droite
    if (location.state?.from === "login") {
      setAnimationClass("auth-card-enter-from-right");
    } else {
      // Sinon, animer depuis la gauche (par défaut)
      setAnimationClass("auth-card-enter-from-left");
    }
  }, [location.pathname, location.state]);

  const updateField = (key) => (event) => {
    let value = event.target.value;
    
    if (key === "firstName" || key === "lastName") {
      value = value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, "");
      if (value.length > 50) {
        value = value.substring(0, 50);
      }
    }
    
    setForm((prev) => ({ ...prev, [key]: value }));
    
    setStatus((prev) => ({ ...prev, error: "" }));
    
    if (touched[key]) {
      validateField(key, value);
    }
  };

  const handleBlur = (key) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    validateField(key, form[key]);
  };

  const validateField = (key, value) => {
    let error = "";
    
    switch (key) {
      case "firstName":
        error = validateName(value, t);
        break;
      case "lastName":
        error = validateName(value, t);
        break;
      case "email":
        error = validateEmail(value, t);
        break;
      case "password":
        error = validatePassword(value, t);
        if (form.confirmPassword && !error) {
          const confirmError = validatePasswordMatch(value, form.confirmPassword, t);
          setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case "confirmPassword":
        error = validatePasswordMatch(form.password, value, t);
        break;
      case "studyCycle":
        error = validateSelect(value, t("signup.studyCycle").replace("*", "").trim().toLowerCase(), t);
        break;
      case "schoolYear":
        error = validateSelect(value, t("signup.schoolYear").replace("*", "").trim().toLowerCase(), t);
        break;
      default:
        break;
    }
    
    setErrors((prev) => ({ ...prev, [key]: error }));
    return error === "";
  };

  const validateAll = () => {
    const allTouched = {
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
      studyCycle: true,
      schoolYear: true,
    };
    setTouched(allTouched);

    const isValid =
      validateField("firstName", form.firstName) &&
      validateField("lastName", form.lastName) &&
      validateField("email", form.email) &&
      validateField("password", form.password) &&
      validateField("confirmPassword", form.confirmPassword) &&
      validateField("studyCycle", form.studyCycle) &&
      validateField("schoolYear", form.schoolYear);

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ submitting: false, error: "", success: "" });

    if (!validateAll()) {
      setStatus({
        submitting: false,
        error: t("validation.formErrors"),
        success: "",
      });
      return;
    }

    setStatus({ submitting: true, error: "", success: "" });

    try {
      await signUp({
        email: form.email.trim(),
        password: form.password,
        metadata: {
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          study_cycle: form.studyCycle,
          school_year: form.schoolYear,
        },
      });

      setStatus({
        submitting: false,
        error: "",
        success: t("signup.success"),
      });

      setForm(initialForm);
      setErrors(initialErrors);
      setTouched({});
      // Redirection vers la page de connexion avec le message de succès
      setTimeout(() => navigate("/login?registered=true"), 1500);
    } catch (err) {
      const code = err?.status;
      const message = err?.message ?? t("validation.accountCreationError");

      if (code === 400 && message.toLowerCase().includes("confirm")) {
        setStatus({
          submitting: false,
          error: t("validation.emailConfirmationRequired"),
          success: "",
        });
      } else {
        setStatus({ submitting: false, error: message, success: "" });
      }
    }
  };

  return (
    <MDBContainer fluid className="signup-container auth-page-container">
      <div className="d-flex flex-column align-items-center">
        <img
          src="/images/logo/logo.png"
          alt="UQAMarketplace Logo"
          style={{
            height: "70px",
            width: "auto",
            objectFit: "contain",
            marginBottom: "24px",
          }}
        />
        
        <MDBCard className={`signup-card auth-card ${animationClass}`}>
          <div className="signup-header">
            <span className="signup-badge">{t("signup.badge")}</span>
            <h2>{t("signup.title")}</h2>
            <p>{t("signup.description")}</p>
          </div>

        <MDBCardBody className="signup-body">
          {status.error && <div className="signup-alert signup-alert--error">{status.error}</div>}
          {status.success && <div className="signup-alert signup-alert--success">{status.success}</div>}

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <div className="signup-grid">
              <label className="signup-field">
                <span>{t("signup.firstName")}</span>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Ex. Amira"
                  maxLength={50}
                  value={form.firstName}
                  onChange={updateField("firstName")}
                  onBlur={handleBlur("firstName")}
                  className={touched.firstName && errors.firstName ? "signup-input-error" : ""}
                />
                {touched.firstName && errors.firstName && (
                  <span className="signup-error-message">{errors.firstName}</span>
                )}
              </label>
              <label className="signup-field">
                <span>{t("signup.lastName")}</span>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Ex. Tremblay"
                  maxLength={50}
                  value={form.lastName}
                  onChange={updateField("lastName")}
                  onBlur={handleBlur("lastName")}
                  className={touched.lastName && errors.lastName ? "signup-input-error" : ""}
                />
                {touched.lastName && errors.lastName && (
                  <span className="signup-error-message">{errors.lastName}</span>
                )}
              </label>
            </div>

            <label className="signup-field">
              <span>{t("signup.email")}</span>
              <input
                type="email"
                name="email"
                placeholder="prenom.nom@uqam.ca"
                value={form.email}
                onChange={updateField("email")}
                onBlur={handleBlur("email")}
                className={touched.email && errors.email ? "signup-input-error" : ""}
              />
              {touched.email && errors.email && (
                <span className="signup-error-message">{errors.email}</span>
              )}
            </label>

            <div className="signup-grid">
              <label className="signup-field">
                <span>{t("signup.password")}</span>
                <div className="signup-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t("signup.passwordPlaceholder")}
                    value={form.password}
                    onChange={updateField("password")}
                    onBlur={handleBlur("password")}
                    className={touched.password && errors.password ? "signup-input-error" : ""}
                  />
                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <span className="signup-error-message">{errors.password}</span>
                )}
              </label>
              <label className="signup-field">
                <span>{t("signup.confirmPassword")}</span>
                <div className="signup-password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder={t("signup.confirmPasswordPlaceholder")}
                    value={form.confirmPassword}
                    onChange={updateField("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    className={touched.confirmPassword && errors.confirmPassword ? "signup-input-error" : ""}
                  />
                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <span className="signup-error-message">{errors.confirmPassword}</span>
                )}
              </label>
            </div>

            <div className="signup-grid">
              <label className="signup-field">
                <span>{t("signup.studyCycle")}</span>
                <select
                  name="studyCycle"
                  value={form.studyCycle}
                  onChange={updateField("studyCycle")}
                  onBlur={handleBlur("studyCycle")}
                  className={touched.studyCycle && errors.studyCycle ? "signup-input-error" : ""}
                >
                  <option value="" disabled hidden>
                    {t("signup.selectStudyCycle")}
                  </option>
                  <option value="bachelor">{t("studyCycles.bachelor")}</option>
                  <option value="master">{t("studyCycles.master")}</option>
                  <option value="phd">{t("studyCycles.phd")}</option>
                  <option value="certificate">{t("studyCycles.certificate")}</option>
                </select>
                {touched.studyCycle && errors.studyCycle && (
                  <span className="signup-error-message">{errors.studyCycle}</span>
                )}
              </label>
              <label className="signup-field">
                <span>{t("signup.schoolYear")}</span>
                <select
                  name="schoolYear"
                  value={form.schoolYear}
                  onChange={updateField("schoolYear")}
                  onBlur={handleBlur("schoolYear")}
                  className={touched.schoolYear && errors.schoolYear ? "signup-input-error" : ""}
                >
                  <option value="" disabled hidden>
                    {t("signup.selectSchoolYear")}
                  </option>
                  <option value="1">{t("schoolYears.1")}</option>
                  <option value="2">{t("schoolYears.2")}</option>
                  <option value="3">{t("schoolYears.3")}</option>
                  <option value="4">{t("schoolYears.4")}</option>
                </select>
                {touched.schoolYear && errors.schoolYear && (
                  <span className="signup-error-message">{errors.schoolYear}</span>
                )}
              </label>
            </div>

            <button
              type="submit"
              className="signup-submit"
              disabled={status.submitting}
            >
              {status.submitting ? t("signup.submitting") : t("signup.submitButton")}
            </button>
          </form>

          <div className="signup-footer">
            <p>
              {t("signup.alreadyHaveAccount")}{" "}
              <Link to="/login" state={{ from: "signup" }}>{t("signup.loginLink")}</Link>
            </p>
          </div>
        </MDBCardBody>
      </MDBCard>
      </div>
    </MDBContainer>
  );
}

export default SignUp;
