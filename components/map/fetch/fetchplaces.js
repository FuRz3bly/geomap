import { getDistance } from 'geolib';
import amenities_static from '../../../constants/amenities/static';

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const RADIUS_KM = 10;
const VIEWBOX_OFFSET = 0.05;

const fetchNearbyAmenities = (() => {
  const cache = new Map();

  return async (latitude, longitude, type) => {
    const cacheKey = `${latitude},${longitude},${type.query}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const query = new URLSearchParams({
      q: type.query,
      format: 'json',
      addressdetails: 1,
      extratags: 1,
      limit: 100,
      viewbox: `${longitude - VIEWBOX_OFFSET},${latitude - VIEWBOX_OFFSET},${longitude + VIEWBOX_OFFSET},${latitude + VIEWBOX_OFFSET}`,
      bounded: 1,
    });

    try {
      const response = await fetch(`${NOMINATIM_ENDPOINT}?${query.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();

      const fetchedAmenities = data
        .filter((place) => {
          const distance = getDistance(
            { latitude, longitude },
            { latitude: parseFloat(place.lat), longitude: parseFloat(place.lon) }
          ) / 1000;
          return distance <= RADIUS_KM;
        })
        .map((place) => {
          const name = place.display_name.split(',')[0];
          const address = place.address || {};
          const city = address.city || address.town || address.village || '';
          const state = address.state || '';
          const formattedAddress = city && state ? `${city}, ${state}` : state;

          return {
            lat: parseFloat(place.lat),
            lon: parseFloat(place.lon),
            name,
            type: type.description,
            address: formattedAddress,
            tags: place.extratags || {},
          };
        });

      const staticAmenities = amenities_static
        .filter((amenity) => {
          const distance = getDistance(
            { latitude, longitude },
            { latitude: amenity.lat, longitude: amenity.lon }
          ) / 1000;
          return distance <= RADIUS_KM;
        })
        .map((amenity) => ({
          ...amenity,
          type: type.description,
        }));

      const combinedAmenities = [...fetchedAmenities, ...staticAmenities];

      cache.set(cacheKey, combinedAmenities);
      return combinedAmenities;
    } catch (error) {
      console.error('Error fetching amenities:', error);
      return [];
    }
  };
})();

export default fetchNearbyAmenities;