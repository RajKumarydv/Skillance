// src/components/Arrows/NextArrow.jsx

import { GrFormNext } from "react-icons/gr";
import "./Arrows.scss";

const NextArrow = ({ onClick }) => {
  return (
    <div className="next" onClick={onClick}>
      <GrFormNext />
    </div>
  );
};

export default NextArrow;
