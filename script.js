/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken = 'pk.eyJ1Ijoicm9oYW4yMDAzIiwiYSI6ImNtazRrYTVtMDA4OTEzbW91YTBtOHhxczEifQ.ZVzMbtIQ2tihbIcpSl3fmQ';

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 11 // starting zoom level
});


/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
// Create an empty variable to store collision data for later use
let collisionData;


/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
// All code to create and view the hexgrid goes inside the map load event handler
map.on('load', () => {

    // Fetch GeoJSON from GitHub raw URL once map has loaded
    fetch('https://raw.githubusercontent.com/rohanh03/GGR472-lab-4-final/main/data/pedcyc_collision_06-21.geojson')
        .then(response => response.json())
        .then(data => {
            collisionData = data;

            // Add collision points as a GeoJSON source
            map.addSource('collisions', {
                type: 'geojson',
                data: collisionData
            });

            map.addLayer({
                id: 'collision-points',
                type: 'circle',
                source: 'collisions',
                paint: {
                    'circle-radius': 3,
                    'circle-color': '#f5a623',
                    'circle-opacity': 0.6
                }
            });

            // Create bounding box polygon around collision point data 
            // (uses bboxPolygon with bbox rather than envelope because later on, hexGrid requires a bbox array anyways)
            const bboxPoly = turf.bboxPolygon(turf.bbox(collisionData));

            // Use transformScale to increase bbox size by 10% for capturing collisions at edge of bounding box
            const scaledPoly = turf.transformScale(bboxPoly, 1.1);

            // Convert scaled polygon back to bbox array for hexGrid
            const bboxExpanded = turf.bbox(scaledPoly);

            // Create hexgrid using expanded bounding box (cell size 0.5 km)
            const hexgrid = turf.hexGrid(bboxExpanded, 0.5, { units: 'kilometers' });


            /*--------------------------------------------------------------------
            Step 4: AGGREGATE COLLISIONS BY HEXGRID
            --------------------------------------------------------------------*/
            // Use Turf collect to spatially join collision points to hexagons,
            // collecting each point's '_id' value into an array called 'values'
            const collisionsHex = turf.collect(hexgrid, collisionData, '_id', 'values');

            // Calculate collision count for each hexagon
            let maxCount = 0;
            collisionsHex.features.forEach(feature => {
                // Count the number of collected _id values to get collision count
                feature.properties.COUNT = feature.properties.values.length;
                // Track the maximum count across all hexagons for use in paint expression
                if (feature.properties.COUNT > maxCount) {
                    maxCount = feature.properties.COUNT;
                }
            });

            console.log(maxCount);


            /*--------------------------------------------------------------------
            Step 5: FINALIZE YOUR WEB MAP
            --------------------------------------------------------------------*/
            // Add aggregated hexgrid as a GeoJSON source
            map.addSource('hexgrid', {
                type: 'geojson',
                data: collisionsHex
            });

            // Add hexgrid fill layer with choropleth color expression based on COUNT
            map.addLayer({
                id: 'hexgrid-fill',
                type: 'fill',
                source: 'hexgrid',
                paint: {
                    'fill-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'COUNT'],
                        0, '#f7fbff',
                        Math.round(maxCount * 0.1), '#c6dbef',
                        Math.round(maxCount * 0.3), '#6baed6',
                        Math.round(maxCount * 0.6), '#2171b5',
                        maxCount, '#084594'
                    ],
                    'fill-opacity': [
                        'case',
                        ['>', ['get', 'COUNT'], 0],
                        0.75,
                        0
                    ]
                }
            }, 'collision-points'); // Insert below points layer

            // Add hexgrid outline layer
            map.addLayer({
                id: 'hexgrid-outline',
                type: 'line',
                source: 'hexgrid',
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 0.3,
                    'line-opacity': [
                        'case',
                        ['>', ['get', 'COUNT'], 0],
                        0.4,
                        0
                    ]
                }
            }, 'collision-points');

            // Add popup on hexagon click
            map.on('click', 'hexgrid-fill', (e) => {
                const count = e.features[0].properties.COUNT;
                if (count > 0) {
                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(`<strong>Collisions:</strong> ${count}`)
                        .addTo(map);
                }
            });

            // Change cursor on hover
            map.on('mouseenter', 'hexgrid-fill', () => {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'hexgrid-fill', () => {
                map.getCanvas().style.cursor = '';
            });

            // Build legend
            const legendEl = document.getElementById('legend');
            const legendStops = [
                { color: '#084594', label: `${Math.round(maxCount * 0.6)}+` },
                { color: '#2171b5', label: `${Math.round(maxCount * 0.3)}–${Math.round(maxCount * 0.6) - 1}` },
                { color: '#6baed6', label: `${Math.round(maxCount * 0.1)}–${Math.round(maxCount * 0.3) - 1}` },
                { color: '#c6dbef', label: `1–${Math.round(maxCount * 0.1) - 1}` },
                { color: '#f7fbff', label: '0' }
            ];

            legendStops.forEach(stop => {
                const item = document.createElement('div');
                item.className = 'legend-item';
                item.innerHTML = `<span class="legend-swatch" style="background:${stop.color}"></span>${stop.label}`;
                legendEl.appendChild(item);
            });

            // Toggle collision points layer on/off when button is clicked
            const toggleBtn = document.getElementById('toggle-points');
            let pointsVisible = true;
            toggleBtn.addEventListener('click', () => {
                pointsVisible = !pointsVisible;
                // Set layer visibility using Mapbox GL setLayoutProperty
                map.setLayoutProperty(
                    'collision-points',
                    'visibility',
                    pointsVisible ? 'visible' : 'none'
                );
                toggleBtn.textContent = pointsVisible ? 'Hide collision points' : 'Show collision points';
            });
        });
});
