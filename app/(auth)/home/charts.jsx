import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, BackHandler, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity, ActivityIndicator, LayoutAnimation, Platform, UIManager, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserContext from '../../../components/UserContext';
import { translate } from '../../../components/ToolsContext';
import { Warning, Menu, Response, Arrival, Pins } from '../../../components/modals';

import { images, icons } from '../../../constants';

const ChartScreen = () => {
  const { user, isResponder } = useContext(UserContext); // User Container
  const [isModalVisible, setModalVisible] = useState(false);
  const { width, height } = Dimensions.get('screen'); // Screen Width and Height

  const handleOK = () => {}

  const handleModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
  };

  const [loadingFrameVisible, setLoadingFrameVisible] = useState(true);

  // Enable LayoutAnimation on Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const toggleView = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLoadingFrameVisible(!loadingFrameVisible);
  };

  useEffect(() => {
    // Trigger the first toggle after
    const firstToggle = setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setLoadingFrameVisible(false);
    }, 2000);

    // Cleanup timeouts when the component is unmounted
    return () => {
      clearTimeout(firstToggle);
    };
  }, [loadingFrameVisible]);

  return (
    <SafeAreaView className="w-full h-full bg-primary-100 justify-center items-center">
      <Pins visible={isModalVisible} onClose={closeModal} />
      {/*
        <Image 
          tintColor="#57b378"
          source={icons.success}
          className="w-20 h-20"
          resizeMode='contain'
        />
        <Text className="text-primary text-2xl font-psemibold py-8">Oh Yeah!</Text>
        <Text className="text-slate-500 text-base font-pregular text-center pb-8" numberOfLines={2} ellipsizeMode='tail'>{'You have successfully registered\nand logged in'}</Text>
        <TouchableHighlight className="py-3 px-4 bg-primary rounded-2xl" underlayColor={"#86ebaa"} onPress={handleOK}>
          <Text className="text-white text-base font-pregular text-center">OK</Text>
        </TouchableHighlight>*/}
      <View className="w-20 h-8 bg-orange-400 mt-8">
        <TouchableHighlight underlayColor={"#ffffff"} className="w-full h-full items-center justify-center" onPress={handleModal}>
          <Text className="text-base font-pregular text-white">MODALS</Text>
        </TouchableHighlight>
      </View>
    </SafeAreaView>
  );
};

export default ChartScreen;
