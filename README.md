# Lovelace animated weather card

Improved version of [weather card](https://github.com/bramkragten/weather-card) to support new hourly forecasts in Home Assistant 2023 and forward. Also inspired by the fork [Carte Lovelace Météo France](https://github.com/hacf-fr/lovelace-meteofrance-weather-card).

This card uses the awesome [animated SVG weather icons by amCharts](https://www.amcharts.com/free-animated-svg-weather-icons/).

![Weather Card](https://github.com/bramkragten/custom-ui/blob/master/weather-card/weather-card.gif?raw=true)

## Installation:

You have 2 main options, HACS or manual.

# HACS (recommended):

Install this repo as a custom repository in [HACS](https://hacs.xyz/): https://github.com/SweVictor/v-weather-card.

# Manual:

Download the contents of the `dist` folder to `/config/www/community/v-weather-card/`. (or an other folder in `/config/www/`)

# Add resources

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
- The X day forecast or hourly forecast

```yaml
type: custom:v-weather-card
entity: weather.yourweatherentity
current: true
details: false
forecast: true
hourly_forecast: false
number_of_forecasts: 5
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

### OpenWeather Map:

When using OpenWeather map you can select hourly(default) or daily forecast to show.

```yaml
# Example configuration.yaml entry
weather:
  - platform: openweathermap
    api_key: YOUR_API_KEY
```
