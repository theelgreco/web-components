// @collapse
class DraggableElement extends HTMLElement {
  static observedAttributes = [];

  constructor() {
    super();
  }

  connectedCallback() {
    this.startCoords = { x: null, y: null };
    this.selected = false;

    this.addEventListener("pointerdown", this.handleDown.bind(this));
    window.addEventListener("pointermove", this.handleMouseMove.bind(this));
    window.addEventListener("pointerup", this.handleMouseUp.bind(this));
  }

  disconnectedCallback() {
    this.removeEventListener("pointerdown", this.handleDown.bind(this));
    window.removeEventListener("pointermove", this.handleMouseMove.bind(this));
    window.removeEventListener("pointerup", this.handleMouseUp.bind(this));
    document.body.removeEventListener("mouseleave", this.handleMouseLeaveWindow.bind(this));
  }

  adoptedCallback() {
    console.log("Custom element moved to new page.");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} has changed.`);
  }

  handleDown(e) {
    this.setMouseCoords(e);
    this.selected = true;
  }

  handleMouseMove(e) {
    if (!this.selected) return;

    const deltaX = e.clientX - this.startCoords.x;
    const deltaY = e.clientY - this.startCoords.y;
    this.updateElementCoords(deltaX, deltaY);
    this.setMouseCoords(e, this.startCoords);
  }

  setMouseCoords(e) {
    this.startCoords.x = e.clientX;
    this.startCoords.y = e.clientY;
  }

  updateElementCoords(deltaX, deltaY) {
    const { left, top } = this.getBoundingClientRect();
    this.style.left = `${left + deltaX}px`;
    this.style.top = `${top + deltaY}px`;
  }

  handleMouseUp() {
    this.selected = false;
  }
}

customElements.define("draggable-element", DraggableElement);

export default DraggableElement