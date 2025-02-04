import React, {useEffect, useState} from 'react';
import {Helmet} from "react-helmet";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {scaleLinear} from 'd3-scale';
import {polygonCentroid} from 'd3-polygon';
import {MaskExtension} from '@deck.gl/extensions';

import type {Color, PickingInfo, MapViewState} from '@deck.gl/core';
import type {Feature, Geometry} from 'geojson';

// Source data GeoJSON
const DATA_URL = import.meta.env.VITE_SOURCE_DATA // eslint-disable-line
const CIRCLE_URL = import.meta.env.VITE_CIRCLE_DATA

export const COLOR_SCALE = scaleLinear<number, Color>()
.domain([1e6, 7e6, 2e7, 3.5e7])
// @ts-ignore
.range([
    [208, 255, 143, 75],
    [255, 191, 54, 75],
    [255, 0, 0, 75],
    [0, 0, 0, 75]
  ]);

const VALUE_SCALE = (val: number) => {
  return Math.max(0, (val - 2.5e6)) / 2e3
}

const INIT_LAT = -6.9215529
const INIT_LONG = 107.595774
const INITIAL_VIEW_STATE: MapViewState = {
  latitude: INIT_LAT,
  longitude: INIT_LONG,
  zoom: 10.5,
  maxZoom: 18,
  pitch: 45,
  bearing: 12.5
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
  mapStyle = MAP_STYLE,
  setSpinner
}: {
  data?: string | Feature<Geometry, BlockProperties>[];
  mapStyle?: string;
  setSpinner: Function;
}) {
  var [selectedArea, setSelectedArea] = useState<any>();

  useEffect(() => {
    async function initData() {
      const response = await fetch(CIRCLE_URL);
      const file = await response.json();
      var area = file.features[0].geometry;
      area['center'] = [0, 0]
      setSelectedArea(area)
    }
    initData()
  }, []);

  var updateCircle = (info: PickingInfo) => {
    try {
      let area = {...selectedArea}
      const center = polygonCentroid(info.object.geometry.coordinates[0])
      const lng_diff = center[0] - area['center'][0]
      const lat_diff = center[1] - area['center'][1]
      area.coordinates[0] = area.coordinates[0].map((coor: number[]) => {
        return [coor[0] + lng_diff, coor[1] + lat_diff]
      })
      area['center'] = [center[0], center[1]]
      setSelectedArea(area)
    } catch (e) {
      console.log(e)
    }
  }

  const layers = [
    new GeoJsonLayer<BlockProperties>({
      id: 'flat-area',
      data: data,
      material: false,
      getFillColor: f => COLOR_SCALE(f.properties.prediction),
      pickable: true,
      autoHighlight: true,
      highlightColor: [0, 132, 255, 150],
      onClick: (info, _) => updateCircle(info),
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
      maskByInstance: true,
      maskInverted: true,
      onClick: (info, _) => updateCircle(info),
    }),
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
      onAfterRender={() => setSpinner(false)}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function AppContainer() {
  var [spinner, setSpinner] = useState(true);

  return (
    <>
      <Helmet
        title={`${import.meta.env.VITE_ALBYTES} | Land Price Prediction`}
        meta={[{ name: 'description', content: 'Land Price Prediction' }]}
        link={[{ rel: 'icon', href: './assets/favicon.ico' }]}
      />
      <App setSpinner={setSpinner} />
      {spinner &&
        <Box sx={{ position: 'absolute', top: 15, right: 15, textAlign: 'right' }}>
          <Box sx={{ textAlign: 'right', marginBottom: 1 }}>Loading Data</Box>
          <CircularProgress color="inherit" size={50} />
        </Box>
      }
    </>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<AppContainer />);
}
