import React, { useEffect, useContext, useState } from 'react';
import { View, Image, Text, TouchableHighlight } from 'react-native';
import Modal from 'react-native-modal';
import Swiper from 'react-native-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { images } from '../../../constants';

const Reporting = ({ visible, onClose }) => {
    return (
        <Modal
            isVisible={visible}
            onBackButtonPress={onClose}
            onBackdropPress={onClose}
            backdropColor='black'
            backdropOpacity={0.6}
            hideModalContentWhileAnimating={true}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={600}
            animationOutTiming={1000}
        >
            <SafeAreaView className="items-center justify-center">
                {/* Emergency Reporting Tutorial */}
                <View className="w-full h-[95%] bg-white items-center justify-center rounded-3xl overflow-hidden">
                    <Swiper
                        dotColor='#e2e8f0'
                        activeDotColor='#57b378'
                        showsPagination={true}
                        autoplay={false}
                        autoplayTimeout={5}
                        loop={false}
                    >
                        {/* Step 01 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 01 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 01/13'}</Text>
                            {/* Image Step 01 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                                <Image 
                                    source={images.r_step_01}
                                    className="w-full h-full"
                                    resizeMode='contain'
                                />
                            </View>
                            {/* Step 01 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                            {'Begin by pressing the report button from the home page.'}
                            </Text>
                        </View>
                        {/* Step 02 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 02 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 02/13'}</Text>
                            {/* Image Step 02 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                            <Image 
                                source={images.r_step_02}
                                className="w-full h-full"
                                resizeMode='contain'
                            />
                            </View>
                            {/* Step 02 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                            {'On the Report Page, start by toggling the Type of the Emergency dropdown button.'}
                            </Text>
                        </View>
                        {/* Step 03 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 03 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 03/13'}</Text>
                            {/* Image Step 03 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-white overflow-hidden border-primary border-[1px]">
                            <Image 
                                source={images.r_step_03}
                                className="w-full h-full"
                                resizeMode='contain'
                            />
                            </View>
                            {/* Step 03 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                            {'Select the Type of the Emergency from the available options.'}
                            </Text>
                        </View>
                        {/* Step 04 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 04 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 04/13'}</Text>
                            {/* Image Step 04 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-white overflow-hidden border-primary border-[1px]">
                            <Image 
                                source={images.r_step_04}
                                className="w-full h-full"
                                resizeMode='contain'
                            />
                            </View>
                            {/* Step 04 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                            {'After selecting the type, you can choose your preferred method of contact by toggling this dropdown.'}
                            </Text>
                        </View>
                        {/* Step 05 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 05 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 05/13'}</Text>
                            {/* Image Step 05 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-white overflow-hidden border-primary border-[1px]">
                            <Image 
                                source={images.r_step_05}
                                className="w-full h-full"
                                resizeMode='contain'
                            />
                            </View>
                            {/* Step 05 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                            {'Choose your preferred method of contact by selecting from the following options.'}
                            </Text>
                        </View>
                        {/* Step 06 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 06 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 06/13'}</Text>
                            {/* Image Step 06 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-white overflow-hidden border-primary border-[1px]">
                            <Image 
                                source={images.r_step_06}
                                className="w-full h-full"
                                resizeMode='contain'
                            />
                            </View>
                            {/* Step 06 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                            {'Select the appropriate time the emergency occurred from the provided options.'}
                            </Text>
                        </View>
                        {/* Step 07 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 07 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 07/13'}</Text>
                            {/* Image Step 07 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-white overflow-hidden border-primary border-[1px]">
                            <Image 
                                source={images.r_step_07}
                                className="w-full h-full"
                                resizeMode='contain'
                            />
                            </View>
                            {/* Step 07 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                            {'Specify the type of assistance required by selecting the appropriate service(s).'}
                            </Text>
                        </View>
                        {/* Step 08 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 08 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 08/13'}</Text>
                            {/* Image Step 08 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-white overflow-hidden border-primary border-[1px]">
                            <Image 
                                source={images.r_step_08}
                                className="w-full h-full"
                                resizeMode='contain'
                            />
                            </View>
                            {/* Step 08 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                            {'Enable the camera by toggling the button.'}
                            </Text>
                        </View>
                        {/* Step 09 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 09 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 09/13'}</Text>
                            {/* Image Step 09 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                            <Image 
                                source={images.r_step_09}
                                className="w-full h-full"
                                resizeMode='contain'
                            />
                            </View>
                            {/* Step 09 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                            {'Capture an evidence / image of the emergency for the report.'}
                            </Text>
                        </View>
                        {/* Step 10 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 10 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 10/13'}</Text>
                            {/* Image Step 10 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-white overflow-hidden border-primary border-[1px]">
                            <Image 
                                source={images.r_step_10}
                                className="w-full h-full"
                                resizeMode='cover'
                            />
                            </View>
                            {/* Step 10 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                            {'Preview or retake if the image captured is appropriate to the report.'}
                            </Text>
                        </View>
                        {/* Step 11 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 11 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 11/13'}</Text>
                            {/* Image Step 11 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-white overflow-hidden border-primary border-[1px]">
                            <Image 
                                source={images.r_step_11}
                                className="w-[98%] h-[98%]"
                                resizeMode='contain'
                            />
                            </View>
                            {/* Step 11 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                            {'If desired, provide additional comments or information relevant to the emergency.'}
                            </Text>
                        </View>
                        {/* Step 12 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 12 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 12/13'}</Text>
                            {/* Image Step 12 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-primary overflow-hidden">
                            <Image 
                                source={images.r_step_12}
                                className="w-full h-full"
                                resizeMode='contain'
                            />
                            </View>
                            {/* Step 12 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center py-4" numberOfLines={3} ellipsizeMode='tail'>
                            {'Click the submit button to upload and post your report to the database.'}
                            </Text>
                        </View>
                        {/* Step 13 */}
                        <View className="w-full h-full items-center justify-center">
                            {/* Step 13 Title */}
                            <Text className="text-primary text-2xl font-psemibold absolute top-5" numberOfLines={1} ellipsizeMode='tail'>{'STEP 13/13'}</Text>
                            {/* Image Step 13 */}
                            <View className="w-[90%] h-[70%] rounded-2xl bg-white overflow-hidden border-primary border-[1px]">
                            <Image 
                                source={images.r_step_13}
                                className="w-full h-full"
                                resizeMode='contain'
                            />
                            </View>
                            {/* Step 13 Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center pt-4 pb-3" numberOfLines={3} ellipsizeMode='tail'>
                            {'Preview the receipt of your submitted report.'}
                            </Text>
                            {/* Buttons Available */}
                            <TouchableHighlight className="py-2 px-8 bg-primary rounded-3xl" underlayColor={"#86ebaa"} onPress={onClose}>
                            <Text className="text-white text-base font-pregular text-center">{'FINISH'}</Text>
                            </TouchableHighlight>
                        </View>
                    </Swiper>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export default Reporting