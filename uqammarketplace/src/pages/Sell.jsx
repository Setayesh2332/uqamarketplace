import React, { useState } from "react";
import "./Sell.css";

export default function Sell() {
    // ----- form state -----
    const [form, setForm] = useState({
        category: "Choisir",
        program: "",
        course: "",
        title: "",
        condition: "Choisir",
        description: "",
        price: "",
        contact_cell: false,
        contact_email: false,
        contact_other: false,
        phone: "",
        email: "",
        otherContact: "",
    });

    // Image previews (File + objectURL)
    const [images, setImages] = useState([]); // [{file, url, id}]

    // ----- handlers -----
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
        // reset input so user can re-select same file if they want
        e.target.value = "";
    };

    const removeImage = (id) => {
        setImages((prev) => {
            const toRevoke = prev.find((im) => im.id === id);
            if (toRevoke) URL.revokeObjectURL(toRevoke.url);
            return prev.filter((im) => im.id !== id);
        });
    };

    const onSubmit = (e) => {
        e.preventDefault();

        // TODO: hook to backend (e.g., Supabase) later
        // For now, show a quick confirmation
        alert("Formulaire prêt à être envoyé (backend à brancher).");

        // Example payload you can reuse:
        // const payload = {
        //   ...form,
        //   images, // you'll upload files: images.map(i => i.file)
        // };
    };

    // ----- UI -----
    const CATEGORIES = [
        "Choisir",
        "Manuel scolaire",
        "Électronique",
        "Fournitures",
        "Meubles",
        "Autre",
    ];

    const CONDITIONS = ["Choisir", "Neuf", "Comme neuf", "Bon", "Acceptable"];

    return (
        <div className="sell-container">
            <h1 className="sell-title">Vendre un article</h1>

            <form className="sell-form" onSubmit={onSubmit}>
                {/* Category */}
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

                {/* Program */}
                <div className="form-row">
                    <label>Quel programme ?</label>
                    <input
                        type="text"
                        placeholder="ex: Bacc en informatique"
                        value={form.program}
                        onChange={(e) => setField("program", e.target.value)}
                    />
                </div>

                {/* Course */}
                <div className="form-row">
                    <label>Quel Cours ?</label>
                    <input
                        type="text"
                        placeholder="ex: MAT4681"
                        value={form.course}
                        onChange={(e) => setField("course", e.target.value)}
                    />
                </div>

                {/* Title */}
                <div className="form-row">
                    <label>Titre :</label>
                    <input
                        type="text"
                        placeholder="Titre pour l’item"
                        value={form.title}
                        onChange={(e) => setField("title", e.target.value)}
                    />
                </div>

                {/* Condition */}
                <div className="form-row">
                    <label>État de l’item :</label>
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

                {/* Description */}
                <div className="form-row form-row--full">
                    <label>Description :</label>
                    <textarea
                        rows={5}
                        placeholder="Écrire la description"
                        value={form.description}
                        onChange={(e) => setField("description", e.target.value)}
                    />
                </div>

                {/* Price */}
                <div className="form-row">
                    <label>Prix :</label>
                    <input
                        type="text"
                        placeholder="Prix pour l’item"
                        value={form.price}
                        onChange={(e) => setField("price", e.target.value)}
                    />
                </div>

                {/* Contact section (aligned) */}
                <fieldset className="contact-fieldset form-row--full">
                    <legend>Mode de contact à vendeur :</legend>

                    <div className="contact-grid">
                        {/* Cell */}
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

                        {/* Email */}
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

                        {/* Other */}
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

                {/* Photos with per-image delete */}
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

                <div className="actions">
                    <button type="submit" className="btn-primary">
                        Sauvegarder
                    </button>
                </div>
            </form>
        </div>
    );
}
