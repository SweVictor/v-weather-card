import { ToggleCardTypeScript } from "./card";
import { ToggleCardTypeScriptEditor } from "./editor";

declare global {
  interface Window {
    customCards: Array<Object>;
  }
}

customElements.define("toggle-card-typescript", ToggleCardTypeScript);
customElements.define(
  "toggle-card-typescript-editor",
  ToggleCardTypeScriptEditor
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "toggle-card-typescript",
  name: "toggle card with TypeScript",
  description: "Turn an entity on and off",
});


// // This puts your card into the UI card picker dialog
// (window as any).customCards = (window as any).customCards || [];
// (window as any).customCards.push({
//   type: 'v-weather-card',
//   name: 'V Weather Card',
//   description: 'A custom weather card with animated icons',
//   preview: true,
//   documentationURL: "https://github.com/SweVictor/v-weather-card",
// });
