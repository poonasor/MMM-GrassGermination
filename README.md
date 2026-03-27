# MMM-GrassGermination

*MMM-GrassGermination* is a module for [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) that displays grass germination readiness based on live weather conditions. It compares the current air temperature and season against optimal germination thresholds and shows a color-coded readiness indicator alongside a configurable grass types table.

By default the module reads temperature data from MagicMirror's built-in **weather** module — no separate API key required. Users who don't run the default weather module can supply their own OpenWeatherMap API key instead.

## Screenshot

![Example of MMM-GrassGermination](./example_1.png)

## Installation

### Install

In your terminal, go to the modules directory and clone the repository:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/poonasor/MMM-GrassGermination.git
cd MMM-GrassGermination
npm install
```

### Update

```bash
cd ~/MagicMirror/modules/MMM-GrassGermination
git pull
```

## Configuration

Add a configuration object to the `modules` array in `config/config.js`.

### Minimal configuration (uses built-in weather module)

No API key needed — works alongside MagicMirror's default `weather` module automatically:

```js
{
    module: "MMM-GrassGermination",
    position: "top_right"
},
```

### Standalone configuration (own API key)

Use this if you are **not** running the default weather module:

```js
{
    module: "MMM-GrassGermination",
    position: "top_right",
    config: {
        apiKey: "YOUR_OPENWEATHERMAP_API_KEY",
        location: "Toronto,CA",
        units: "metric"
    }
},
```

### Full configuration (all options)

```js
{
    module: "MMM-GrassGermination",
    position: "top_right",
    config: {
        apiKey: "",
        location: "",
        units: "metric",
        updateInterval: 1800000,
        grassTypes: [
            { name: "Perennial Ryegrass", minDays: 7,  maxDays: 14 },
            { name: "Kentucky Bluegrass", minDays: 14, maxDays: 30 },
            { name: "Fine Fescue",        minDays: 10, maxDays: 21 },
            { name: "Tall Fescue",        minDays: 10, maxDays: 21 }
        ]
    }
},
```

### Configuration options

| Option           | Type     | Default                        | Description                                                                                                    |
| ---------------- | -------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `apiKey`         | `string` | `""`                           | OpenWeatherMap API key. Leave blank to use data from MagicMirror's built-in weather module instead.            |
| `location`       | `string` | `""`                           | City name passed to OpenWeatherMap (e.g. `"Toronto,CA"`). Required when `apiKey` is set.                       |
| `units`          | `string` | `"metric"`                     | Display units for temperature. `"metric"` shows °C, `"imperial"` shows °F.                                     |
| `updateInterval` | `number` | `1800000` (30 min)             | How often (in milliseconds) to re-fetch weather when using `apiKey` mode. Not used with the weather module.    |
| `grassTypes`     | `array`  | See below                      | List of grass types to display. Each entry requires `name` (string), `minDays` (number), `maxDays` (number).   |

#### Default `grassTypes`

| Name                | Days to Germinate |
| ------------------- | ----------------- |
| Perennial Ryegrass  | 7–14              |
| Kentucky Bluegrass  | 14–30             |
| Fine Fescue         | 10–21             |
| Tall Fescue         | 10–21             |

To show only specific grass types, supply the full array with just the entries you want:

```js
grassTypes: [
    { name: "Perennial Ryegrass", minDays: 7, maxDays: 14 },
    { name: "Kentucky Bluegrass", minDays: 14, maxDays: 30 }
]
```

## Germination readiness

The module calculates readiness from the current air temperature and calendar month:

| Status   | Color  | Condition                                        |
| -------- | ------ | ------------------------------------------------ |
| IDEAL    | Green  | 10–20°C **and** April, May, August, or September |
| GOOD     | Yellow | 10–20°C (outside ideal seeding months)           |
| MARGINAL | Orange | 5–25°C                                           |
| NOT IDEAL| Red    | Below 5°C or above 25°C                          |

> Temperature is always evaluated in Celsius internally, regardless of the `units` display setting.

## Developer commands

- `npm install` — Install devDependencies like ESLint.
- `node --run lint` — Run linting and formatter checks.
- `node --run lint:fix` — Fix linting and formatter issues.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE.md) file for details.

## Changelog

All notable changes to this project will be documented in the [CHANGELOG.md](CHANGELOG.md) file.
