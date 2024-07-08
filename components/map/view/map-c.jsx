import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import default_theme from '../themes/default_theme';
import night_theme from '../themes/night_theme';
import vintage_theme from '../themes/vintage_theme';
import wasp_theme from '../themes/wasp_theme';
import elevation_theme from '../themes/elevation_theme';

import AmenitiesMarker from '../markers/amenities-a';
import NewReportMarker from '../markers/report-n';

const initialRegion = {
    latitude: 14.32212,
    longitude: 120.77134,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

const themes = {
    default: default_theme,
    night: night_theme,
    vintage: vintage_theme,
    wasp: wasp_theme,
    elevation: elevation_theme,
    eim: default_theme,
};

const MapCommunity = ({
    showTraffic,
    selectedTheme,
    focus,
    resetFocus,
    userLocation,
    toggleAmenity,
    selectedAmenity,
    toggleNearest,
    resetToggleNearest,
    report,
    selectedReport,
    toggleReport,
    toggleMarkers
}) => {
    const mapRef = useRef(null);
    const [region, setRegion] = useState(initialRegion);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [nearestAmenity, setNearestAmenity] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            const { coords } = await Location.getCurrentPositionAsync({});
            setLocation(coords);
            userLocation(coords);
        })();
    }, []);

    useEffect(() => {
        if (mapRef.current && focus && location) {
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
            resetFocus();
        }
    }, [focus, location, resetFocus]);

    useEffect(() => {
        if (nearestAmenity && toggleNearest) {
            mapRef.current.animateToRegion({
                latitude: nearestAmenity.lat,
                longitude: nearestAmenity.lon,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }, 1000);
            selectedAmenity(nearestAmenity);
            toggleAmenity(true);
            resetToggleNearest();
        }
    }, [nearestAmenity, toggleNearest, selectedAmenity, toggleAmenity, resetToggleNearest]);

    const handleNearestAmenity = useCallback((amenity) => setNearestAmenity(amenity), []);

    const mapTheme = useMemo(() => themes[selectedTheme] || null, [selectedTheme]);

    return (
        <SafeAreaView className="w-full h-full justify-center">
            <MapView
                ref={mapRef}
                style={{ width: '100%', height: '120%' }}
                customMapStyle={mapTheme}
                initialRegion={{
                    latitude: location ? location.latitude : region.latitude,
                    longitude: location ? location.longitude : region.longitude,
                    latitudeDelta: region.latitudeDelta,
                    longitudeDelta: region.longitudeDelta,
                }}
                onRegionChangeComplete={setRegion}
                showsUserLocation={true}
                showsBuildings={true}
                showsTraffic={showTraffic}
                showsCompass={false}
                showsMyLocationButton={false}
                zoomControlEnabled={false}
                toolbarEnabled={false}
            >
                {toggleMarkers && (
                    <AmenitiesMarker 
                        location={location} 
                        toggleAmenity={toggleAmenity} 
                        selectedAmenity={selectedAmenity} 
                        isNearest={handleNearestAmenity} 
                    />
                )}
                <NewReportMarker 
                    report={report} 
                    toggleReport={toggleReport} 
                    selectedReport={selectedReport} 
                />
            </MapView>
        </SafeAreaView>
    );
};

export default React.memo(MapCommunity);