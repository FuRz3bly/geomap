import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';

import { icons } from '../../../constants'

const MapTools = ({ onClose, screenSelect, showsTraffic, showsMarkers, showsFilters, visibleFilters, showsThemes, visibleThemes, nearbyAmenity, focus }) => {
    const reportSelect = () => {
        onClose()
        screenSelect('Report')
    }
    // Nearest Amenity Button Logic
    const showNearestAmenity = () => {
        nearbyAmenity(true)
    } // Show Nearest Amenity
    // Refocus to User Button Logic
    const refocus = () => {
        focus(true)
    } // Refocus to User Button
    // Check if the Modal is Visible if its not, set button to false state
    // Map Themes Button
    const [showMapThemes, setShowMapThemes] = useState(false); // Map Theme Button Container
    const toggleMapThemes = () => {
        setShowMapThemes(!showMapThemes)
        showsThemes(showMapThemes)
    }; // Toggle Map Theme Button
    // Traffic Button
    const [showTraffic, setShowTraffic] = useState(false); // Traffic Button Container
    const toggleTraffic = () => {
        setShowTraffic(!showTraffic)
        showsTraffic(!showTraffic)
    }; // Toggle Traffic Button
    // Marker Button
    const [showMarkers, setShowMarkers] = useState(false); // Marker Button Container
    const toggleMarkers = () => {
        setShowMarkers(!showMarkers)
        showsMarkers(!showMarkers)
    }; // Toggle Marker Button
    // Marker Button
    const [showFilters, setShowFilters] = useState(false); // Marker Button Container
    const toggleFilters = () => {
        setShowFilters(!showFilters)
        showsFilters(showFilters)
    }; // Toggle Marker Button

    useEffect(() => {
        if (visibleThemes === false) {
            setShowMapThemes(false)
        }
        if (visibleFilters === false) {
            setShowFilters(false)
        }
    }, [visibleThemes, visibleFilters])
    
    return (
        <SafeAreaView className="w-full h-full z-10 -bottom-[21%] items-center justify-center">
            {/*--------------------------------------------Report-Button-------------------------------------------------------------*/}
            <View className="z-30 absolute inset-0 bottom-[90%] bg-primary border-[10px] border-primary rounded-full">
                <TouchableOpacity className="rounded-full items-center justify-center bg-white p-5" onPress={reportSelect}>
                    <Image 
                    tintColor="#57b378"
                    source={icons.report}
                    className="w-14 h-14"
                    resizeMode='contain'
                    /> 
                </TouchableOpacity>
            </View>
            {/*--------------------------------------------Report-Button-------------------------------------------------------------*/}
            {/*-----------------------------------------Find-Nearest-Button----------------------------------------------------------*/}
            <View className="z-30 absolute left-[28%] bottom-[85%] bg-primary border-[10px] border-primary rounded-full">
                <TouchableOpacity onPress={showNearestAmenity} className='w-16 h-16 bg-white border-white border-0.5 rounded-full flex-row items-center justify-center'>
                        <Image 
                            tintColor={"#57b378"}
                            source={icons.nearby}
                            className="w-8 h-8"
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
            </View>
            {/*-----------------------------------------Find-Nearest-Button----------------------------------------------------------*/}
            {/*--------------------------------------------Refocus-Button------------------------------------------------------------*/}
            <View className="z-30 absolute right-[28%] bottom-[85%] bg-primary border-[10px] border-primary rounded-full">
                <TouchableOpacity onPress={refocus} className='w-16 h-16 bg-white border-white border-0.5 rounded-full flex-row items-center justify-center'>
                        <Image 
                            tintColor={"#57b378"}
                            source={icons.mapFocus}
                            className="w-10 h-10"
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
            </View>
            {/*--------------------------------------------Refocus-Button------------------------------------------------------------*/}
            {/*--------------------------------------------Footer-Design-------------------------------------------------------------*/}
            <View className="w-[660px] h-[550px] bg-primary rounded-full justify-center items-center">
                {/*-------------------------------------Bottom-Button-Container------------------------------------------------------*/}
                <View className="w-[100%] h-[15%] absolute top-[12.5%] inset-x-[3.5%] justify-center items-center flex-row gap-x-10">
                    {/*-----------------------------------------Map-Theme-Button------------------------------------------------------*/}
                    <TouchableOpacity onPress={toggleMapThemes} className={`w-16 h-16 ${!showMapThemes ? "bg-primary" : "bg-white"} border-white border-0.5 rounded-full flex-row items-center justify-center`}>
                        <Image 
                            tintColor={!showMapThemes ? "#ffffff" : "#57b378"}
                            source={icons.mapStyle}
                            className="w-8 h-8"
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
                    {/*-----------------------------------------Map-Theme-Button------------------------------------------------------*/}
                    {/*------------------------------------------Traffic-Button-------------------------------------------------------*/}
                    <TouchableOpacity onPress={toggleTraffic} className={`w-16 h-16 ${!showTraffic ? "bg-primary" : "bg-white"} border-white border-0.5 rounded-full flex-row items-center justify-center`}>
                        <Image 
                            tintColor={!showTraffic ? "#ffffff" : "#57b378"}
                            source={icons.traffic}
                            className="w-8 h-8"
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
                    {/*------------------------------------------Traffic-Button-------------------------------------------------------*/}
                    {/*------------------------------------------Markers-Button-------------------------------------------------------*/}
                    <TouchableOpacity onPress={toggleMarkers} className={`w-16 h-16 ${!showMarkers ? "bg-primary" : "bg-white"} border-white border-0.5 rounded-full flex-row items-center justify-center`}>
                        <Image 
                            tintColor={!showMarkers ? "#ffffff" : "#57b378"}
                            source={icons.address}
                            className="w-8 h-8"
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
                    {/*------------------------------------------Markers-Button-------------------------------------------------------*/}
                    {/*------------------------------------------Filters-Button-------------------------------------------------------*/}
                    <TouchableOpacity onPress={toggleFilters} className={`w-16 h-16 ${!showFilters ? "bg-primary" : "bg-white"} border-white border-0.5 rounded-full flex-row items-center justify-center`}>
                        <Image 
                            tintColor={!showFilters ? "#ffffff" : "#57b378"}
                            source={icons.filter}
                            className="w-8 h-8"
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
                    {/*------------------------------------------Filters-Button-------------------------------------------------------*/}
                </View>
            </View>
        </SafeAreaView>
    )
}

export default MapTools;