import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAttributeLabel } from "../utils/attributesLabels";

// export default function MenuBox({ title, example, attributes, locale = "fr", onMessage }) {
  // const [expanded, setExpanded] = useState(false);
export default function MenuBox({ id, title, example, attributes, locale = "fr" }) {
  const navigate = useNavigate();

  const orderedPairs = useMemo(() => {
    return attributes
      .filter((key) => example[key] !== undefined && key !== "image")
      .map((key) => [getAttributeLabel(key, locale), example[key]]);
  }, [attributes, example, locale]);

  // Si non étendu, on montre les 4 premiers
  const visible = orderedPairs.slice(0, 4);
  const handleVoirPlus = () => {
      navigate(`/listing/${id}`);
  };

  return (
    <article className="menu-box">
      {/* Section image (gauche) */}
      <div className="menu-box__image">
        <img src={example.image} alt={example.titre || title} />
      </div>

      {/* Section infos (droite) */}
      <div className="menu-box__info">
        <h3 className="menu-box__title">{example.titre || title}</h3>
        <dl className="menu-box__fields">
          {visible.map(([key, value]) => (
            <div className="field" key={key}>
              <dt>{key}</dt>
              <dd>{String(value)}</dd>
            </div>
          ))}
        </dl>

        <div className="menu-box__actions">
          {orderedPairs.length > 4 && (
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? "Voir moins" : "Voir plus"}
            </button>
          )}

          {onMessage && (
            <button
              className="btn btn--primary"
              type="button"
              onClick={onMessage}
            >
              Contacter le vendeur
            </button>
          )}
        </div>
        <button
            className="btn btn--ghost menu-box__more"
            onClick={handleVoirPlus}
        >
            Voir plus
        </button>
      </div>
    </article>
  );
}
