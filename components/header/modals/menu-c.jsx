import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

import { icons } from '../../../constants'

export default function MenuC({ visible, onClose, onSelect, selectedOption }) {
    const router = useRouter();
    const closeMenu = () => {onClose()}
    const homeMenu = () => {
        onSelect('Map')
    };
    const accountMenu = () => {
        onSelect('Account')
    };
    const reportMenu = () => {
        onSelect('Report')
    };
    const helpMenu = () => {
        onSelect('Help')
    };
    const aboutMenu = () => {
        onSelect('About Us')
    };
    const settingsMenu = () => {
        onSelect('Settings')
    };
    const logoutMenu = () => {
        router.push('/login')
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
        <SafeAreaView className=" w-[50%] h-[110%] absolute -left-[5.5%] -top-[3%]">
            <View className="h-full bg-primary flex-col pl-2">
                {/*------------------------------------------------Close-Menu-Button-------------------------------------------------*/}
                <TouchableOpacity className="w-20 h-16 z-10 absolute right-2 top-2 justify-center items-center pl-6" onPress={closeMenu}>
                    <Image 
                        tintColor="#ffffff"
                        source={icons.menuBack}
                        className="w-10 h-10"
                        resizeMode='contain'
                    />
                </TouchableOpacity>
                {/*------------------------------------------------Close-Menu-Button-------------------------------------------------*/}
                {/*----------------------------------------------------Map-Button----------------------------------------------------*/}
                <View className="w-full absolute top-[12%] left-[4%] z-10">
                    <TouchableOpacity onPress={homeMenu}>
                        {selectedOption === 'Map' ? (
                        <View className="flex-row items-center bg-white w-[95%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#57b378"
                                source={icons.mapBW}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-primary text-sm pl-5">
                                Map
                            </Text> 
                        </View>
                        ) : (
                        <View className="flex-row items-center bg-primary w-[90%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#ffffff"
                                source={icons.mapBW}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-white text-sm pl-5">
                                Map
                            </Text> 
                        </View>
                        )}
                    </TouchableOpacity>
                </View>
                {/*----------------------------------------------------Map-Button----------------------------------------------------*/}
                {/*-------------------------------------------------Profile-Button---------------------------------------------------*/}
                <View className="w-full absolute top-[18%] left-[4%] z-10">
                    <TouchableOpacity onPress={accountMenu}>
                        {selectedOption === 'Account' ? (
                        <View className="flex-row items-center bg-white w-[95%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#57b378"
                                source={icons.profile}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-primary text-sm pl-5">
                                Account
                            </Text> 
                        </View>
                        ) : (
                        <View className="flex-row items-center bg-primary w-[90%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#ffffff"
                                source={icons.profile}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-white text-sm pl-5">
                                Account
                            </Text> 
                        </View>
                        )}
                    </TouchableOpacity>
                </View>
                {/*-------------------------------------------------Profile-Button---------------------------------------------------*/}
                {/*--------------------------------------------------Report-Button---------------------------------------------------*/}
                <View className="w-full absolute top-[24%] left-[4%] z-10">
                    <TouchableOpacity onPress={reportMenu}>
                        {selectedOption === 'Report' ? (
                        <View className="flex-row items-center bg-white w-[95%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#57b378"
                                source={icons.report}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-primary text-sm pl-5">
                                Report
                            </Text> 
                        </View>
                        ) : (
                        <View className="flex-row items-center bg-primary w-[90%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#ffffff"
                                source={icons.report}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-white text-sm pl-5">
                                Report
                            </Text> 
                        </View>
                        )}
                    </TouchableOpacity>
                </View>
                {/*--------------------------------------------------Report-Button---------------------------------------------------*/}
                {/*---------------------------------------------------Help-Button----------------------------------------------------*/}
                <View className="w-full absolute top-[30%] left-[4%] z-10">
                    <TouchableOpacity onPress={helpMenu}>
                        {selectedOption === 'Help' ? (
                        <View className="flex-row items-center bg-white w-[95%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#57b378"
                                source={icons.help}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-primary text-sm pl-5">
                                Help
                            </Text> 
                        </View>
                        ) : (
                        <View className="flex-row items-center bg-primary w-[90%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#ffffff"
                                source={icons.help}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-white text-sm pl-5">
                                Help
                            </Text> 
                        </View>
                        )}
                    </TouchableOpacity>
                </View>
                {/*---------------------------------------------------Help-Button----------------------------------------------------*/}
                {/*-------------------------------------------------About-Us-Button--------------------------------------------------*/}
                <View className="w-full absolute top-[36%] left-[4%] z-10">
                    <TouchableOpacity onPress={aboutMenu}>
                        {selectedOption === 'About Us' ? (
                        <View className="flex-row items-center bg-white w-[95%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#57b378"
                                source={icons.aboutUs}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-primary text-sm pl-5">
                                About Us
                            </Text> 
                        </View>
                        ) : (
                        <View className="flex-row items-center bg-primary w-[90%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#ffffff"
                                source={icons.aboutUs}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-white text-sm pl-5">
                                About Us
                            </Text> 
                        </View>
                        )}
                    </TouchableOpacity>
                </View>
                {/*-------------------------------------------------About-Us-Button--------------------------------------------------*/}
                {/*------------------------------------------------------Border------------------------------------------------------*/}
                <View className="h-[0.1%] w-[90%] z-10 absolute bottom-[26%] left-[7%] bg-white"/>
                {/*------------------------------------------------------Border------------------------------------------------------*/}

                {/*-------------------------------------------------Settings-Button--------------------------------------------------*/}
                <View className="w-full absolute bottom-[18%] left-[4%] z-10">
                    <TouchableOpacity onPress={settingsMenu}>
                        {selectedOption === 'Settings' ? (
                        <View className="flex-row items-center bg-white w-[95%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#57b378"
                                source={icons.settings}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-primary text-sm pl-5">
                                Settings
                            </Text> 
                        </View>
                        ) : (
                        <View className="flex-row items-center bg-primary w-[90%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#ffffff"
                                source={icons.settings}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-white text-sm pl-5">
                                Settings
                            </Text> 
                        </View>
                        )}
                    </TouchableOpacity>
                </View>
                {/*-------------------------------------------------Settings-Button--------------------------------------------------*/}
                {/*--------------------------------------------------Logout-Button---------------------------------------------------*/}
                <View className="w-full absolute bottom-[10%] left-[4%] z-10">
                    <TouchableOpacity onPress={logoutMenu}>
                        <View className="flex-row items-center bg-primary w-[95%] h-10 rounded-full pl-3">
                            <Image 
                                tintColor="#ffffff"
                                source={icons.logOut}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-white text-sm pl-5">
                                Logout
                            </Text> 
                        </View>
                    </TouchableOpacity>
                </View>
                {/*--------------------------------------------------Logout-Button---------------------------------------------------*/}
                {/*-------------------------------------------------GEOMAP-VERSION---------------------------------------------------*/}
                <View className="w-full absolute bottom-[3%] left-[4%] z-10">
                    <Text className="font-pregular text-white opacity-50 text-xs pl-2">{"GEOMAP Version 1.0.0.54"}</Text>
                </View>
                {/*-------------------------------------------------GEOMAP-VERSION---------------------------------------------------*/}
            </View>
        </SafeAreaView>
    </Modal>
  );
}