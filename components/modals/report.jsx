import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import Modal from 'react-native-modal';
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import {icons} from "../../constants"

const Report = ({ visible, onClose, reportForm, userDetails }) => {
    // Profile Components
    const [showProfile, setShowProfile] = useState(false)
    // Toggle Profile
    const toggleProfile = () => {setShowProfile(!showProfile)}
    // Format id from ######### to ###-###-###
    const formatId = (id) => {return `${id.slice(0, 3)}-${id.slice(3, 6)}-${id.slice(6, 9)}`};
    // Format services to be Service, Service
    const formatServices = (services) => {
        const validServices = services.filter(service => service.length > 0);
        if (validServices.length === 0) return '';
        if (validServices.length === 1) return validServices[0].charAt(0).toUpperCase() + validServices[0].slice(1);
        return validServices.map(service => service.charAt(0).toUpperCase() + service.slice(1)).join(', ');
    };
    // Format Total Reports to 1 - 001
        const formatReport = (number, length) => {
        return number.toString().padStart(length, '0');
        }
    // All emergency types
  const emergency_types = [
    // Fire Emergency Types
    {type: 'structural_fire', description: 'Structural Fire'},
    {type: 'vehicular_fire', description: 'Vehicular Fire'},
    {type: 'fire_rescue', description: 'Rescue'},
    {type: 'explosion', description: 'Explosion Incident'},
    {type: 'wildfire', description: 'Wildfire'},
    // Police Emergency Types
    {type: 'personal_safety', description: 'Personal Safety'},
    {type: 'traffic_accident', description: 'Traffic Accident'},
    {type: 'public_disturbance', description: 'Public Disturbance'},
    {type: 'theft', description: 'Theft & Burglary'},
    {type: 'assault', description: 'Assault & Battery'},
    {type: 'domestic_violence', description: 'Domestic Violence'},
    {type: 'active_shooting', description: 'Active Shooting'},
    // NDRRMO Emergency Types
    {type: 'search_and_rescue', description: 'Search & Rescue'},
    {type: 'industrial_accidents', description: 'Industrial Accident'},
    {type: 'disaster_accident', description: 'Disaster Accident'}];

  const status_types = [
    // Responders Status Types
    {status: 'preliminary', description: 'Filing the Report'},
    {status: 'waiting', description: 'Waiting for Response'},
    {status: 'receive', description: 'Help is on the Way'},
    {status: 'arrive', description: 'Responder Arrived'},
  ]
  // Translate snake_case to proper Descriptions
  const getEmergency = (type) => {
    const emergencyType = emergency_types.find((et) => et.type === type);
    return emergencyType ? emergencyType.description : '';
  };
  // Translate snake_case to proper Descriptions
  const getStatus = (status) => {
    const statusType = status_types.find((st) => st.status === status);
    return statusType ? statusType.description : '';
  };

    return (
    <Modal
        isVisible={visible}
        onBackButtonPress={onClose}
        onBackdropPress={onClose}
        hideModalContentWhileAnimating={true}
        backdropTransitionInTiming={0}
        backdropTransitionOutTiming={0}
        animationIn="fadeInUp"
        animationOut="fadeOutDown"
        animationInTiming={400}
        animationOutTiming={500}
        
    >
        <SafeAreaView className="h-full items-center justify-center">
            {/* Full Report Modal */}
            <View className="absolute bg-white h-[68%] w-[90%] p-2 z-10 ">
                {/* Header */}
                <View className="mx-2 flex-row py-2">
                <Text className="font-pbold text-primary text-2xl">Full Report Details</Text>
                <View className="absolute -right-2 -top-0.5">
                    <TouchableOpacity onPress={onClose}>
                    <View className="rounded-full w-12 h-12 flex-row items-center justify-center px-2">
                        <Image 
                        tintColor="#57b378"
                        source={icons.close}
                        className="w-5 h-5"
                        resizeMode='contain'
                        />
                    </View>
                    </TouchableOpacity>
                </View>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                {/* Details Container */}
                <View className="justify-center mx-2 pt-2 pb-2">
                {reportForm && (
                    <>
                        <Text className="text-primary font-pregular text-sm pt-1"><Text className="font-pbold">Report ID:{"   "}</Text>#{formatId(reportForm.id)}</Text>
                        <Text className="text-primary font-pregular text-sm pt-1 pb-1"><Text className="font-pbold">Status:{"   "}</Text>{getStatus(reportForm.status)}</Text>
                        { showProfile === false ? (
                        <TouchableOpacity onPress={toggleProfile}>
                            <View className="border-y-0.5 border-primary py-2">
                            <View className="flex-row">
                                <Text className="text-primary font-pregular text-sm"><Text className="font-pbold">User:{"   "}</Text>{reportForm.user.fullname.firstname}{" "}{reportForm.user.fullname.lastname}</Text>
                                <View className="absolute right-0 -inset-y-1.5">
                                <View className="rounded-full w-8 h-8 flex-row items-center justify-center px-2">
                                    <Image 
                                    tintColor="#57b378"
                                    source={icons.moreDetails}
                                    className="w-5 h-5"
                                    resizeMode='contain'
                                    />
                                </View>
                                </View>
                            </View>
                            </View>
                        </TouchableOpacity>
                        ) : (
                        <TouchableOpacity onPress={toggleProfile}>
                            <View className="border-y-0.5 border-primary py-2">
                            <Text className="text-primary font-pregular text-sm pt-1"><Text className="font-pbold">Name:{"   "}</Text>
                                {reportForm.user.fullname.firstname}{" "}{reportForm.user.fullname.middlename}{" "}{reportForm.user.fullname.lastname}
                            </Text>
                            <Text className="text-primary font-pregular text-sm pt-1"><Text className="font-pbold">Username:{"   "}</Text>{reportForm.user.username}</Text>
                            <View className="py-2" />
                            <View className="w-64 h-32 items-center justify-center bg-white-100 rounded-2xl">
                                <Image 
                                    tintColor="#ffffff"
                                    source={icons.camera}
                                    className="w-16 h-16"
                                    resizeMode='contain'
                                />
                            </View>
                            <View className="py-2" />
                            <Text className="text-primary font-pregular text-sm pt-1"><Text className="font-pbold">Address:{"   "}</Text>{reportForm.user.address}</Text>
                            <Text className="text-primary font-pregular text-sm pt-1"><Text className="font-pbold">Phone Number:{"   "}</Text>{"(064)"}{reportForm.user.phone_number}</Text>
                            <Text className="text-primary font-pregular text-sm pt-1"><Text className="font-pbold">Email:{"   "}</Text>{reportForm.user.email}</Text>
                            <>
                                {userDetails ? (
                                    <Text className="text-primary font-pregular text-sm pt-1"><Text className="font-pbold">Total Reports:{"   "}</Text>{formatReport(userDetails.reports, 3)}</Text>
                                ) : (<Text></Text>)}
                            </>
                            </View>
                        </TouchableOpacity>
                        )}
                        <Text className="text-primary font-pregular text-sm pt-1"><Text className="font-pbold">Date:{"   "}</Text>{reportForm.date}</Text>
                        <Text className="text-primary font-pregular text-sm pt-1"><Text className="font-pbold">Time:{"   "}</Text>{reportForm.time}</Text>
                        <Text className="text-primary font-pregular text-sm pt-1"><Text className="font-pbold">Location:{"   "}</Text>{(reportForm.latitude).toFixed(2)}{"  "}{"|"}{"  "}{(reportForm.longitude).toFixed(2)}</Text>
                        <Text className="text-primary font-pregular text-sm pt-1"><Text className="font-pbold">Address:{"   "}</Text>{reportForm.address}</Text>
                        <Text className="text-primary font-pregular text-sm pt-1"><Text className="font-pbold">Type:{"   "}</Text>{getEmergency(reportForm.type)}</Text>
                        <Text className="text-primary font-pregular text-sm pt-1 pb-2"><Text className="font-pbold">Services:{"   "}</Text>{formatServices(reportForm.services)}</Text>
                        <View className="border-y-0.5 border-primary py-2 pb-4">
                        <Text className="text-primary font-pbold text-sm pb-2">Evidences:</Text>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            <View className="flex-row gap-4">
                            <View className="w-24 h-48 items-center justify-center bg-white-100 rounded-2xl">
                                <Image 
                                tintColor="#ffffff"
                                source={icons.camera}
                                className="w-6 h-6"
                                resizeMode='contain'
                                />
                            </View>
                            <View className="w-24 h-48 items-center justify-center bg-white-100 rounded-2xl">
                                <Image 
                                tintColor="#ffffff"
                                source={icons.camera}
                                className="w-6 h-6"
                                resizeMode='contain'
                                />
                            </View>
                            <View className="w-24 h-48 items-center justify-center bg-white-100 rounded-2xl">
                                <Image 
                                tintColor="#ffffff"
                                source={icons.camera}
                                className="w-6 h-6"
                                resizeMode='contain'
                                />
                            </View>
                            </View>
                        </ScrollView>
                        </View>
                    </>
                )}
                </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    </Modal>
    )
}

export default Report