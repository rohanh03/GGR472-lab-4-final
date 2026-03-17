# GGR472 Lab 4

This repo contains code for an interactive hexgrid choropleth map of Toronto pedestrian and cyclist collisions, as required by Lab 4.

Link: https://rohanh03.github.io/GGR472-lab-4-final/

## Repo Table of Contents

/data: Contains `pedcyc_collision_06-21.geojson` — GeoJSON of all pedestrian and cyclist collisions in Toronto from 2006–2021 (City of Toronto Open Data). Fetched directly from GitHub raw URL at runtime.

index.html: HTML file to render the webmap with Mapbox GL JS. Contains the map container div, a legend, and a toggle button for the collision points layer.

script.js: JavaScript file that initializes the map, fetches the collision GeoJSON, creates a 0.5 km hexgrid over the bounding box of the data, aggregates collision counts per hexagon using Turf.js, renders a choropleth fill layer, adds click popups showing collision count, and builds the legend.

style.css: CSS file that styles the map container, legend panel, and layer toggle button.
