import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import { createListing } from "../utils/listingsApi";
import "./Sell.css";

export default function Sell() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: "Choisir",
    program: "",
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
    contact_cell: false,
    contact_email: false,
    contact_other: false,
    phone: "",
    email: "",
    otherContact: "",
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

    if (form.condition === "Choisir") {
      setError("Veuillez sélectionner l'état de l'article");
      setLoading(false);
      return;
    }

    if (!form.title.trim()) {
      setError("Veuillez entrer un titre");
      setLoading(false);
      return;
    }

    if (!form.price.trim() || isNaN(parseFloat(form.price))) {
      setError("Veuillez entrer un prix valide");
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
              <label>Que voulez vous vendre ?</label>
              <select
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Quel programme ?</label>
              <input
                type="text"
                placeholder="ex: Bacc en informatique"
                value={form.program}
                onChange={(e) => setField("program", e.target.value)}
              />
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
              <label>Titre :</label>
              <input
                type="text"
                placeholder="Titre pour l'item"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>État de l'item :</label>
              <select
                value={form.condition}
                onChange={(e) => setField("condition", e.target.value)}
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
              />
            </div>

            <div className="form-row">
              <label>Prix :</label>
              <input
                type="text"
                placeholder="Prix pour l'item"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
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
