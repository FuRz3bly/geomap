import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, BackHandler, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserContext from '../../../components/UserContext';
import { translate } from '../../../components/ToolsContext';
import { Receipt, Menu } from '../../../components/modals';

import { images, icons } from '../../../constants';

const SettingsScreen = () => {
  return (
    <SafeAreaView className="w-full h-full bg-highlight justify-center items-center">
      
    </SafeAreaView>
  );
};

export default SettingsScreen;