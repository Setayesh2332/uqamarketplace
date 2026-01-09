import { useNavigate } from "react-router-dom";

export default function MenuBox({ id, title, example }) {
    const navigate = useNavigate();

    const handleVoirPlus = () => {
        navigate(`/listing/${id}`);
    };

    return (
        <article className="menu-box" onClick={handleVoirPlus}>
            {/* Image section (top) */}
            <div className="menu-box__image">
                <img src={example.image} alt={example.titre || title} />
            </div>

            {/* Info section (bottom) */}
            <div className="menu-box__info">
                <div className="menu-box__header">
                    <h3 className="menu-box__title">{example.titre || title}</h3>
                    <span className="menu-box__category">{title}</span>
                </div>

                <div className="menu-box__price">
                    {example.prix} $
                </div>

                <button
                    className="btn btn--ghost menu-box__more"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleVoirPlus();
                    }}
                >
                    Voir plus
                </button>
            </div>
        </article>
    );
}