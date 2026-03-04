import React, { useEffect, useState } from "react";
import "./SideBar.css";

const SideBar = ({ show = undefined, onHide = undefined, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [filter, setFilter] = useState("All");

  // New: hide toggle state
  const [hideToggle, setHideToggle] = useState(false);

  // New: Listen for modal open event from OffCanvasCart
  useEffect(() => {
    const handler = (e) => setHideToggle(Boolean(e.detail));
    window.addEventListener("customerModalOpen", handler);
    return () => window.removeEventListener("customerModalOpen", handler);
  }, []);

  // default items (keep as you had them)
  const defaultData = [
    { id: "T9-C6-8910", status: "Pending" },
    { id: "T3-C7-2234", status: "New" },
  ];

  // Initialize dataList by merging persisted recent IDs (if any) with defaults.
  const [dataList, setDataList] = useState(() => {
    try {
      const raw = localStorage.getItem("offcanvas_recent");
      if (raw) {
        const ids = JSON.parse(raw);
        if (Array.isArray(ids) && ids.length > 0) {
          const persistedItems = ids.map((id) => ({ id, status: "New" }));
          const remainingDefaults = defaultData.filter((d) => !ids.includes(d.id));
          return [...persistedItems, ...remainingDefaults];
        }
      }
    } catch (err) {
      // ignore parse errors
    }
    return defaultData;
  });

  useEffect(() => {
    if (typeof show === "boolean") setIsOpen(show);
  }, [show]);

  // Listen for new ID creation
  useEffect(() => {
    const handler = (e) => {
      const newDetail = e.detail;
      if (!newDetail || !newDetail.id) return;

      setDataList((prev) => {
        const withoutDup = prev.filter((it) => it.id !== newDetail.id);
        const newItem = { id: newDetail.id, status: newDetail.status || "New" };
        const next = [newItem, ...withoutDup];

        try {
          const recentIds = next.map((x) => x.id).slice(0, 6);
          localStorage.setItem("offcanvas_recent", JSON.stringify(recentIds));
        } catch (err) {}

        return next;
      });
    };

    window.addEventListener("newIdCreated", handler);
    return () => window.removeEventListener("newIdCreated", handler);
  }, []);

  // Listen for showSidebar events (open/close)
  useEffect(() => {
    const handler = (e) => {
      const shouldOpen = typeof e?.detail === "boolean" ? e.detail : true;
      setIsOpen(shouldOpen);
      if (typeof onHide === "function") onHide(shouldOpen);
    };

    window.addEventListener("showSidebar", handler);
    return () => window.removeEventListener("showSidebar", handler);
  }, [onHide]);

  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (typeof onHide === "function") onHide(newState);
  };

  const filteredData =
    filter === "All"
      ? dataList
      : dataList.filter((item) => item.status === filter);

  const DRAWER_WIDTH = 229;
  const NAVBAR_HEIGHT = 73;

  const handleCreateNew = () => {
    setIsOpen(false);
    if (typeof onHide === "function") onHide(false);
    window.dispatchEvent(new CustomEvent("showCreateId", { detail: true }));
  };

  const handleSelectId = (id) => {
    if (!id) return;
    setIsOpen(false);
    if (typeof onHide === "function") onHide(false);
    window.dispatchEvent(new CustomEvent("setActiveId", { detail: id }));
  };

  return (
    <>
      {/* TOGGLE — now hidden when modal is open */}
      {!hideToggle && (
        <div
          onClick={toggle}
          className="sb-toggle-btn"
          style={{
            top: `calc(${NAVBAR_HEIGHT}px + 50vh - 60px)`,
            left: isOpen ? DRAWER_WIDTH : 0,
          }}
        >
          <span className={`sb-toggle-icon ${isOpen ? "open" : ""}`}>❮</span>
        </div>
      )}

      {/* Drawer */}
      <div
        className={`sb-drawer ${isOpen ? "open" : ""}`}
        style={{
          top: NAVBAR_HEIGHT,
          left: isOpen ? 0 : -DRAWER_WIDTH,
          width: DRAWER_WIDTH,
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        }}
      >

        {/* Header */}
        <div className="sb-header" style={{ padding: "12px 10px" }}>
          <button onClick={handleCreateNew} className="sb-create-btn">
            + Create New
          </button>

          {/* Filter Buttons */}
          <div className="filter-buttons">
            {["All", "New", "Paid", "Pending"].map((btn) => (
              <button
                key={btn}
                onClick={() => setFilter(btn)}
                className={filter === btn ? "active" : ""}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* Data List */}
        <div
          className="sb-list hide-scroll"
          style={{ flex: 1, overflowY: "auto", padding: "0 10px 80px" }}
        >
          {filteredData.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="data-item"
              onClick={() => handleSelectId(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleSelectId(item.id);
              }}
            >
              <div className="data-left">
                <span>{index + 1}</span>
                <span>{item.id}</span>
              </div>
              <span className={`badge ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SideBar;
