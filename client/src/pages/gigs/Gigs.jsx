// src/pages/Gigs/Gigs.jsx

import { useState, useRef, useEffect } from "react";
import { GigCard, Loader } from "../../components";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { axiosFetch } from "../../utils";
import "./Gigs.scss";

const Gigs = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [sortBy, setSortBy] = useState("sales");
  const [category, setCategory] = useState("");
  const minRef = useRef();
  const maxRef = useRef();
  const { search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const categoryParam = params.get("category");
    if (categoryParam) setCategory(categoryParam);
  }, [search]);

  const {
    isLoading,
    error,
    data = [],
    refetch,
  } = useQuery({
    queryKey: ["gigs", sortBy, search],
    queryFn: async () => {
      const queryPrefix = search ? `${search}&` : "?";
      const url = `/gigs${queryPrefix}min=${minRef.current?.value || 0}&max=${
        maxRef.current?.value || 9999
      }&sort=${sortBy}`;
      console.log("Gigs API request:", url);

      try {
        const res = await axiosFetch.get(url);
        console.log("Gigs API response data:", res.data);
        return res.data;
      } catch (err) {
        console.error("Fetch error:", err.message);
        return [];
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [sortBy, search]);

  const handleSortBy = (type) => {
    setSortBy(type);
    setOpenMenu(false);
  };

  const handlePriceFilter = () => {
    refetch();
  };

  return (
    <div className="gigs">
      <div className="container">
        <span className="breadcrumbs">
          FIVERR{" "}
          {category ? category[0]?.toUpperCase() + category.slice(1) : ""}
        </span>
        <h1>
          {category ? category[0]?.toUpperCase() + category.slice(1) : "Gigs"}
        </h1>
        <p>
          Explore the boundaries of art and technology with Fiverr's {category}
        </p>

        <div className="menu">
          <div className="left">
            <span>Budget</span>
            <input ref={minRef} type="number" placeholder="min" />
            <input ref={maxRef} type="number" placeholder="max" />
            <button onClick={handlePriceFilter}>Apply</button>
          </div>

          <div className="right">
            <span className="sortBy">Sort By</span>
            <span className="sortType">
              {sortBy === "sales" ? "Best Selling" : "Newest"}
            </span>
            <img
              src="./media/down.png"
              alt=""
              onClick={() => setOpenMenu(!openMenu)}
            />
            {openMenu && (
              <div className="rightMenu">
                {sortBy === "sales" ? (
                  <span onClick={() => handleSortBy("createdAt")}>Newest</span>
                ) : (
                  <span onClick={() => handleSortBy("sales")}>
                    Best Selling
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="cards">
          {isLoading ? (
            <div className="loader">
              <Loader size={45} />
            </div>
          ) : error ? (
            "Something went wrong!"
          ) : data.length === 0 ? (
            "No gigs found."
          ) : (
            data.map((gig) => <GigCard key={gig._id} data={gig} />)
          )}
        </div>
      </div>
    </div>
    

  );
};

export default Gigs;
