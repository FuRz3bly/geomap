import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, TouchableHighlight, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import Swiper from 'react-native-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons, images } from '../../../constants';

const Exploring = ({ visible, onClose  }) => {
    const [startTutorial, setStartTutorial] = useState(false); // Started Tutorial
    const [selectedTutorial, setSelectedTutorial] = useState('buttons'); // Selected Tutorial - buttons, interfaces
    const buttonSwiperRef = useRef(null); // Reference to Swiper instance

    const interfaceSearchRef = useRef(null);
    const interfaceReportRef = useRef(null);
    const interfaceAmenityRef = useRef(null);
    const interfaceLegendsRef = useRef(null);
    const interfaceIntensityRef = useRef(null);
    const interfaceCategoryRef = useRef(null);

    const [selectedInterface, setSelectedInterface] = useState('search'); // Selected Interface Tutorial - search, report, amenity, legends, intensity, categories
    
    const handleStart = (tutorial) => {
        setSelectedTutorial(tutorial);
        setStartTutorial(true);
    };

    const swipeToPage = (targetIndex) => {
        const currentIndex = buttonSwiperRef.current?.state.index || 0; // Get the current index
        const offset = targetIndex - currentIndex; // Calculate the offset to target index
        buttonSwiperRef.current?.scrollBy(offset, true); // Scroll by the offset
    };

    const changeInterface = (page) => {
        setSelectedInterface(page);
        // Timeout Necessary for Resetting the Swiper Page to 1st Page
        setTimeout(() => {
            if (page === 'search') {
                interfaceSearchRef.current?.scrollTo(0, false);
            } else if (page === 'report') {
                interfaceReportRef.current?.scrollTo(0, false);
            } else if (page === 'amenity') {
                interfaceAmenityRef.current?.scrollTo(0, false);
            } else if (page === 'legends') {
                interfaceLegendsRef.current?.scrollTo(0, false);
            } else if (page === 'intensity') {
                interfaceIntensityRef.current?.scrollTo(0, false);
            } else if (page === 'categories') {
                interfaceCategoryRef.current?.scrollTo(0, false);
            }
        }, 50);
    };

    return (
        <Modal
            isVisible={visible}
            onBackButtonPress={onClose}
            onBackdropPress={onClose}
            backdropColor='black'
            backdropOpacity={0.6}
            hideModalContentWhileAnimating={true}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={600}
            animationOutTiming={1000}
        >
            <SafeAreaView className="items-center justify-center">
                {/* Exploring Map Tutorial */}
                <View className="w-full h-[95%] bg-white items-center justify-center rounded-3xl">
                {!startTutorial ? (
                    <>
                        {/* Back Button */}
                        <TouchableHighlight 
                            className="w-14 h-14 bg-white rounded-full absolute top-1 right-2 z-10 items-center justify-center" 
                            underlayColor={"#86ebaa"} 
                            onPress={onClose}
                        >
                            <Image 
                                source={icons.close}
                                tintColor={'#57b378'}
                                className="w-6 h-6"
                                resizeMode='contain'
                            />
                        </TouchableHighlight>
                        <Swiper
                            dotColor='#e2e8f0'
                            activeDotColor='#57b378'
                            showsPagination={true}
                            autoplay={false}
                            autoplayTimeout={5}
                            loop={false}
                        >
                            <View className="w-full h-full items-center justify-center">
                                <Text className="text-black text-2xl font-pbold absolute top-[10%]" numberOfLines={1} ellipsizeMode='tail'>{'MAP BUTTONS'}</Text>
                                <View className="w-[90%] h-[40%] rounded-2xl overflow-hidden absolute top-[20%]">
                                    <Image 
                                        source={images.mapButtons}
                                        tintColor={'#57b378'}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                </View>
                                <Text className="w-[80%] text-slate-500 text-base font-pregular text-center absolute bottom-[20%]" numberOfLines={3} ellipsizeMode='tail'>
                                    {'Understanding the buttons and their function in the map.'}
                                </Text>
                                <TouchableHighlight className="py-2 px-[15%] bg-primary rounded-3xl absolute bottom-[10%]" underlayColor={"#86ebaa"} onPress={() => handleStart('buttons')}>
                                    <Text className="text-white text-xl font-pregular text-center">{'START'}</Text>
                                </TouchableHighlight>
                            </View>
                            <View className="w-full h-full items-center justify-center">
                                <Text className="text-black text-2xl font-pbold absolute top-[10%]" numberOfLines={1} ellipsizeMode='tail'>{'MAP INTERFACES'}</Text>
                                <View className="w-[77%] h-[40%] rounded-2xl overflow-hidden absolute top-[23%]">
                                    <Image 
                                        source={images.mapInterface}
                                        tintColor={'#57b378'}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                </View>
                                <Text className="w-[80%] text-slate-500 text-base font-pregular text-center absolute bottom-[20%]" numberOfLines={3} ellipsizeMode='tail'>
                                    {'Understanding the interfaces\nof the map.'}
                                </Text>
                                <TouchableHighlight className="py-2 px-[15%] bg-primary rounded-3xl absolute bottom-[10%]" underlayColor={"#86ebaa"} onPress={() => handleStart('interfaces')}>
                                    <Text className="text-white text-xl font-pregular text-center">{'START'}</Text>
                                </TouchableHighlight>
                            </View>
                        </Swiper>
                    </>
                ) : (
                    <>
                    {selectedTutorial === 'buttons' ? (
                        <>
                            {/* Back Button */}
                            <TouchableHighlight 
                                className="w-16 h-12 bg-white rounded-3xl absolute top-1 left-2 z-10 items-center justify-center" 
                                underlayColor={"#86ebaa"} 
                                onPress={() => setStartTutorial(false)}
                            >
                                <Image 
                                    source={icons.back}
                                    tintColor={'#57b378'}
                                    className="w-8 h-8"
                                    resizeMode='contain'
                                />
                            </TouchableHighlight>
                            {/* Other Buttons */}
                            <View className="w-full h-[5%] bg-primary absolute -bottom-4 z-10 flex-row justify-evenly rounded-b-3xl overflow-hidden">
                                {/* Focus */}
                                <View className="w-[11%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => swipeToPage(2)}>
                                        <Image 
                                        source={icons.mapFocus}
                                        tintColor='#ffffff'
                                        className="w-[70%] h-[70%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                                {/* Compass */}
                                <View className="w-[11%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => swipeToPage(3)}>
                                        <Image 
                                        source={icons.compass}
                                        tintColor='#ffffff'
                                        className="w-[70%] h-[70%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                                {/* Traffic */}
                                <View className="w-[11%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => swipeToPage(4)}>
                                        <Image 
                                        source={icons.traffic}
                                        tintColor='#ffffff'
                                        className="w-[80%] h-[80%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                                {/* Search */}
                                <View className="w-[11%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => swipeToPage(6)}>
                                        <Image 
                                        source={icons.findNearest}
                                        tintColor='#ffffff'
                                        className="w-[70%] h-[70%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                                {/* Refresh Map */}
                                <View className="w-[11%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => swipeToPage(7)}>
                                        <Image 
                                        source={icons.refresh}
                                        tintColor='#ffffff'
                                        className="w-[80%] h-[80%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                                {/* Report */}
                                <View className="w-[11%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => swipeToPage(8)}>
                                        <Image 
                                        source={icons.reportHome}
                                        tintColor='#ffffff'
                                        className="w-[80%] h-[80%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                                {/* Legend */}
                                <View className="w-[11%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => swipeToPage(9)}>
                                        <Image 
                                        source={icons.legends}
                                        tintColor='#ffffff'
                                        className="w-[70%] h-[70%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Swiper
                                ref={buttonSwiperRef}
                                dotColor='#e2e8f0'
                                activeDotColor='#57b378'
                                showsPagination={true}
                                autoplay={false}
                                autoplayTimeout={5}
                                loop={false}
                            >
                                {/* Initial Map Page Buttons */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'INITIAL MAP PAGE'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                        <Image 
                                        source={images.e_b_step_01}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                        />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {'This is the initial interface\nof the map page.'}
                                    </Text>
                                </View>
                                {/* All Map Page Buttons */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'ALL BUTTONS'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                        <Image 
                                        source={images.e_b_step_02}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                        />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {'These are the main buttons\nof the map page.'}
                                    </Text>
                                </View>
                                {/* Focus Button */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'FOCUS BUTTON'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                        <Image 
                                        source={images.e_b_step_03}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                        />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"When Focus Button is pressed, the map will move towards the user's location."}
                                    </Text>
                                </View>
                                {/* Compass Button */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'COMPASS BUTTON'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                        <Image 
                                        source={images.e_b_step_04}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                        />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"When Compass Button is pressed, the map will rotate to North."}
                                    </Text>
                                </View>
                                {/* Traffic Button 1/2 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'TRAFFIC BUTTON'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                        <Image 
                                        source={images.e_b_step_05}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                        />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"When Traffic Button is toggled, the map will show the traffic lines."}
                                    </Text>
                                </View>
                                {/* Traffic Button 2/2 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'TRAFFIC BUTTON'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                        <Image 
                                        source={images.e_b_step_06}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                        />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"The map displays the traffic lines on the road."}
                                    </Text>
                                </View>
                                {/* Search Button */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'SEARCH BUTTON'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                        <Image 
                                        source={images.e_b_step_07}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                        />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"When Search Button is pressed, the search interface will be display for sorting and filtering markers."}
                                    </Text>
                                </View>
                                {/* Refresh / Reload Map Button */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'REFRESH BUTTON'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                        <Image 
                                        source={images.e_b_step_08}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                        />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"When Refresh Map Button is pressed, the map will reload."}
                                    </Text>
                                </View>
                                {/* Report Button */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'REPORT BUTTON'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                        <Image 
                                        source={images.e_b_step_09}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                        />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"When Report Button is pressed,\nyou also get's redirected to\nthe Report Page."}
                                    </Text>
                                </View>
                                {/* Legends Button */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'LEGENDS BUTTON'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                        <Image 
                                        source={images.e_b_step_10}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                        />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"When Legends Button is pressed, map options will show such as, legends, intensity map and themes."}
                                    </Text>
                                </View>
                            </Swiper>
                        </>
                    ) : selectedTutorial === 'interfaces' ? (
                        <>
                            {/* Back Button */}
                            <TouchableHighlight 
                                className="w-16 h-12 bg-white rounded-3xl absolute top-1 left-2 z-10 items-center justify-center" 
                                underlayColor={"#86ebaa"} 
                                onPress={() => setStartTutorial(false)}
                            >
                                <Image 
                                source={icons.back}
                                tintColor={'#57b378'}
                                className="w-8 h-8"
                                resizeMode='contain'
                                />
                            </TouchableHighlight>
                            {/* Shortcut Buttons */}
                            <View className="w-full h-[8%] bg-primary absolute -bottom-10 z-10 flex-row justify-evenly rounded-b-3xl overflow-hidden">
                                {/* Search Interface */}
                                <View className="w-[16%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => changeInterface('search')}>
                                        <Image 
                                        source={icons.findNearest}
                                        tintColor={selectedInterface === 'search' ? '#ffffff' : '#bfffd6'}
                                        className="w-[60%] h-[60%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                                {/* Report Interface */}
                                <View className="w-[16%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => changeInterface('report')}>
                                        <Image 
                                        source={icons.reportDashboard}
                                        tintColor={selectedInterface === 'report' ? '#ffffff' : '#bfffd6'}
                                        className="w-[60%] h-[60%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                                {/* Amenity Interface */}
                                <View className="w-[16%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => changeInterface('amenity')}>
                                        <Image 
                                        source={icons.barangayLogo}
                                        tintColor={selectedInterface === 'amenity' ? '#ffffff' : '#bfffd6'}
                                        className="w-[60%] h-[60%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                                {/* Legends Interface */}
                                <View className="w-[16%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => changeInterface('legends')}>
                                        <Image 
                                        source={icons.legends}
                                        tintColor={selectedInterface === 'legends' ? '#ffffff' : '#bfffd6'}
                                        className="w-[60%] h-[60%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                                {/* Intensity Interface */}
                                <View className="w-[16%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => changeInterface('intensity')}>
                                        <Image 
                                        source={icons.intensityMap}
                                        tintColor={selectedInterface === 'intensity' ? '#ffffff' : '#bfffd6'}
                                        className="w-[70%] h-[70%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                                {/* Categories Interface */}
                                <View className="w-[16%] h-full">
                                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => changeInterface('categories')}>
                                        <Image 
                                        source={icons.symbols}
                                        tintColor={selectedInterface === 'categories' ? '#ffffff' : '#bfffd6'}
                                        className="w-[60%] h-[60%]"
                                        resizeMode='contain'
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {/* Search Interface */}
                            {selectedInterface === 'search' ? (
                                <>
                                    <Swiper
                                        ref={interfaceSearchRef}
                                        dotColor='#e2e8f0'
                                        activeDotColor='#57b378'
                                        showsPagination={true}
                                        autoplay={false}
                                        autoplayTimeout={5}
                                        loop={false}
                                    >
                                        {/* Search - Step 01 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'SEARCH INTERFACE'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_01}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {'After pressing the Search Button,\nyou will see this interface and\nutilize it to filter map.'}
                                            </Text>
                                        </View>
                                        {/* Search - Step 02 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'FILTERS'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_02}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {'You can choose filters for\nsearching and map, starting\nwith the Map Filter.'}
                                            </Text>
                                        </View>
                                        {/* Search - Step 03 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'MAP FILTERS'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_03}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {'Toggle report markers by pressing the button where it hides the\nmarker for clarity.'}
                                            </Text>
                                        </View>
                                        {/* Search - Step 04 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'HIDE REPORTS'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_04}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {'Reports made by the user is hidden when Map Filter is toggled.\n'}
                                            </Text>
                                        </View>
                                        {/* Search - Step 05 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'AMENITIES FILTER'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-white border-primary border-[1px] overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_05}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {'Pressing the Amenities displays the Amenity Options, allowing you to select the type of stations.'}
                                            </Text>
                                        </View>
                                        {/* Search - Step 06 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'TOGGLE STATIONS'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-white border-primary border-[1px] overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_06}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {'Uncheck the station type to hide its markers. The maximum number of stations is four (4).'}
                                            </Text>
                                        </View>
                                        {/* Search - Step 07 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'DISPLAY STATIONS'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-white border-primary border-[1px] overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_07}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {'The stations displayed are the four (4) nearest to the user, based on the selected type of station.'}
                                            </Text>
                                        </View>
                                        {/* Search - Step 08 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'FIND NEAREST'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_08}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {'Press this button to search for the nearest station based on the selected type.'}
                                            </Text>
                                        </View>
                                        {/* Search - Step 09 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'FOUND NEAREST'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-white border-primary border-[1px] overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_09}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {"The system automatically finds the nearest station based on the user's location."}
                                            </Text>
                                        </View>
                                        {/* Search - Step 10 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'SEARCH FILTER'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_10}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {"Expand the search categories to include filter results for\nall, reports, and amenities."}
                                            </Text>
                                        </View>
                                        {/* Search - Step 11 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'SEARCH CATEGORY'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_11}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {"Select and apply filters based on the desired results and items to find.\n"}
                                            </Text>
                                        </View>
                                        {/* Search - Step 12 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'INPUT SEARCH'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_12}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {"Input your search criteria and receive results based on\napplied filters.\n"}
                                            </Text>
                                        </View>
                                        {/* Search - Step 13 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'SEARCH RESULTS'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-white border-primary border-[1px] overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_13}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {"View the search results based on the selected filters and most relevant matches according to your input."}
                                            </Text>
                                        </View>
                                        {/* Search - Step 14 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'RECENT SEARCHES'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_14}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {"Previous searches are stored in the Recent tab on the Search page.\n"}
                                            </Text>
                                        </View>
                                        {/* Search - Step 15 */}
                                        <View className="w-full h-full items-center justify-center">
                                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'SAVED STATIONS'}</Text>
                                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                                <Image 
                                                source={images.e_s_step_15}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                                {"Saved stations are stored in the Saved tab in the Search Page.\n"}
                                            </Text>
                                        </View>
                                    </Swiper>
                                </>
                            ) : selectedInterface === 'report' ? (
                                <Swiper
                                    ref={interfaceReportRef}
                                    dotColor='#e2e8f0'
                                    activeDotColor='#57b378'
                                    showsPagination={true}
                                    autoplay={false}
                                    autoplayTimeout={5}
                                    loop={false}
                                >
                                {/* Report - Step 01 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'REPORT INTERFACE'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                        <Image 
                                            source={images.e_r_step_01}
                                            className="w-full h-full"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {'After pressing the report marker, this page will display the report type, status, ID, address, and handler.'}
                                    </Text>
                                </View>
                                {/* Report - Step 02 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'EXPAND REPORT'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                        <Image 
                                            source={images.e_r_step_02}
                                            className="w-full h-full"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"To learn more and view additional details, press the 'More Info' button to be redirected to the Collection Page."}
                                    </Text>
                                </View>
                                {/* Report - Step 03 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'DETAILED REPORT'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-white border-primary border-[1px] overflow-hidden">
                                    <Image 
                                        source={images.e_r_step_03}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"The Collection Page automatically retrieves the report from the database."}
                                    </Text>
                                </View>
                                {/* Report - Step 04 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'FOLLOW UP REPORT'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                    <Image 
                                        source={images.e_r_step_04}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"Press the 'Follow Up' button to send or ping the report to emergency responders for follow-up."}
                                    </Text>
                                </View>
                                </Swiper>
                            ) : selectedInterface === 'amenity' ? (
                                <Swiper
                                    ref={interfaceAmenityRef}
                                    dotColor='#e2e8f0'
                                    activeDotColor='#57b378'
                                    showsPagination={true}
                                    autoplay={false}
                                    autoplayTimeout={5}
                                    loop={false}
                                >
                                    {/* Amenity - Step 01 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'STATION INTERFACE'}</Text>
                                        <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                        <Image 
                                            source={images.e_a_step_01}
                                            className="w-full h-[99%]"
                                            resizeMode='contain'
                                        />
                                        </View>
                                        <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {'After pressing the station marker, this page will display the station name, distance, address and others.'}
                                        </Text>
                                    </View>
                                    {/* Amenity - Step 02 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'SAVE STATION'}</Text>
                                        <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                        <Image 
                                            source={images.e_a_step_01}
                                            className="w-full h-[99%]"
                                            resizeMode='contain'
                                        />
                                        </View>
                                        <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"Press the 'Save' button to save a station in the Saved tab for easy searching and storage."}
                                        </Text>
                                    </View>
                                    {/* Amenity - Step 03 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'CALL STATION'}</Text>
                                        <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                        <Image 
                                            source={images.e_a_step_01}
                                            className="w-full h-[99%]"
                                            resizeMode='contain'
                                        />
                                        </View>
                                        <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"Press this button to call the station, it automatically inputs the number for the phone call."}
                                        </Text>
                                    </View>
                                    {/* Amenity - Step 04 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'SEARCH SIMILAR'}</Text>
                                        <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                        <Image 
                                            source={images.e_a_step_04}
                                            className="w-full h-[99%]"
                                            resizeMode='contain'
                                        />
                                        </View>
                                        <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"Press this button to find and search for similar stations, based on type and service."}
                                        </Text>
                                    </View>
                                    {/* Amenity - Step 05 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'SEARCH SIMILAR'}</Text>
                                        <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                        <Image 
                                            source={images.e_a_step_05}
                                            className="w-full h-[99%]"
                                            resizeMode='contain'
                                        />
                                        </View>
                                        <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"The system automatically inputs the station type of the selected station to find similar stations."}
                                        </Text>
                                    </View>
                                    {/* Amenity - Step 06 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'SHARE STATION'}</Text>
                                        <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                        <Image 
                                            source={images.e_a_step_06}
                                            className="w-full h-[99%]"
                                            resizeMode='contain'
                                        />
                                        </View>
                                        <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"Press this button to share\nthe current selected station with\nGoogle Maps Link."}
                                        </Text>
                                    </View>
                                    {/* Amenity - Step 07 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'SHARED STATION'}</Text>
                                        <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                        <Image 
                                            source={images.e_a_step_07}
                                            className="w-full h-[99%]"
                                            resizeMode='contain'
                                        />
                                        </View>
                                        <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"The system generates a Google Maps Link that can be shared with people."}
                                        </Text>
                                    </View>
                                    {/* Amenity - Step 08 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'OPTIONS'}</Text>
                                        <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                        <Image 
                                            source={images.e_a_step_08}
                                            className="w-full h-[99%]"
                                            resizeMode='contain'
                                        />
                                        </View>
                                        <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"Press the 'Options' button to open and re-route to the Settings Page.\n"}
                                        </Text>
                                    </View>
                                    {/* Amenity - Step 09 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'NAVIGATE'}</Text>
                                        <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                        <Image 
                                            source={images.e_a_step_09}
                                            className="w-full h-[99%]"
                                            resizeMode='contain'
                                        />
                                        </View>
                                        <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"Press the 'Navigate' button to open and get directions with Google Maps.\n"}
                                        </Text>
                                    </View>
                                    {/* Amenity - Step 10 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'NAVIGATION'}</Text>
                                        <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                        <Image 
                                            source={images.e_a_step_10}
                                            className="w-full h-[99%]"
                                            resizeMode='contain'
                                        />
                                        </View>
                                        <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                        {"The system automatically opens and generate path from the user's location to the selected station."}
                                        </Text>
                                    </View>
                                </Swiper>
                            ) : selectedInterface === 'legends' ? (
                                <Swiper
                                    ref={interfaceLegendsRef}
                                    dotColor='#e2e8f0'
                                    activeDotColor='#57b378'
                                    showsPagination={true}
                                    autoplay={false}
                                    autoplayTimeout={5}
                                    loop={false}
                                >
                                {/* Legends - Step 01 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'LEGENDS INTERFACE'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                    <Image 
                                        source={images.e_l_step_01}
                                        className="w-full h-[95%]"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"After pressing the 'Legends' button, this page will display the map legends, themes and intensity map."}
                                    </Text>
                                </View>
                                {/* Legends - Step 02 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'LEGENDS'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                    <Image 
                                        source={images.e_l_step_02}
                                        className="w-full h-[95%]"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"By pressing this button it shows two (2) types of legends. Such as Stations and Reports."}
                                    </Text>
                                </View>
                                {/* Legends - Step 03 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'STATIONS'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                    <Image 
                                        source={images.e_l_step_04}
                                        className="w-full h-[95%]"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"This section displays the Fire, Police Stations, DRRMO and Barangay Hall markers."}
                                    </Text>
                                </View>
                                {/* Legends - Step 04 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'REPORTS'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                    <Image 
                                        source={images.e_l_step_05}
                                        className="w-full h-[95%]"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"This section displays the Fire, Police, Disaster and Barangay related report markers."}
                                    </Text>
                                </View>
                                {/* Legends - Step 05 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'THEMES'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                    <Image 
                                        source={images.e_l_step_06}
                                        className="w-full h-[95%]"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"By pressing this button this\ndisplay template / sample\nthemes for the Map."}
                                    </Text>
                                </View>
                                {/* Legends - Step 06 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'THEMES'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                    <Image 
                                        source={images.e_l_step_07}
                                        className="w-full h-[95%]"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"The available themes for the map are Default, Night, Vintage,\nWasp and Elevation."}
                                    </Text>
                                </View>
                                {/* Legends - Step 07 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'APPLIED THEME'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                    <Image 
                                        source={images.e_l_step_08}
                                        className="w-full h-[95%]"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"Selecting a theme allows you to personalize, map's appearance\nand visual elements."}
                                    </Text>
                                </View>
                                {/* Legends - Step 08 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'INTENSITY MAP'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                    <Image 
                                        source={images.e_l_step_09}
                                        className="w-full h-[95%]"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"Selecting a theme allows you to personalize, map's appearance\nand visual elements."}
                                    </Text>
                                </View>
                                </Swiper>
                            ) : selectedInterface === 'intensity' ? (
                                <Swiper
                                    ref={interfaceIntensityRef}
                                    dotColor='#e2e8f0'
                                    activeDotColor='#57b378'
                                    showsPagination={true}
                                    autoplay={false}
                                    autoplayTimeout={5}
                                    loop={false}
                                >
                                {/* Intensity - Step 01 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'INTENSITY MAP'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                    <Image 
                                        source={images.e_i_step_01}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"This is the initial page of the emergency intensity map (EIM).\n"}
                                    </Text>
                                </View>
                                {/* Intensity - Step 02 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'BUTTONS'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                    <Image 
                                        source={images.e_i_step_02}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"These are the main buttons of the map, return to original map and legends of the intensity map."}
                                    </Text>
                                </View>
                                {/* Intensity - Step 03 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'NOTIFICATION'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                    <Image 
                                        source={images.e_i_step_03}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"When initially opening the map, it sends a notification about nearby dangers and emergency."}
                                    </Text>
                                </View>
                                {/* Intensity - Step 04 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'HEAT SPOTS'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-white border-[1px] border-primary overflow-hidden">
                                    <Image 
                                        source={images.e_i_step_04}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"By pressing heat spots, you can see which cases are in high-risk areas. \n"}
                                    </Text>
                                </View>
                                {/* Intensity - Step 05 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'LEGEND'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                    <Image 
                                        source={images.e_i_step_06}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"Pressing this button displays the legends information page of the intensity map."}
                                    </Text>
                                </View>
                                {/* Intensity - Step 06 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'RETURN TO MAP'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                    <Image 
                                        source={images.e_i_step_07}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"Pressing this closes the intensity map and returns to the\noriginal map."}
                                    </Text>
                                </View>
                                </Swiper>
                            ) : selectedInterface === 'categories' ? (
                                <Swiper
                                    ref={interfaceCategoryRef}
                                    dotColor='#e2e8f0'
                                    activeDotColor='#57b378'
                                    showsPagination={true}
                                    autoplay={false}
                                    autoplayTimeout={5}
                                    loop={false}
                                >
                                {/* Category - Step 01 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'LEGEND CATEGORY'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                    <Image 
                                        source={images.e_c_step_01}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"This is the displays the categories of the heat spots along with their pallete and type."}
                                    </Text>
                                </View>
                                {/* Category - Step 02 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'CATEGORIES'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                    <Image 
                                        source={images.e_c_step_02}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"Pressing this button expands each category to display cases and risk level."}
                                    </Text>
                                </View>
                                {/* Category - Step 03 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'FIRE CATEGORY'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                    <Image 
                                        source={images.e_c_step_03}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"This section displays more information about the high-risk areas on the intensity map."}
                                    </Text>
                                </View>
                                {/* Category - Step 04 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'VISIBILITY'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                    <Image 
                                        source={images.e_c_step_04}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"By toggling the eye button, you can show or hide a specific category on the map."}
                                    </Text>
                                </View>
                                {/* Category - Step 05 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'HIDDEN'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                    <Image 
                                        source={images.e_c_step_05}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"This feature allows customization to visible data, making it easier to focus and minimizes distractions."}
                                    </Text>
                                </View>
                                {/* Category - Step 06 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'CATEGORY SORTING'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                    <Image 
                                        source={images.e_c_step_06}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"Hiding categories allows for a clearer view and helps you focus on the most relevant information."}
                                    </Text>
                                </View>
                                {/* Category - Step 07 */}
                                <View className="w-full h-full items-center justify-center">
                                    <Text className="text-primary text-2xl font-psemibold absolute top-5 pl-3" numberOfLines={1} ellipsizeMode='tail'>{'CATEGORY SORTING'}</Text>
                                    <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                    <Image 
                                        source={images.e_c_step_07}
                                        className="w-full h-full"
                                        resizeMode='contain'
                                    />
                                    </View>
                                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                                    {"Toggling the 'Safety Category' display only specific categories, such as Fire and Traffic."}
                                    </Text>
                                </View>
                                </Swiper>
                            ) : (
                                <></>
                            )}
                        </>
                    ) : (
                        <></>
                    )}
                    </>
                )}
                </View>
            </SafeAreaView>
        </Modal>
    )
};

export default Exploring