import { buildings, parkingOptions, permitRates, sampleSchedule, weekdays } from "./data.js";

const state = {
  entries: [],
  selectedDay: "Mon",
  selectedParkingId: null,
  preference: "balanced",
  quarterMonths: 3,
  sourceName: "Sample schedule"
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const icons = {
  upload: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0 4 4m-4-4-4 4M5 20h14" /></svg>`,
  sample: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" /></svg>`,
  map: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15" /></svg>`,
  park: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 21V3h7a5 5 0 0 1 0 10H7m0 0h7" /></svg>`,
  clock: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>`,
  clear: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" /></svg>`,
  download: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" /></svg>`
};

let map;
let mapLayers = [];

function boot() {
  renderShell();
  $("#scheduleText").value = sampleSchedule;
  state.entries = parseSchedule(sampleSchedule, "text");
  render();
  initMap();
  setTimeout(renderMap, 50);
}

function renderShell() {
  $("#app").innerHTML = `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">W2P</div>
        <div>
          <h1>Where2Park</h1>
          <p>UC Irvine schedule-to-parking planner</p>
        </div>
      </div>
      <div class="top-actions">
        <button class="icon-button" id="sampleBtn" title="Load sample schedule">${icons.sample}<span>Sample</span></button>
        <label class="icon-button file-button" title="Import ICS, CSV, or text schedule">
          ${icons.upload}<span>Import</span>
          <input id="fileInput" type="file" accept=".ics,.csv,.txt,text/calendar,text/csv,text/plain" />
        </label>
        <button class="icon-button" id="exportBtn" title="Export analysis">${icons.download}<span>Export</span></button>
        <button class="icon-button quiet" id="clearBtn" title="Clear schedule">${icons.clear}<span>Clear</span></button>
      </div>
    </header>

    <main class="workspace">
      <section class="panel import-panel">
        <div class="panel-header">
          <div>
            <h2>Schedule</h2>
            <p id="sourceLabel">Sample schedule</p>
          </div>
        </div>

        <textarea id="scheduleText" spellcheck="false" placeholder="Paste WebReg text, CSV rows, or simple lines like: ICS 31 MW 9:00 AM-9:50 AM ICS 174"></textarea>
        <div class="control-row">
          <button id="parseTextBtn" class="primary-button">Parse pasted text</button>
          <button id="useSampleBtn" class="secondary-button">Use sample</button>
        </div>

        <div class="settings-grid">
          <label>
            Permit style
            <select id="preferenceSelect">
              <option value="balanced">Balanced</option>
              <option value="budget">Lowest cost</option>
              <option value="fastest">Shortest walk</option>
            </select>
          </label>
          <label>
            Quarter length
            <select id="quarterSelect">
              <option value="3">3 months</option>
              <option value="2">2 months</option>
              <option value="4">4 months</option>
            </select>
          </label>
        </div>

        <div class="day-tabs" id="dayTabs"></div>
        <div class="schedule-list" id="scheduleList"></div>
      </section>

      <section class="map-panel">
        <div class="map-toolbar">
          <div>
            <h2>${icons.map} Campus Map</h2>
            <p id="mapSummary">Class pins, parking pins, and walking links</p>
          </div>
          <div class="legend">
            <span><i class="legend-dot class-dot"></i>Class</span>
            <span><i class="legend-dot parking-dot"></i>Parking</span>
            <span><i class="legend-line"></i>Walk path</span>
          </div>
        </div>
        <div id="map"></div>
        <div id="fallbackMap" class="fallback-map" hidden></div>
      </section>

      <aside class="panel insights-panel">
        <div class="panel-header">
          <div>
            <h2>Recommendation</h2>
            <p>Permit and timing fit</p>
          </div>
        </div>
        <div id="recommendation"></div>
        <div id="parkingRank"></div>
        <div id="gapWarnings"></div>
        <div class="source-box">
          <h3>Permit notes</h3>
          <p>Rates/rules reflect UCI Transportation 2025-2026 public pages. Permit availability and eligibility still need final confirmation in myCommute.</p>
          <a href="https://parking.uci.edu/permits/student/" target="_blank" rel="noreferrer">Student permit rules</a>
          <a href="https://parking.uci.edu/permits/rates/" target="_blank" rel="noreferrer">Permit rates</a>
        </div>
      </aside>
    </main>
  `;

  $("#sampleBtn").addEventListener("click", loadSample);
  $("#useSampleBtn").addEventListener("click", loadSample);
  $("#clearBtn").addEventListener("click", clearSchedule);
  $("#exportBtn").addEventListener("click", exportAnalysis);
  $("#parseTextBtn").addEventListener("click", () => {
    const text = $("#scheduleText").value.trim();
    state.entries = parseSchedule(text, "text");
    state.sourceName = "Pasted schedule";
    pickUsableDay();
    render();
  });
  $("#fileInput").addEventListener("change", handleFile);
  $("#preferenceSelect").addEventListener("change", (event) => {
    state.preference = event.target.value;
    render();
  });
  $("#quarterSelect").addEventListener("change", (event) => {
    state.quarterMonths = Number(event.target.value);
    render();
  });
}

function loadSample() {
  $("#scheduleText").value = sampleSchedule;
  state.entries = parseSchedule(sampleSchedule, "text");
  state.sourceName = "Sample schedule";
  state.selectedDay = "Mon";
  render();
}

function clearSchedule() {
  $("#scheduleText").value = "";
  state.entries = [];
  state.sourceName = "No schedule loaded";
  render();
}

async function handleFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  const extension = file.name.split(".").pop()?.toLowerCase() || "txt";
  $("#scheduleText").value = text;
  state.entries = parseSchedule(text, extension);
  state.sourceName = file.name;
  pickUsableDay();
  render();
}

