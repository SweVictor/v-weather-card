import { html, LitElement, TemplateResult, nothing, PropertyValues } from "lit";
import { styles } from "./card.styles";
import { customElement, state } from "lit/decorators";

import { HassEntity } from "home-assistant-js-websocket";
import { ActionConfig, ActionHandlerEvent, HomeAssistant, LovelaceCardConfig, handleAction, hasAction, hasConfigOrEntityChanged } from "custom-card-helpers";

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

@customElement('v-weather-card')
export class VWeatherCard extends LitElement {
  // internal reactive states
  @state() private config!: Config;
  @state() private header: string | typeof nothing;
  @state() private entity: string;
  @state() private name: string;

  // @state() private _name: string;
  @state() private state: HassEntity;
  @state() private status: string;

  private numberElements = 0;

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

    if (!config.entity) {
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

  // https://lit.dev/docs/components/lifecycle/#reactive-update-cycle-performing
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }



  // https://lit.dev/docs/components/rendering/
  render(): TemplateResult {
    let content: TemplateResult;


    if (!this.config || !this._hass) {
      return html``;
    }

    this.numberElements = 0;

    const lang = this._hass.selectedLanguage || this._hass.language;
    const stateObj = this._hass.states[this.config.entity];

    if (!stateObj) {
      return html`
        <style>
          .not-found {
            flex: 1;
            background-color: yellow;
            padding: 8px;
          }
        </style>
        <ha-card>
          <div class="not-found">
            Entity not available: ${this.config.entity}
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${this.header}" @click="${this._handleClick}">
        ${this.config.current !== false ? this.renderCurrent(stateObj) : ""}
        ${this.config.details !== false ? this.renderDetails(stateObj, lang) : ""}
        ${this.config.forecast !== false
        ? this.renderForecast(stateObj.attributes.forecast, lang)
        : ""}
      </ha-card>
      `;

  }

  fireEvent(node, type, detail, options: any = {}) {
    options = options || {};
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed,
    });
    (event as any).detail = detail;
    node.dispatchEvent(event);
    return event;
  };

  _handleClick() {
    this.fireEvent(this, "hass-more-info", { entityId: this.config.entity });
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this._hass && this.config && ev.detail.action) {
      handleAction(this, this._hass, this.config, ev.detail.action);
    }
  }



  renderCurrent(stateObj) {
    this.numberElements++;

    return html`
      <div class="current ${this.numberElements > 1 ? "spacer" : ""}">
        <span
          class="icon bigger"
          style="background: none, url('${this.getWeatherIcon(
      stateObj.state.toLowerCase(),
      this._hass.states["sun.sun"]
    )}') no-repeat; background-size: contain;"
          >${stateObj.state}
        </span>
        ${this.config.name
        ? html` <span class="title"> ${this.config.name} </span> `
        : ""}
        <span class="temp"
          >${this.getUnit("temperature") == "°F"
        ? Math.round(stateObj.attributes.temperature)
        : stateObj.attributes.temperature}</span
        >
        <span class="tempc"> ${this.getUnit("temperature")}</span>
      </div>
    `;
  }

  renderDetails(stateObj, lang) {
    const sun = this._hass.states["sun.sun"];
    let next_rising;
    let next_setting;

    if (sun) {
      next_rising = new Date(sun.attributes.next_rising).toLocaleTimeString(lang, {
        hour: "2-digit",
        minute: "2-digit",
      });
      next_setting = new Date(sun.attributes.next_setting).toLocaleTimeString(lang, {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    this.numberElements++;

    return html`
      <ul class="variations ${this.numberElements > 1 ? "spacer" : ""}">
        <li>
          <ha-icon icon="mdi:water-percent"></ha-icon>
          ${stateObj.attributes.humidity}<span class="unit"> % </span>
        </li>
        <li>
          <ha-icon icon="mdi:weather-windy"></ha-icon> ${windDirections[
      Math.floor(((stateObj.attributes.wind_bearing as number) + 11.25) / 22.5)
      ]}
          ${stateObj.attributes.wind_speed}<span class="unit">
            ${this.getUnit("length")}/h
          </span>
        </li>
        <li>
          <ha-icon icon="mdi:gauge"></ha-icon>
          ${stateObj.attributes.pressure}
          <span class="unit">
            ${this.getUnit("air_pressure")}
          </span>
        </li>
        <li>
          <ha-icon icon="mdi:weather-fog"></ha-icon> ${stateObj.attributes
        .visibility}<span class="unit">
            ${this.getUnit("length")}
          </span>
        </li>
        ${next_rising
        ? html`
              <li>
                <ha-icon icon="mdi:weather-sunset-up"></ha-icon>
                ${next_rising}
              </li>
            `
        : ""}
        ${next_setting
        ? html`
              <li>
                <ha-icon icon="mdi:weather-sunset-down"></ha-icon>
                ${next_setting}
              </li>
            `
        : ""}
      </ul>
    `;
  }

  renderForecast(forecast, lang) {
    if (!forecast || forecast.length === 0) {
      return html``;
    }

    this.numberElements++;
    return html`
      <div class="forecast clear ${this.numberElements > 1 ? "spacer" : ""}">
        ${forecast
        .slice(
          0,
          this.config.number_of_forecasts
            ? this.config.number_of_forecasts
            : 5
        )
        .map(
          (daily) => html`
              <div class="day">
                <div class="dayname">
                  ${this.config.hourly_forecast
              ? new Date(daily.datetime).toLocaleTimeString(lang, {
                hour: "2-digit",
                minute: "2-digit",
              })
              : new Date(daily.datetime).toLocaleDateString(lang, {
                weekday: "short",
              })}
                </div>
                <i
                  class="icon"
                  style="background: none, url('${this.getWeatherIcon(
                daily.condition.toLowerCase()
              )}') no-repeat; background-size: contain"
                ></i>
                <div class="highTemp">
                  ${daily.temperature}${this.getUnit("temperature")}
                </div>
                ${daily.templow !== undefined
              ? html`
                      <div class="lowTemp">
                        ${daily.templow}${this.getUnit("temperature")}
                      </div>
                    `
              : ""}
                ${!this.config.hide_precipitation &&
              daily.precipitation !== undefined &&
              daily.precipitation !== null
              ? html`
                      <div class="precipitation">
                        ${Math.round(daily.precipitation * 10) / 10} ${this.getUnit("precipitation")}
                      </div>
                    `
              : ""}
                ${!this.config.hide_precipitation &&
              daily.precipitation_probability !== undefined &&
              daily.precipitation_probability !== null
              ? html`
                      <div class="precipitation_probability">
                        ${Math.round(daily.precipitation_probability)} ${this.getUnit("precipitation_probability")}
                      </div>
                    `
              : ""}
              </div>
            `
        )}
      </div>
    `;
  }



  getWeatherIcon(condition, sun = null) {
    return `${this.config.icons
        ? this.config.icons
        : "https://cdn.jsdelivr.net/gh/bramkragten/weather-card/dist/icons/"
      }${sun && sun.state == "below_horizon"
        ? weatherIconsNight[condition]
        : weatherIconsDay[condition]
      }.svg`;
  }

  getUnit(measure) {
    const lengthUnit = this._hass.config.unit_system.length;
    switch (measure) {
      case "air_pressure":
        return lengthUnit === "km" ? "hPa" : "inHg";
      case "length":
        return lengthUnit;
      case "precipitation":
        return lengthUnit === "km" ? "mm" : "in";
      case "precipitation_probability":
        return "%";
      default:
        return this._hass.config.unit_system[measure] || "";
    }
  }


  // card configuration
  static getConfigElement() {
    return document.createElement("toggle-card-typescript-editor");
  }

  static getStubConfig() {
    return {
      entity: "weather.home",
      header: "",
    };
  }
}
