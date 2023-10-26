import { html, LitElement, TemplateResult, nothing } from "lit";
import { styles } from "./card.styles";
import { state } from "lit/decorators/state";

import { HassEntity } from "home-assistant-js-websocket";
import { ActionConfig, ActionHandlerEvent, HomeAssistant, LovelaceCardConfig, handleAction, hasAction } from "custom-card-helpers";

interface Config extends LovelaceCardConfig {
  header?: string;
  entity: string;

  type: string;
  name?: string;
  // show_warning?: boolean;
  // show_error?: boolean;
  // test_gui?: boolean;
  // entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

const weatherIconsDay = {
  clear: "day",
  "clear-night": "night",
  cloudy: "cloudy",
  fog: "cloudy",
  hail: "rainy-7",
  lightning: "thunder",
  "lightning-rainy": "thunder",
  partlycloudy: "cloudy-day-3",
  pouring: "rainy-6",
  rainy: "rainy-5",
  snowy: "snowy-6",
  "snowy-rainy": "rainy-7",
  sunny: "day",
  windy: "cloudy",
  "windy-variant": "cloudy-day-3",
  exceptional: "!!",
};

const weatherIconsNight = {
  ...weatherIconsDay,
  clear: "night",
  sunny: "night",
  partlycloudy: "cloudy-night-3",
  "windy-variant": "cloudy-night-3",
};

const windDirections = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
  "N",
];

export class ToggleCardTypeScript extends LitElement {
  // internal reactive states
  @state() private config!: Config;
  @state() private header: string | typeof nothing;
  @state() private entity: string;
  @state() private name: string;

  // @state() private _name: string;
  @state() private state: HassEntity;
  @state() private status: string;
  
  private _hass: HomeAssistant;

  // lifecycle interface
  setConfig(config: Config) {
    // The config object contains the configuration specified by the user in ui-lovelace.yaml
    
    // It will minimally contain:
    // config.type = "custom:my-custom-card"
    
    // setConfig will ALWAYS be called at the start of the lifetime of the card
    // BEFORE the `hass` object is first provided.
    // It MAY be called several times during the lifetime of the card, e.g. if the configuration
    // of the card is changed.
    
    if(!config.entity) {
      // If no entity was specified, this will display a red error card with the message below
      throw new Error('You need to define an entity');
    }
    
    this.config = config;
  }

  getCardSize() {
    // The height of the card. 
    // Home Assistant uses this to automatically distribute all cards over the available columns.
    return 1;
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    console.log("Setting hass", hass);
    this.state = hass.states[this.config.entity];
    this.entity = this.config.entity;
    this.header = this.config.header === "" ? nothing : this.config.header;

    if (this.state) {
      this.status = this.state.state;
      let fn = this.state.attributes.friendly_name;
      this.name = fn ? fn : this.config.entity;
    }
    console.debug("Entity", this.entity);
    // console.log("Header", this.header);
    // console.log("Name", this.name);
    // console.log("State", this.state);
    console.log("Status", this.status);
  }

  // declarative part
  static styles = styles;


  // https://lit.dev/docs/components/rendering/
  render() {
    let content: TemplateResult;
    if (!this.state) {
      content = html` <p class="error">${this.name} is unavailable.</p> `;
    } else {
      content = html`
        <dl class="dl">
          <dt class="dt">${this.name}</dt>
          <dd class="dd" @click="${this.doToggle}">
            <span class="toggle ${this.status}">
              <span class="button"></span>
            </span>
            <span class="value">${this.status}</span>
          </dd>
        </dl>
      `;
      // <!-- .actionHandler=${(actionHandler({
      //   hasHold: hasAction(this.config.hold_action),
      //   hasDoubleClick: hasAction(this.config.double_tap_action),
      // })} -->

      content = html`
        <ha-card
          .header=${this.name}
          @action=${this._handleAction}
          tabindex="0"
          .label=${`V Weather Card: ${this.config.entity || 'No Entity Defined'}`}
        >${content}</ha-card>
      `;

  // return html`
  // <ha-card @click="${this._handleClick}">
  //   ${this._config.current !== false ? this.renderCurrent(stateObj) : ""}
  //   ${this._config.details !== false ? this.renderDetails(stateObj, lang) : ""}
  //   ${this._config.forecast !== false
  //     ? this.renderForecast(stateObj.attributes.forecast, lang)
  //     : ""}
  // </ha-card>
  // `;

    // if (!this._config || !this._hass) {
    //   return html``;
    // }

    // this.numberElements = 0;

    // const lang = this._hass.selectedLanguage || this._hass.language;
    // const stateObj = this._hass.states[this._config.entity];

    // if (!stateObj) {
    //   return html`
    //     <style>
    //       .not-found {
    //         flex: 1;
    //         background-color: yellow;
    //         padding: 8px;
    //       }
    //     </style>
    //     <ha-card>
    //       <div class="not-found">
    //         Entity not available: ${this._config.entity}
    //       </div>
    //     </ha-card>
    //   `;
    // }      

    }

    return html`
      <ha-card header="${this.header}">
        <div class="card-content">${content}</div>
      </ha-card>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this._hass && this.config && ev.detail.action) {
      handleAction(this, this._hass, this.config, ev.detail.action);
    }
  }

  // event handling
  doToggle() {
    this._hass.callService("input_boolean", "toggle", {
      entity_id: this.config.entity
    });
  }

  // card configuration
  static getConfigElement() {
    return document.createElement("toggle-card-typescript-editor");
  }

  static getStubConfig() {
    return {
      entity: "input_boolean.tcts",
      header: "",
    };
  }
}
