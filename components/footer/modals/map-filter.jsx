import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import React, { useState } from 'react';

import { icons } from '../../../constants';

const MapFilter = ({ visible, onClose, visibleFilter, selectedFilter }) => {
      // Style Container
    const [filter, setFilter] = useState('all')
    // Choosing a Map Theme Logic
    const handleFilterSelect = (filter) => {
        setFilter(filter)
    }
    const handleFilterConfirm = (filter) => {
        selectedFilter(filter)
        onClose()
        visibleFilter(false)
    }
    return (
        <Modal
          isVisible={visible}
          onBackdropPress={onClose}
          backdropColor='black'
          backdropOpacity={0.3}
          hideModalContentWhileAnimating={true}
          backdropTransitionInTiming={0}
          backdropTransitionOutTiming={0}
          animationIn="slideInRight"
          animationOut="slideOutRight"
          animationInTiming={400}
          animationOutTiming={500}
        >
        <SafeAreaView className="absolute -right-5 -top-[2.5%] w-[30%] h-[108%]">
            <View className="bg-primary w-full h-full items-center">
                <View className="absolute inset-0 top-[6%]">
                  <Image
                    tintColor={"#ffffff"}
                    source={icons.filter}
                    className="w-10 h-10"
                    resizeMode='contain'
                  />
                </View>
              <View className="border-b-0.5 border-white" />

              <View className="border-t-0.5 border-white" />
              <View className="absolute inset-x-0 bottom-4 items-center justify-center">
                <TouchableOpacity onPress={() => handleFilterConfirm(filter)}>
                  <View className="bg-white w-20 h-20 items-center justify-center rounded-full">
                    <Image
                      tintColor={"#57b378"}
                      source={icons.verification}
                      className="w-16 h-16"
                      resizeMode='contain'
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
    )
}

export default MapFilter;