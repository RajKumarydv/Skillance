// src/components/Arrows/PrevArrow.jsx

import { GrFormPrevious } from "react-icons/gr";
import "./Arrows.scss";

const PrevArrow = ({ onClick }) => {
  return (
    <div className="prev" onClick={onClick}>
      <GrFormPrevious />
    </div>
  );
};

export default PrevArrow;
