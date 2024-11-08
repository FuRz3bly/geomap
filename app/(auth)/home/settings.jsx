import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, BackHandler, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserContext from '../../../components/UserContext';
import { translate } from '../../../components/ToolsContext';
import { Receipt, Menu } from '../../../components/modals';

import { images, icons } from '../../../constants';

const SettingsScreen = ({ changePage, backPage }) => {
  // Allow the back button action when the component is mounted
  useEffect(() => {
    const backAction = () => {
        //changePage('home/homes');
        backPage();
        return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    // Cleanup the event listener when the component unmounts
    return () => backHandler.remove();
  }, []);
  
  return (
    <SafeAreaView className="w-full h-full bg-primary justify-center items-center">
      <View className="w-full h-full bg-white">
        <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
          {/* Category Title */}
          <View className="w-full h-16 justify-center">
            <Text className="font-pmedium text-xl text-slate-500 pt-[5%] pb-[3%] px-6">{'GENERAL'}</Text>
          </View>
          {/* Menu Sounds */}
          <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.soundOff}
                className="w-[40%] h-[40%]"
                resizeMode='contain'
              />
            </View>
            <View className="w-[70%] py-4 justify-center">
              <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Menu Sounds'}</Text>
            </View>
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#57b378'
                source={icons.toggleOn}
                className="w-[80%] h-[80%]"
                resizeMode='contain'
              />
            </View> 
          </View>
          {/* Category Title */}
          <View className="w-full h-16 justify-center">
            <Text className="font-pmedium text-xl text-slate-500 py-[3%] px-6">{'PERMISSIONS'}</Text>
          </View>
          {/* Location Permission */}
          <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.locationOff}
                className="w-[40%] h-[40%]"
                resizeMode='contain'
              />
            </View>
            <View className="w-[70%] py-4 justify-center">
              <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Location'}</Text>
            </View>
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.toggleOff}
                className="w-[80%] h-[80%]"
                resizeMode='contain'
              />
            </View> 
          </View>
          {/* Camera Permission */}
          <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.cameraOff}
                className="w-[40%] h-[40%]"
                resizeMode='contain'
              />
            </View>
            <View className="w-[70%] py-4 justify-center">
              <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Camera'}</Text>
            </View>
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.toggleOff}
                className="w-[80%] h-[80%]"
                resizeMode='contain'
              />
            </View> 
          </View>
          {/* Media Permission */}
          <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.mediaOff}
                className="w-[40%] h-[40%]"
                resizeMode='contain'
              />
            </View>
            <View className="w-[70%] py-4 justify-center">
              <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Media'}</Text>
            </View>
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.toggleOff}
                className="w-[80%] h-[80%]"
                resizeMode='contain'
              />
            </View> 
          </View>
          {/* Notification Permission */}
          <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.notificationOff}
                className="w-[40%] h-[40%]"
                resizeMode='contain'
              />
            </View>
            <View className="w-[70%] py-4 justify-center">
              <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Notifications'}</Text>
            </View>
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.toggleOff}
                className="w-[80%] h-[80%]"
                resizeMode='contain'
              />
            </View> 
          </View>
          {/* Category Title */}
          <View className="w-full h-16 justify-center">
            <Text className="font-pmedium text-xl text-slate-500 py-[3%] px-6">{'HELP & SUPPORT'}</Text>
          </View>
          {/* FAQ */}
          <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.faq}
                className="w-[40%] h-[40%]"
                resizeMode='contain'
              />
            </View>
            <View className="w-[70%] py-4 justify-center">
              <Text className="font-rbase text-base text-slate-500 left-[5%]">{'FAQ'}</Text>
            </View>
            <View className="w-[15%] items-end justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.nextBtn}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
              />
            </View> 
          </View>
          {/* Contact US */}
          <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.support}
                className="w-[50%] h-[50%]"
                resizeMode='contain'
              />
            </View>
            <View className="w-[70%] py-4 justify-center">
              <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Contact Us'}</Text>
            </View>
            <View className="w-[15%] items-end justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.nextBtn}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
              />
            </View> 
          </View>
          {/* Send Feedback */}
          <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.sendFeedback}
                className="w-[40%] h-[40%]"
                resizeMode='contain'
              />
            </View>
            <View className="w-[70%] py-4 justify-center">
              <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Send Feedback'}</Text>
            </View>
            <View className="w-[15%] items-end justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.nextBtn}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
              />
            </View> 
          </View>
          {/* Category Title */}
          <View className="w-full h-16 justify-center">
            <Text className="font-pmedium text-xl text-slate-500 py-[3%] px-6">{'ABOUT'}</Text>
          </View>
          {/* About Us */}
          <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.aboutUsOff}
                className="w-[50%] h-[50%]"
                resizeMode='contain'
              />
            </View>
            <View className="w-[70%] py-4 justify-center">
              <Text className="font-rbase text-base text-slate-500 left-[5%]">{'About Us'}</Text>
            </View>
            <View className="w-[15%] items-end justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.nextBtn}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
              />
            </View> 
          </View>
          {/* Version Information */}
          <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.information}
                className="w-[40%] h-[40%]"
                resizeMode='contain'
              />
            </View>
            <View className="w-[70%] py-4 justify-center">
              <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Version Information'}</Text>
            </View>
            <View className="w-[15%] items-end justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.nextBtn}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
              />
            </View> 
          </View>
          {/* Terms and Conditions */}
          <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.terms}
                className="w-[40%] h-[40%]"
                resizeMode='contain'
              />
            </View>
            <View className="w-[70%] py-4 justify-center">
              <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Terms and Conditions'}</Text>
            </View>
            <View className="w-[15%] items-end justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.nextBtn}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
              />
            </View> 
          </View>
          {/* Credits */}
          <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
            <View className="w-[15%] items-center justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.legends}
                className="w-[40%] h-[40%]"
                resizeMode='contain'
              />
            </View>
            <View className="w-[70%] py-4 justify-center">
              <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Credits'}</Text>
            </View>
            <View className="w-[15%] items-end justify-center">
              <Image 
                tintColor='#64748b'
                source={icons.nextBtn}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
              />
            </View> 
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;