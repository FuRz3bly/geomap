import { View, Text, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { icons } from '../../constants';

const UserRegistration = () => {
    const community = () => {router.push("register/community/signup-personal")};
    const responder = () => {router.push("register/responder/signup-personal")};

  return (
    <SafeAreaView className="bg-white items-center justify-center h-full w-full">
        <Swiper loop={false} horizontal={true} index={0} showsPagination={true} activeDotColor='#57b378' dotColor='#bfffd6'>
            {/* Community User Page */}
            <View className="w-full h-full items-center">
                {/* Icon and Text Container */}
                <View className="absolute top-[15%] items-center">
                    {/* Community Icon */}
                    <View className="w-[250px] h-[250px] rounded-full justify-center items-center overflow-hidden">
                        <Image
                            source={icons.community}
                            tintColor={"#57b378"}
                            className="w-[250px] h-[255px]"
                            resizeMode="contain"
                        />
                    </View>
                    {/* Community User */}
                    <View className="py-[25%]">
                        <Text className="text-center text-primary text-2xl font-pbold">Community{"\n"}User</Text>
                    </View>
                    {/* Role and Description */}
                    <View className="items-center justify-center">
                        <Text className="text-center text-slate-400 text-xl font-pregular">You will report{"\n"}emergencies to{"\n"}responders directly.</Text>
                    </View>
                </View>
                {/* Apply Button */}
                <View className="absolute bottom-[7%] w-full items-center justify-center">
                    <TouchableOpacity className="w-2/3 h-12 bg-primary rounded-full items-center justify-center" onPress={community}>
                        <Text className="text-center text-white font-psemibold text-xl">Apply</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* Responder Page */}
            <View className="w-full h-full items-center">
                {/* Icon and Text Container */}
                <View className="absolute top-[15%] items-center">
                    {/* Responder Icon */}
                    <View className="w-[250px] h-[250px] rounded-full justify-center items-center overflow-hidden">
                        <Image
                            source={icons.responder}
                            tintColor={"#57b378"}
                            className="w-[250px] h-[250px]"
                            resizeMode="contain"
                        />
                    </View>
                    {/* Emergency Responder */}
                    <View className="py-[25%]">
                        <Text className="text-center text-primary text-2xl font-pbold">Emergency{"\n"}Responder</Text>
                    </View>
                    {/* Role and Description */}
                    <View className="items-center justify-center">
                        <Text className="text-center text-slate-400 text-xl font-pregular">You will receive and{"\n"}respond to emergencies{"\n"}reported.</Text>
                    </View>
                </View>
                {/* Apply Button */}
                <View className="absolute bottom-[7%] w-full items-center justify-center">
                    <TouchableOpacity className="w-2/3 h-12 bg-primary rounded-full items-center justify-center" onPress={responder}>
                        <Text className="text-center text-white font-psemibold text-xl">Apply</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Swiper>
        <StatusBar backgroundColor='#ffffff' style={'dark'} />
    </SafeAreaView>
  )
}

export default UserRegistration