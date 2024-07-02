import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

import {icons} from "../../constants"

const Style = ({ visible, onClose, chosenStyle }) => {
    const [style, setStyle] = useState('default');

    const defaultStyle = () => {setStyle('default')}
    const nightStyle = () => {setStyle('night')}
    const retroStyle = () => {setStyle('retro')}
    const waspStyle = () => {setStyle('wasp')}
    const elevationStyle = () => {setStyle('elevation')}
    const eimStyle = () => {setStyle('eim')}

    const handleStyleSelect = (style) => {
        chosenStyle(style);
        onClose
    }

    return (
        <Modal
            isVisible={visible}
            onBackButtonPress={onClose}
            onBackdropPress={onClose}
            backdropColor='black'
            backdropOpacity={0.4}
            hideModalContentWhileAnimating={true}
            backdropTransitionInTiming={0}
            backdropTransitionOutTiming={0}
            animationIn="slideInLeft"
            animationOut="slideOutLeft"
            animationInTiming={400}
            animationOutTiming={500} 
        >
        <SafeAreaView className="absolute -right-5 w-[112%] h-full">
            <View className="w-full h-[27%] bg-primary pb-14">
                <View className="flex-row items-center">
                    <Text className="font-psemibold text-xl text-white pl-3 py-2">Map Styles</Text>
                    <View className="absolute right-4 top-2">
                        <Image
                            tintColor={"#ffffff"}
                            source={icons.mapStyle}
                            className="w-7 h-7"
                            resizeMode='contain'
                            />
                    </View>
                </View> 
                <View className="border-b-0.5 border-white" />
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <View className="justify-center pt-4 flex-row gap-3 px-2">
                    {/* Default Map Button */}
                    <TouchableOpacity onPress={defaultStyle}>
                        <View className="w-20 items-center">
                        <View className={`w-16 h-16 rounded-full ${style === "default" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                            <Image
                            tintColor={style === "default" ? null : "#ffffff"}
                            source={icons.mapDefault}
                            className="w-8 h-8"
                            resizeMode='contain'
                            />
                        </View>
                        <Text className={`${style === "default" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Default</Text>
                        </View>
                    </TouchableOpacity>
                    {/* Night Mode Button */}
                    <TouchableOpacity onPress={nightStyle}>
                        <View className="w-20 items-center">
                        <View className={`w-16 h-16 rounded-full ${style === "night" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                            <Image
                            tintColor={style === "night" ? null : "#ffffff"}
                            source={icons.mapNight}
                            className="w-8 h-8"
                            resizeMode='contain'
                            />
                        </View>
                        <Text className={`${style === "night" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Night</Text>
                        </View>
                    </TouchableOpacity>
                    {/* Retro Mode Button */}
                    <TouchableOpacity onPress={retroStyle}>
                        <View className="w-20 items-center">
                        <View className={`w-16 h-16 rounded-full ${style === "retro" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                            <Image
                            tintColor={style === "retro" ? null : "#ffffff"}
                            source={icons.mapVintage}
                            className="w-8 h-8"
                            resizeMode='contain'
                            />
                        </View>
                        <Text className={`${style === "retro" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Vintage</Text>
                        </View>
                    </TouchableOpacity>
                    {/* Black and Yellow Mode Button */}
                    <TouchableOpacity onPress={waspStyle}>
                        <View className="w-20 items-center">
                        <View className={`w-16 h-16 rounded-full ${style === "wasp" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                            <Image
                            tintColor={style === "wasp" ? null : "#ffffff"}
                            source={icons.mapWasp}
                            className="w-8 h-8"
                            resizeMode='contain'
                            />
                        </View>
                        <Text className={`${style === "wasp" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Wasp</Text>
                        </View>
                    </TouchableOpacity>
                    {/* Elevation Mode Button */}
                    <TouchableOpacity onPress={elevationStyle}>
                        <View className="w-20 items-center">
                        <View className={`w-16 h-16 rounded-full ${style === "elevation" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                            <Image
                            tintColor={style === "elevation" ? null : "#ffffff"}
                            source={icons.mapElevation}
                            className="w-8 h-8"
                            resizeMode='contain'
                            />
                        </View>
                        <Text className={`${style === "elevation" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Elevation</Text>
                        </View>
                    </TouchableOpacity>
                    {/* Emergency Intensity Map Button */}
                    <TouchableOpacity onPress={eimStyle}>
                        <View className="w-26 items-center">
                        <View className={`w-16 h-16 rounded-full ${style === "eim" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                            <Image
                            tintColor={style === "eim" ? null : "#ffffff"}
                            source={icons.mapEIM}
                            className="w-8 h-8"
                            resizeMode='contain'
                            />
                        </View>
                        <Text className={`${style === "eim" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3 text-center`}>Intensity Map</Text>
                        </View>
                    </TouchableOpacity>
                    </View>
                </ScrollView>
                <View className="border-t-0.5 border-white" />
                <View className="absolute right-4 bottom-2 items-center justify-center">
                    <TouchableOpacity onPress={handleStyleSelect(style)}>
                    <View className="bg-white px-8 py-2 rounded-full">
                        <Text className="font-pmedium text-primary text-sm">Apply</Text>
                    </View>
                    </TouchableOpacity>
                 </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export default Style