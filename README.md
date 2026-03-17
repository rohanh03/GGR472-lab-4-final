# GGR472 Lab 4 — Pedestrian & Cyclist Collision Hexgrid Map

## Purpose
This web map visualizes pedestrian and cyclist collision data for Toronto (2006–2021) using an interactive hexgrid choropleth built with Mapbox GL JS and Turf.js. Collisions are spatially aggregated into 0.5 km hexagonal cells, with darker cells indicating higher collision counts. Users can click a hexagon to see its exact count and toggle the underlying collision points layer on or off.

## Data Source
- **Pedestrian and Cyclist Collisions (2006–2021):** City of Toronto Open Data
  File: `data/pedcyc_collision_06-21.geojson`

## Tools & Libraries
- [Mapbox GL JS v3.10.0](https://docs.mapbox.com/mapbox-gl-js/) — interactive basemap and layer rendering
- [Turf.js v7.2.0](https://turfjs.org/) — GIS analysis (bbox, transformScale, hexGrid, collect)

## Running Locally
From the project root:
```bash
python3 -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Features
- Choropleth hexgrid showing collision density
- Click popup displaying collision count per hexagon
- Toggle button to show/hide raw collision point layer
- Legend with colour-coded count ranges
