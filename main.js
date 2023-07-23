const rel = {
  items: { rel: "items", type: "application/geo+json" },
  tiles: "http://www.opengis.net/def/rel/ogc/1.0/tilesets-vector",
  styles: "http://www.opengis.net/def/rel/ogc/1.0/styles",
};

async function fetchJsonByRel(links, rel) {
  for (const link of links) {
    if (link.rel === rel) {
      try {
        link.href = link.href + "?f=json";

        const response = await fetch(link.href, {
          headers: {
            Accept: "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch JSON for rel "${rel}"`);
        }

        const json = await response.json();

        return json;
      } catch (error) {
        console.error(error);
        return null;
      }
    }
  }

  return null;
}

const searchLink = (links, rel) => {
  let href;
  links.forEach((link) => {
    if (link.rel === rel.rel && link.type === rel.type) {
      href = link.href;
    }
  });

  return href;
};

export class Collection {
  constructor(json) {
    this.title = json.title;
    this.id = json.id;
    this.item_count = json.itemCount;
    this.item_type = json.itemType;
    this.extent = json.extent;
    this.items_url;
    this.self_url;
    this.tilesets;
    this.styles;
    this.isReady = false;
    this.readyCallback;

    this.init(json);
  }

  async init(json) {
    let tilejson = await fetchJsonByRel(json.links, rel.tiles);
    this.tilesets = tilejson.tilesets;

    let stylejson = await fetchJsonByRel(json.links, rel.styles);
    this.styles = stylejson.styles;

    this.items_url = searchLink(json.links, rel.items);

    this.isReady = true;
    this.readyCallback();
  }

  onReady(callback) {
    if (this.isReady) {
      callback();
    } else {
      this.readyCallback = callback;
    }
  }

  getVectorTileUrl(tileMatrixSetId) {
    let tileset_idx = this.tilesets.findIndex(
      (item) => item.tileMatrixSetId === tileMatrixSetId
    );

    let link_idx = this.tilesets[tileset_idx].links.findIndex(
      (item) => item.rel === "self"
    );

    return this.tilesets[tileset_idx].links[link_idx].href;
  }

  getStyleUrl(styleId) {
    let style = this.styles.find((style) => style.id === styleId);
    let style_url = style.links.find(
      (link) => link.type === "application/vnd.mapbox.style+json"
    );
    return style_url.href;
  }

  getStyleNames() {
    return this.styles.map((style) => style.id);
  }
}
