import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import { getListingById, updateListing } from "../utils/listingsApi";
import "./Sell.css";

export default function EditListing() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    category: "Choisir",
    program: "",
    course: "",
    title: "",
    condition: "Choisir",
    description: "",
    price: "",
    marque: "",
    type: "",
    taille: "",
    genre: "",
    contact_cell: false,
    contact_email: false,
    contact_other: false,
    phone: "",
    email: "",
    otherContact: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const listing = await getListingById(id);
      
      // Remplir le formulaire avec les données existantes
      const categoryAttrs = listing.category_attributes || {};
      setForm({
        category: listing.category || "Choisir",
        program: listing.program || "",
        course: listing.course || "",
        title: listing.title || "",
        condition: listing.condition || "Choisir",
        description: listing.description || "",
        price: listing.price?.toString() || "",
        marque: categoryAttrs.marque || "",
        type: categoryAttrs.type || "",
        taille: categoryAttrs.taille || "",
        genre: categoryAttrs.genre || "",
        contact_cell: listing.contact_cell || false,
        contact_email: listing.contact_email || false,
        contact_other: listing.contact_other || false,
        phone: listing.contact_phone || "",
        email: listing.contact_email_value || "",
        otherContact: listing.contact_other_value || "",
      });
    } catch (err) {
      console.error("Erreur lors du chargement de l'annonce:", err);
      setError("Impossible de charger l'annonce");
    } finally {
      setLoading(false);
    }
  };

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const handleCheck = (key) => (e) => setField(key, e.target.checked);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    // Validation
    if (form.category === "Choisir") {
      setError("Veuillez sélectionner une catégorie");
      setSaving(false);
      return;
    }

    if (form.condition === "Choisir") {
      setError("Veuillez sélectionner l'état de l'article");
      setSaving(false);
      return;
    }

    if (!form.title.trim()) {
      setError("Veuillez entrer un titre");
      setSaving(false);
      return;
    }

    if (form.title.trim().length > 150) {
      setError("Le titre ne doit pas dépasser 150 caractères");
      setSaving(false);
      return;
    }

    if (form.description.trim().length > 2000) {
      setError("La description ne doit pas dépasser 2000 caractères");
      setSaving(false);
      return;
    }

    if (!form.price.trim() || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      setError("Veuillez entrer un prix valide (supérieur à 0)");
      setSaving(false);
      return;
    }

    if (form.contact_cell && !form.phone.trim()) {
      setError("Veuillez entrer un numéro de téléphone");
      setSaving(false);
      return;
    }

    if (form.contact_email && !form.email.trim()) {
      setError("Veuillez entrer une adresse courriel");
      setSaving(false);
      return;
    }

    if (form.contact_other && !form.otherContact.trim()) {
      setError("Veuillez entrer les informations de contact");
      setSaving(false);
      return;
    }

    if (!form.contact_cell && !form.contact_email && !form.contact_other) {
      setError("Veuillez sélectionner au moins un mode de contact");
      setSaving(false);
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

      const updates = {
        category: form.category,
        program: form.program || null,
        course: form.course || null,
        title: form.title.trim(),
        condition: form.condition,
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        contact_cell: form.contact_cell,
        contact_email: form.contact_email,
        contact_other: form.contact_other,
        contact_phone: form.contact_cell ? form.phone.trim() : null,
        contact_email_value: form.contact_email ? form.email.trim() : null,
        contact_other_value: form.contact_other ? form.otherContact.trim() : null,
        category_attributes: categoryAttributes,
      };

      await updateListing(id, updates);
      alert("Annonce mise à jour avec succès !");
      navigate("/my-listings");
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError(err.message || "Une erreur est survenue lors de la mise à jour");
      setSaving(false);
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

  if (loading) {
    return (
      <div className="sell-shell">
        <MenuBar onSearch={() => {}} onSellClick={() => {}} />
        <main className="sell-main">
          <div className="sell-container">
            <p style={{ textAlign: "center", padding: "2rem" }}>
              Chargement de l'annonce...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="sell-shell">
      <MenuBar onSearch={() => {}} onSellClick={() => {}} />

      <main className="sell-main">
        <div className="sell-container">
          <h1 className="sell-title">Modifier l'annonce</h1>

          {error && (
            <div
              className="error-message"
              style={{
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor: "#fee",
                color: "#c33",
                borderRadius: "4px",
              }}
            >
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
                maxLength={150}
              />
              <small style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                {form.title.length}/150 caractères
              </small>
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

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/my-listings")}
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? "Mise à jour en cours..." : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
