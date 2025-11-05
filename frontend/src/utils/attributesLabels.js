// Clés = noms des attributs tels qu'ils apparaissent dans MenuList.js
// Valeurs = labels lisibles par langue
export const ATTRIBUTE_LABELS = {
  titre:           { fr: "Titre",            en: "Title" },
  cours:           { fr: "Cours",            en: "Course" },
  prix:            { fr: "Prix",             en: "Price" },
  condition:       { fr: "État",             en: "Condition" },
  description:     { fr: "Description",      en: "Description" },
  vendeur:         { fr: "Vendeur",          en: "Seller" },
  datePublication: { fr: "Date de publication", en: "Published at" },

  marque:          { fr: "Marque",           en: "Brand" },
  type:            { fr: "Type",             en: "Type" },
  taille:          { fr: "Taille",           en: "Size" },
  genre:           { fr: "Genre",            en: "Gender" },

  typeService:     { fr: "Type de service",  en: "Service type" },
  tarifHoraire:    { fr: "Tarif horaire",    en: "Hourly rate" },
  disponibilite:   { fr: "Disponibilité",    en: "Availability" },
};

// Utilitaire avec fallback : si pas trouvé -> capitalise la clé ("prix" -> "Prix")
export function getAttributeLabel(key, locale = "fr") {
  const rec = ATTRIBUTE_LABELS[key];
  if (rec && rec[locale]) return rec[locale];
  return key.charAt(0).toUpperCase() + key.slice(1); // fallback simple
}
