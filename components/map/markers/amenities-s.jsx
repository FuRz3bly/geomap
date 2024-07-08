import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import amenities_static from '../../../constants/amenities/static';
import { View, Text } from 'react-native';
import { getDistance } from 'geolib';

const StaticAmenitiesMarker = ({ toggleAmenity, selectedAmenity, location }) => {
    // Marker Color Switcher
    const getMarkerColor = (type) => {
        switch (type) {
            case 'Fire Station':
                return 'tomato';
            case 'Police Station':
                return 'blue';
            case 'Government Office':
                return 'green';
            case 'Townhall':
                return 'linen';
            case 'Municipal Hall':
                return 'tan';
            case 'Barangay Hall':
                return 'wheat';
            default:
                return 'red';
        }
    };
    // Get Amenity Type Color in Callout - Colored Square - Type: Barangay Hall
    const getAType = (type) => {
        switch (type) {
            case 'Fire Station':
                return 'bg-orange-300';
            case 'Police Station':
                return 'bg-blue-400';
            case 'Government Office':
                return 'bg-green-400';
            case 'Townhall':
                return 'bg-yellow-200';
            case 'Municipal Hall':
                return 'bg-amber-200';
            case 'Barangay Hall':
                return 'bg-amber-300';
            default:
                return 'bg-primary-50';
        }
    }
    // Distance Color
    const getDistanceColor = (distance) => {
        if (distance < 1) {
            return 'bg-green-400';
        } else if (distance < 5) {
            return 'bg-yellow-400';
        } else {
            return 'bg-orange-500';
        }
    };

    const updatedAmenities = amenities_static.map((amenity) => {
        let distance = null;
        let distanceColor = null;
    
        if (location) {
          distance = getDistance(
            { latitude: location.latitude, longitude: location.longitude },
            { latitude: amenity.lat, longitude: amenity.lon }
          ) / 1000; // Convert distance to kilometers
          distanceColor = getDistanceColor(distance);
        }
    
        return {
          ...amenity,
          distance,
          distanceColor,
        };
      });

    const handleCalloutPress = (amenity) => {
        // Handle press action here, e.g., navigate to a detailed view
        toggleAmenity(true)
        selectedAmenity(amenity)
        console.log('Callout pressed for:', amenity.name);
      };
    return (
        <>
            {updatedAmenities.map((amenity) => (
                <Marker
                    key={amenity.id}
                    coordinate={{
                    latitude: amenity.lat,
                    longitude: amenity.lon
                    }}
                    pinColor={getMarkerColor(amenity.type)}
                    onCalloutPress={() => handleCalloutPress(amenity)}
                >
                    <Callout>
                        <View className="w-50 h-30 justify-center">
                            {/* Name of Amenity */}
                            <Text className="font-pbold text-sm text-primary py-2 text-center px-2">{amenity.name}</Text>
                            {/* Line Separator */}
                            <View className="border-b-0.5 border-primary" />
                            {/* Type Description */}
                            <View className="flex-row pt-2">
                                <View className={`w-2 h-6 ${getAType(amenity.type)} -top-[1%]`}><Text>{" "}</Text></View>
                                <Text className="font-psemibold text-sm text-primary">{"  "}Type:{" "}</Text>
                                <Text className="w-[80%] font-pregular text-sm text-primary">{amenity.type}</Text>
                            </View>
                            {/* Distance Description */}
                            {location && (
                            <View className="flex-row pt-2">
                                <View className={`w-2 h-6 ${amenity.distanceColor} -top-[1%]`}><Text>{" "}</Text></View>
                                <Text className="font-psemibold text-sm text-primary">{"  "}Distance:{" "}</Text>
                                <Text className="w-[80%] font-pregular text-sm text-primary">
                                    {amenity.distance.toFixed(2)} km
                                </Text>
                            </View>
                            )}
                            {/* Address Description */}
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

export default StaticAmenitiesMarker;