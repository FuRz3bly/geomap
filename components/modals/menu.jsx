import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

import { icons } from '../../constants'

export default function Menu({ visible, onClose }) {
    const [option, setOption] = useState('op1');
    const router = useRouter();

    const homeMenu = () => {
        setOption('op1')
        router.push('home/map')
    };

    const accountMenu = () => {
        setOption('op2')
        router.push('home/profile')
    };

    const reportMenu = () => {
        setOption('op3')
        router.push('home/report/prelim-report')
    };

    const helpMenu = () => {
        setOption('op4')
        router.push('home/help')
    };

    const aboutMenu = () => {
        setOption('op5')
        router.push('home/about-us')
    };

    const settingsMenu = () => {
        setOption('op6')
        router.push('home/settings')
    };

    const logoutMenu = () => {
        setOption('op7')
        router.push('/')
    };

    return (
    <Modal
        isVisible={visible}
        onBackdropPress={onClose}
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
    >
        <SafeAreaView className="h-full absolute -inset-y-6 -left-5 w-[62%]">
            <View className="h-10 bg-primary"></View>
            <View className="h-full bg-primary flex-col pl-5">
                {/* Close Menu Button */}
                <TouchableOpacity onPress={onClose}>
                    <View className="absolute right-4 top-0">
                            <View>
                                <Image 
                                    tintColor="#ffffff"
                                    source={icons.menuBack}
                                    className="w-8 h-8"
                                    resizeMode='contain'
                                />
                            </View>
                    </View>
                </TouchableOpacity>

                {/* Home Button */}
                <View className="pt-16"></View>
                <TouchableOpacity onPress={homeMenu}>
                    {option === 'op1' ? (
                    <View className="flex-row items-center bg-white w-[95%] h-10 rounded-full pl-3">
                        <Image 
                            tintColor="#57b378"
                            source={icons.home}
                            className="w-5 h-5"
                            resizeMode='contain'
                        />
                        <Text className="font-psemibold text-primary text-sm pl-5">
                            Home
                        </Text> 
                    </View>
                    ) : (
                    <View className="flex-row items-center bg-primary w-[90%] h-10 rounded-full pl-3">
                        <Image 
                            tintColor="#ffffff"
                            source={icons.home}
                            className="w-5 h-5"
                            resizeMode='contain'
                        />
                        <Text className="font-psemibold text-white text-sm pl-5">
                            Home
                        </Text> 
                    </View>
                    )}
                </TouchableOpacity>

                {/* Profile Button */}
                <View className="pt-4"></View>
                <TouchableOpacity onPress={accountMenu}>
                    {option === 'op2' ? (
                    <View className="flex-row items-center bg-white w-[95%] h-10 rounded-full pl-2">
                        <Image 
                            tintColor="#57b378"
                            source={icons.profileBorder}
                            className="w-5 h-5"
                            resizeMode='contain'
                        />
                        <Text className="font-psemibold text-primary text-sm pl-4">
                            Account
                        </Text> 
                    </View>
                    ) : (
                    <View className="flex-row items-center bg-primary w-[90%] h-10 rounded-full pl-2">
                        <Image 
                            tintColor="#ffffff"
                            source={icons.profileBorder}
                            className="w-5 h-5"
                            resizeMode='contain'
                        />
                        <Text className="font-psemibold text-white text-sm pl-4">
                            Account
                        </Text> 
                    </View>
                        )}
                    </TouchableOpacity>

                {/* Report Button */}
                <View className="pt-4"></View>
                <TouchableOpacity onPress={reportMenu}>
                    {option === 'op3' ? (
                    <View className="flex-row items-center bg-white w-[95%] h-10 rounded-full pl-2">
                        <Image 
                            tintColor="#57b378"
                            source={icons.report}
                            className="w-5 h-5"
                            resizeMode='contain'
                        />
                        <Text className="font-psemibold text-primary text-sm pl-4">
                            Report
                        </Text> 
                    </View>
                    ) : (
                    <View className="flex-row items-center bg-primary w-[90%] h-10 rounded-full pl-2">
                        <Image 
                            tintColor="#ffffff"
                            source={icons.report}
                            className="w-5 h-5"
                            resizeMode='contain'
                        />
                        <Text className="font-psemibold text-white text-sm pl-4">
                            Report
                        </Text> 
                    </View>
                    )}
                </TouchableOpacity>

                {/* Help Button */}
                <View className="pt-4"></View>
                <TouchableOpacity onPress={helpMenu}>
                    {option === 'op4' ? (
                    <View className="flex-row items-center bg-white w-[95%] h-10 rounded-full pl-2">
                        <Image 
                            tintColor="#57b378"
                            source={icons.help}
                            className="w-6 h-5"
                            resizeMode='contain'
                        />
                        <Text className="font-psemibold text-primary text-sm pl-4">
                            Help
                        </Text> 
                    </View>
                    ) : (
                    <View className="flex-row items-center bg-primary w-[90%] h-10 rounded-full pl-2">
                        <Image 
                            tintColor="#ffffff"
                            source={icons.help}
                            className="w-6 h-5"
                            resizeMode='contain'
                        />
                        <Text className="font-psemibold text-white text-sm pl-4">
                            Help
                        </Text> 
                    </View>
                    )}
                </TouchableOpacity>

                {/* About Us Button */}
                <View className="pt-4"></View>
                <TouchableOpacity onPress={aboutMenu}>
                    {option === 'op5' ? (
                    <View className="flex-row items-center bg-white w-[95%] h-10 rounded-full pl-2">
                        <Image 
                            tintColor="#57b378"
                            source={icons.aboutUs}
                            className="w-5 h-5"
                            resizeMode='contain'
                        />
                        <Text className="font-psemibold text-primary text-sm pl-4">
                            About Us
                        </Text> 
                    </View>
                    ) : (
                    <View className="flex-row items-center bg-primary w-[90%] h-10 rounded-full pl-2">
                        <Image 
                            tintColor="#ffffff"
                            source={icons.aboutUs}
                            className="w-5 h-5"
                            resizeMode='contain'
                        />
                        <Text className="font-psemibold text-white text-sm pl-4">
                        About Us
                        </Text> 
                    </View>
                    )}
                </TouchableOpacity>

                {/* Bottom Bar */}
                <View className="absolute bottom-6 left-5 w-full">
                    <View className="border-t border-white pb-10 w-[75%] opacity-75"></View>

                    {/* Settings Button */}
                    <TouchableOpacity onPress={settingsMenu}>
                        {option === 'op6' ? (
                        <View className="flex-row items-center bg-white w-[85%] h-10 rounded-full pl-2">
                            <Image 
                                tintColor="#57b378"
                                source={icons.settings}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-primary text-sm pl-4">
                                Settings
                            </Text> 
                        </View>
                        ) : (
                        <View className="flex-row items-center bg-primary w-[85%] h-10 rounded-full pl-2">
                            <Image 
                                tintColor="#ffffff"
                                source={icons.settings}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-white text-sm pl-4">
                                Settings
                            </Text> 
                        </View>
                        )}
                    </TouchableOpacity>
                    <View className="pb-4"></View>

                    {/* Logout Button */}
                    <TouchableOpacity onPress={logoutMenu}>
                        <View className="flex-row items-center bg-primary w-[85%] h-10 rounded-full pl-2">
                            <Image 
                                tintColor="#ffffff"
                                source={icons.logOut}
                                className="w-5 h-5"
                                resizeMode='contain'
                            />
                            <Text className="font-psemibold text-white text-sm pl-4">
                                Logout
                            </Text> 
                        </View>
                    </TouchableOpacity>
                    <View className="pb-8"></View>
                    <Text className="font-pregular text-white opacity-50 text-xs pl-2">
                        GEOMAP Version 1.0.0.26
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    </Modal>
  );
}