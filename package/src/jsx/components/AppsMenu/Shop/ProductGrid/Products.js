import { Link } from "react-router-dom";

const Products = ({
  product: { previewImg, title, price, type, buttonText },
  onAddToCart,
}) => {
  const payload = {
    id: `${title}-${price}`,
    title,
    price,
    img: previewImg,
  };

  const handleAdd = () => {
    if (typeof onAddToCart === "function") {
      onAddToCart(payload);
      return;
    }

    try {
      window.dispatchEvent(new CustomEvent("addToCart", { detail: payload }));
    } catch (err) {
      const evt = document.createEvent && document.createEvent("CustomEvent");
      if (evt && evt.initCustomEvent) {
        evt.initCustomEvent("addToCart", true, true, payload);
        window.dispatchEvent(evt);
      }
    }
  };

  const isVeg = type === "Vegetarian";

  const circleStyle = {
    width: 12,
    height: 12,
    borderRadius: "50%",
    display: "inline-block",
    verticalAlign: "middle",
    padding: 0,
    lineHeight: 0,
  };


  return (

     <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6"> 

      <div className="card overflow-hidden shadow-sm rounded-2xl">
        <div className="card-body p-2">
          <div className="new-arrival-product relative">

            {/* Badge + Text */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span
                className={isVeg ? "badge bg-success badge-circle" : "badge bg-primary badge-circle"}
                style={circleStyle}
                aria-hidden
              />
              <span style={{ color: "black",fontWeight: "700" }}>{type}</span>
            </div>

            {/* Image */}
            <div
              className="new-arrivals-img-contnent rounded-lg overflow-hidden mx-auto"
              style={{ width: "140px", height: "152px" }}
            >
              <img
                className="w-full h-full object-cover"
                src={previewImg}
                alt={title}
              />
            </div>

            {/* Details */}
            <div className="new-arrival-content text-center mt-3">
              <h4 className="text-base font-semibold">
                <Link to="/ecom-product-detail" className="hover:text-primary">
                  {title}
                </Link>
              </h4> 

              <div
                className="d-flex justify-content-between align-items-center mt-2"
                style={{ marginTop: "1rem" }}
              >
                <h6 className="">₹{price}</h6>
                <button className="btn btn-primary btn-xxs" onClick={handleAdd}>
                  ADD
                </button>
              </div>
            </div>

          </div>
        </div>
      </div> 
    </div>

    
  );
};

export default Products; 



