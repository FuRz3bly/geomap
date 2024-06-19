import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from "../../../../constants";
import { images } from "../../../../constants";
import { router } from "expo-router";

const FinishReport = () => {
  return (
    <SafeAreaView className="bg-white h-full items-center justify-center">
            {/* Title Container */}
          <View className="absolute inset-x-0 top-40 h-[20%] w-full justify-center bg-white z-10">
            {/* Title */}
            <View className="items-center">
              <Image
                source={images.title_b}
                className="w-[250 px] h-[70px]"
                resizeMode="contain"
              />
            </View>
            <View className="absolute inset-0 left-6 top-[126px] bg-primary h-1 w-[88%] items-center"></View>
            {/* Page Indicators */}
            <View className="pt-4 flex-row gap-40 items-center justify-center bottom-0">
              <View className="bg-primary h-4 w-4 rounded-full justify-center items-center">
              </View>
              <View className="bg-primary h-4 w-4 rounded-full justify-center items-center">
              </View>
              <View className="bg-white border-primary border-double border-4 h-4 w-4 rounded-full justify-center items-center">
              </View>
            </View>
          </View>
      <View className="pt-12 w-full items-center justify-center min-h-[100vh]">
        <View className="items-center">
          <Image
            source={icons.verified}
            tintColor={"#57b378"}
            className="w-[100px] h-[100px]"
            resizeMode="contain"
          />
          <Text className="font-pbold text-3xl pt-10 text-center">
            Emergency{"\n"}Reported{"\n"}Sucessfully
          </Text>
        </View>
      </View>
      <TouchableOpacity className="w-56 h-16 absolute bottom-4 right-4 bg-primary items-center justify-center rounded-xl mt-2" onPress={() => {router.push("home/map")}}>
        <Text className="text-white font-pbold text-2xl pl-4">PROCEED {"   >"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default FinishReport