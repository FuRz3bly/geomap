import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../constants';
import MenuC from './modals/menu-c'

const MenuBar = ({ screenSelect, newScreen }) => {
    // Menu Components - Set the Visibility to False
    const [isMenuVisible, setMenuVisible] = useState(false)
    // Menu Button Logic
    const toggleMenu = () => {setMenuVisible(!isMenuVisible)}
    // Change Screen Logic
    const [selectedOption, setSelectedOption] = useState('Map');
    // Option Selected From Modal to Menu Bar Page Logic
    const handleOptionSelect = (option) => {
        setSelectedOption(option)
        screenSelect(option)
        setMenuVisible(false)
    };

    useEffect(() => {
        if (newScreen) {
            setSelectedOption(newScreen)
        }
    }, [newScreen])

    return (
        // Header Bar
        <SafeAreaView className="w-full h-[12%] z-10 absolute items-center justify-center bg-primary">
            {/*-----------------------------------------------Title------------------------------------------------------------------*/}
            <View className="absolute top-[70%] inset-0">
                <Text className="text-2xl font-psemibold text-white text-center">{selectedOption}</Text>
            </View>
            {/*-----------------------------------------------Title------------------------------------------------------------------*/}
            {/*-----------------------------------------------Modals-----------------------------------------------------------------*/}
            <View className="absolute">
                <MenuC visible={isMenuVisible} onClose={toggleMenu} onSelect={handleOptionSelect} selectedOption={selectedOption}/>
            </View>
            {/*-----------------------------------------------Modals-----------------------------------------------------------------*/}
            {/*---------------------------------------------Menu-Button--------------------------------------------------------------*/}
            <View className="absolute bottom-[25%] left-[5%]">
                <TouchableOpacity onPress={toggleMenu}>
                    <Image 
                        tintColor="#ffffff"
                        source={icons.menu}
                        className="w-10 h-10"
                        resizeMode='contain'
                    />
                </TouchableOpacity>
            </View>
            {/*-------------------------------------------Top-Left-Button--------------------------------------------------------------*/}
            {selectedOption === 'Account' || selectedOption === 'Report' ? (
                <View className="absolute bottom-[18%] right-[3%]">
                    <TouchableOpacity onPress={() => handleOptionSelect('Settings')}>
                        <View className="w-12 h-12 items-center justify-center rounded-full">
                            <Image 
                                tintColor="#ffffff"
                                source={icons.settings}
                                className="w-8 h-8"
                                resizeMode='contain'
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="absolute bottom-[23%] right-[3%]">
                    <TouchableOpacity onPress={() => handleOptionSelect('Account')}>
                        <View className="w-10 h-10 items-center justify-center pt-1 rounded-full bg-white overflow-hidden border-white border-4">
                            <Image 
                                tintColor="#57b378"
                                source={icons.profile}
                                className="w-7 h-7"
                                resizeMode='contain'
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            )}
            {/*-------------------------------------------Top-Left-Button--------------------------------------------------------------*/}
        </SafeAreaView>
    )
};

export default MenuBar;