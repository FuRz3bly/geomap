import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, BackHandler, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity, ActivityIndicator, LayoutAnimation, Platform, UIManager, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserContext from '../../../components/UserContext';
import { translate } from '../../../components/ToolsContext';
import { Warning, Menu, Response, Arrival, Pins, Exploring } from '../../../components/modals';

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
      <Exploring visible={isModalVisible} onClose={closeModal} />
      {/* Modal Button */}
      <View className="w-20 h-8 bg-orange-400 mt-8">
        <TouchableHighlight underlayColor={"#ffffff"} className="w-full h-full items-center justify-center" onPress={handleModal}>
          <Text className="text-base font-pregular text-white">MODALS</Text>
        </TouchableHighlight>
      </View>
    </SafeAreaView>
  );
};

export default ChartScreen;
