import React, { useState, useEffect } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, TouchableOpacity } from 'react-native';

const NewReportMarker = ({ report, toggleReport, selectedReport }) => {
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
        {type: 'disaster_accident', description: 'Disaster Accident'}
    ];
    // All Status Types Translations to Descriptions
    const status_types = [
        {status: 'preliminary', description: 'Filing the Report'},
        {status: 'waiting', description: 'Waiting for Response'},
        {status: 'receive', description: 'Help is on the Way'},
        {status: 'arrive', description: 'Responder Arrived'},
    ];
    // Emergency Type Translator
    const getEmergencyDescription = (type) => {
        const emergencyType = emergency_types.find((et) => et.type === type);
        return emergencyType ? emergencyType.description : '';
    };
    // Status Type Translator
    const getStatusDescription = (status) => {
        const statusType = status_types.find((st) => st.status === status);
        return statusType ? statusType.description : '';
    };
    // Change Marker Color Depending on the Handler
    const getMarkerTint = (handler) => {
        switch (handler) {
        case 'fire_station':
            return 'tomato';
        case 'police':
            return 'blue';
        case 'government':
            return 'green';
        default:
            return 'red';
        };
    };
    // Change Handler Type Color in Callout - Colored Square - Type: Structural Fire
    const typeColor = (handler) => {
        switch(handler) {
            case 'fire_station':
                return 'bg-orange-500';
            case 'police':
                return 'bg-blue-400';
            case 'government':
                return 'bg-green-600';
            default:
                return 'primary';
        };
    };

    const toggleShowReport = (report) => {
        selectedReport(report)
        toggleReport(true)
    };
    return (
        <>
            {report && (
                <Marker
                    coordinate={{
                        latitude: report.latitude,
                        longitude: report.longitude
                    }}
                    pinColor={getMarkerTint(report.handler)}
                    onCalloutPress={() => toggleShowReport(report)}
                >
                    <Callout>
                        <View className="w-50 h-30 justify-center">
                        {/* Title */}
                        <Text className="font-pbold text-sm text-primary py-2 text-center">Reported Emergency</Text>
                        {/* Line Separator */}
                        <View className="border-b-0.5 border-primary" />
                        {/* Type Description */}
                        <View className="flex-row pt-2">
                            <View className={`w-2 h-6 ${typeColor(report.handler)} -top-[1%]`}><Text>{" "}</Text></View>
                            <Text className="font-psemibold text-sm text-primary">{"  "}Type:{" "}</Text>
                            <Text className="w-[80%] font-pregular text-sm text-primary">{getEmergencyDescription(report.type)}</Text>
                        </View>
                        {/* Status Description */}
                        <View className="flex-row pt-2">
                            <View className={`w-2 h-6 bg-yellow-300 -top-[1%]`}><Text>{" "}</Text></View>
                            <Text className="font-psemibold text-sm text-primary pb-2">{"  "}Status:{" "}</Text>
                            <Text className="w-[80%] font-pregular text-sm text-primary">{getStatusDescription(report.status)}</Text>
                        </View>
                        </View>
                    </Callout>
                </Marker>
            )}
        </>
    )
};

export default NewReportMarker;