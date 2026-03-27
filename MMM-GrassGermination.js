Module.register("MMM-GrassGermination", {

  defaults: {
    apiKey: "",
    location: "",
    units: "metric",
    updateInterval: 30 * 60 * 1000,
    grassTypes: [
      { name: "Perennial Ryegrass", minDays: 7, maxDays: 14 },
      { name: "Kentucky Bluegrass", minDays: 14, maxDays: 30 },
      { name: "Fine Fescue", minDays: 10, maxDays: 21 },
      { name: "Tall Fescue", minDays: 10, maxDays: 21 },
    ],
  },

  getStyles() {
    return ["MMM-GrassGermination.css"]
  },

  start() {
    this.tempCelsius = null
    this.weatherError = null
    this.weatherDesc = ""

    if (this.config.apiKey) {
      this.fetchWeather()
      setInterval(() => this.fetchWeather(), this.config.updateInterval)
    }
  },

  fetchWeather() {
    this.sendSocketNotification("FETCH_WEATHER", {
      apiKey: this.config.apiKey,
      location: this.config.location,
    })
  },

  notificationReceived(notification, payload) {
    if (notification === "WEATHER_UPDATED" && !this.config.apiKey) {
      if (!payload.currentWeather) { return }
      this.tempCelsius = payload.currentWeather.temperature
      this.weatherDesc = payload.locationName ?? ""
      this.weatherError = null
      this.updateDom()
    }
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "WEATHER_DATA") {
      this.tempCelsius = payload.tempCelsius
      this.weatherDesc = payload.description
      this.weatherError = null
      this.updateDom()
    } else if (notification === "WEATHER_ERROR") {
      this.weatherError = payload.message
      this.updateDom()
    }
  },

  getReadiness(tempCelsius) {
    const month = new Date().getMonth()
    const isIdealSeason = [3, 4, 7, 8].includes(month)

    if (tempCelsius >= 10 && tempCelsius <= 20 && isIdealSeason) {
      return { label: "IDEAL", cssClass: "status-ideal" }
    }
    if (tempCelsius >= 10 && tempCelsius <= 20) {
      return { label: "GOOD", cssClass: "status-good" }
    }
    if (tempCelsius >= 5 && tempCelsius <= 25) {
      return { label: "MARGINAL", cssClass: "status-marginal" }
    }
    return { label: "NOT IDEAL", cssClass: "status-not-ideal" }
  },

  getSeasonLabel() {
    const month = new Date().getMonth()
    if (month === 3 || month === 4) { return "Spring (Apr\u2013May) \u2713" }
    if (month === 7 || month === 8) { return "Fall (Aug\u2013Sep) \u2713" }
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return names[month]
  },

  displayTemp(tempCelsius) {
    if (this.config.units === "imperial") {
      return `${Math.round(tempCelsius * 9 / 5 + 32)}\u00b0F`
    }
    return `${Math.round(tempCelsius)}\u00b0C`
  },

  makeRow(labelText, valueText) {
    const row = document.createElement("div")
    row.className = "row"
    const label = document.createElement("span")
    label.className = "label"
    label.textContent = labelText
    const value = document.createElement("span")
    value.textContent = valueText
    row.appendChild(label)
    row.appendChild(value)
    return row
  },

  getDom() {
    const wrapper = document.createElement("div")
    wrapper.className = "MMM-GrassGermination"

    if (!this.tempCelsius && !this.weatherError) {
      const msg = document.createElement("div")
      msg.className = "loading"
      msg.textContent = this.config.apiKey ? "Loading weather data\u2026" : "Waiting for weather module\u2026"
      wrapper.appendChild(msg)
      return wrapper
    }

    if (this.weatherError) {
      const err = document.createElement("div")
      err.className = "error"
      err.textContent = this.weatherError
      wrapper.appendChild(err)
      return wrapper
    }

    const header = document.createElement("div")
    header.className = "module-header"
    header.textContent = "Grass Germination"
    wrapper.appendChild(header)

    const readiness = this.getReadiness(this.tempCelsius)

    const currentSection = document.createElement("div")
    currentSection.className = "section"
    const currentTitle = document.createElement("div")
    currentTitle.className = "section-title"
    currentTitle.textContent = "Current Conditions"
    currentSection.appendChild(currentTitle)

    const tempRow = document.createElement("div")
    tempRow.className = "row"
    const tempLabel = document.createElement("span")
    tempLabel.className = "label"
    tempLabel.textContent = "Temperature:"
    const tempValue = document.createElement("span")
    tempValue.textContent = this.displayTemp(this.tempCelsius)
    const statusBadge = document.createElement("span")
    statusBadge.className = readiness.cssClass
    statusBadge.textContent = readiness.label
    tempRow.appendChild(tempLabel)
    tempRow.appendChild(tempValue)
    tempRow.appendChild(statusBadge)
    currentSection.appendChild(tempRow)

    currentSection.appendChild(this.makeRow("Season:", this.getSeasonLabel()))
    wrapper.appendChild(currentSection)

    const optimalSection = document.createElement("div")
    optimalSection.className = "section"
    const optimalTitle = document.createElement("div")
    optimalTitle.className = "section-title"
    optimalTitle.textContent = "Optimal Conditions"
    optimalSection.appendChild(optimalTitle)
    optimalSection.appendChild(this.makeRow("Soil Temp:", "10\u201318\u00b0C"))
    optimalSection.appendChild(this.makeRow("Water:", "3\u20134\u00d7 daily, 4\u201310 min"))
    wrapper.appendChild(optimalSection)

    const grassSection = document.createElement("div")
    grassSection.className = "section"
    const grassTitle = document.createElement("div")
    grassTitle.className = "section-title"
    grassTitle.textContent = "Grass Types"
    grassSection.appendChild(grassTitle)

    const table = document.createElement("table")
    table.className = "grass-table"

    const thead = document.createElement("thead")
    const headerRow = document.createElement("tr")
    const thType = document.createElement("th")
    thType.textContent = "Type"
    const thDays = document.createElement("th")
    thDays.textContent = "Days to Germinate"
    headerRow.appendChild(thType)
    headerRow.appendChild(thDays)
    thead.appendChild(headerRow)
    table.appendChild(thead)

    const tbody = document.createElement("tbody")
    this.config.grassTypes.forEach((grass) => {
      const row = document.createElement("tr")
      const nameCell = document.createElement("td")
      nameCell.textContent = grass.name
      const daysCell = document.createElement("td")
      daysCell.textContent = `${grass.minDays}\u2013${grass.maxDays}`
      row.appendChild(nameCell)
      row.appendChild(daysCell)
      tbody.appendChild(row)
    })
    table.appendChild(tbody)
    grassSection.appendChild(table)
    wrapper.appendChild(grassSection)

    return wrapper
  },
})
