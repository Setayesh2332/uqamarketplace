import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import { createListing } from "../utils/listingsApi";
import "./Sell.css";

const CONTACT_PREFS_KEY = "uqamarketplace_contactPrefs";

export default function Sell() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    let savedContacts = null;

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(CONTACT_PREFS_KEY);
        if (raw) {
          savedContacts = JSON.parse(raw);
        }
      } catch (err) {
        console.error("Impossible de charger les préférences de contact", err);
      }
    }

    return {
      category: "Choisir",
      course: "",
      title: "",
      condition: "Choisir",
      description: "",
      price: "",
      // Attributs spécifiques par catégorie
      marque: "", // Pour Électronique
      type: "", // Pour Meubles
      taille: "", // Pour Vêtements
      genre: "", // Pour Vêtements

      // Contact (pré-rempli si sauvegardé)
      contact_cell: savedContacts?.contact_cell ?? false,
      contact_email: savedContacts?.contact_email ?? false,
      contact_other: savedContacts?.contact_other ?? false,
      phone: savedContacts?.phone ?? "",
      email: savedContacts?.email ?? "",
      otherContact: savedContacts?.otherContact ?? "",
    };
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const handleCheck = (key) => (e) => setField(key, e.target.checked);

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const next = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const toRevoke = prev.find((im) => im.id === id);
      if (toRevoke) URL.revokeObjectURL(toRevoke.url);
      return prev.filter((im) => im.id !== id);
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (form.category === "Choisir") {
      setError("Veuillez sélectionner une catégorie");
      setLoading(false);
      return;
    }

    if (!form.title.trim()) {
      setError("Veuillez entrer un titre");
      setLoading(false);
      return;
    }

    if (form.title.trim().length > 150) {
      setError("Le titre ne doit pas dépasser 150 caractères");
      setLoading(false);
      return;
    }

    if (form.condition === "Choisir") {
      setError("Veuillez sélectionner l'état de l'article");
      setLoading(false);
      return;
    }

    if (!form.price.trim() || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      setError("Veuillez entrer un prix valide (supérieur à 0)");
      setLoading(false);
      return;
    }

    if (form.description.trim().length > 2000) {
      setError("La description ne doit pas dépasser 2000 caractères");
      setLoading(false);
      return;
    }

    // Valider les informations de contact
    if (form.contact_cell && !form.phone.trim()) {
      setError("Veuillez entrer un numéro de téléphone");
      setLoading(false);
      return;
    }

    if (form.contact_email && !form.email.trim()) {
      setError("Veuillez entrer une adresse courriel");
      setLoading(false);
      return;
    }

    if (form.contact_other && !form.otherContact.trim()) {
      setError("Veuillez entrer les informations de contact");
      setLoading(false);
      return;
    }

    if (!form.contact_cell && !form.contact_email && !form.contact_other) {
      setError("Veuillez sélectionner au moins un mode de contact");
      setLoading(false);
      return;
    }

    try {
      try {
        if (typeof window !== "undefined") {
          const toSave = {
            contact_cell: form.contact_cell,
            contact_email: form.contact_email,
            contact_other: form.contact_other,
            phone: form.phone,
            email: form.email,
            otherContact: form.otherContact,
          };
          localStorage.setItem(CONTACT_PREFS_KEY, JSON.stringify(toSave));
        }
      } catch (e) {
        console.error("Impossible de sauvegarder les préférences de contact", e);
      }
      // Préparer les attributs spécifiques à la catégorie
      const categoryAttributes = {};

      if (form.category === "Électronique" && form.marque) {
        categoryAttributes.marque = form.marque.trim();
      }
      if (form.category === "Meubles" && form.type) {
        categoryAttributes.type = form.type.trim();
      }
      if (form.category === "Vêtements") {
        if (form.taille) categoryAttributes.taille = form.taille.trim();
        if (form.genre) categoryAttributes.genre = form.genre.trim();
      }

      const imageFiles = images.map((img) => img.file);

      const listing = await createListing(
        {
          ...form,
          category_attributes: categoryAttributes,
        },
        imageFiles
      );

      navigate("/publish-success", { state: { listing } });
    } catch (err) {
      console.error("Erreur lors de la création de l'annonce:", err);
      setError(
        err.message || "Une erreur est survenue lors de la création de l'annonce"
      );
      setLoading(false);
    }
  };

  const CATEGORIES = [
    "Choisir",
    "Manuel scolaire",
    "Électronique",
    "Meubles",
    "Vêtements",
    "Autre",
  ];

  const CONDITIONS = ["Choisir", "Neuf", "Comme neuf", "Bon", "Acceptable"];

  return (
    <div className="sell-shell">
      <MenuBar onSearch={() => { }} onSellClick={() => { }} />

      <main className="sell-main">
        <div className="sell-container">
          <h1 className="sell-title">Vendre un article</h1>

          <p className="mandatory-note">
            <span className="required-asterisk">*</span> Champs obligatoires
          </p>

          {error && (
            <div className="error-message" style={{
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: "#fee",
              color: "#c33",
              borderRadius: "4px"
            }}>
              {error}
            </div>
          )}

          <form className="sell-form" onSubmit={onSubmit}>
            <div className="form-row">
              <label>
                Que voulez vous vendre ? <span className="required-asterisk">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Quel Cours ?</label>
              <input
                type="text"
                placeholder="ex: MAT4681"
                value={form.course}
                onChange={(e) => setField("course", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>
                Titre : <span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                placeholder="Titre pour l'item"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                maxLength={150}
                required
              />
              <small style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                {form.title.length}/150 caractères
              </small>
            </div>

            <div className="form-row">
              <label>
                État de l'item : <span className="required-asterisk">*</span>
              </label>
              <select
                value={form.condition}
                onChange={(e) => setField("condition", e.target.value)}
                required
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Champs spécifiques selon la catégorie */}
            {form.category === "Électronique" && (
              <div className="form-row">
                <label>Marque :</label>
                <input
                  type="text"
                  placeholder="ex: Lenovo, Apple, Samsung"
                  value={form.marque}
                  onChange={(e) => setField("marque", e.target.value)}
                />
              </div>
            )}

            {form.category === "Meubles" && (
              <div className="form-row">
                <label>Type :</label>
                <input
                  type="text"
                  placeholder="ex: Chaise de bureau, Table, Étagère"
                  value={form.type}
                  onChange={(e) => setField("type", e.target.value)}
                />
              </div>
            )}

            {form.category === "Vêtements" && (
              <>
                <div className="form-row">
                  <label>Taille :</label>
                  <input
                    type="text"
                    placeholder="ex: S, M, L, XL"
                    value={form.taille}
                    onChange={(e) => setField("taille", e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Genre :</label>
                  <select
                    value={form.genre}
                    onChange={(e) => setField("genre", e.target.value)}
                  >
                    <option value="">Sélectionner</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Unisexe">Unisexe</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-row form-row--full">
              <label>Description :</label>
              <textarea
                rows={5}
                placeholder="Écrire la description"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                maxLength={2000}
              />
              <small style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                {form.description.length}/2000 caractères
              </small>
            </div>

            <div className="form-row">
              <label>
                Prix : <span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                placeholder="Prix pour l'item"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                required
              />
            </div>

            <fieldset className="contact-fieldset form-row--full">
              <legend>Mode de contact à vendeur :</legend>

              <div className="contact-grid">
                <label className="contact-option">
                  <input
                    type="checkbox"
                    checked={form.contact_cell}
                    onChange={handleCheck("contact_cell")}
                  />
                  <span>Cellulaire</span>
                </label>

                <div className="contact-input">
                  <input
                    type="tel"
                    placeholder="Numéro de téléphone"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    disabled={!form.contact_cell}
                  />
                </div>

                <label className="contact-option">
                  <input
                    type="checkbox"
                    checked={form.contact_email}
                    onChange={handleCheck("contact_email")}
                  />
                  <span>Courriel</span>
                </label>

                <div className="contact-input">
                  <input
                    type="email"
                    placeholder="ex: prenom.nom@uqam.ca"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    disabled={!form.contact_email}
                  />
                </div>

                <label className="contact-option">
                  <input
                    type="checkbox"
                    checked={form.contact_other}
                    onChange={handleCheck("contact_other")}
                  />
                  <span>Autre</span>
                </label>

                <div className="contact-input">
                  <input
                    type="text"
                    placeholder="ex: Telegram @handle"
                    value={form.otherContact}
                    onChange={(e) => setField("otherContact", e.target.value)}
                    disabled={!form.contact_other}
                  />
                </div>
              </div>
            </fieldset>

            <div className="form-row form-row--full">
              <label>Télécharger des photos :</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="file-input"
              />
              {images.length > 0 && (
                <div className="image-grid">
                  {images.map((img) => (
                    <div key={img.id} className="image-card">
                      <img src={img.url} alt="aperçu" />
                      <button
                        type="button"
                        className="image-delete"
                        onClick={() => removeImage(img.id)}
                        aria-label="Supprimer cette image"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Publication en cours..." : "Sauvegarder"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}