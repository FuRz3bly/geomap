import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, TouchableHighlight, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../../constants';
import { translate } from '../../ToolsContext';

const Receipt = ({ visible, onClose, report }) => {
    if (!report) {
        return null; // Handle case where report is not defined
    };

    return (
        <Modal
            isVisible={visible}
            onBackButtonPress={onClose}
            onBackdropPress={onClose}
            backdropColor='black'
            backdropOpacity={0.3}
            hideModalContentWhileAnimating={true}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={600}
            animationOutTiming={1000}
        >
            <SafeAreaView className="items-center justify-center">
                {/* Report Receipt Modal */}
                <View className="w-full h-[92%] bg-white items-center justify-center">
                    {/* Close Button */}
                    <View className="absolute z-10 right-2 top-2">
                        <TouchableOpacity onPress={onClose}>
                        <View className="rounded-full w-12 h-12 flex-row items-center justify-center bg-white">
                            <Image 
                                tintColor="#57b378"
                                source={icons.close}
                                className="w-5 h-5 m-5"
                                resizeMode='contain'
                            />
                        </View>
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                        <Image 
                            tintColor="#57b378"
                            source={icons.verification}
                            className="w-10 h-10 my-8"
                            resizeMode='contain'
                        />
                        <Text className="font-pregular text-primary-hidden text-xl">{'Report Successful!'}</Text>
                        <Text className="font-psemibold text-black text-2xl py-4">{`RID #${report?.report_id ?? 'N/A'}`}</Text>
                        <View className="w-[90%] border-primary border-b-0.5 my-8"/>
                        {/* Report Type */}
                        <View className="w-[90%] flex-row justify-between py-2">
                        <Text className="font-pregular text-gray-500 text-base">{'Type:'}</Text>
                        <Text className="font-pregular text-black text-base">{translate(report?.report_type ?? 'N/A')}</Text>
                        </View>
                        {/* Status */}
                        <View className="w-[90%] flex-row justify-between py-2">
                        <Text className="font-pregular text-gray-500 text-base">{'Status'}</Text>
                        <Text className="font-pregular text-black text-base">{translate(report?.report_status ?? 'N/A')}</Text>
                        </View>
                        {/* Injuries */}
                        <View className="w-[90%] flex-row justify-between py-2">
                        <Text className="font-pregular text-gray-500 text-base">{'Medical Emergency'}</Text>
                        <Text className="font-pregular text-black text-base">{(report.services ?? []).includes('ambulance') ? 'Yes' : 'No'}</Text>
                        </View>
                        {/* Handler */}
                        <View className="w-[90%] flex-row justify-between py-2">
                        <Text className="font-pregular text-gray-500 text-base">{'Handler'}</Text>
                        <Text className="font-pregular text-black text-base">{translate(report?.handler ?? 'N/A')}</Text>
                        </View>
                        {/* Services */}
                        <View className="w-[90%] flex-row justify-between py-2">
                        <Text className="font-pregular text-gray-500 text-base">{'Services'}</Text>
                        <Text className="font-pregular text-black text-base">
                            {((report.services ?? []).length > 0) 
                                ? (report.services.map(service => translate(service)).join(', ')) 
                                : 'None'}
                        </Text>
                        </View>
                        {/* Report Time */}
                        <View className="w-[90%] flex-row justify-between py-2">
                        <Text className="font-pregular text-gray-500 text-base">{'Report Time'}</Text>
                        <Text className="font-pregular text-black text-base">
                        {report?.report_date
                            ? (typeof report.report_date.toDate === 'function'
                                ? report.report_date.toDate().toLocaleDateString()
                                : new Date(report.report_date.seconds * 1000 + report.report_date.nanoseconds / 1000000).toLocaleDateString())
                            : ''}
                        {", "}
                        {report?.report_date
                            ? (typeof report.report_date.toDate === 'function'
                                ? report.report_date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(report.report_date.seconds * 1000 + report.report_date.nanoseconds / 1000000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                            : ''}
                        </Text>
                        </View>
                        {/* Incident Time */}
                        <View className="w-[90%] flex-row justify-between py-2">
                        <Text className="font-pregular text-gray-500 text-base">{'Incident Time'}</Text>
                        <Text className="font-pregular text-black text-base">
                        {report?.incident_date
                            ? (typeof report.incident_date.toDate === 'function'
                                ? report.incident_date.toDate().toLocaleDateString()
                                : new Date(report.incident_date.seconds * 1000 + report.report_date.nanoseconds / 1000000).toLocaleDateString())
                            : ''}
                        {", "}
                        {report?.incident_date
                            ? (typeof report.incident_date.toDate === 'function'
                                ? report.incident_date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(report.incident_date.seconds * 1000 + report.incident_date.nanoseconds / 1000000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                            : ''}
                        </Text>
                        </View>
                        {/* Preferred Communication */}
                        <View className="w-[90%] flex-row justify-between py-2">
                        <Text className="font-pregular text-gray-500 text-base">{'Contact Method'}</Text>
                        <Text className="font-pregular text-black text-base">{translate(report?.coms ?? 'N/A')}</Text>
                        </View>
                        {/* Description */}
                        <View className="w-[90%] flex-row justify-between py-2">
                        <Text className="font-pregular text-gray-500 text-base">{'Description Provided'}</Text>
                        <Text className="font-pregular text-black text-base">{(report.description ?? '') ? 'Yes' : 'No'}</Text>
                        </View>
                        {/* Address */}
                        <View className="w-[90%] flex-row justify-between py-2">
                        <Text className="font-pregular text-gray-500 text-base">{'Address'}</Text>
                        <Text className="font-pregular text-black text-base">{report?.report_address ?? 'N/A'}</Text>
                        </View>
                        <View className="w-[90%] border-primary-100 border-b-0.5 border-dashed my-8"/>
                        {/* Report ID */}
                        <View className="w-[90%] flex-row justify-between py-2">
                        <Text className="font-pregular text-gray-500 text-base">{'Report ID'}</Text>
                        <Text className="font-pregular text-black text-base">{`#${report?.report_id ?? 'N/A'}`}</Text>
                        </View>
                        {/* Name */}
                        <View className="w-[90%] flex-row justify-between py-2 mb-12">
                        <Text className="font-pregular text-gray-500 text-base">{'Reporter Name'}</Text>
                        <Text className="font-pregular text-black text-base">{`${report?.user_report?.full_name?.first_name ?? ''} ${report?.user_report?.full_name?.last_name ?? ''}`}</Text>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export default Receipt;