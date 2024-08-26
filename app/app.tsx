import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {scaleLinear} from 'd3-scale';
import {MaskExtension} from '@deck.gl/extensions';

import type {Color, Position, PickingInfo, MapViewState} from '@deck.gl/core';
import type {Feature, Geometry} from 'geojson';

// Source data GeoJSON
const DATA_URL = import.meta.env.VITE_SOURCE_DATA // eslint-disable-line
const CIRCLE_URL = import.meta.env.VITE_CIRCLE_DATA

export const COLOR_SCALE = scaleLinear<number, Color>()
.domain([1e6, 7e6, 2e7, 3.5e7])
// @ts-ignore
.range([
    [208, 255, 143, 150],
    [255, 191, 54, 150],
    [255, 0, 0, 150],
    [0, 0, 0, 150]
  ]);

const VALUE_SCALE = (val: number) => {
  return Math.max(0, (val - 2.5e6)) / 2e3
}

const INIT_LAT = -6.9215529
const INIT_LONG = 107.6110212
const INITIAL_VIEW_STATE: MapViewState = {
  latitude: INIT_LAT,
  longitude: INIT_LONG,
  zoom: 10.5,
  maxZoom: 18,
  pitch: 45,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

type BlockProperties = {
  prediction: number;
};

function getTooltip({object}: PickingInfo<Feature<Geometry, BlockProperties>>) {
  return (
    object && {
      html: `\
  <div><b>Land Price Prediction</b></div>
  <div>Rp. ${object.properties.prediction.toLocaleString('id-ID')} / m<sup>2</sup></div>
  `
    }
  );
}

export default function App({
  data = DATA_URL,
  mapStyle = MAP_STYLE
}: {
  data?: string | Feature<Geometry, BlockProperties>[];
  mapStyle?: string;
}) {
  var [selectedArea, setSelectedArea] = useState<any>();

  useEffect(() => {
    async function initData() {
      const response = await fetch(CIRCLE_URL);
      const file = await response.json();
      var coor = file.features[0].geometry.coordinates;
      coor[0] = coor[0].map(x => [x[0] + INIT_LONG, x[1] + INIT_LAT])
      file.features[0].geometry['cc'] = [INIT_LONG, INIT_LAT]
      setSelectedArea(file.features[0].geometry)
    }
    initData()
  }, []);

  var updateCircle = (point: any) => {
    const cc = selectedArea['cc']
    var area = {...selectedArea}
    var coor = area.coordinates;
    console.log(coor[0][0][0])
    coor[0] = coor[0].map(x => {
      // console.log(x[1])
      // return [x[0] - cc[0] + point[0], x[1] - cc[1] + point[1]]
      return [x[0], x[1]]
    })
    area['cc'] = [point[0], point[1]]
    setSelectedArea(area)
  }

  try {
    // console.log(selectedArea.coordinates[0][0][0])
    // console.log(selectedArea['cc'][0])
  } catch (error) {
    console.log(error)
  }

  const layers = [
    new GeoJsonLayer<BlockProperties>({
      id: 'flat-area',
      data: data,
      material: false,
      extruded: false,
      getFillColor: [0, 0, 0, 100],
      pickable: true,
      autoHighlight: true,
      highlightColor: [0, 132, 255, 150],
      onHover: (info, event) => updateCircle(info.coordinate),
    }),
    new GeoJsonLayer({
      id: 'selected-area',
      data: selectedArea,
      operation: 'mask',
    }),
    new GeoJsonLayer({
      id: 'extruded-area',
      data: data,
      extruded: true,
      wireframe: true,
      material: false,
      getElevation: f => VALUE_SCALE(f.properties.prediction),
      getFillColor: f => COLOR_SCALE(f.properties.prediction),
      getLineColor: [255, 255, 255, 0],
      pickable: true,
      autoHighlight: true,
      highlightColor: [0, 132, 255, 150],
      maskId: 'selected-area',
      extensions: [new MaskExtension()],
    }),
  ];

  return (
    <DeckGL
      layers={layers}
      // effects={effects}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
