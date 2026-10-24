# Necessities

**Free food, shelter and help across the Oklahoma City metro, all in one place.**

Necessities helps people in the OKC metro find a free meal, a food pantry or a safe place to sleep near them. It shows what's open right now, how far away each place is, and how to call or get directions in one tap. It also covers SNAP and WIC, ways to stretch a grocery budget, and how to donate money, time or clothing.

Built for SASEhack 2026.

## Features

### Find help (map + list)
- **110 places** across the metro (96 food, 14 shelter) on an interactive street map.
- **Set your location** by ZIP code, with **Use my current location** (browser geolocation), or by tapping the map. Location is never saved or sent anywhere.
- **Distance radius** from 1 to 25 miles, with places outside the radius shown as faded pins.
- **Filters:** All / Food / Shelter, categories (pantry, hot meals, baby & kids, overnight, day center, youth, families, women), and **Open right now**.
- **Open now** is calculated from each place's weekly hours in Oklahoma City time, with seasonal shelters handled (e.g. the winter shelter, Nov. 1 – Mar. 31).
- **Sort by** distance, category (grouped with headings), open-now first, or name A–Z.
- **Numbered pins match the list.** Food pins are green circles with a fork and knife, and shelter pins are blue squares with a house.
- **Selecting a place** lifts it to the top of the list and opens a details panel with address, hours, distance, phone, features (walk-ins, drive-thru, delivery, choose your own food), and **Call / Directions / Copy number / Website** buttons.
- **Confidential shelters** (domestic violence) have no map pin or address. They're listed under "Call to reach".

### SNAP & WIC
One scrolling panel with a section menu that tracks your place: how to apply for SNAP, free help lines, Double Up Oklahoma (matches SNAP up to $20/day on produce), and WIC clinics.

### Save money
Money-saving tips, plus local grocery stores and apps with links to their deals.

### Donate
- A filterable, scrolling list of local charities (Food, Shelter, Families, Youth). Each has a description, what your gift helps with, and in-person giving details.
- **Donate clothes:** 15 drop-off locations grouped into *straight to people in need*, *work clothes*, and *thrift stores & pickup*. Each shows what they take, what they don't, hours, and directions.

### Launch page
`index.html` introduces the app, shows live counts (places, food, shelters, open right now), and links into each section.

## Running it

There's no build step and nothing to install. It's plain HTML, CSS and JavaScript.

Serve the folder with any static server, for example:

```bash
python3 -m http.server 8765
```

Then open <http://localhost:8765/>.

> Use a local server rather than double-clicking the file. Browsers only allow **Use my current location** on `localhost` or `https://` pages. When you deploy, host it on HTTPS (GitHub Pages, Netlify, Vercel, etc.).

## Project structure

| File | Purpose |
|---|---|
| `index.html` | Launch page (with its live stats script) |
| `landing.css` | Styles only used by the launch page |
| `main.html` | The app: Find help, SNAP & WIC, Save money and Donate tabs |
| `app.js` | All app behavior: map, filters, sorting, details panel, tab routing, donate/save content |
| `data.js` | The listings (`window.PLACES`) |
| `style.css` | Shared theme and layout for both pages |

The four tabs are sections of `main.html`. The URL hash picks which one shows (`main.html#find`, `#snap`, `#save`, `#donate`).

## Adding or editing a place

All listings live in `data.js`. Copy an entry and edit it:

```js
{"id":"my-pantry","cat":"food","kind":["pantry"],"name":"Example Pantry",
 "addr":"123 Main St, Oklahoma City, OK 73102","lat":35.4676,"lon":-97.5164,
 "phone":"405-555-0100","hoursText":"Tue, Thu 9 am–12 pm",
 "h":[["24","09:00","12:00"]],"feat":["Walk-ins"],"src":"curated"}
```

| Field | Meaning |
|---|---|
| `cat` | `"food"` or `"shelter"` |
| `kind` | Any of `pantry`, `meal`, `baby`, `overnight`, `day`, `youth`, `family`, `women` |
| `h` | Weekly hours for "Open now": `[days, "HH:MM", "HH:MM"]`, days as digits, 0 = Sunday … 6 = Saturday |
| `hoursText` | Hours as people should read them (put monthly schedules like "3rd Saturday" here) |
| `feat` | Optional tags such as `"Walk-ins"`, `"Drive-thru"`, `"Delivery available"`, `"Choose your own food"` |
| `addr` | `null` for confidential locations (no pin is shown) |
| `seasonal` | `true` for winter-only shelters (open Nov. 1 – Mar. 31) |

Charities, clothing drop-offs and stores are in the `CHARITIES`, `CLOTHES` and `STORES` lists in `app.js`.

## Tech

- Vanilla HTML, CSS and JavaScript, with no framework or build tools.
- [Leaflet 1.9.4](https://leafletjs.com/) for the map, with [Esri World Street Map](https://www.esri.com/) tiles (no API key required).
- Map icons adapted from [Lucide](https://lucide.dev/) (ISC license).
- Browser Geolocation API for "Use my current location".

## Data sources

Listings were gathered on Oct. 24, 2026 from:

- Regional Food Bank of Oklahoma partner-pantry locator (coordinates from the food bank)
- Homeless Alliance, City of Oklahoma City and City of Norman shelter lists
- Hunger Free Oklahoma and public food pantry directories
- U.S. Census geocoder (coordinates for curated listings)

Clothing drop-off details come from the Homeless Alliance donation guide, Goodwill Central Oklahoma's location pages, and local news coverage. Entries we couldn't confirm as current are marked **"confirm before you go"** in the app.

## Limitations

- **Hours change often.** Pantry and shelter schedules shift, so the app tells people to call before they go.
- **No live bed counts.** Shelters don't publish real-time availability, so the app says to call and check.
- **ZIP locations are approximate.** Each ZIP uses an approximate center point, which is fine for distances but not exact.
- **Static data.** Updates are made by editing `data.js`. There's no backend or admin tool.

## Ideas for next steps

- Live weekly grocery deals sorted by the stores closest to you
- Pin clustering where many places overlap downtown
- Spanish translation
- A simple form for organizations to submit updates to their listing

## In an emergency

Dial **2-1-1** (Heartline) for food, shelter and crisis help anywhere in Oklahoma, 24/7. For emergencies, call **911**.
