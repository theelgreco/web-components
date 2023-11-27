import DraggableElement from "./DraggableElement.js";

class AppWindow extends DraggableElement {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.edgeOffset = 20;
    this.waitingToExpand = false;
    this.fullscreen = false;
    this.doubleClickAttempt = false;
    this.minimisedWidth = null;
    this.minimisedHeight = null;
    this.width = this.getAttribute("width");
    this.height = this.getAttribute("height");
    this.content = document.createElement("content");
    this.header = document.createElement("div");

    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");

    this.addEventListener("pointermove", this.handleExpand.bind(this));
    this.addEventListener("pointerup", this.expandWindow.bind(this));
    this.header.addEventListener(
      "pointerdown",
      this.handleMouseDown.bind(this)
    );

    this.hostStyle = `
          :host {
            position: fixed;
            min-height: 400px;
            min-width: 500px;
            background: rgb(192, 208, 209);
            user-select: none !important;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            border-radius: 20px;
            overflow: hidden;
            padding: 4px;
            resize: both;
            z-index: 1;
          }
        `;

    this.headerStyle = `
          .header {
            border-radius: 20px 20px 0px 0px;
            width: 100%;
            min-height: 50px;
          }
        `;

    this.contentStyle = `
          .content {
            width: 100%;
            height: -webkit-fill-available;
            border-radius: 0px 0px 20px 20px;
          }
        `;

    this.ifraneStyle = `
          .iframe {
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 5px 5px 20px 20px;
          }
        `;

    this.keyfranesGrow = `
          @keyframes grow {
            to {
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
          }
        `;

    style.textContent = `
          :host {
            left: ${window.innerWidth / 2 - this.width / 2}px;
            top: ${window.innerHeight / 2 - this.height / 2}px;
            width: ${this.width}px;
            height: ${this.height}px;
          }
          ${this.hostStyle}
          ${this.headerStyle}
          ${this.contentStyle}
          ${this.ifraneStyle}
        `;

    this.header.classList.add("header");
    this.header.setAttribute("id", "header");
    this.content.classList.add("content");

    shadow.appendChild(this.header);
    shadow.appendChild(this.content);
    shadow.appendChild(style);
  }

  handleDown() {
    return;
  }

  handleMouseDown(e) {
    if (e.buttons && e.button !== 0) return;

    if (this.doubleClickAttempt) {
      this.waitingToExpand = true;
      this.expandWindow();
      this.doubleClickAttempt = false;
      return;
    }

    this.setMouseCoords(e);
    this.selected = true;
    this.doubleClickAttempt = true;

    setTimeout(() => {
      this.doubleClickAttempt = false;
    }, 250);
  }

  handleExpand(e) {
    const style = this.shadowRoot.querySelector("style");

    if (!this.selected) return;

    if (this.selected && this.fullscreen) {
      style.textContent = `
            :host {
              left: ${
                e.clientX - this.minimisedWidth * (e.clientX / this.offsetWidth)
              }px;
              top: ${
                e.clientY -
                this.minimisedHeight * (e.clientY / this.offsetHeight)
              }px;
              width: ${this.minimisedWidth}px;
              height: ${this.minimisedHeight}px;
            }
            ${this.hostStyle}
            ${this.headerStyle}
            ${this.contentStyle}
            ${this.ifraneStyle}
          `;

      this.fullscreen = false;
    }

    if (this.sideElementIsOutOf(e) && !this.waitingToExpand) {
      style.textContent = `
            :host {
              left: ${this.style.left};
              top: ${this.style.top};
              width: ${this.offsetWidth}px;
              height: ${this.offsetHeight}px;
            }
            ${this.hostStyle}
            ${this.headerStyle}
            ${this.contentStyle}
            ${this.ifraneStyle}

            .fullscreen-ghost {
              position: fixed;
              left: ${this.style.left};
              top: ${this.style.top};
              width: ${this.offsetWidth}px;
              height: ${this.offsetHeight}px;
              background-color: rgb(102 51 153 /30%);
              border: 2px solid rebeccapurple;
              animation-name: grow;
              animation-duration: 0.2s;
              animation-fill-mode: forwards;
              box-sizing: border-box;
              border-radius: 20px;
            }

            ${this.keyfranesGrow}
          `;
      const div = document.createElement("div");
      div.classList.add("fullscreen-ghost");
      this.shadowRoot.appendChild(div);
      this.waitingToExpand = true;
    }

    if (this.waitingToExpand && !this.sideElementIsOutOf(e)) {
      const ghost = this.shadowRoot.querySelector(".fullscreen-ghost");
      this.shadowRoot.removeChild(ghost);
      this.waitingToExpand = false;
    }
  }

  expandWindow() {
    if (this.waitingToExpand) {
      this.removeAttribute("style");

      const style = this.shadowRoot.querySelector("style");
      if (!this.fullscreen) {
        this.minimisedHeight = this.offsetHeight;
        this.minimisedWidth = this.offsetWidth;

        style.textContent = `
            :host {
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
            }
            ${this.hostStyle}
            ${this.headerStyle}
            ${this.contentStyle}
            ${this.ifraneStyle}
          `;
      } else {
        style.textContent = `
          :host {
            left: ${window.innerWidth / 2 - this.width / 2}px;
            top: ${window.innerHeight / 2 - this.height / 2}px;
            width: ${this.minimisedWidth}px;
            height: ${this.minimisedHeight}px;
          }
          ${this.hostStyle}
          ${this.headerStyle}
          ${this.contentStyle}
          ${this.ifraneStyle}
        `;
      }

      const ghost = this.shadowRoot.querySelector(".fullscreen-ghost");

      if (ghost) this.shadowRoot.removeChild(ghost);

      this.waitingToExpand = false;
      this.selected = false;
      this.fullscreen = !this.fullscreen;
    }
  }

  sideElementIsOutOf(e) {
    const containerBounds = document.body.getBoundingClientRect();

    if (e.clientX <= containerBounds.left + 10) {
      return "left";
    }

    if (e.clientY <= containerBounds.top + 10) {
      return "top";
    }

    if (e.clientX >= containerBounds.right - 10) {
      return "right";
    }

    if (e.clientY >= containerBounds.bottom - 10) {
      return "bottom";
    }

    return false;
  }
}

customElements.define("app-window", AppWindow);
