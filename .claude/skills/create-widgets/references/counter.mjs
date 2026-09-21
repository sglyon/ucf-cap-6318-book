function render({ model, el }) {
  const getCount = () => model.get("count") ?? 0;

  const btn = document.createElement("button");
  Object.assign(btn.style, {
    padding: "0.5em 1em",
    border: "2px solid #3B82F6",
    borderRadius: "8px",
    background: "#DBEAFE",
    color: "#1E40AF",
    fontSize: "16px",
    cursor: "pointer",
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  });
  btn.textContent = `count is ${getCount()}`;

  btn.addEventListener("click", () => {
    model.set("count", getCount() + 1);
    model.save_changes();
  });
  model.on("change:count", () => {
    btn.textContent = `count is ${getCount()}`;
  });

  el.appendChild(btn);
  return () => btn.remove();
}
export default { render };
