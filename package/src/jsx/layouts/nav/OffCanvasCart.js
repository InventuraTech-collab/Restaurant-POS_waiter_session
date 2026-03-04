import React, { useEffect, useState, useRef } from "react";
import product1 from "../../../images/product/1.jpg";
import product2 from "../../../images/product/2.jpg";
import Billpreview from "../nav/Billpreview";
import "./OffCanvasCart.css";

// Move CreateIdContent outside OffCanvasCart to maintain component identity
const CreateIdContent = ({
  table, setTable,
  chair, setChair,
  idNumber, setIdNumber,
  generated, recent,
  onCreate,
  onCancel
}) => (
  <div className="oc-create-wrap">
    <h2 className="oc-create-title">Create New</h2>
    <div className="oc-create-desc">Quickly create an ID using table & chair</div>
    <div className="oc-create-labels">
      <label className="oc-create-label">Table</label>
      <label className="oc-create-label">Chair</label>
      <label className="oc-create-label id">Name</label>
    </div>

    <div className="oc-create-inputs">
      <input
        className="oc-input table"
        value={table}
        onChange={(e) => setTable(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder=""
      />

      <input
        className="oc-input chair"
        value={chair}
        onChange={(e) => setChair(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder=""
      />

      <input
        className="oc-input id-input"
        value={idNumber}
        onChange={(e) =>
          setIdNumber(e.target.value.replace(/[^0-9a-zA-Z-]/g, ""))
        }
        placeholder=""
      />
    </div>

    <div className="oc-generated-wrap">
      <div className="oc-generated">{generated}</div>
    </div>

    <div className="oc-create-actions">
      <button className="oc-btn create" onClick={onCreate}>create id</button>
      <button className="oc-btn cancel" onClick={onCancel}>Cancel</button>
    </div>

    {recent.length > 0 && (
      <div>
        <div className="oc-recent-title">Recently created</div>
        <div className="oc-recent-item">{recent[0]}</div>
      </div>
    )}
  </div>
);

const OffCanvasCart = ({ show = undefined, onHide = undefined, defaultOpen = false }) => {
  // ----------------------
  // All states declared up front (important!)
  // ----------------------
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showBill, setShowBill] = useState(false);
  const [showBillSummary, setShowBillSummary] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  // Create ID state
  const [showCreateId, setShowCreateId] = useState(false);
  const [table, setTable] = useState("");
  const [chair, setChair] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [generated, setGenerated] = useState("T6-C5-5678");
  const [recent, setRecent] = useState(["T8-C3-2256"]);

  // Active id shown in UI
  const [activeId, setActiveId] = useState("T2–C4–1133");

  // Cart & items
  const [cartItems, setCartItems] = useState([
    { id: 6, title: "Paneer Fry", price: 180, qty: 1, img: product2, cookingInstructions: "" },
  ]);

  // toppings picker
  const TOPPINGS = [
    "Extra Cheese",
    "Onion",
    "Extra Spices",
    "Green Chili",
    "Tomato",
    "Coriander",
    "Fried Onion",
  ];
  const [openToppingsFor, setOpenToppingsFor] = useState(null);

  // --- order type & customer modal state ---
  const [orderType, setOrderType] = useState("Dine-In");
  const [pendingOrderType, setPendingOrderType] = useState(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [previousOrderType, setPreviousOrderType] = useState("Dine-In");

  // keep ref
  const orderTypeRef = useRef(orderType);
  useEffect(() => { orderTypeRef.current = orderType; }, [orderType]);

  // constants
  const DRAWER_WIDTH = 240;
  const NAVBAR_HEIGHT = 73;
  const FOOTER_HEIGHT = 140;

  // ----------------------
  // Notify Sidebar when modal opens/closes
  // ----------------------
  const openModal = () => {
    setCustomerModalOpen(true);
    window.dispatchEvent(new CustomEvent("customerModalOpen", { detail: true }));
  };

  const closeModal = () => {
    setCustomerModalOpen(false);
    window.dispatchEvent(new CustomEvent("customerModalOpen", { detail: false }));
  };

  // ----------------------
  // Effects & listeners
  // ----------------------
  useEffect(() => {
    if (typeof show === "boolean") setIsOpen(show);
  }, [show]);

  // showCreateId listener
  useEffect(() => {
    const handler = (e) => {
      setShowCreateId(Boolean(e?.detail));
      if (!isOpen) {
        setIsOpen(true);
        if (typeof onHide === "function") onHide(true);
      }
    };
    window.addEventListener("showCreateId", handler);
    return () => window.removeEventListener("showCreateId", handler);
  }, [isOpen, onHide]);

  // addToCart listener
  useEffect(() => {
    const handler = (e) => {
      const p = e.detail || {};
      const id = p.id ?? `${p.title ?? "item"}-${p.price ?? 0}`;
      const title = p.title ?? p.name ?? "Item";
      const price = Number(p.price ?? p.unitPrice ?? 0) || 0;
      const img = p.img ?? p.image ?? product1;
      const incomingInstructions = p.cookingInstructions ?? "";

      setCartItems((prev) => {
        const existsIndex = prev.findIndex((it) => String(it.id) === String(id));
        if (existsIndex > -1) {
          const next = [...prev];
          const existing = next[existsIndex];
          next[existsIndex] = {
            ...existing,
            qty: (Number(existing.qty) || 0) + 1,
            cookingInstructions: existing.cookingInstructions || incomingInstructions || "",
          };
          return next;
        }
        return [...prev, { id, title, price, qty: 1, img, cookingInstructions: incomingInstructions }];
      });

      if (!isOpen) {
        setIsOpen(true);
        if (typeof onHide === "function") onHide(true);
      }
    };

    window.addEventListener("addToCart", handler);
    return () => window.removeEventListener("addToCart", handler);
  }, [isOpen, onHide]);

  // setActiveId listener
  useEffect(() => {
    const handler = (e) => {
      const id = e?.detail;
      if (!id) return;

      setActiveId(id);

      setCartItems([]);
      setShowBill(false);
      setShowBillSummary(false);
      setShowPaymentOptions(false);
      setShowCreateId(false);
      setCustomerDetails(null);
      setPendingOrderType(null);

      if (!isOpen) {
        setIsOpen(true);
        if (typeof onHide === "function") onHide(true);
      }
    };

    window.addEventListener("setActiveId", handler);
    return () => window.removeEventListener("setActiveId", handler);
  }, [isOpen, onHide]);

  // hide drawer listener
  useEffect(() => {
    const handler = () => {
      setIsOpen(false);
      if (typeof onHide === "function") onHide(false);
    };
    window.addEventListener("hideOffCanvasCart", handler);
    return () => window.removeEventListener("hideOffCanvasCart", handler);
  }, [onHide]);

  // ----------------------
  // Helpers & handlers
  // ----------------------
  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (typeof onHide === "function") onHide(newState);
  };

  const increaseQty = (id) => {
    setCartItems((prev) => prev.map((it) => (String(it.id) === String(id) ? { ...it, qty: Number(it.qty || 0) + 1 } : it)));
  };

  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev
        .map((it) => {
          if (String(it.id) !== String(id)) return it;
          const newQty = Number(it.qty || 0) - 1;
          return newQty > 0 ? { ...it, qty: newQty } : null;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((it) => String(it.id) !== String(id)));
  };

  const toggleToppings = (itemId) => {
    setOpenToppingsFor((prev) => (String(prev) === String(itemId) ? null : itemId));
  };

  const addToppingToItem = (itemId, topping) => {
    setCartItems((prev) =>
      prev.map((it) => {
        if (String(it.id) !== String(itemId)) return it;
        const current = String(it.cookingInstructions || "").trim();
        const list = current ? current.split(",").map((s) => s.trim()).filter(Boolean) : [];
        const already = list.some((el) => el.toLowerCase() === topping.toLowerCase());
        const nextList = already ? list : [...list, topping];
        return { ...it, cookingInstructions: nextList.join(", ") };
      })
    );
  };

  const onChangeInstructions = (itemId, value) => {
    setCartItems((prev) => prev.map((it) => (String(it.id) === String(itemId) ? { ...it, cookingInstructions: value } : it)));
  };

  const subtotal = cartItems.reduce((acc, i) => acc + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const buildBillData = () => ({
    id: activeId || "T2-C4-1133",
    waiterName: "Manu",
    orderType: orderType,
    date: new Date().toLocaleDateString("en-GB"),
    vatPercent: 5,
    customer: customerDetails || null,
    items: cartItems.map((c) => ({ name: c.title, qty: c.qty, unitPrice: c.price })),
    company: { name: "Company Name", addressLine1: "[company address]", addressLine2: "[company address]", addressLine3: "[company address]" },
  });

  const handlePrintBillClick = () => setShowBill(true);

  // 🔥 OPEN MODAL HANDLING UPDATED HERE
  const handlePlaceOrderClick = () => {
    if (["Drive-in", "Delivery", "Take-away"].includes(orderType) && !customerDetails) {
      openModal();
      setPendingOrderType(orderType);
      return;
    }
    setShowBillSummary(true);
    window.dispatchEvent(new CustomEvent("showBillSummary", { detail: true }));
  };

  const onOrderTypeChange = (nextType) => {
    if (["Drive-in", "Delivery", "Take-away"].includes(nextType)) {
      if (customerDetails) {
        setPreviousOrderType(orderType);
        setOrderType(nextType);
        return;
      }

      if (cartItems && cartItems.length > 0) {
        setPendingOrderType(nextType);
        openModal();
      } else {
        setPreviousOrderType(orderType);
        setOrderType(nextType);
      }
    } else {
      setPreviousOrderType(orderType);
      setOrderType(nextType);
    }
  };

  const saveCustomerDetails = (details) => {
    setCustomerDetails(details || null);
    if (pendingOrderType) {
      setPreviousOrderType(orderType);
      setOrderType(pendingOrderType);
      setPendingOrderType(null);
    }
    closeModal();
  };

  const cancelCustomerModal = () => {
    closeModal();
    setPendingOrderType(null);
    setOrderType(previousOrderType);
  };

  // CustomerModal
  const CustomerModal = ({ open, onSave, onCancel, initial = {} }) => {
    const [name, setName] = useState(initial.name || "");
    const [phone, setPhone] = useState(initial.phone || "");
    const [address, setAddress] = useState(initial.address || "");

    useEffect(() => {
      if (open) {
        setName(initial.name || "");
        setPhone(initial.phone || "");
        setAddress(initial.address || "");
      }
    }, [open, initial]);

    const handleSave = () => {
      if (!name.trim() || !phone.trim()) {
        alert("Please provide customer name and phone.");
        return;
      }
      onSave({ name: name.trim(), phone: phone.trim(), address: address.trim() });
    };

    if (!open) return null;

    return (
      <div className="oc-modal-overlay" style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 1400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}>
        <div className="oc-modal" role="dialog" aria-modal="true" style={{
          width: "min(520px, 92%)"  ,
          background: "#fff",
          borderRadius: 8,
          padding: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        }}>
          <h4 style={{ margin: 0, marginBottom: 8 }}>Customer Details</h4>
          <div style={{ marginBottom: 8, color: "#666" }}>Provide customer information for {pendingOrderType || orderType}</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
            <label style={{ fontSize: 13, color: "#333" }}>
              Name
              <input className="oc-input" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", marginTop: 6 }} />
            </label>

            <label style={{ fontSize: 13, color: "#333" }}>
              Phone
              <input className="oc-input" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))} style={{ width: "100%", marginTop: 6 }} />
            </label>

            <label style={{ fontSize: 13, color: "#333" }}>
              Address (optional)
              <textarea className="oc-input" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: "100%", marginTop: 6 }} rows={3} />
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button className="oc-btn cancel" onClick={onCancel}>Cancel</button>
            <button className="oc-btn create" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  // Handler functions for CreateIdContent
  const handleCreateId = () => {
    if (!table || !chair || !idNumber) { alert("Please fill in all fields"); return; }
    const t = String(table).slice(0, 2).padStart(2, "0");
    const c = String(chair).slice(0, 2).padStart(2, "0");
    const id = `T${t}-C${c}-${idNumber}`;
    setGenerated(id);
    setRecent((p) => [id, ...p].slice(0, 6));

    // dispatch event so Sidebar (or other parts) know about the new ID
    window.dispatchEvent(new CustomEvent("newIdCreated", { detail: { id, status: "New" } }));

    // Close create view and clear form
    setShowCreateId(false);
    setTable(""); setChair(""); setIdNumber("");

    // Hide any bill UI so user doesn't land on summary after creating
    setShowBillSummary(false);
    setShowPaymentOptions(false);
    setShowBill(false);

    // --- after creating a table, close the drawer (return sidebar) ---
    setIsOpen(false);
    if (typeof onHide === "function") onHide(false);
  };

  const handleCancelCreate = () => {
    setTable(""); setChair(""); setIdNumber(""); 
    setShowCreateId(false);
  };

  const BillSummaryContent = ({ data }) => {
    const subtotalVal = data.items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.unitPrice || 0), 0);
    const vatVal = subtotalVal * (Number(data.vatPercent || 0) / 100);
    const grandVal = subtotalVal + vatVal;

    return (
      <div className="oc-billsummary-wrap">
        <div className="oc-billsummary-header">
          <button
            onClick={() => {
              setShowBillSummary(false);
              setShowPaymentOptions(false);
              window.dispatchEvent(new CustomEvent("showBillSummary", { detail: false }));
            }}
            className="oc-close-summary"
            aria-label="Close summary"
          >
            ×
          </button>
          <h4 className="oc-billsummary-title">Bill Summary</h4>
        </div>

        {data.customer && (
          <div className="oc-customer-details" style={{ border: "1px solid #f1f1f1", padding: 8, borderRadius: 6, marginBottom: 8 }}>
            <div style={{ fontWeight: 700,color: "#000" }}>Customer</div>
            <div style={{ fontSize: 13,color: "#000" }}>{data.customer.name} • {data.customer.phone}</div>
            {data.customer.address && <div style={{ fontSize: 13, color: "#000" }}>{data.customer.address}</div>}
            <div style={{ fontSize: 12, color: "#000", marginTop: 4 }}>Order Type: {data.orderType}</div>
          </div>
        )}

        <div className="oc-total-label">Total Bill</div>

        <div className="oc-items-head">
          <div>Item</div>
          <div className="oc-items-head-total">Total</div>
        </div>

        <div className="oc-items-list">
          {data.items.map((it, idx) => (
            <div key={idx} className="oc-item-row" style={{ borderBottom: idx < data.items.length - 1 ? "1px solid #f6f6f6" : "none" }}>
              <div className="oc-item-name">{it.name}</div>
              <div className="oc-item-total">{it.qty} × ₹{Number(it.unitPrice).toFixed(0)}</div>
            </div>
          ))}
        </div>

        <div className="oc-summary-totals">
          <div className="oc-summary-row"><div>Subtotal :</div><div>₹{subtotalVal.toFixed(2)}</div></div>
          <div className="oc-summary-row"><div>VAT ({data.vatPercent}%) :</div><div>₹{vatVal.toFixed(2)}</div></div>
          <div className="oc-summary-grand"><div>Grand Total :</div><div>₹{grandVal.toFixed(2)}</div></div>
        </div>

        <div className="oc-billsummary-actions">
          <button
            onClick={() => {
              setShowPaymentOptions(true);
            }}
            className="oc-btn paynow"
          >
            Pay Now
          </button>

          <button
            onClick={() => setShowBill(true)}
            className="oc-btn print"
          >
            Print Bill
          </button>
        </div>

        <div className={`oc-payment-options ${showPaymentOptions ? "open" : ""}`}>
          <div className="oc-payment-title">Select Payment Method</div>
          <div className="oc-payment-desc">Choose how you'd like to complete your payment</div>

          <div className="oc-payment-list">
            <button onClick={() => { alert("Selected: Pay In Cash"); setShowPaymentOptions(false); setShowBillSummary(false); window.dispatchEvent(new CustomEvent("showBillSummary", { detail: false })); }} className="oc-payment-btn cash">
              <div className="oc-payment-emoji">💵</div>
              Pay In Cash
            </button>

            <button onClick={() => { alert("Selected: Debit Card"); setShowPaymentOptions(false); setShowBillSummary(false); window.dispatchEvent(new CustomEvent("showBillSummary", { detail: false })); }} className="oc-payment-btn debit">
              <div className="oc-payment-emoji">💳</div>
              Debit Card
            </button>

            <button onClick={() => { alert("Selected: Credit Card"); setShowPaymentOptions(false); setShowBillSummary(false); window.dispatchEvent(new CustomEvent("showBillSummary", { detail: false })); }} className="oc-payment-btn credit">
              <div className="oc-payment-emoji">🏦</div>
              Credit Card
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------
  // Render
  // ----------------------
  return (
    <>
      {/* RIGHT TOGGLE — hidden when modal open */}
      {!customerModalOpen && (
        <div
          onClick={toggle}
          className={`oc-toggle ${isOpen ? "open" : ""}`}
          style={{
            right: isOpen ? DRAWER_WIDTH - 1 : 0,
          }}
        >
          <span className={`oc-toggle-arrow ${isOpen ? "open" : ""}`}>❯</span>
        </div>
      )}

      <div className={`oc-drawer ${isOpen ? "open" : ""}`} style={{ top: NAVBAR_HEIGHT, right: isOpen ? 0 : -DRAWER_WIDTH, width: DRAWER_WIDTH, height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}>
        <div className={`oc-content ${showBillSummary || showCreateId ? "compact" : ""}`} style={{ padding: showBillSummary || showCreateId ? "12px 12px 16px" : `8px 8px ${FOOTER_HEIGHT + 8}px` }}>
          <style>{`.hide-scroll::-webkit-scrollbar{display:none;}`}</style>

          <CustomerModal open={customerModalOpen} onSave={saveCustomerDetails} onCancel={cancelCustomerModal} initial={customerDetails || {}} />

          {showCreateId ? (
          <CreateIdContent
            table={table}
            setTable={setTable}
            chair={chair}
            setChair={setChair}
            idNumber={idNumber}
            setIdNumber={setIdNumber}
            generated={generated}
            recent={recent}
            onCreate={handleCreateId}
            onCancel={handleCancelCreate}
          />
        ) : !showBillSummary ? (
            <>
              <div>
                <div className="oc-active-id">
                  Active Id: <span className="oc-active-id-val">{activeId}</span>
                </div>
                <div className="oc-heading">Orders & Billing</div>
                <div className="oc-subheading">Manage cart and billing</div>
              </div>

              <div className="oc-items-wrap">
                {cartItems.map((item) => (
                  <div key={item.id} className="oc-item-card">
                    <img src={item.img} alt={item.title} className="oc-item-img" />
                    <div className="oc-item-body">
                      <div className="oc-item-head">
                        <h6 className="oc-item-title">{item.title}</h6>
                        <button onClick={() => removeItem(item.id)} className="oc-item-remove">×</button>
                      </div>

                      <div className="oc-item-qty">
                        <button onClick={() => decreaseQty(item.id)} className="oc-qty-btn">−</button>
                        <span className="oc-qty-value">{item.qty}</span>
                        <button onClick={() => increaseQty(item.id)} className="oc-qty-btn">+</button>
                      </div>

                      <div className="oc-item-price">₹{item.price}</div>

                      <textarea
                        placeholder="Add cooking instructions"
                        rows={1}
                        className="oc-item-textarea"
                        value={item.cookingInstructions || ""}
                        onChange={(e) => onChangeInstructions(item.id, e.target.value)}
                        onFocus={() => toggleToppings(item.id)}
                      />

                      {String(openToppingsFor) === String(item.id) && (
                        <div className="oc-toppings-wrap" aria-hidden={false}>
                          <div className="oc-toppings-title">Toppings</div>
                          <div className="oc-toppings-list">
                            {TOPPINGS.map((t) => (
                              <button
                                type="button"
                                key={t}
                                className="oc-topping"
                                onClick={() => addToppingToItem(item.id, t)}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <button type="button" className="oc-toppings-close" onClick={() => setOpenToppingsFor(null)}>Done</button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>

              <div className="oc-order-types" style={{ marginTop: 8 }}>
                {["Dine-In", "Drive-in", "Delivery", "Take-away"].map((type) => (
                  <label key={type} className="oc-order-type" style={{ marginRight: 8 }}>
                    <input
                      type="radio"
                      name="orderType"
                      value={type}
                      className="oc-order-radio"
                      checked={orderType === type}
                      onChange={() => onOrderTypeChange(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </>
          ) : (
            <BillSummaryContent data={buildBillData()} />
          )}
        </div>

        {!showBillSummary && !showCreateId && (
          <div className="oc-footer" style={{ height: `${FOOTER_HEIGHT}px` }}>
            <div className="oc-footer-totals">
              <div className="oc-footer-line">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="oc-footer-line small">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="oc-footer-line total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="oc-footer-actions">
              <button onClick={handlePrintBillClick} className="oc-btn footer-print">Print Bill</button>
              <button onClick={handlePlaceOrderClick} className="oc-btn footer-place">Place Order</button>
            </div>
          </div>
        )}
      </div>

      <Billpreview show={showBill} onClose={() => setShowBill(false)} data={buildBillData()} />
    </>
  );
};

export default OffCanvasCart;

