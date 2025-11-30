import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaBox, FaHeart, FaSave, FaTimes } from "react-icons/fa";
import MenuBar from "../components/MenuBar";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../utils/supabaseClient";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    studyCycle: "",
    schoolYear: "",
    joinDate: "",
    phone: "",
  });

  const [tempUser, setTempUser] = useState(user);

  // Charger les données du profil depuis Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;
      
      if (!authUser) {
        setError("Vous devez être connecté pour voir votre profil");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setUser({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: data.email || "",
            studyCycle: data.study_cycle || "",
            schoolYear: data.school_year || "",
            joinDate: data.created_at || "",
            phone: data.phone || "",
          });
          setTempUser({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: data.email || "",
            studyCycle: data.study_cycle || "",
            schoolYear: data.school_year || "",
            joinDate: data.created_at || "",
            phone: data.phone || "",
          });
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du profil:", err);
        setError("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser, authLoading]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempUser(user);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    if (!authUser) {
      setError("Vous devez être connecté pour modifier votre profil");
      setSuccessMessage(null);
      return;
    }

    // Réinitialiser les messages
    setError(null);
    setSuccessMessage(null);

    try {
      // Préparer les données à mettre à jour (sans l'email qui n'est pas modifiable)
      const updateData = {
        first_name: tempUser.firstName,
        last_name: tempUser.lastName,
        study_cycle: tempUser.studyCycle,
        school_year: tempUser.schoolYear,
        phone: tempUser.phone || null,
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", authUser.id);

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour l'état local avec les données sauvegardées
      setUser(tempUser);
      setIsEditing(false);
      setSuccessMessage("Sauvegarde effectuée avec succès");
      setError(null);

      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError("Erreur lors de la sauvegarde du profil");
      setSuccessMessage(null);
    }
  };

  const handleCancel = () => {
    setTempUser(user);
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
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

  if (authLoading || loading) {
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
                <p>Chargement...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !authUser) {
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
                <p style={{ color: "red" }}>{error}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                      <p className="profile-value">{user.email}</p>
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
                        {user.joinDate
                          ? new Date(user.joinDate).toLocaleDateString("fr-FR")
                          : "N/A"}
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
      
      {/* Notification en bas de l'écran */}
      {(error || successMessage) && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            minWidth: "300px",
            maxWidth: "90%",
            padding: "1rem 1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            animation: "slideUp 0.3s ease-out",
            ...(error
              ? {
                  color: "#991b1b",
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fecaca",
                }
              : {
                  color: "#065f46",
                  backgroundColor: "#d1fae5",
                  border: "1px solid #a7f3d0",
                }),
          }}
        >
          {error || successMessage}
        </div>
      )}
      
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;
