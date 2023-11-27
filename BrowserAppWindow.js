import AppWindow from "./AppWindow.js";

class BrowserAppWindow extends AppWindow {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    const iframe = document.createElement("iframe");
    iframe.src = this.getAttribute("src");
    iframe.classList.add("iframe");
    this.content.appendChild(iframe);
  }
}

customElements.define("browser-app", BrowserAppWindow);
