
// File: PageTitle.jsx
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./PageTitle.css";

const PageTitle = ({
  leftOpen = false,
  rightOpen = false,
  leftWidth = 260,
  rightWidth = 320,
  currentFilter = "all",
  onFilterChange = () => {},
}) => {
  const [active, setActive] = useState("Starters");
  const [containerPadding, setContainerPadding] = useState({
    paddingLeft: 0,
    paddingRight: 0,
  });

  const categories = [
    { name: "Starters", icon: "bi-egg-fried" },
    { name: "Main", icon: "bi-basket2-fill" },
    { name: "Desserts", icon: "bi-egg-fried" },
    { name: "Drinks", icon: "bi-cup-straw" },
  ];

  useEffect(() => {
    const updatePadding = () => {
      const vw = window.innerWidth;
      const isDesktop = vw >= 1024;

      setContainerPadding({
        paddingLeft: isDesktop && leftOpen ? leftWidth : 0,
        paddingRight: isDesktop && rightOpen ? rightWidth : 0,
      });
    };

    updatePadding();
    window.addEventListener("resize", updatePadding);
    return () => window.removeEventListener("resize", updatePadding);
  }, [leftOpen, rightOpen, leftWidth, rightWidth]);

  const rootInlineStyle = {
    paddingLeft: containerPadding.paddingLeft,
    paddingRight: containerPadding.paddingRight,
    transition: "padding 200ms ease",
    boxSizing: "border-box",
  };

  return (
    <div className="pt-wrapper" style={rootInlineStyle}>
      <div className="pt-container">
        <div className="pt-top">
          <div className="category-title">
            <i className="bi bi-grid-3x3-gap-fill" aria-hidden="true"></i> Categories
          </div>

          <div className="search-wrap">
            <div className="search-box">
              <i className="bi bi-search" aria-hidden="true"></i>
              <input type="search" className="search-input" placeholder="Search Dishes" />
              <i className="bi bi-sliders" aria-hidden="true"></i>
            </div>
          </div>
        </div>

        <div className="pt-pills-row">
          <div className="category-buttons" role="tablist" aria-label="categories">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className={`btn-category ${active === cat.name ? "btn-active" : ""}`}
                onClick={() => setActive(cat.name)}
                role="tab"
                aria-selected={active === cat.name}
                title={cat.name}
              >
                <i className={`bi ${cat.icon}`} aria-hidden="true" />
                <span className="btn-label" style={{ marginLeft: 6 }}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>

          <div className="pill-filter-group" aria-label="filters">
            <button
              className={`btn-category ${currentFilter === "veg" ? "btn-active" : ""}`}
              onClick={() => onFilterChange("veg")}
              aria-pressed={currentFilter === "veg"}
              aria-label="Show vegetarian dishes"
              title="Veg"
            >
              <i className="bi bi-circle-fill" style={{ color: "green" }} aria-hidden="true" />
              <span style={{ marginLeft: 6 }}>Veg</span>
            </button>

            <button
              className={`btn-category ${currentFilter === "non-veg" ? "btn-active" : ""}`}
              onClick={() => onFilterChange("non-veg")}
              aria-pressed={currentFilter === "non-veg"}
              aria-label="Show non vegetarian dishes"
              title="Non-Veg"
            >
              <i className="bi bi-circle-fill" style={{ color: "red" }} aria-hidden="true" />
              <span style={{ marginLeft: 6 }}>Non-Veg</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageTitle;

