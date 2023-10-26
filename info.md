# Lovelace animated weather card

Improved version of [weather card](https://github.com/bramkragten/weather-card) to support new hourly forecasts in Home Assistant 2023 and forward.

This card uses the awesome [animated SVG weather icons by amCharts](https://www.amcharts.com/free-animated-svg-weather-icons/).

![Weather Card](https://github.com/bramkragten/custom-ui/blob/master/weather-card/weather-card.gif?raw=true)

## Installation:


Add the following to resources in your lovelace config (typically `/config/lovelace.yaml`):

```yaml
resources:
  - url: /hacsfiles/v-weather-card/v-weather-card.js
    type: module
```

## Configuration:

And add a card with type `custom:v-weather-card`:

```yaml
type: custom:v:weather-card
entity: weather.yourweatherentity
name: Optional name
```

If you want to use your local icons add the location to the icons:

```yaml
type: custom:v-weather-card
entity: weather.yourweatherentity
icons: "/local/custom-components/v-weather-card/icons/"
```

You can choose wich elements of the weather card you want to show:

The 3 different rows, being:

- The current weather icon, the current temperature and title
- The details about the current weather
- The 5 day forecast

```yaml
type: custom:v-weather-card
entity: weather.yourweatherentity
current: true
details: false
forecast: true
```

If you want to show the sunrise and sunset times, make sure the `sun` component is enabled:

```yaml
# Example configuration.yaml entry
sun:
```

### Dark Sky:

When using Dark Sky you should put the mode to `daily` if you want a daily forecast with highs and lows.

```yaml
# Example configuration.yaml entry
weather:
  - platform: darksky
    api_key: YOUR_API_KEY
    mode: daily
```
