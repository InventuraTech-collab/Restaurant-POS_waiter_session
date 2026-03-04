// Billpreview.jsx
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import "./Billpreview.css";

function currencyFormat(num, symbol = "AED") {
  const n = Number(num) || 0;
  return `${symbol} ${n.toFixed(2)}`;
}

export default function Billpreview({ show, onClose, data }) {
  useEffect(() => {
    const savedStyles = new Map();

    if (!show) return;

    document.body.classList.add("bill-preview-open");

    // Hide toggler safely
    const toggleSelectors = [
      ".vertical-toggle",
      "#vertical-toggle",
      ".sidebar-toggle",
      ".menu-toggle",
      ".toggle-button",
      ".hamburger",
      ".nav-toggler",
    ];

    toggleSelectors.forEach((sel) => {
      const nodes = document.querySelectorAll(sel);
      nodes.forEach((el) => {
        savedStyles.set(el, el.style.cssText);
        el.style.display = "none";
        el.style.visibility = "hidden";
      });
    });

    // Disable background clicks; allow pointer events only for modal
    const prevPointer = document.documentElement.style.pointerEvents;
    document.documentElement.style.pointerEvents = "none";
    const modalEl = document.querySelector(".bill-modal");
    if (modalEl) modalEl.style.pointerEvents = "auto";

    return () => {
      document.body.classList.remove("bill-preview-open");
      document.documentElement.style.pointerEvents = prevPointer || "";
      savedStyles.forEach((style, el) => {
        el.style.cssText = style;
      });
    };
  }, [show]);

  if (!show) return null;

  const {
    id = "",
    waiterName = "",
    orderType = "",
    date = "",
    items = [],
    company = {},
    vatPercent = 5,
  } = data || {};

  const subtotal = items.reduce((s, it) => s + (it.qty || 0) * (it.unitPrice || 0), 0);
  const vatAmount = subtotal * (vatPercent / 100);
  const grandTotal = subtotal + vatAmount;

  const handlePrint = () => window.print();

  return (
    <div className="bp-overlay" role="dialog" aria-modal="true">
      <div className="bp-modal bill-modal" aria-label="Bill preview">
        <div className="bp-close-circle" onClick={onClose} role="button" aria-label="Close">
          ×
        </div>

        <div className="bp-header-title">Bill preview</div>

        <div className="bp-content">
          <div className="bp-info-row">
            <div className="bp-left-info">
              <div><strong>ID :</strong> {id}</div>
              <div><strong>Waiter Name :</strong> {waiterName}</div>
              <div><strong>Order type :</strong> {orderType}</div>
              <div><strong>Date :</strong> {date}</div>
            </div>

            <div className="bp-right-info">
              <div className="bp-company-name">{company.name || "Company Name"}</div>
              <div>{company.addressLine1 || "[company address]"}</div>
              <div>{company.addressLine2 || "[company address]"}</div>
              <div>{company.addressLine3 || "[company address]"}</div>
            </div>
          </div>

          <div className="bp-table-wrapper">
            <table className="bp-items-table" aria-hidden={items.length === 0}>
              <thead>
                <tr>
                  <th className="bp-th bp-col-item">Item</th>
                  <th className="bp-th bp-col-qty">Qty</th>
                  <th className="bp-th bp-col-unit">Unit Price</th>
                  <th className="bp-th bp-col-total">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}>
                    <td className="bp-td">{it.name}</td>
                    <td className="bp-td bp-td-center">{it.qty}</td>
                    <td className="bp-td bp-td-right">{it.unitPrice}</td>
                    <td className="bp-td bp-td-right">{it.qty * it.unitPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bp-totals">
            <div className="bp-subtotal-row">
              <div className="bp-small-muted">Subtotal :</div>
              <div>{currencyFormat(subtotal)}</div>
            </div>
            <div className="bp-subtotal-row">
              <div className="bp-small-muted">VAT ({vatPercent}%):</div>
              <div>{currencyFormat(vatAmount)}</div>
            </div>
            <div className="bp-grand-total-box">
              <div>Grand Total :</div>
              <div>{currencyFormat(grandTotal)}</div>
            </div>
          </div>
        </div>

        <div className="bp-footer">
          <button className="bp-print-button" onClick={handlePrint}>Print Now</button>
        </div>
      </div>
    </div>
  );
}

Billpreview.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
};

Billpreview.defaultProps = {
  show: true,
  onClose: () => {},
  data: {
    id: "T2-C4-1133",
    waiterName: "Manu",
    orderType: "Dine-In",
    date: "24/09/2026",
    vatPercent: 5,
    items: [
      { name: "Veg Biriyani", qty: 1, unitPrice: 150 },
      { name: "Chicken Biriyani", qty: 2, unitPrice: 250 },
    ],
    company: {
      name: "Company Name",
      addressLine1: "[company address]",
      addressLine2: "[company address]",
      addressLine3: "[company address]",
    },
  },
};
