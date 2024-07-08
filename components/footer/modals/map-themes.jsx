import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import React, { useState, useRef } from 'react';

import { icons } from '../../../constants';

const MapThemes = ({ visible, onClose, visibleTheme, selectedTheme }) => {
      // Style Container
    const [theme, setTheme] = useState('default')
    // Choosing a Map Theme Logic
    const handleThemeSelect = (theme) => {
        setTheme(theme);
    }
    const handleThemeConfirm = (theme) => {
        selectedTheme(theme)
        onClose();
        visibleTheme(false)
    }
    return (
        <Modal
          isVisible={visible}
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
        <SafeAreaView className="absolute -right-5 bottom-[2.5%] w-[112%] h-[100%]">
            <View className="w-full h-[30%] bg-primary pb-14">
              <View className="flex-row items-center pt-4">
                <Text className="font-psemibold text-xl text-white pl-3 py-2">Map Themes</Text>
                <View className="absolute right-4 top-6">
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
                  {/* Default Theme Button */}
                  <TouchableOpacity onPress={() => handleThemeSelect('default')}>
                    <View className="w-20 items-center">
                      <View className={`w-16 h-16 rounded-full ${theme === "default" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                          <Image
                          tintColor={theme === "default" ? null : "#ffffff"}
                          source={icons.mapDefault}
                          className="w-8 h-8"
                          resizeMode='contain'
                          />
                      </View>
                      <Text className={`${theme === "default" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Default</Text>
                      </View>
                  </TouchableOpacity>
                {/* Night Theme Button */}
                <TouchableOpacity onPress={() => handleThemeSelect('night')}>
                    <View className="w-20 items-center">
                      <View className={`w-16 h-16 rounded-full ${theme === "night" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                          <Image
                          tintColor={theme === "night" ? null : "#ffffff"}
                          source={icons.mapNight}
                          className="w-8 h-8"
                          resizeMode='contain'
                          />
                      </View>
                      <Text className={`${theme === "night" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Night</Text>
                      </View>
                  </TouchableOpacity>
                {/* Retro Theme Button */}
                <TouchableOpacity onPress={() => handleThemeSelect('vintage')}>
                    <View className="w-20 items-center">
                      <View className={`w-16 h-16 rounded-full ${theme === "vintage" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                          <Image
                          tintColor={theme === "vintage" ? null : "#ffffff"}
                          source={icons.mapVintage}
                          className="w-8 h-8"
                          resizeMode='contain'
                          />
                      </View>
                      <Text className={`${theme === "vintage" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Vintage</Text>
                      </View>
                  </TouchableOpacity>
                {/* Black and Yellow Theme Button */}
                <TouchableOpacity onPress={() => handleThemeSelect('wasp')}>
                    <View className="w-20 items-center">
                      <View className={`w-16 h-16 rounded-full ${theme === "wasp" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                          <Image
                          tintColor={theme === "wasp" ? null : "#ffffff"}
                          source={icons.mapWasp}
                          className="w-8 h-8"
                          resizeMode='contain'
                          />
                      </View>
                      <Text className={`${theme === "wasp" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Wasp</Text>
                      </View>
                  </TouchableOpacity>
                {/* Elevation Theme Button */}
                <TouchableOpacity onPress={() => handleThemeSelect('elevation')}>
                    <View className="w-20 items-center">
                      <View className={`w-16 h-16 rounded-full ${theme === "elevation" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                          <Image
                          tintColor={theme === "elevation" ? null : "#ffffff"}
                          source={icons.mapElevation}
                          className="w-8 h-8"
                          resizeMode='contain'
                          />
                      </View>
                      <Text className={`${theme === "elevation" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Elevation</Text>
                      </View>
                  </TouchableOpacity>
                {/* Emergency Intensity Map Button */}
                <TouchableOpacity onPress={() => handleThemeSelect('eim')}>
                  <View className="w-26 items-center">
                    <View className={`w-16 h-16 rounded-full ${theme === "eim" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                        <Image
                        tintColor={theme === "eim" ? null : "#ffffff"}
                        source={icons.mapEIM}
                        className="w-8 h-8"
                        resizeMode='contain'
                        />
                    </View>
                    <Text className={`${theme === "eim" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3 text-center`}>Intensity Map</Text>
                    </View>
                </TouchableOpacity>
                </View>
              </ScrollView>
              <View className="border-t-0.5 border-white" />
              <View className="absolute right-4 bottom-2 items-center justify-center">
                <TouchableOpacity onPress={() => handleThemeConfirm(theme)}>
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

export default MapThemes;