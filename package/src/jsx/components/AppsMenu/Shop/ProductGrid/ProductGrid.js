import React, { Fragment, useEffect, useState } from "react";
import Products from "./Products";
import OffCanvasCart from "../../../../layouts/nav/OffCanvasCart";
import SideBar from "../../../../layouts/nav/SideBar";
import productData from "../productData";
import PageTitle from "../../../../layouts/PageTitle";

const ProductGrid = () => {
  const LEFT_DRAWER_WIDTH = 220;
  const RIGHT_DRAWER_WIDTH = 275;

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 991 : false
  );

  const [showSidebar, setShowSidebar] = useState(
    typeof window !== "undefined" ? window.innerWidth > 991 : true
  );
  const [showCart, setShowCart] = useState(false);

  // *** NEW: filter state ***
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 991;
      setIsMobile(mobile);

      if (mobile) setShowSidebar(false);
      else setShowSidebar(true);
    };

    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleAddToCart = (product) => {
    const payload = {
      id:
        product.id ??
        product.key ??
        `${product.title ?? product.name ?? "item"}-${product.price ?? 0}`,
      title: product.title ?? product.name ?? "Item",
      price: Number(product.price ?? product.unitPrice ?? 0) || 0,
      img: product.previewImg ?? product.img ?? product.image ?? "",
      raw: product,
    };

    try {
      window.dispatchEvent(new CustomEvent("addToCart", { detail: payload }));
    } catch (err) {
      const evt = document.createEvent && document.createEvent("CustomEvent");
      if (evt && evt.initCustomEvent) {
        evt.initCustomEvent("addToCart", true, true, payload);
        window.dispatchEvent(evt);
      }
    }

    setShowCart(true);
  };

  const leftOffset = !isMobile && showSidebar ? LEFT_DRAWER_WIDTH : 0;
  const rightOffset = !isMobile && showCart ? RIGHT_DRAWER_WIDTH : 0;


  const mainWrapperStyle = {
  position: isMobile ? "relative" : "absolute",
  top: 0,
  left: leftOffset,
  right: rightOffset,
  transition: "left 300ms ease, right 300ms ease, width 300ms ease",
  boxSizing: "border-box",
  paddingTop: isMobile ? 40 : 80,
  paddingLeft: isMobile ? 12 : 24,
  paddingRight: isMobile ? 12 : 24,
  minHeight: "100vh",
  overflow: "auto",
  width: isMobile
    ? "100%"
    : `calc(100% - ${leftOffset + rightOffset}px)`,
};



  const sidebarStyle = {
    position: isMobile ? "relative" : "fixed",
    top: 0,
    left: showSidebar ? 0 : `-${LEFT_DRAWER_WIDTH}px`,
    width: isMobile ? "100%" : LEFT_DRAWER_WIDTH,
    borderRight: "1px solid #ddd",
    transition: "left 0.3s ease",
    zIndex: 5000,
    overflowY: "auto",
    pointerEvents: isMobile && !showSidebar ? "none" : "auto",
  };

  return (
    <Fragment>
      <div style={sidebarStyle}>
        <SideBar
          show={showSidebar}
          onHide={(state) => setShowSidebar(Boolean(state))}
          defaultOpen={showSidebar}
        />
      </div>

      <OffCanvasCart
        show={showCart}
        onHide={(state) => setShowCart(Boolean(state))}
        defaultOpen={showCart}
      />

      {/* Pass filter props */}
      <div style={mainWrapperStyle}>
        <PageTitle
          activeMenu="Products"
          motherMenu="Shop"
          currentFilter={filterType}
          onFilterChange={setFilterType}
        />

        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-12 col-lg-12 col-md-12">
              <div className="row">
                {productData
                  .filter((p) => {
                    if (filterType === "veg") return p.type === "Vegetarian";
                    if (filterType === "non-veg")
                      return p.type !== "Vegetarian";
                    return true;
                  })
                  .map((product) => (
                    <Products
                      key={product.key}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ProductGrid;
