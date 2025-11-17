import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaBox, FaHeart, FaSave, FaTimes } from "react-icons/fa";
import MenuBar from "../components/MenuBar";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@uqam.ca",
    studyCycle: "Bachelor",
    schoolYear: "2nd Year",
    joinDate: "2024-10-31",
    phone: "+1 (514) 987-6543",
  });

  const [tempUser, setTempUser] = useState(user);

  const handleEdit = () => {
    setIsEditing(true);
    setTempUser(user);
  };

  const handleSave = () => {
    setUser(tempUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempUser(user);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUser((prev) => ({ ...prev, [name]: value }));
  };

  const additionalCards = [
    {
      id: 1,
      icon: <FaBox />,
      title: "Mes Annonces",
      description: "Consultez vos annonces publiées",
      link: "/my-listings",
    },
    {
      id: 2,
      icon: <FaHeart />,
      title: "Favoris",
      description: "Vos articles sauvegardés",
      link: "#",
    },
  ];

  return (
    <div className="profile-shell">
      <MenuBar onSearch={() => {}} onSellClick={() => {}} />

      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-card-header">
              <h1 className="profile-header-title">Mon Profil</h1>
            </div>

            <div className="profile-card-body">
              <div className="profile-info-wrapper">
                <div className="profile-left">
                  <div className="profile-avatar">
                    <span>👤</span>
                  </div>
                  <div className="profile-left-info">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="firstName"
                          value={tempUser.firstName}
                          onChange={handleInputChange}
                          className="profile-edit-input"
                        />
                        <input
                          type="text"
                          name="lastName"
                          value={tempUser.lastName}
                          onChange={handleInputChange}
                          className="profile-edit-input"
                        />
                      </>
                    ) : (
                      <>
                        <h2 className="profile-name">
                          {user.firstName} {user.lastName}
                        </h2>
                        <p className="profile-cycle">{user.studyCycle}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="profile-right">
                  <div className="profile-info-row">
                    <div className="profile-info-col">
                      <label className="profile-label">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={tempUser.email}
                          onChange={handleInputChange}
                          className="profile-edit-input"
                        />
                      ) : (
                        <p className="profile-value">{user.email}</p>
                      )}
                    </div>
                    <div className="profile-info-col">
                      <label className="profile-label">Téléphone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={tempUser.phone}
                          onChange={handleInputChange}
                          className="profile-edit-input"
                        />
                      ) : (
                        <p className="profile-value">{user.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="profile-info-row">
                    <div className="profile-info-col">
                      <label className="profile-label">Cycle d'études</label>
                      {isEditing ? (
                        <select
                          name="studyCycle"
                          value={tempUser.studyCycle}
                          onChange={handleInputChange}
                          className="profile-edit-input"
                        >
                          <option value="Bachelor">Bachelor</option>
                          <option value="Master">Master</option>
                          <option value="Doctorat">Doctorat</option>
                          <option value="Autre">Autre</option>
                        </select>
                      ) : (
                        <p className="profile-value">{user.studyCycle}</p>
                      )}
                    </div>
                    <div className="profile-info-col">
                      <label className="profile-label">Année scolaire</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="schoolYear"
                          value={tempUser.schoolYear}
                          onChange={handleInputChange}
                          className="profile-edit-input"
                        />
                      ) : (
                        <p className="profile-value">{user.schoolYear}</p>
                      )}
                    </div>
                  </div>

                  <div className="profile-info-row">
                    <div className="profile-info-col">
                      <label className="profile-label">Membre depuis</label>
                      <p className="profile-value">
                        {new Date(user.joinDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                {isEditing ? (
                  <>
                    <button
                      className="profile-btn-edit"
                      style={{
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      }}
                      onClick={handleSave}
                    >
                      <FaSave /> Sauvegarder
                    </button>
                    <button
                      className="profile-btn-logout"
                      onClick={handleCancel}
                    >
                      <FaTimes /> Annuler
                    </button>
                  </>
                ) : (
                  <button className="profile-btn-edit" onClick={handleEdit}>
                    <FaEdit /> Modifier le profil
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="profile-cards-grid">
            {additionalCards.map((card) => (
              <div className="profile-action-card" key={card.id}>
                <div className="profile-action-icon">{card.icon}</div>
                <h3 className="profile-action-title">{card.title}</h3>
                <p className="profile-action-description">{card.description}</p>
                <button 
                  className="profile-action-btn"
                  onClick={() => {
                    if (card.link && card.link !== "#") {
                      navigate(card.link);
                    }
                  }}
                >
                  Voir
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
