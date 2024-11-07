import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, TouchableHighlight, TouchableOpacity, Dimensions } from 'react-native';
import Constants from 'expo-constants';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTitle, setTitle } from '../../ToolsContext'

import { icons } from '../../../constants';

const Menu = ({ visible, onClose, respo, changePage, logout }) => {
    const version = Constants.expoConfig?.version || '1.0.0'; // GEOMAP Version
    const { height, width } = Dimensions.get('screen'); // Phone Size
    const [title, setLocalTitle] = useState(getTitle());

    useEffect(() => {
        setLocalTitle(getTitle());
    }, []);

    const handlePress = (page) => {
        setTitle(page);
        setLocalTitle(page);
        changePage(page);
        onClose();
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            backdropColor='black'
            backdropOpacity={0.2}
            hideModalContentWhileAnimating={true}
            backdropTransitionOutTiming={0}
            animationIn="slideInLeft"
            animationOut="fadeOutLeft"
        >
            <SafeAreaView className={`w-[55%] ${height < 900 ? 'h-[114%] top-4' : 'h-[109%] top-3'} -left-5`}>
                {/* Menu Modal */}
                <View className="w-full h-full bg-primary justify-end px-1">
                    {/* Close Menu Button */}
                    <View className={`w-[30%] h-[10%] absolute right-1 ${height < 900 ? 'top-2' : 'top-1'}`}>
                        <TouchableOpacity className="w-full h-full p-2" onPress={onClose}>
                            <Image 
                                tintColor="#ffffff"
                                source={icons.menuBack}
                                className="w-full h-full"
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </View>
                    {/* Menu Buttons Container */}
                    <View className="w-full h-[90%]">
                    {/* Home Button */}
                    <TouchableHighlight
                        underlayColor={title === 'home/homes' ? '#FDFFAE' : '#86ebaa'}
                        className={`w-full h-[7%] ${title === 'home/homes' ? 'bg-white' : 'bg-primary'} rounded-3xl mt-4`}
                        onPress={() => handlePress('home/homes')}
                    >
                        <View className="w-full h-full flex-row">
                        <View className="w-1/3 h-full items-center justify-center">
                            <Image 
                            tintColor={title === 'home/homes' ? '#57b378' : '#ffffff'}
                            source={icons.home}
                            className="w-[40%] h-[40%]"
                            resizeMode='contain'
                            />
                        </View>
                        <View className="w-2/3 h-full justify-center pl-2">
                            <Text className={`font-rmedium text-base ${title === 'home/homes' ? 'text-primary' : 'text-white'}`}>Home</Text>
                        </View>
                        </View>
                    </TouchableHighlight>
                    {/* Account Button */}
                    <TouchableHighlight
                        underlayColor={title === 'home/profiles' ? '#FDFFAE' : '#86ebaa'} 
                        className={`w-full h-[7%] ${title === 'home/profiles' ? 'bg-white' : 'bg-primary'} rounded-3xl mt-2`}
                        onPress={() => handlePress('home/profiles')}
                    >
                        <View className="w-full h-full flex-row">
                        <View className="w-1/3 h-full items-center justify-center">
                            <Image 
                            tintColor={title === 'home/profiles' ? '#57b378' : '#ffffff'}
                            source={icons.profile}
                            className="w-[40%] h-[40%]"
                            resizeMode='contain'
                            />
                        </View>
                        <View className="w-2/3 h-full justify-center pl-2">
                            <Text className={`font-rmedium text-base ${title === 'home/profiles' ? 'text-primary' : 'text-white'}`}>Account</Text>
                        </View>
                        </View>
                    </TouchableHighlight>
                    {/* Map Button */}
                    <TouchableHighlight
                        underlayColor={title === 'home/maps' ? '#FDFFAE' : '#86ebaa'} 
                        className={`w-full h-[7%] ${title === 'home/maps' ? 'bg-white' : 'bg-primary'} rounded-3xl mt-2`}
                        onPress={() => handlePress('home/maps')}
                    >
                        <View className="w-full h-full flex-row">
                        <View className="w-1/3 h-full items-center justify-center">
                            <Image 
                            tintColor={title === 'home/maps' ? '#57b378' : '#ffffff'}
                            source={icons.mapDefault}
                            className="w-[40%] h-[40%]"
                            resizeMode='contain'
                            />
                        </View>
                        <View className="w-2/3 h-full justify-center pl-2">
                            <Text className={`font-rmedium text-base ${title === 'home/maps' ? 'text-primary' : 'text-white'}`}>Map</Text>
                        </View>
                        </View>
                    </TouchableHighlight>
                    {/* Report Button */}
                    <TouchableHighlight
                        underlayColor={title === 'home/reports' ? '#FDFFAE' : '#86ebaa'} 
                        className={`w-full h-[7%] ${title === 'home/reports' ? 'bg-white' : 'bg-primary'} rounded-3xl mt-2`}
                        onPress={() => handlePress('home/reports')}
                    >
                        <View className="w-full h-full flex-row">
                        <View className="w-1/3 h-full items-center justify-center">
                            <Image 
                            tintColor={title === 'home/reports' ? '#57b378' : '#ffffff'}
                            source={icons.report}
                            className="w-[40%] h-[40%]"
                            resizeMode='contain'
                            />
                        </View>
                        <View className="w-2/3 h-full justify-center pl-2">
                            <Text className={`font-rmedium text-base ${title === 'home/reports' ? 'text-primary' : 'text-white'}`}>Report</Text>
                        </View>
                        </View>
                    </TouchableHighlight>
                    {/* Detail Button */}
                    <TouchableHighlight
                        underlayColor={title === 'home/details' ? '#FDFFAE' : '#86ebaa'} 
                        className={`w-full h-[7%] ${title === 'home/details' ? 'bg-white' : 'bg-primary'} rounded-3xl mt-2`}
                        onPress={() => handlePress('home/details')}
                    >
                        <View className="w-full h-full flex-row">
                        <View className="w-1/3 h-full items-center justify-center">
                            <Image 
                            tintColor={title === 'home/details' ? '#57b378' : '#ffffff'}
                            source={icons.details}
                            className="w-[40%] h-[40%]"
                            resizeMode='contain'
                            />
                        </View>
                        <View className="w-2/3 h-full justify-center pl-2">
                            <Text className={`font-rmedium text-base ${title === 'home/details' ? 'text-primary' : 'text-white'}`}>Details</Text>
                        </View>
                        </View>
                    </TouchableHighlight>
                    {respo ? (
                    <>
                        {/* Statistics Button */}
                        <TouchableHighlight
                            underlayColor={title === 'home/statistics' ? '#FDFFAE' : '#86ebaa'} 
                            className={`w-full h-[7%] ${title === 'home/statistics' ? 'bg-white' : 'bg-primary'} rounded-3xl mt-2`}
                            onPress={() => handlePress('home/statistics')}
                        >
                            <View className="w-full h-full flex-row">
                            <View className="w-1/3 h-full items-center justify-center">
                                <Image 
                                tintColor={title === 'home/statistics' ? '#57b378' : '#ffffff'}
                                source={icons.statistics}
                                className="w-[40%] h-[40%]"
                                resizeMode='contain'
                                />
                            </View>
                            <View className="w-2/3 h-full justify-center pl-2">
                                <Text className={`font-rmedium text-base ${title === 'home/statistics' ? 'text-primary' : 'text-white'}`}>Statistics</Text>
                            </View>
                            </View>
                        </TouchableHighlight>
                        {/* Print Button */}
                        <TouchableHighlight
                            underlayColor={title === 'home/documents' ? '#FDFFAE' : '#86ebaa'} 
                            className={`w-full h-[7%] ${title === 'home/documents' ? 'bg-white' : 'bg-primary'} rounded-3xl mt-2`}
                            onPress={() => handlePress('home/documents')}
                        >
                            <View className="w-full h-full flex-row">
                            <View className="w-1/3 h-full items-center justify-center">
                                <Image 
                                tintColor={title === 'home/documents' ? '#57b378' : '#ffffff'}
                                source={icons.prints}
                                className="w-[40%] h-[40%]"
                                resizeMode='contain'
                                />
                            </View>
                            <View className="w-2/3 h-full justify-center pl-2">
                                <Text className={`font-rmedium text-base ${title === 'home/documents' ? 'text-primary' : 'text-white'}`}>Document</Text>
                            </View>
                            </View>
                        </TouchableHighlight>
                    </>) : (<></>)}
                    {/* Help Button */}
                    <TouchableHighlight
                        underlayColor={title === 'home/helps' ? '#FDFFAE' : '#86ebaa'} 
                        className={`w-full h-[7%] ${title === 'home/helps' ? 'bg-white' : 'bg-primary'} rounded-3xl mt-2`}
                        onPress={() => handlePress('home/helps')}
                    >
                        <View className="w-full h-full flex-row">
                        <View className="w-1/3 h-full items-center justify-center">
                            <Image 
                            tintColor={title === 'home/helps' ? '#57b378' : '#ffffff'}
                            source={icons.help}
                            className="w-[40%] h-[40%]"
                            resizeMode='contain'
                            />
                        </View>
                        <View className="w-2/3 h-full justify-center pl-2">
                            <Text className={`font-rmedium text-base ${title === 'home/helps' ? 'text-primary' : 'text-white'}`}>Help</Text>
                        </View>
                        </View>
                    </TouchableHighlight>
                    {/* Bottom Border */}
                    <View className="w-full h-[30%] absolute bottom-0 border-t-0.5 border-white">
                        {/* Settings Button */}
                        <TouchableHighlight
                        underlayColor={title === 'home/settings' ? '#FDFFAE' : '#86ebaa'} 
                        className={`w-full h-[25%] ${title === 'home/settings' ? 'bg-white' : 'bg-primary'} rounded-3xl mt-4`}
                        onPress={() => handlePress('home/settings')}
                        >
                        <View className="w-full h-full flex-row">
                            <View className="w-1/3 h-full items-center justify-center">
                            <Image 
                                tintColor={title === 'home/settings' ? '#57b378' : '#ffffff'}
                                source={icons.settings}
                                className="w-[40%] h-[40%]"
                                resizeMode='contain'
                            />
                            </View>
                            <View className="w-2/3 h-full justify-center pl-2">
                            <Text className={`font-rmedium text-base ${title === 'home/settings' ? 'text-primary' : 'text-white'}`}>Settings</Text>
                            </View>
                        </View>
                        </TouchableHighlight>
                        {/* Logout Button */}
                        <TouchableHighlight
                        underlayColor={'#86ebaa'} 
                        className={`w-full h-[25%] bg-primary rounded-3xl mt-2`}
                        onPress={logout}
                        >
                        <View className="w-full h-full flex-row">
                            <View className="w-1/3 h-full items-center justify-center">
                            <Image 
                                tintColor="#ffffff"
                                source={icons.logOut}
                                className="w-[40%] h-[40%]"
                                resizeMode='contain'
                            />
                            </View>
                            <View className="w-2/3 h-full justify-center pl-2">
                            <Text className="font-rmedium text-base text-white">Logout</Text>
                            </View>
                        </View>
                        </TouchableHighlight>
                        {/* Version Text */}
                        <View className="w-full absolute bottom-4">
                        <Text className="font-rbase text-sm text-white/60 text-center">GEOMAP Version {version}</Text>
                        </View>
                    </View>
                    </View>
                </View>
            </SafeAreaView>
    </Modal>
    )
};

export default Menu;