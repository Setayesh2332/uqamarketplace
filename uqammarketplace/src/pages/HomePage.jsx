import { useMemo, useState } from "react";
import MenuBar from "../components/MenuBar";
import MenuBox from "../components/MenuBox";
import { MENU_LIST } from "../utils/MenuList";



export default function HomePage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("prix_asc"); // 'prix_asc' | 'prix_desc' | 'recent'

  const items = useMemo(() => {
    const arr = [];
    for (const cat of MENU_LIST) {
      for (const ex of cat.examples) {
        arr.push({ catLabel: cat.label, attributes: cat.attributes, example: ex });
      }
    }
    return arr;
  }, []);


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(({ example }) => {
      const hay = `${example.titre ?? ""} ${example.description ?? ""} ${example.vendeur ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);


  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sort === "prix_asc") {
      copy.sort((a, b) => (a.example.prix ?? Infinity) - (b.example.prix ?? Infinity));
    } else if (sort === "prix_desc") {
      copy.sort((a, b) => (b.example.prix ?? -Infinity) - (a.example.prix ?? -Infinity));
    } else if (sort === "recent") {
      copy.sort((a, b) => {
        const da = Date.parse(a.example.datePublication ?? "1970-01-01");
        const db = Date.parse(b.example.datePublication ?? "1970-01-01");
        return db - da;
      });
    }
    return copy;
  }, [filtered, sort]);

  return (
    <>
      <MenuBar onSearch={setQuery} onSellClick={() => alert("Vendre (à brancher)")} />

      <div className="container list-header">
        <div />
        <div className="list-filter">
          <label htmlFor="sort">Filtre&nbsp;:</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="prix_asc">Prix le plus bas</option>
            <option value="prix_desc">Prix le plus élevé</option>
            <option value="recent">Plus récent</option>
          </select>
        </div>
      </div>

      <section className="container menu-grid">
        {sorted.map(({ catLabel, attributes, example }, idx) => (
          <MenuBox
            key={catLabel + idx}
            title={catLabel}
            attributes={attributes}
            example={example}
          />
        ))}
      </section>
    </>
  );
}
