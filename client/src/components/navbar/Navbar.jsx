import Slider from "react-slick";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { axiosFetch } from "../../utils";
import { useRecoilState } from "recoil";
import { userState } from "../../atoms";
import { Loader } from "..";
import toast from "react-hot-toast";
import "./Navbar.scss";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(userState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null); // Agar token nahi hai to user ko null set karo
        return;
      }

      // Token ko default headers me set karo
      axiosFetch.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setIsLoading(true);
      try {
        const response = await axiosFetch.get("/auth/me");

        if (response?.data?.user) {
          // Agar valid user hai, to user ko state me set karo
          setUser(response.data.user);
        } else {
          throw new Error("User not found");
        }
      } catch (err) {
        const message = err?.response?.data?.message || "Something went wrong!";
        console.error("Auth error:", message);
        setUser(null); // Agar user nahi mila, to state me null set karo
        localStorage.removeItem("token"); // Token ko remove karo
        delete axiosFetch.defaults.headers.common["Authorization"];
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const isActive = () => {
    setShowMenu(window.scrollY > 0);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);
    return () => window.removeEventListener("scroll", isActive);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosFetch.post("/auth/logout");
    } catch (err) {
      console.log("Logout failed:", err?.response?.data || err.message);
    } finally {
      localStorage.removeItem("token");
      delete axiosFetch.defaults.headers.common["Authorization"];
      setUser(null);
      toast.success("Logged out successfully 👋");
      navigate("/login");
    }
  };

  const menuLinks = [
    { path: "/gigs?category=design", name: "Graphics & Design" },
    { path: "/gigs?category=video", name: "Video & Animation" },
    { path: "/gigs?category=books", name: "Writing & Translation" },
    { path: "/gigs?category=ai", name: "AI Services" },
    { path: "/gigs?category=social", name: "Digital Marketing" },
    { path: "/gigs?category=voice", name: "Music & Audio" },
    { path: "/gigs?category=wordpress", name: "Programming & Tech" },
  ];

  const settings = {
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 2,
    prevArrow: <GrFormPrevious />,
    nextArrow: <GrFormNext />,
    swipeToSlide: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <nav className={showMenu || pathname !== "/" ? "navbar active" : "navbar"}>
      <div className="container">
        <div className="logo">
          <Link to="/" className="link">
            <span className="text">Skilance</span>
          </Link>
          <span className="dot">.</span>
        </div>

        <div className="links">
          <div className="menu-links">{!user?.isSeller && <span></span>}</div>
          {isLoading ? (
            <Loader size={35} />
          ) : (
            <>
              {!user && (
                <>
                  <span>
                    <Link to="/login" className="link">
                      Sign in
                    </Link>
                  </span>
                  <button
                    className={
                      showMenu || pathname !== "/" ? "join-active" : ""
                    }
                  >
                    <Link to="/register" className="link">
                      Join
                    </Link>
                  </button>
                </>
              )}
              {user && (
                <div className="user" onClick={() => setShowPanel(!showPanel)}>
                  <img src={user.image || "/media/noavatar.png"} alt="User" />
                  <span>{user?.username}</span>
                  {showPanel && (
                    <div className="options">
                      {user?.isSeller && (
                        <>
                          <Link className="link" to="/my-gigs">
                            Gigs
                          </Link>
                          <Link className="link" to="/organize">
                            Add New Gig
                          </Link>
                        </>
                      )}
                      <Link className="link" to="/orders">
                        Orders
                      </Link>
                      <Link className="link" to="/messages">
                        Messages
                      </Link>
                      <Link className="link" to="/" onClick={handleLogout}>
                        Logout
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {(showMenu || pathname !== "/") && (
        <>
          <hr />
          <Slider className="menu" {...settings}>
            {menuLinks.map(({ path, name }) => (
              <div key={name} className="menu-item">
                <Link className="link" to={path}>
                  {name}
                </Link>
              </div>
            ))}
          </Slider>
        </>
      )}
    </nav>
  );
};

export default Navbar;
