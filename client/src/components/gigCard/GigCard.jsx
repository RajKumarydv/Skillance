import { Link } from "react-router-dom";
import "./GigCard.scss";

const GigCard = ({ data }) => {
  const user = data?.userID;

  return (
    <Link to={`/gig/${data._id}`} className="link">
      <div className="gigCard">
        <img src={data.cover || "./media/noimage.png"} alt="gig cover" />
        <div className="info">
          <div className="user">
            <img
              src={user?.image || "./media/noavatar.png"}
              alt="user avatar"
            />
            <span>{user?.username || "Unknown User"}</span>
          </div>
          <p>{data.title || "No Title"}</p>
          <div className="star">
            <img src="./media/star.png" alt="star icon" />
            <span>
              {data.starNumber
                ? Math.round(data.totalStars / data.starNumber)
                : 0}
            </span>
            <span className="totalStars">({data.starNumber || 0})</span>
          </div>
        </div>
        <hr />
        <div className="detail">
          <img src="./media/heart.png" alt="like icon" />
          <div className="price">
            <span>STARTING AT</span>
            <h2>
              {data.price?.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
                style: "currency",
                currency: "INR",
              }) || "₹0"}
            </h2>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;