function render() {
  $("#sourceLabel").textContent = `${state.sourceName} - ${state.entries.length} meeting${state.entries.length === 1 ? "" : "s"}`;
  renderDayTabs();
  renderScheduleList();
  const ranked = rankParking();
  state.selectedParkingId = state.selectedParkingId || ranked[0]?.id || null;
  renderRecommendation(ranked);
  renderParkingRank(ranked);
  renderGapWarnings();
  renderMap();
}

function renderDayTabs() {
  const counts = Object.fromEntries(weekdays.map((day) => [day, dayEntries(day).length]));
  $("#dayTabs").innerHTML = weekdays
    .map(
      (day) => `
        <button class="${day === state.selectedDay ? "active" : ""}" data-day="${day}">
          ${day}<span>${counts[day]}</span>
        </button>
      `
    )
    .join("");
  $$("#dayTabs button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDay = button.dataset.day;
      render();
    });
  });
}

function renderScheduleList() {
  const entries = dayEntries(state.selectedDay);
  if (!entries.length) {
    $("#scheduleList").innerHTML = `<div class="empty">No ${state.selectedDay} classes loaded. Import an ICS/CSV file or paste a schedule.</div>`;
    return;
  }

  $("#scheduleList").innerHTML = entries
    .map((entry, index) => {
      const next = entries[index + 1];
      const gap = next ? minutesBetween(entry.end, next.start) : null;
      const walk = next && entry.building && next.building ? walkingMinutes(entry.building, next.building) : null;
      const tight = gap !== null && walk !== null && gap < walk + 8;
      return `
        <article class="class-row ${tight ? "tight" : ""}">
          <div class="time-block">
            <strong>${formatMinutes(entry.start)}</strong>
            <span>${formatMinutes(entry.end)}</span>
          </div>
          <div class="class-main">
            <h3>${escapeHtml(entry.course || "Class")}</h3>
            <p>${escapeHtml(entry.location || "Unknown location")}</p>
            <div class="meta-line">
              <span>${entry.building ? entry.building.name : "Needs location match"}</span>
              ${next ? `<span>${gap} min gap${walk ? `, ${walk} min walk` : ""}</span>` : "<span>Last class</span>"}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderRecommendation(ranked) {
  const best = ranked[0];
  if (!best) {
    $("#recommendation").innerHTML = `<div class="empty">Load a schedule to get a permit recommendation.</div>`;
    return;
  }
  const permit = choosePermit(best);
  const quarterCost = permit.month ? permit.month * state.quarterMonths : permit.day;
  const daySummary = dayEntries(state.selectedDay);
  const first = daySummary[0];
  const last = daySummary[daySummary.length - 1];
  const parking = parkingOptions.find((option) => option.id === best.id);
  const firstWalk = first?.building ? walkingMinutes(parking, first.building) : null;
  const lastWalk = last?.building ? walkingMinutes(last.building, parking) : null;

  $("#recommendation").innerHTML = `
    <div class="permit-card">
      <div class="permit-icon">${icons.park}</div>
      <div>
        <span class="eyebrow">Best fit</span>
        <h3>${permit.name}</h3>
        <p>Zone ${best.zone} via ${parking.short}</p>
      </div>
      <strong>$${quarterCost}</strong>
    </div>
    <div class="stat-grid">
      <div><span>To first class</span><strong>${firstWalk ?? "-"} min</strong></div>
      <div><span>Back to car</span><strong>${lastWalk ?? "-"} min</strong></div>
      <div><span>Avg parking walk</span><strong>${best.averageWalk} min</strong></div>
      <div><span>Quarter estimate</span><strong>$${quarterCost}</strong></div>
    </div>
    <p class="recommendation-text">${permit.reason}</p>
  `;
}

function renderParkingRank(ranked) {
  $("#parkingRank").innerHTML = `
    <h3 class="section-title">Parking score</h3>
    <div class="rank-list">
      ${ranked
        .slice(0, 6)
        .map((item, index) => {
          const parking = parkingOptions.find((option) => option.id === item.id);
          return `
            <button class="rank-row ${state.selectedParkingId === item.id ? "selected" : ""}" data-id="${item.id}">
              <span>${index + 1}</span>
              <div>
                <strong>${parking.name}</strong>
                <small>Zone ${parking.zone} - ${item.averageWalk} min avg walk</small>
              </div>
              <b>${item.score}</b>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
  $$("#parkingRank .rank-row").forEach((row) => {
    row.addEventListener("click", () => {
      state.selectedParkingId = row.dataset.id;
      render();
    });
  });
}

function renderGapWarnings() {
  const warnings = gapWarnings();
  $("#gapWarnings").innerHTML = `
    <h3 class="section-title">${icons.clock} Gap checks</h3>
    ${
      warnings.length
        ? warnings.map((warning) => `<div class="warning ${warning.level}">${warning.text}</div>`).join("")
        : `<div class="success">No tight class-to-class walks found for ${state.selectedDay}.</div>`
    }
  `;
}

function initMap() {
  const mapEl = $("#map");
  if (!window.L || !mapEl) {
    showFallbackMap();
    return;
  }
  map = L.map(mapEl, { zoomControl: false, scrollWheelZoom: true }).setView([33.6462, -117.8428], 15);
  L.control.zoom({ position: "bottomright" }).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  setTimeout(() => {
    map.invalidateSize();
    renderMap();
  }, 150);
}

function renderMap() {
  if (!$("#map")) return;
  if (!map || !window.L) {
    showFallbackMap();
    return;
  }
  map.invalidateSize();
  $("#fallbackMap").hidden = true;
  $("#map").hidden = false;
  mapLayers.forEach((layer) => layer.remove());
  mapLayers = [];

  const selectedEntries = dayEntries(state.selectedDay).filter((entry) => entry.building);
  const ranked = rankParking();
  const selectedParking = parkingOptions.find((option) => option.id === (state.selectedParkingId || ranked[0]?.id));
  const points = [];

  parkingOptions.forEach((parking) => {
    const selected = selectedParking?.id === parking.id;
    const marker = L.marker([parking.lat, parking.lng], {
      icon: L.divIcon({
        className: `pin parking-pin ${selected ? "selected" : ""}`,
        html: `<span>P</span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      })
    })
      .bindPopup(`<strong>${parking.name}</strong><br>Zone ${parking.zone}<br>${parking.note}`)
      .addTo(map);
    marker.on("click", () => {
      state.selectedParkingId = parking.id;
      render();
    });
    mapLayers.push(marker);
    if (selected) points.push([parking.lat, parking.lng]);
  });

  selectedEntries.forEach((entry, index) => {
    const marker = L.marker([entry.building.lat, entry.building.lng], {
      icon: L.divIcon({
        className: "pin class-pin",
        html: `<span>${index + 1}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
    })
      .bindPopup(`<strong>${escapeHtml(entry.course)}</strong><br>${entry.building.name}<br>${formatMinutes(entry.start)}-${formatMinutes(entry.end)}`)
      .addTo(map);
    mapLayers.push(marker);
    points.push([entry.building.lat, entry.building.lng]);
  });

  const route = [];
  if (selectedParking && selectedEntries.length) {
    route.push([selectedParking.lat, selectedParking.lng]);
    selectedEntries.forEach((entry) => route.push([entry.building.lat, entry.building.lng]));
    route.push([selectedParking.lat, selectedParking.lng]);
    const line = L.polyline(route, {
      color: "#0064a4",
      weight: 3,
      opacity: 0.74,
      dashArray: "8 8"
    }).addTo(map);
    mapLayers.push(line);
  }

  if (points.length) map.fitBounds(points, { padding: [42, 42], maxZoom: 16 });
  $("#mapSummary").textContent = `${selectedEntries.length} class pins on ${state.selectedDay}${selectedParking ? `, parked at ${selectedParking.short}` : ""}`;
}

function showFallbackMap() {
  const target = $("#fallbackMap");
  if (!target) return;
  $("#map").hidden = true;
  target.hidden = false;
  const selectedEntries = dayEntries(state.selectedDay).filter((entry) => entry.building);
  const ranked = rankParking();
  const selectedParking = parkingOptions.find((option) => option.id === (state.selectedParkingId || ranked[0]?.id));
  const allPoints = [...buildings, ...parkingOptions];
  const minLat = Math.min(...allPoints.map((point) => point.lat));
  const maxLat = Math.max(...allPoints.map((point) => point.lat));
  const minLng = Math.min(...allPoints.map((point) => point.lng));
  const maxLng = Math.max(...allPoints.map((point) => point.lng));
  const project = (point) => ({
    x: ((point.lng - minLng) / (maxLng - minLng)) * 760 + 40,
    y: 460 - ((point.lat - minLat) / (maxLat - minLat)) * 400
  });
  const route = selectedParking ? [selectedParking, ...selectedEntries.map((entry) => entry.building), selectedParking] : [];
  target.innerHTML = `
    <svg viewBox="0 0 840 520" role="img" aria-label="Fallback UCI campus map">
      <rect x="0" y="0" width="840" height="520" rx="18" fill="#eef3f5" />
      <circle cx="420" cy="260" r="170" fill="none" stroke="#b6c7d1" stroke-width="18" opacity=".6" />
      <path d="${route.map((point, index) => `${index ? "L" : "M"} ${project(point).x} ${project(point).y}`).join(" ")}" fill="none" stroke="#0064a4" stroke-width="4" stroke-dasharray="10 8" />
      ${parkingOptions
        .map((parking) => {
          const p = project(parking);
          const selected = selectedParking?.id === parking.id;
          return `<g><circle cx="${p.x}" cy="${p.y}" r="${selected ? 15 : 11}" fill="${selected ? "#ffd200" : "#0064a4"}" stroke="#082f49" stroke-width="2" /><text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="10" font-weight="800" fill="${selected ? "#082f49" : "#fff"}">P</text></g>`;
        })
        .join("")}
      ${selectedEntries
        .map((entry, index) => {
          const p = project(entry.building);
          return `<g><circle cx="${p.x}" cy="${p.y}" r="14" fill="#f97316" stroke="#fff" stroke-width="3" /><text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">${index + 1}</text></g>`;
        })
        .join("")}
    </svg>
  `;
}

function parseSchedule(text, type = "text") {
  if (!text.trim()) return [];
  const raw = type === "ics" || text.includes("BEGIN:VEVENT") ? parseIcs(text) : parseRows(text);
  return raw
    .map((entry, index) => {
      const building = matchBuilding(entry.location || entry.course || "");
      return {
        id: `${Date.now()}-${index}`,
        course: entry.course?.trim() || "Class",
        location: entry.location?.trim() || "",
        days: entry.days?.length ? entry.days : ["Mon"],
        start: entry.start ?? 9 * 60,
        end: entry.end ?? 10 * 60,
        building
      };
    })
    .filter((entry) => entry.course || entry.location)
    .sort((a, b) => a.start - b.start);
}

function parseRows(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.includes(",") ? parseCsvLine(line) : parseTextLine(line)))
    .filter(Boolean);
}

function parseCsvLine(line) {
  const parts = csvSplit(line);
  if (parts[0]?.toLowerCase() === "course") return null;
  if (parts.length >= 5) {
    return {
      course: parts[0],
      days: expandDays(parts[1]),
      start: parseTime(parts[2]),
      end: parseTime(parts[3]),
      location: parts.slice(4).join(" ")
    };
  }
  return parseTextLine(line.replaceAll(",", " "));
}

function parseTextLine(line) {
  const timeMatch = line.match(/(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|am|pm)?)\s*[-–]\s*(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|am|pm)?)/i);
  const dayMatch = line.match(/\b(MWF|MW|MF|WF|TuTh|TR|TTh|Mon(?:day)?s?\/Wed(?:nesday)?s?\/Fri(?:day)?s?|Mon(?:day)?s?\/Wed(?:nesday)?s?|Tue(?:sday)?s?\/Thu(?:rsday)?s?|Mon|Tue|Tues|Wed|Thu|Thur|Fri|Sat|Sun|M|T|W|R|F)\b/i);
  if (!timeMatch) return null;
  const start = parseTime(timeMatch[1]);
  const end = parseTime(timeMatch[2], start);
  const before = line.slice(0, timeMatch.index).replace(dayMatch?.[0] || "", "").trim();
  const after = line.slice(timeMatch.index + timeMatch[0].length).trim();
  return {
    course: before || line.slice(0, timeMatch.index).trim() || "Class",
    days: expandDays(dayMatch?.[0] || ""),
    start,
    end,
    location: after
  };
}

function parseIcs(text) {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const events = unfolded.split("BEGIN:VEVENT").slice(1).map((chunk) => chunk.split("END:VEVENT")[0]);
  return events.map((event) => {
    const get = (name) => {
      const match = event.match(new RegExp(`^${name}(?:;[^:]*)?:(.*)$`, "im"));
      return match ? decodeIcs(match[1]) : "";
    };
    const startDate = parseIcsDate(get("DTSTART"));
    const endDate = parseIcsDate(get("DTEND"));
    const rrule = get("RRULE");
    const days = parseRruleDays(rrule) || (startDate ? [weekdays[(startDate.getDay() + 6) % 7]] : ["Mon"]);
    return {
      course: get("SUMMARY") || "Class",
      location: get("LOCATION"),
      days,
      start: startDate ? startDate.getHours() * 60 + startDate.getMinutes() : 9 * 60,
      end: endDate ? endDate.getHours() * 60 + endDate.getMinutes() : 10 * 60
    };
  });
}

function matchBuilding(input) {
  const normalized = normalize(input);
  let match = null;
  buildings.forEach((building) => {
    building.aliases.forEach((alias) => {
      const needle = normalize(alias);
      if (normalized.includes(needle) && (!match || needle.length > match.score)) {
        match = { ...building, score: needle.length };
      }
    });
  });
  return match ? buildings.find((building) => building.id === match.id) : null;
}

function rankParking() {
  const entries = weekdays.flatMap((day) => dayEntries(day).map((entry) => ({ ...entry, day }))).filter((entry) => entry.building);
  if (!entries.length) return [];
  const byDay = Object.groupBy ? Object.groupBy(entries, (entry) => entry.day) : groupByDay(entries);
  return parkingOptions
    .map((parking) => {
      let minutes = 0;
      let touches = 0;
      Object.values(byDay).forEach((dayList) => {
        const sorted = [...dayList].sort((a, b) => a.start - b.start);
        if (!sorted.length) return;
        minutes += walkingMinutes(parking, sorted[0].building);
        minutes += walkingMinutes(sorted[sorted.length - 1].building, parking);
        touches += 2;
        sorted.slice(0, -1).forEach((entry, index) => {
          minutes += walkingMinutes(entry.building, sorted[index + 1].building) * 0.3;
        });
      });
      const zonePenalty = parking.zone === 2 ? 8 : 0;
      const remotePenalty = parking.id === "arc" || parking.id === "ecps" ? 7 : 0;
      const preferencePenalty = state.preference === "budget" && parking.type === "structure" ? 1 : 0;
      const score = Math.round(minutes + zonePenalty + remotePenalty + preferencePenalty);
      return {
        ...parking,
        score,
        averageWalk: Math.max(1, Math.round(minutes / Math.max(1, touches)))
      };
    })
    .sort((a, b) => a.score - b.score);
}

function choosePermit(best) {
  const allStarts = state.entries.map((entry) => entry.start);
  const eveningOnly = allStarts.length > 0 && allStarts.every((start) => start >= 17 * 60);
  if (eveningOnly) {
    return {
      ...permitRates.e,
      reason: "Every loaded class starts at or after 5 PM, so the evening permit is the lowest monthly fit if your usage stays inside evening-valid hours."
    };
  }
  if (state.preference === "fastest") {
    return {
      ...permitRates.p,
      reason: `"P" Preferred costs more than "S" but can use preferred stalls in the selected zone, which fits a shortest-walk preference for Zone ${best.zone}.`
    };
  }
  return {
    ...permitRates.s,
    reason: `"S" Zone Commuter is the default value pick for regular commuting. Zone ${best.zone} is recommended from your class locations and walking score.`
  };
}

function gapWarnings() {
  const entries = dayEntries(state.selectedDay);
  const warnings = [];
  entries.slice(0, -1).forEach((entry, index) => {
    const next = entries[index + 1];
    if (!entry.building || !next.building) return;
    const gap = minutesBetween(entry.end, next.start);
    const walk = walkingMinutes(entry.building, next.building);
    if (gap < walk) {
      warnings.push({
        level: "danger",
        text: `${entry.course} to ${next.course}: ${gap} min gap but about ${walk} min walking. This is likely too tight.`
      });
    } else if (gap < walk + 8) {
      warnings.push({
        level: "caution",
        text: `${entry.course} to ${next.course}: ${gap} min gap with about ${walk} min walking. Leave right away.`
      });
    }
  });
  return warnings;
}

function dayEntries(day) {
  return state.entries.filter((entry) => entry.days.includes(day)).sort((a, b) => a.start - b.start);
}

function pickUsableDay() {
  const firstDay = weekdays.find((day) => dayEntries(day).length);
  state.selectedDay = firstDay || "Mon";
}

function walkingMinutes(a, b) {
  const meters = haversineMeters(a, b) * 1.18;
  return Math.max(1, Math.ceil(meters / 78));
}

function haversineMeters(a, b) {
  const radius = 6371000;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function minutesBetween(end, start) {
  return start - end;
}

function parseTime(value, startHint = null) {
  const raw = String(value || "").trim().toLowerCase().replace(/\./g, "");
  const match = raw.match(/^(\d{1,2})(?::?(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = match[3];
  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (!meridiem && startHint !== null && hour * 60 + minute <= startHint && hour < 12) hour += 12;
  return hour * 60 + minute;
}

function formatMinutes(total) {
  const hour24 = Math.floor(total / 60);
  const minute = total % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour = hour24 % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function expandDays(raw) {
  const value = String(raw || "").trim();
  if (!value) return [];
  const normalized = value.replace(/days?/gi, "").replaceAll("/", " ");
  const explicit = [];
  const wordMap = [
    ["Mon", /\bmon\b/i],
    ["Tue", /\btue|tues\b/i],
    ["Wed", /\bwed\b/i],
    ["Thu", /\bthu|thur|thurs\b/i],
    ["Fri", /\bfri\b/i],
    ["Sat", /\bsat\b/i],
    ["Sun", /\bsun\b/i]
  ];
  wordMap.forEach(([day, pattern]) => {
    if (pattern.test(normalized)) explicit.push(day);
  });
  if (explicit.length) return explicit;
  const compact = normalized.replace(/\s/g, "");
  const days = [];
  for (let i = 0; i < compact.length; i += 1) {
    const char = compact[i].toUpperCase();
    const next = compact[i + 1]?.toLowerCase();
    if (char === "M") days.push("Mon");
    if (char === "W") days.push("Wed");
    if (char === "F") days.push("Fri");
    if (char === "R") days.push("Thu");
    if (char === "T") {
      if (next === "h") {
        days.push("Thu");
        i += 1;
      } else if (next === "u") {
        days.push("Tue");
        i += 1;
      } else {
        days.push("Tue");
      }
    }
  }
  return [...new Set(days)];
}

function parseRruleDays(rrule) {
  const match = rrule?.match(/BYDAY=([^;]+)/i);
  if (!match) return null;
  const map = { MO: "Mon", TU: "Tue", WE: "Wed", TH: "Thu", FR: "Fri", SA: "Sat", SU: "Sun" };
  return match[1].split(",").map((day) => map[day]).filter(Boolean);
}

function parseIcsDate(value) {
  const match = String(value || "").match(/(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?/);
  if (!match) return null;
  const [, year, month, day, hour = "0", minute = "0"] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
}

function decodeIcs(value) {
  return String(value || "").replace(/\\n/g, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").trim();
}

function csvSplit(line) {
  const parts = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  return parts;
}

function groupByDay(entries) {
  return entries.reduce((acc, entry) => {
    acc[entry.day] ||= [];
    acc[entry.day].push(entry);
    return acc;
  }, {});
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function exportAnalysis() {
  const ranked = rankParking();
  const payload = {
    generatedAt: new Date().toISOString(),
    source: state.sourceName,
    selectedDay: state.selectedDay,
    recommendation: ranked[0] ? { parking: ranked[0], permit: choosePermit(ranked[0]) } : null,
    entries: state.entries
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "where2park-analysis.json";
  link.click();
  URL.revokeObjectURL(url);
}

boot();
