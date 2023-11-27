class DragBoxElement extends HTMLElement {
  constructor() {
    super();

    this.selected = false;
    this.mouseOffsetX = null;
    this.mouseOffsetY = null;
    this.cloneEl = null;

    this.setupClone = () => {
      const { left, top } = this.getBoundingClientRect();
      const styles = window.getComputedStyle(this);

      this.cloneEl = this.cloneNode(true);

      for (let i = 0; i < styles.length; i++) {
        const styleName = styles[i];
        const styleValue = styles.getPropertyValue(styleName);
        const stylesToIgnore = ["position", "pointerEvents", "left", "top"];

        if (!stylesToIgnore.includes(styleName)) {
          this.cloneEl.style.setProperty(styleName, styleValue);
        }
      }

      this.cloneEl.style.position = "absolute";
      this.cloneEl.style.pointerEvents = "none";
      this.cloneEl.style.left = left + "px";
      this.cloneEl.style.top = top + "px";

      const body = document.querySelector("body");
      body.appendChild(this.cloneEl);
    };

    this.handleDown = (e) => {
      if ((e.button === 0 || e.touches) && !this.selected) {
        const { left, top } = this.getBoundingClientRect();
        if (e.touches) {
          this.mouseOffsetX = e.touches[0].clientX - left;
          this.mouseOffsetY = e.touches[0].clientY - top;
        } else {
          this.mouseOffsetX = e.offsetX;
          this.mouseOffsetY = e.offsetY;
        }

        this.setupClone();
        this.style.opacity = "0.1";
        this.selected = true;
      }
    };

    this.handleMove = (e) => {
      if (this.selected) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        this.cloneEl.style.left = clientX - this.mouseOffsetX + "px";
        this.cloneEl.style.top = clientY - this.mouseOffsetY + "px";
      }
    };

    this.handleUp = (e) => {
      if (this.selected) {
        this.selected = false;
        const body = document.querySelector("body");
        body.removeChild(this.cloneEl);
        this.cloneEl = null;
        this.style.opacity = "1";
      }
    };
  }

  initialiseStyle() {
    this.style.userSelect = "none";
    this.style.boxSizing = "border-box";
  }

  disableUserInputForChildren = (node) => {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      child.style.pointerEvents = "none";
      child.style.userSelect = "none";
      this.disableUserInputForChildren(child);
    }
  };

  connectedCallback() {
    this.initialiseStyle();
    this.disableUserInputForChildren(this);

    this.addEventListener("mousedown", this.handleDown);
    this.addEventListener("touchstart", this.handleDown);

    document.addEventListener("mousemove", this.handleMove);
    document.addEventListener("touchmove", this.handleMove, { passive: false });

    document.addEventListener("mouseup", this.handleUp);
    document.addEventListener("touchend", this.handleUp);
  }

  disconnectedCallback() {
    this.removeEventListener("mousedown", this.handleDown);
    this.removeEventListener("touchstart", this.handleDown);

    document.removeEventListener("mousemove", this.handleMove);
    document.removeEventListener("touchmove", this.handleMove, {
      passive: false,
    });

    document.removeEventListener("mouseup", this.handleUp);
    document.removeEventListener("touchend", this.handleUp);
  }
}

customElements.define("drag-box", DragBoxElement);
