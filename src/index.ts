import "./card";
import { ToggleCardTypeScriptEditor } from "./editor";

declare global {
  interface Window {
    customCards: Array<Object>;
  }
}

// customElements.define("v-weather-card", VWeatherCard);
customElements.define(
  "v-weather-card-editor",
  ToggleCardTypeScriptEditor
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "v-weather-card",
  name: "V Weather Card",
  description: "Animated weather card for Home Assistant",
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
