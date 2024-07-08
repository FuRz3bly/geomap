import { View, Text, Image, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

import { icons } from '../../../constants'

const AmenityTools = ({ userLocation, selectedAmenity, toggleAmenity, resetToggleAmenity }) => {
    const navigateAmenity = () => {
        resetToggleAmenity()
        toggleAmenity()
        if (selectedAmenity && userLocation) {
            const originName = encodeURIComponent('Your Location');
            const destinationName = encodeURIComponent(`${selectedAmenity.name} (${selectedAmenity.type})`);
            const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&origin_name=${originName}&destination=${destinationName}&destination_place_id=${selectedAmenity.name}`;
            // Open Google Maps with directions
            Linking.openURL(url).then(() => {
            // Guide the user to follow directions in Google Maps
            // After the user manually closes Google Maps, they will return to your app
            }).catch((err) => {
              console.error('Failed to open Google Maps:', err);
            });
          };
    }
    const closeAmenity = () => {
        resetToggleAmenity()
    }
    return (
        <SafeAreaView className="w-full h-full z-10 -bottom-[10%] items-center justify-center">
            {/*------------------------------------------Navigate-Button-------------------------------------------------------------*/}
            <View className="z-30 absolute inset-0 bottom-[90%] bg-primary border-[10px] border-primary rounded-full">
                <TouchableOpacity className="rounded-full items-center justify-center bg-white pt-4 pr-4 pl-3 pb-3" onPress={navigateAmenity}>
                    <Image 
                        tintColor="#57b378"
                        source={icons.navigate}
                        className="w-14 h-14"
                        resizeMode='contain'
                    /> 
                </TouchableOpacity>
            </View>
            {/*--------------------------------------------Close-Button--------------------------------------------------------------*/}
            <View className="z-30 absolute right-[26%] bottom-[89%] bg-primary border-[10px] border-primary rounded-full">
                <TouchableOpacity onPress={closeAmenity} className='w-12 h-12 bg-white border-white border-0.5 rounded-full flex-row items-center justify-center'>
                        <Image 
                            tintColor={"#57b378"}
                            source={icons.close}
                            className="w-6 h-6"
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
            </View>
            {/*--------------------------------------------Close-Button--------------------------------------------------------------*/}
            {/*------------------------------------------Navigate-Button-------------------------------------------------------------*/}
            <View className="w-[660px] h-[550px] bg-primary rounded-full">
                <View className="w-[60%] h-[0.2%] absolute top-[12%] left-[20%] bg-white" />
                <View className="absolute left-[20%] top-[13%] z-10 w-full">
                {selectedAmenity && (
                    <>  
                        <Text className="font-pbold text-lg text-white pt-3 pl-2">{selectedAmenity.name}</Text>
                        <View className="flex-row pt-3 pb-5">
                            {/*Amenity Type*/}
                            <View className="w-[20%] border-r-2 border-white h-18 pl-3">
                                <View className="flex-col gap-1.5">
                                <Text className="font-pregular text-sm text-white">Type:</Text>
                                <Text className="w-[90%] font-psemibold text-sm text-white">{selectedAmenity.type}</Text>
                                </View>
                            </View>
                            {/* Amenity Type */}
                            <View className="w-[17%] border-r-2 border-white h-18 pl-4">
                                <View className="flex-col gap-1.5">
                                <Text className="font-pregular text-sm text-white">Distance:</Text>
                                <Text className="w-[80%] font-psemibold text-sm text-white">{selectedAmenity.distance} km</Text>
                                </View>
                            </View>
                            {/* Amenity Type */}
                            <View className="w-[40%] border-r-0 border-white h-18 pl-4">
                                <View className="flex-col gap-1.5">
                                <Text className="font-pregular text-sm text-white">Address:</Text>
                                <Text className="w-[53%] font-psemibold text-sm text-white">{selectedAmenity.address}</Text>
                                </View>
                            </View>
                            </View>
                    </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default AmenityTools;