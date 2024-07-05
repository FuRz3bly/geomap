import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "../../../../constants";
import { images } from "../../../../constants";
import { router } from "expo-router";

const SignupV = () => {
  return (
    <SafeAreaView className="bg-white h-full items-center justify-center">
        <View className="inset-x-0 top-20">
            <Image
              source={images.title_b}
              className="w-[245 px] h-[64px]"
              resizeMode="contain"
            />
          </View>
      <View className="w-full items-center justify-center min-h-[100vh]">
        <View className="items-center">
          <Image
            source={icons.verified}
            tintColor={"#57b378"}
            className="w-[100px] h-[100px]"
            resizeMode="contain"
          />
          <Text className="font-psemibold text-2xl pt-7 text-center">
            Account Verification{"\n"}Successful
          </Text>
        </View>
      </View>
      <TouchableOpacity className="w-56 h-16 absolute bottom-4 right-4 bg-primary items-center justify-center rounded-xl mt-2" onPress={() => {router.push("home/geolocation/map-c")}}>
        <Text className="text-white font-pbold text-2xl pl-4">PROCEED {"   >"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SignupV;
