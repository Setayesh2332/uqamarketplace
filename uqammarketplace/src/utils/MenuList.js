export const MENU_LIST = [
  {
    label: "Manuels scolaires",
    to: "/annonces/manuels",
    attributes: ["titre", "cours", "prix", "condition", "description", "vendeur", "datePublication"],
    examples: [
      {
        image: "https://picsum.photos/480/320?book",
        titre: "Livre de Calcul Intégral - MAT2100",
        cours: "Calcul Intégral",
        prix: 25,
        condition: "Très bon état",
        description: "Sans surlignage, utilisé un semestre.",
        vendeur: "Alex D.",
        datePublication: "2025-10-10",
      },
    ],
  },
  {
    label: "Électronique",
    to: "/annonces/electronique",
    attributes: ["titre", "marque", "prix", "condition", "description", "vendeur"],
    examples: [
      {
        image: "https://picsum.photos/480/320?laptop",
        titre: "Lenovo ThinkPad",
        marque: "Lenovo",
        prix: 450,
        condition: "Excellent",
        description: "i5 • 8Go RAM • 256Go SSD",
        vendeur: "Sophie T.",
      },
    ],
  },
  {
    label: "Meubles",
    to: "/annonces/meubles",
    attributes: ["titre", "type", "prix", "condition", "description", "vendeur"],
    examples: [
      {
        image: "https://picsum.photos/480/320?chair",
        titre: "Chaise de bureau ergonomique",
        type: "Chaise de bureau",
        prix: 60,
        condition: "Bon état",
        description: "Noire, confortable.",
        vendeur: "Mohamed L.",
      },
    ],
  },
  {
    label: "Vêtements",
    to: "/annonces/vetements",
    attributes: ["titre", "taille", "genre", "prix", "condition", "description", "vendeur"],
    examples: [
      {
        image: "https://picsum.photos/480/320?coat",
        titre: "Manteau d’hiver",
        taille: "L",
        genre: "Homme",
        prix: 80,
        condition: "Comme neuf",
        description: "Très chaud, porté 2 fois.",
        vendeur: "Nabil K.",
      },
    ],
  },
  {
    label: "Services",
    to: "/annonces/services",
    attributes: ["titre", "typeService", "tarifHoraire", "description", "vendeur", "disponibilite"],
    examples: [
      {
        image: "https://picsum.photos/480/320?tutoring",
        titre: "Tutorat en mathématiques",
        typeService: "Tutorat",
        tarifHoraire: 20,
        description: "Aide personnalisée MAT2100.",
        vendeur: "Rania B.",
        disponibilite: "Soir & week-end",
      },
    ],
  },
];
