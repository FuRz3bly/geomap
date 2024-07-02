const fetchNearbyAmenities = async (latitude, longitude, type) => {
  const nominatimEndpoint = 'https://nominatim.openstreetmap.org/search';
  const query = `${nominatimEndpoint}?q=${type.query}&format=json&addressdetails=1&extratags=1&limit=100&viewbox=${longitude-0.05},${latitude-0.05},${longitude+0.05},${latitude+0.05}&bounded=1`;

  // Haversine formula to calculate distance between two coordinates
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  try {
    const response = await fetch(query, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();

    // Filter results to include only those within a 10 km radius
    const radius = 10; // Radius in kilometers
    const nearbyAmenities = data.filter(place => {
      const distance = haversineDistance(latitude, longitude, parseFloat(place.lat), parseFloat(place.lon));
      return distance <= radius;
    });

    return nearbyAmenities.map(place => {
      const name = place.display_name.split(',')[0]; // Extract only the name part
      const address = place.address || {};
      const city = address.city || address.town || address.village || '';
      const state = address.state || '';
      const formattedAddress = city && state ? `${city}, ${state}` : state;
      return {
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        name: name,
        type: type.description,
        address: formattedAddress,
        tags: place.extratags || {},
      };
    });
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return [];
  }
};

export default fetchNearbyAmenities;