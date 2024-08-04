import json
import googlemaps
import numpy as np

from .config import config

gmaps = googlemaps.Client(key=config.gmap_api_key)

locations = np.load('files/locations.npy', allow_pickle=True)
for loc in locations:
    geocode_result = gmaps.geocode(loc)
    area = loc.split(',')[-1].strip()
    subarea = ''.join(loc.split(',')[:-1]).strip()
    filename = f"{area}--{subarea}".replace(" ","_").lower()
    with open(f'files/json/{filename}.json', 'w') as file:
        json.dump(geocode_result, file, ensure_ascii=False, indent=4)
