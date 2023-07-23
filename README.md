# ldproxy-wrapper
A wrapper for ldproxy for easy access to OGC API endpoints. Currently in development.


Example using Openlayers and [ol-mapbox-style](https://github.com/openlayers/ol-mapbox-style) to create a vectortile from a [ldproxy](https://github.com/interactive-instruments/ldproxy) collection URL, and style it with a published style.
```
const response = await fetch(
  "<baseUrl>/rest/services/<serviceId>/collections/<collectionId>?f=json"
);
const json = await resp.json();
let collection = new Collection(json);

collection.onReady(() => {
  let tileLayer = new VectorTileLayer({
    source: new OGCVectorTile({
      format: new MVT(),
      url: collection.getVectorTileUrl("WebMercatorQuad"),
    }),
  });

  let mapboxStyle = collection.getStyleNames(<styleId>);

  map.addLayer(mapboxStyle);
});
```
