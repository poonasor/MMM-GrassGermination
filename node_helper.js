const https = require("https")
const NodeHelper = require("node_helper")

module.exports = NodeHelper.create({

  socketNotificationReceived(notification, payload) {
    if (notification === "FETCH_WEATHER") {
      if (!payload.apiKey) {
        this.sendSocketNotification("WEATHER_ERROR", { message: "No API key provided" })
        return
      }
      if (!payload.location) {
        this.sendSocketNotification("WEATHER_ERROR", { message: "No location configured" })
        return
      }
      this.fetchWeather(payload)
    }
  },

  fetchWeather(payload) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(payload.location)}&appid=${payload.apiKey}&units=metric`

    const req = https.get(url, (res) => {
      let rawData = ""

      res.on("data", (chunk) => {
        rawData += chunk
      })

      res.on("end", () => {
        if (res.statusCode !== 200) {
          this.sendSocketNotification("WEATHER_ERROR", { message: `Weather API error: ${res.statusCode}` })
          return
        }

        try {
          const data = JSON.parse(rawData)
          const description = data.weather && data.weather[0] ? data.weather[0].description : ""
          this.sendSocketNotification("WEATHER_DATA", {
            tempCelsius: data.main.temp,
            description,
          })
        } catch {
          this.sendSocketNotification("WEATHER_ERROR", { message: "Failed to parse weather data" })
        }
      })
    })

    req.on("error", (e) => {
      this.sendSocketNotification("WEATHER_ERROR", { message: `Request failed: ${e.message}` })
    })
  },
})
