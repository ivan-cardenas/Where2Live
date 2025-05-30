
function toggleInfo() {
    var x = document.getElementById("info");
    if (x.style.display === "block") {
      x.style.display = "none";
    } else {
      x.style.display = "block";
    }
  }

mapboxgl.accessToken = "pk.eyJ1IjoiY3lnbnVzMjYiLCJhIjoiY2s5Z2MzeWVvMGx3NTNtbzRnbGtsOXl6biJ9.8SLdJuFQzuN-s4OlHbwzLg";
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/cygnus26/clzmeog6f005c01qt8db6guh6",
      projection: "globe",
      zoom: 7,
      center: [5, 52],
    });

  

map.on("style.load", () => map.setFog({}));

map.on("load", () => {
      const filterGroup = document.getElementById("filter-group");

      map.addSource("Stores", { type: "geojson", data: "./Assets/AH_Jumbos.json" });
      map.addSource("Walking Distance", { type: "geojson", data: "./Assets/5minWalkAH_Jum.geojson" });
      map.addSource("Houses", { type: "geojson", data: "./Assets/results.geojson" });
      map.addSource("LifeBarometer", { type: "geojson", data: "./Assets/LifeBarometer.geojson"});
      map.addSource("10minWalk", { type: "geojson", data: "./Assets/10minWalkAH_Jum.geojson" });

      map.addLayer({
        id: "LifeBarometer-layer",
        type: "fill",
        source: "LifeBarometer",
        paint: {
          "fill-color": [
            "interpolate", ['linear'], ["get", "kscore"],
            0, "#f05446",	
            5, "#ede9d0",
            9, "#5abab6"
          ],
          "fill-outline-opacity": 0.8,
          "fill-opacity": 0.7
        },
        layout: {
          visibility: "none"
        }
      });

      map.addLayer({
        id: "Walking-layer",
        type: "fill",
        source: "Walking Distance",
        // filter: ["in", "Name", "Albert Heijn: 0 - 5", "Jumbo : 0 - 5"],
        paint:{
          "fill-color": [
            "match", ["get", "Name"],
            "Albert Heijn: 0 - 5", "#079dce",
            "Jumbo : 0 - 5", "#6a5500",
            "#f00"
          ],
          "fill-opacity": 0.5
        }
      });
    
    map.addLayer({
        id: "10minWalking-layer",
        type: "fill",
        source: "10minWalk",
        paint:{
          "fill-color": [
            "match", ["get", "Name"],
            "Albert Heijn: 5 - 10", "#079dce",
            "Jumbo : 5 - 10", "#6a5500",
            "#f00"
          ],
          "fill-opacity": 0.2
        }
    });
    

      map.addLayer({
        id: "stores-layer",
        type: "circle",
        source: "Stores",
        paint: {
          "circle-radius": 3,
          "circle-color": [
            "match", ["get", "brand"],
            "Albert Heijn", "#08B0E7",
            "Jumbo", "#FFCF08",
            "Albert Heijn XL", "#08B0E7",
            "Jumbo City", "#FFCF08",
            "Jumbo Foodmarkt", "#FFCF08",
            "#000"
          ]
        }
      });

      map.addLayer({
        id:"Houses-layer",
        type: "circle",
        source: "Houses",
        visibility: "visible",
        paint: {
          "circle-color": "#FF0000",
          "circle-radius": 4
        }
      })

      map.once("idle", () => {
        
      // Get all polygon features
      const polygonFeatures = map.querySourceFeatures('Walking Distance');
      
      if (polygonFeatures.length > 0) {
        // Create a filter expression that checks if a point is within any of the polygons
        const withinExpressions = polygonFeatures.map(feature => 
          ['within', feature.geometry]
        );
        
        // Combine all within expressions with an 'any' operator
        const withinAnyPolygon = ['any', ...withinExpressions];
        
        // Apply the filter to style your points
        map.setPaintProperty('Houses-layer', 'circle-color', [
          'case',
          withinAnyPolygon,
          '#00FF00', // Color for points within any polygon
          '#d63232'  // Color for points outside all polygons
        ]);

        // You can also adjust the circle radius to make highlighted points more visible
        map.setPaintProperty('Houses-layer', 'circle-radius', [
        'case',
         withinAnyPolygon,
        4, // Larger radius for points within the polygon
        3  // Original radius for points outside
        ]);
      }
      });

      

      const categories = ["Albert Heijn", "Jumbo"];

      categories.forEach((category) => {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = category;
        input.checked = true;
        filterGroup.appendChild(input);
        

        const label = document.createElement("label");
        label.setAttribute("for", category);
        label.textContent = category;
        filterGroup.appendChild(label);

        

        input.addEventListener("change", () => {
          const checkedCategories = [...document.querySelectorAll("#filter-group input:checked")]
            .map(input => input.id);

          if (checkedCategories.length > 0) {
            map.setFilter("Walking-layer", ["any", ...checkedCategories.map(cat => ["in", cat, ["get", "Name"]])]);
            map.setFilter("10minWalking-layer", ["any", ...checkedCategories.map(cat => ["in", cat, ["get", "Name"]])]);
            map.setFilter("stores-layer", ["in", ["get", "brand"], ["literal", checkedCategories]]);
          } else {
            map.setFilter("Walking-layer", ["==", ["get", "Name"], ""]);
            map.setFilter("10minWalking-layer", ["==", ["get", "Name"], ""]);
            map.setFilter("stores-layer", ["==", ["get", "brand"], ""]);
          }
        });
      });
    

    // Set up the toggle button
    // Add checkbox and label elements for the layer
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'layer-toggle';
    input.checked = false;
    filterGroup.appendChild(input);

    const label = document.createElement('label');
    label.setAttribute('for', 'layer-toggle');
    label.textContent = 'Barometer Layer';
    filterGroup.appendChild(label);

    // When the checkbox changes, update the visibility of the layer
    input.addEventListener('change', (e) => {
        map.setLayoutProperty(
            'LifeBarometer-layer',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });

     // Add checkbox and label elements for the layer
    const rents = document.createElement('input');
    rents.type = 'checkbox';
    rents.id = 'rent-toggle';
    rents.checked = true;
    filterGroup.appendChild(rents);

    const rentslabel = document.createElement('label');
    rentslabel.setAttribute('for', 'rent-toggle');
    rentslabel.textContent = 'To Rent';
    filterGroup.appendChild(rentslabel);

    // When the checkbox changes, update the visibility of the layer
    rents.addEventListener('change', (e) => {
        map.setLayoutProperty(
            'Houses-layer',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });
  });

    // For click-based popups instead of hover
    map.on('click', 'stores-layer', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;
      const brand = properties.brand;
      const name = properties.name || brand;
      const City = properties.addr_city;
      const address = properties.addr_street || '';
      const houseNumber = properties.addr_housenumber || '';
      const postalCode = properties.addr_postcode || '';
      
      const description = `
        <strong>${name} ${City}</strong>
        <p>${address} ${houseNumber}, ${postalCode} </p>
      `;
      
      if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
      }
      
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    });

    map.on('click', 'Houses-layer', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;
      
      // Customize this HTML based on your actual data properties
      const description = `<div style:"font-family: Arial, sans-serif;">
        <strong>${properties.title || 'N/A'}</strong>
        <p>Location: ${properties.postal_code || 'N/A'}</p>
        <p>House Type: ${properties.house_type || 'N/A'}</p>
        <p>Bedrooms: ${properties.bedrooms || 'N/A'}</p>
        <p>Price: ${properties.rental_price || 'N/A'}</p>
        <p>Offered Since: ${properties.offered_since || 'N/A'}</p>
        <p>Status: ${properties.status || 'N/A'}</p>
        <p>Available: ${properties.available || 'N/A'}</p>
        <p>Service cost: ${properties.service_cost || 'N/A'}</p>
        <p>Living_area: ${properties.living_area || 'N/A'}</p>
        <p>Energy rating: ${properties.energy_rating || 'N/A'}</p>
        <p>Link: <a href="${properties.url || '#'}" target="_blank">More info</a></p>
      </div>`;
      
      if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
      }
      
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    });

    // Still good to change cursor on hover for better UX
    map.on('mouseenter', 'Houses-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'Houses-layer', () => {
      map.getCanvas().style.cursor = '';
    });

    // Still good to change cursor on hover for better UX
    map.on('mouseenter', 'stores-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'stores-layer', () => {
      map.getCanvas().style.cursor = '';
    });