import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, BackHandler, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserContext from '../../../components/UserContext';
import { translate } from '../../../components/ToolsContext';
import { Receipt, Menu } from '../../../components/modals';

import { images, icons } from '../../../constants';

const HelpScreen = () => {
  return (
    <SafeAreaView className="w-full h-full bg-violet-500 justify-center items-center">
      <View className="w-full h-full bg-orange-400">
        <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HelpScreen;