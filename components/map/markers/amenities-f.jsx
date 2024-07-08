import React, { useState, useEffect, useCallback } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, TouchableOpacity } from 'react-native';
import { getDistance } from 'geolib';
import fetchNearbyAmenities from '../../fetchplaces';

const filteredWords = [
    'Barangay Hall', 
    'Municipal Hall', 
    'Townhall', 
    'Government Office', 
    'Police Station', 
    'Fire Station', 
    'Fire Department'
];

const cleanName = (name) => {
    let cleanedName = name;
    filteredWords.forEach((word) => {
        cleanedName = cleanedName.replace(new RegExp(word, 'gi'), '').trim();
    });
    return cleanedName;
};

const types = [
    { query: 'fire_station', description: 'Fire Station' },
    { query: 'police', description: 'Police Station' },
    { query: 'government', description: 'Government Office' },
    { query: 'townhall', description: 'Municipal / City Hall' },
    { query: 'barangay_hall', description: 'Barangay Hall' }
];

const getAType = (type) => {
    switch (type) {
        case 'Fire Station': return 'bg-orange-300';
        case 'Police Station': return 'bg-blue-400';
        case 'Government Office': return 'bg-green-400';
        case 'Townhall': return 'bg-yellow-200';
        case 'Municipal Hall': return 'bg-amber-200';
        case 'Barangay Hall': return 'bg-amber-300';
        default: return 'bg-primary-50';
    }
};

const getMarkerColor = (type, isNearest = false) => {
    if (isNearest) {
        return 'yellow';
    }
    switch (type) {
        case 'Fire Station': return 'tomato';
        case 'Police Station': return 'blue';
        case 'Government Office': return 'green';
        case 'Townhall': return 'linen';
        case 'Municipal Hall': return 'tan';
        case 'Barangay Hall': return 'wheat';
        default: return 'red';
    }
};

const getDistanceColor = (distance) => {
    if (distance < 2) {
        return 'bg-green-400';
    } else if (distance < 5) {
        return 'bg-yellow-400';
    } else {
        return 'bg-orange-500';
    }
};

const calculateDistance = (location, amenity) => {
    return getDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: amenity.lat, longitude: amenity.lon }
    ) / 1000; // Convert distance to kilometers
};

const FetchedAmenitiesMarker = ({ toggleAmenity, selectedAmenity, location, isNearest }) => {
    const [nearestAmenity, setNearestAmenity] = useState(null);
    const [amenities, setAmenities] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            let fetchedAmenities = [];
            for (const type of types) {
                const results = await fetchNearbyAmenities(location.latitude, location.longitude, type);
                const cleanedResults = results.map((amenity) => {
                    const cleanedName = cleanName(amenity.name);
                    const distance = calculateDistance(location, amenity);
                    const distanceColor = getDistanceColor(distance);
                    return { ...amenity, name: cleanedName, distance: distance.toFixed(2), distanceColor };
                });
                fetchedAmenities = [...fetchedAmenities, ...cleanedResults];
            }
            setAmenities(fetchedAmenities);

            if (fetchedAmenities.length > 0) {
                const nearest = fetchedAmenities.reduce((prev, curr) => (
                    calculateDistance(location, prev) < calculateDistance(location, curr) ? prev : curr
                ));
                setNearestAmenity(nearest);
                isNearest(nearest);
            }
        };

        if (location) {
            fetchData();
        }
    }, [location, isNearest]);

    const handleCalloutPress = useCallback((amenity) => {
        toggleAmenity(true);
        selectedAmenity(amenity);
        console.log('Callout pressed for:', amenity.name);
    }, [toggleAmenity, selectedAmenity]);

    return (
        <>
            {amenities.map((amenity, index) => (
                <Marker
                    key={index}
                    coordinate={{ latitude: amenity.lat, longitude: amenity.lon }}
                    pinColor={getMarkerColor(amenity.type, amenity === nearestAmenity)}
                    onCalloutPress={() => handleCalloutPress(amenity)}
                >
                    <Callout>
                        <View className="w-50 h-30 justify-center">
                            <Text className="font-pbold text-sm text-primary py-2 text-center px-2">{amenity.name}</Text>
                            <View className="border-b-0.5 border-primary" />
                            <View className="flex-row pt-2">
                                <View className={`w-2 h-6 ${getAType(amenity.type)} -top-[1%]`}><Text>{" "}</Text></View>
                                <Text className="font-psemibold text-sm text-primary">{"  "}Type:{" "}</Text>
                                <Text className="w-[80%] font-pregular text-sm text-primary">{amenity.type}</Text>
                            </View>
                            {location && (
                                <View className="flex-row pt-2">
                                    <View className={`w-2 h-6 ${amenity.distanceColor} -top-[1%]`}><Text>{" "}</Text></View>
                                    <Text className="font-psemibold text-sm text-primary">{"  "}Distance:{" "}</Text>
                                    <Text className="w-[80%] font-pregular text-sm text-primary">
                                        {amenity.distance} km
                                    </Text>
                                </View>
                            )}
                            <View className="flex-row pt-2">
                                <View className={`w-2 h-6 bg-primary-50 -top-[1%]`}><Text>{" "}</Text></View>
                                <Text className="font-psemibold text-sm text-primary pb-2">{"  "}Address:{" "}</Text>
                                <Text className="w-[80%] font-pregular text-sm text-primary">{amenity.address}</Text>
                            </View>
                        </View>
                    </Callout>
                </Marker>
            ))}
        </>
    );
};

export default FetchedAmenitiesMarker;
