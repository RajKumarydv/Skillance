import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { axiosFetch } from "../../utils";
import { useRecoilValue } from "recoil";
import { userState } from "../../atoms";
import { Loader } from "../../components";
import "./Orders.scss";

const Orders = () => {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { isLoading, error, data } = useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      axiosFetch
        .get(`/orders`)
        .then(({ data }) => data)
        .catch(({ response }) => {
          console.log(response?.data);
        }),
  });

  const handleContact = async (order) => {
    const sellerID = order.sellerID?._id || order.sellerID;
    const buyerID = order.buyerID?._id || order.buyerID;

    try {
      const { data } = await axiosFetch.get(
        `/conversations/single/${sellerID}/${buyerID}`
      );
      navigate(`/message/${data.conversationID}`);
    } catch (err) {
      if (err.response?.status === 404 && user) {
        const { data } = await axiosFetch.post("/conversations", {
          to: user?.isSeller ? buyerID : sellerID,
          from: user?.isSeller ? sellerID : buyerID,
        });
        navigate(`/message/${data.conversationID}`);
      }
    }
  };

  if (!user) {
    return <div className="orders">Loading user data...</div>;
  }

  return (
    <div className="orders">
      {isLoading ? (
        <div className="loader">
          <Loader />
        </div>
      ) : error ? (
        "Something went wrong!"
      ) : (
        <div className="container">
          <div className="title">
            <h1>Orders</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>{user?.isSeller ? "Buyer" : "Seller"}</th>
                <th>Title</th>
                <th>Price</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((order) => (
                <tr key={order._id}>
                  <td>
                    <img className="img" src={order.image} alt="" />
                  </td>
                  <td>
                    {user?.isSeller
                      ? order.buyerID?.username
                      : order.sellerID?.username}
                  </td>
                  <td>{order.title?.slice(0, 30)}...</td>
                  <td>
                    {order.price?.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                      style: "currency",
                      currency: "INR",
                    })}
                  </td>
                  <td>
                    <img
                      className="message"
                      src="./media/message.png"
                      alt="message"
                      onClick={() => handleContact(order)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
