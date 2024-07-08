import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../constants';
import MapTools from './modals/map-tools-c';
import MapThemes from './modals/map-themes';
import MapFilter from './modals/map-filter';
import AmenityTools from './modals/amenity-tools-c';
import ReportTools from './modals/report-tools-c';

const MapToolBar = ({
    showToolBar,
    toggleToolBar,
    enableToolBar,
    screenSelect, 
    showsTraffic,
    showMarkers,
    focus, 
    selectedTheme,
    selectedFilter,
    userLocation,
    selectedAmenity,
    toggleAmenity,
    resetToggleAmenity,
    nearbyAmenity,
    selectReport,
    showReport,
    toggleReportTool,
    userDetails
}) => {
    const [showMapTheme, setShowMapThemes] = useState(false);
    const [showMapFilters, setShowMapFilters] = useState(false);

    const toggleMapThemes = useCallback(() => {
        setShowMapThemes(prev => !prev);
    }, []);

    const handleShowTheme = useCallback((theme) => {
        setShowMapThemes(!theme);
    }, []);

    const handleVisibility = useCallback((bool) => {
        setShowMapThemes(bool);
    }, []);

    const toggleMapFilters = useCallback(() => {
        setShowMapFilters(prev => !prev);
    }, []);

    const handleShowFilters = useCallback((filter) => {
        setShowMapFilters(!filter);
    }, []);

    const handleOpacity = useCallback((bool) => {
        setShowMapFilters(bool);
        console.log(bool)
    }, []);

    return (
        <SafeAreaView className="w-full h-[2%] z-10 absolute bottom-0 items-center justify-center bg-primary/60">
            <View className="absolute items-center justify-center">
                {showToolBar && (
                    toggleAmenity ? (
                        <AmenityTools 
                            userLocation={userLocation} 
                            selectedAmenity={selectedAmenity} 
                            toggleAmenity={toggleToolBar} 
                            resetToggleAmenity={resetToggleAmenity} 
                        />
                    ) : showReport ? (
                        <ReportTools 
                            selectedReport={selectReport} 
                            toggleReport={showReport} 
                            onClose={toggleReportTool} 
                            userDetails={userDetails}
                        />
                    ) : (
                        <MapTools 
                            onClose={toggleToolBar} 
                            screenSelect={screenSelect} 
                            showsTraffic={showsTraffic}
                            showsMarkers={showMarkers}
                            showsFilters={handleShowFilters}
                            showsThemes={handleShowTheme} 
                            visibleThemes={showMapTheme}
                            visibleFilters={showMapFilters}
                            nearbyAmenity={nearbyAmenity} 
                            focus={focus} 
                        />
                    )
                )}
                <MapThemes 
                    visible={showMapTheme} 
                    onClose={toggleMapThemes} 
                    visibleTheme={handleVisibility} 
                    selectedTheme={selectedTheme}
                />
                <MapFilter
                    visible={showMapFilters}
                    onClose={toggleMapFilters}
                    visibleFilter={handleOpacity}
                    selectedFilter={selectedFilter}
                />
            </View>
            <TouchableOpacity className="w-full absolute inset-0 items-center" onPress={toggleToolBar}>
                <Image 
                    tintColor="#ffffff"
                    source={icons.expandUp}
                    className="w-10 h-10"
                    resizeMode='contain'
                />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default React.memo(MapToolBar);