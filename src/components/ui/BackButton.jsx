import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "./BackButton.css";

export default function BackButton({ label = "Back", onClick, to, className = "" }) {
  const navigate = useNavigate();

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
      return;
    }
    if (to) {
      navigate(to);
      return;
    }
    navigate(-1);
  };

  return (
    <button type="button" className={`shared-back-button ${className}`} onClick={handleClick}>
      <FiArrowLeft size={18} />
      <span>{label}</span>
    </button>
  );
}
