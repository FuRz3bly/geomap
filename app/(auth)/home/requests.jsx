import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, BackHandler, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity, ActivityIndicator, LayoutAnimation, Platform, UIManager, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserContext from '../../../components/UserContext';
import { translate } from '../../../components/ToolsContext';

import { images, icons } from '../../../constants';

import { getFirestore, doc, updateDoc, arrayUnion} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const RequestScreen = ({ data, changePage, backPage }) => {
  const { user, isResponder } = useContext(UserContext); // User Container
  const { width, height } = Dimensions.get('screen'); // Screen Width and Height
  // Local Variables
  const scrollRef = useRef(null); // Scroll View Reference
  const [expandedStates, setExpandedStates] = useState(data.map(() => false));

  // Allow the back button action when the component is mounted
  useEffect(() => {
    const backAction = () => {
        backPage();
        return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    // Cleanup the event listener when the component unmounts
    return () => backHandler.remove();
  }, []);

  // Function to sort requests
  const sortRequests = (requests) => {
    // Group requests by status
    const pendingRequests = requests.filter(request => request.status === 'pending');
    const approvedRequests = requests.filter(request => request.status === 'approved');
    const rejectedRequests = requests.filter(request => request.status === 'rejected');

    // Sort each group alphabetically by last_name
    const sortByLastName = (a, b) => a.full_name.last_name.localeCompare(b.full_name.last_name);

    pendingRequests.sort(sortByLastName);
    approvedRequests.sort(sortByLastName);
    rejectedRequests.sort(sortByLastName);

    // Combine sorted groups
    return [...pendingRequests, ...approvedRequests, ...rejectedRequests];
  };

  const statusStyles = {
    pending: {
        bgColor: 'bg-warn-100',
        borderColor: 'border-warn',
        icon: icons.recentP
    },
    rejected: {
        bgColor: 'bg-red-500',
        borderColor: 'border-red-500',
        icon: icons.close
    },
    approved: {
        bgColor: 'bg-primary',
        borderColor: 'border-primary',
        icon: icons.verification
    }
  };

  const getStatusStyles = (status) => statusStyles[status] || statusStyles.approved;

  // Button Functions
  // Template Buttons
  const handleOK = ( user ) => {
      console.log(user);
  };

  // Toggle Expand Per Users
  const toggleExpandDashboard = (id) => {
      LayoutAnimation.configureNext({
          duration: 200,
          update: {
              type: LayoutAnimation.Types.linear,
              property: LayoutAnimation.Properties.scaleX
          },
      });
      setExpandedStates(prevStates => ({
          ...prevStates,
          [id]: !prevStates[id]
      }));
  };

  // Enable LayoutAnimation on Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const sortedRequests = sortRequests(data);

  // Approve Request Function
  const handleApprove = async (request, requestId) => {
    const db = getFirestore();
    const requestRef = doc(db, 'request', requestId);

    try {
        // Approve the request
        await updateDoc(requestRef, { status: 'approved' });
        console.log(`Request ${requestId} approved.`);
        alert('Request approved successfully!');

        // Apply changes to the user based on request data
        await applyChangesToUser(request);
    } catch (error) {
        console.error("Error approving request:", error);
    }
  };

  // Reject Request Function
  const handleReject = async (requestId) => {
      const db = getFirestore();
      const requestRef = doc(db, 'request', requestId);

      try {
          await updateDoc(requestRef, { status: 'rejected' });
          console.log(`Request ${requestId} rejected.`);
          alert('Request rejected successfully!');
      } catch (error) {
          console.error("Error rejecting request:", error);
      }
  };

  // Apply Changes To User
  const applyChangesToUser = async (request) => {
    const db = getFirestore();
    const userRef = doc(db, 'users', request.user_uid);

    try {
        // Update Firestore with the new fields from the request
        await updateDoc(userRef, {
            type: request.type,
            user_id: request.user_id,
            username: request.username,
            address: request.address,
            birthdate: request.birthdate,
            full_name: {
                first_name: request.full_name.first_name,
                middle_name: request.full_name.middle_name,
                last_name: request.full_name.last_name
            },
            phone_number: request.phone_number,
            rank: request.rank,
            photo_id: request.photo_id,
            amenity_id: request.amenity_id,
            amenity_key: null,
            on_duty: false
        });

        // Update the responders list for the amenity if it exists
        if (request.amenity_id) {
            const amenityRef = doc(db, 'amenity', request.amenity_id);
            await updateDoc(amenityRef, {
                responders: arrayUnion({
                    user_id: request.user_id,
                    uid: request.user_uid,
                    full_name: request.full_name,
                    username: request.username,
                    phone_number: request.phone_number,
                    email: request.email
                })
            });
        }

        console.log('User updated successfully as a responder.');
    } catch (error) {
        console.error('Error updating responder details:', error);
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-white justify-center items-center">
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
        {sortedRequests.length === 0 ? (
            <View className="w-[96%] h-fit">
                <TouchableHighlight
                    underlayColor={'#fffd99'}
                    className={`w-full h-fit bg-white border-[1px] border-warn mt-4 rounded-3xl overflow-hidden`}
                    disabled
                >
                    <>
                        {/* No Data Available */}
                        <View className="w-[70%] h-fit mb-[1%] mt-[4%] px-4">
                            <Text className={`text-primary-300 font-psemibold text-sm`}>
                                {'Missing Requests'}
                            </Text>
                        </View>
                        {/* Status */}
                        <View className={`mx-2 absolute top-[15%] right-[2%] bg-yellow-400 rounded-3xl justify-center items-center flex-row overflow-hidden p-1 pr-2`}>
                            <View className="w-6 items-center justify-center">
                                <Image
                                    tintColor={'#ffffff'}
                                    source={icons.missing}
                                    className="w-[70%] h-[70%]"
                                    resizeMode='contain'
                                />
                            </View>
                            <View className="h-full justify-center pl-[2%] bottom-[1%]">
                                <Text className="text-white font-pregular text-xs">{'Missing'}</Text>
                            </View>
                        </View>
                        {/* Missing Data */}
                        <View className="w-full h-fit mb-[4%] px-4 justify-center">
                            <Text className="w-[68%] text-slate-500 font-pregular text-xs">{'No requests data available.'}</Text>
                            <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                <View className="w-[40%] h-full items-center justify-center">
                                    <Image
                                        tintColor={'#64748b'}
                                        source={icons.missing}
                                        className="w-[50%] h-[50%]"
                                        resizeMode='contain'
                                    />
                                </View>
                                <View className="h-full justify-center">
                                    <Text className="text-slate-500 font-pregular text-xs text-right">
                                        {'NaN'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </>
                </TouchableHighlight>
            </View>
        ) : (
            <>
                {sortedRequests.map((request) => (
                    !expandedStates[request.request_id] ? (
                        <View key={request.request_id} className="w-[96%] h-fit">
                            <TouchableHighlight
                                underlayColor={'#fffd99'}
                                className={`w-full h-fit bg-white border-[1px] ${getStatusStyles(request.status).borderColor} mt-4 rounded-3xl overflow-hidden`}
                                onPress={() => toggleExpandDashboard(request.request_id)}
                            >
                                <>
                                    {/* Full Name */}
                                    <View className="w-[70%] h-fit mb-[1%] mt-[4%] px-4">
                                        <Text className={`text-primary-300 font-psemibold text-sm`}>
                                            {`${request.full_name.last_name}, ${request.full_name.first_name} - ${request.rank}`}
                                        </Text>
                                    </View>
                                    {/* Status */}
                                    <View className={`mx-2 absolute top-[15%] right-[2%] ${getStatusStyles(request.status).bgColor} rounded-3xl justify-center items-center flex-row overflow-hidden p-1 pr-2`}>
                                        <View className="w-6 items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={getStatusStyles(request.status).icon}
                                                className="w-[70%] h-[70%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="h-full justify-center pl-[2%] bottom-[1%]">
                                            <Text className="text-white font-pregular text-xs">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</Text>
                                        </View>
                                    </View>
                                    {/* Email */}
                                    <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                        <Text className="w-[68%] text-slate-500 font-pregular text-xs">{request.email}</Text>
                                        <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                            <View className="w-[40%] h-full items-center justify-center">
                                                <Image
                                                    tintColor={'#64748b'}
                                                    source={request.type === 'community' ? icons.profileBorder : icons.profileRespoBorder}
                                                    className="w-[50%] h-[50%]"
                                                    resizeMode='contain'
                                                />
                                            </View>
                                            <View className="h-full justify-center">
                                                <Text className="text-slate-500 font-pregular text-xs text-right">
                                                    {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </>
                            </TouchableHighlight>
                        </View>
                    ) : (
                        <View key={request.request_id} className="w-[96%] h-fit items-center justify-center">
                            {/* Expanded View */}
                            <View className={`w-full h-fit bg-white border-[1px] ${getStatusStyles(request.status).borderColor} mt-4 rounded-3xl overflow-hidden`}>
                                <View className="w-full h-8 mt-[4%] mb-[2%] px-2">
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                        <View className={`h-full ml-2 ${getStatusStyles(request.status).bgColor} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                            <View className="w-6 h-full items-center justify-center">
                                                <Image
                                                    tintColor={'#ffffff'}
                                                    source={request.type === 'community' ? icons.profileBorder : icons.profileRespoBorder}
                                                    className="w-[60%] h-[60%]"
                                                    resizeMode='contain'
                                                />
                                            </View>
                                            <View className="h-full justify-center pl-[4%]">
                                                <Text className="text-white font-pregular text-xs">{request.user_id}</Text>
                                            </View>
                                        </View>
                                        <View className={`h-full mx-2 ${getStatusStyles(request.status).bgColor} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                            <View className="w-6 items-center justify-center">
                                                <Image
                                                    tintColor={'#ffffff'}
                                                    source={getStatusStyles(request.status).icon}
                                                    className="w-[50%] h-[50%]"
                                                    resizeMode='contain'
                                                />
                                            </View>
                                            <View className="h-full justify-center pl-[2%]">
                                                <Text className="text-white font-pregular text-xs">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</Text>
                                            </View>
                                        </View>
                                        {/* {user.violation && (
                                            <View className={`h-full mr-4 ${user.violation === 1 ? 'bg-warn' : user.violation === 2 ? 'bg-orange-500' : user.violation === 3 ? 'bg-red-600' : ''} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                <View className="w-6 items-center justify-center">
                                                    <Image
                                                        tintColor={'#ffffff'}
                                                        source={icons.warning}
                                                        className="w-[50%] h-[50%]"
                                                        resizeMode='contain'
                                                    />
                                                </View>
                                                <View className="h-full justify-center pl-[2%]">
                                                    <Text className="text-white font-pregular text-xs">{`Violation - ${user.violation.toString()}`}</Text>
                                                </View>
                                            </View>
                                        )} */}
                                    </ScrollView>
                                </View>
                                <View className="w-[90%] h-fit mb-[1%] px-4">
                                    <Text className={`text-primary-300 font-psemibold text-sm`}>
                                    {`${request.full_name.last_name}, ${request.full_name.first_name} - ${request.rank}`}
                                    </Text>
                                </View>
                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                    <Text className="w-[80%] text-slate-500 font-pregular text-xs">{request.email}</Text>
                                </View>
                                <View className="w-full h-14 justify-center">
                                    <TouchableHighlight
                                        underlayColor={'#fffd99'}
                                        className={`w-full h-full flex-row ${getStatusStyles(request.status).bgColor} items-center px-4`}
                                        onPress={() => toggleExpandDashboard(request.request_id)}
                                    >
                                        <>
                                            <View className="w-[10%] h-[80%] justify-center">
                                                <Image
                                                    tintColor={'#ffffff'}
                                                    source={request.type === 'community' ? icons.profileBorder : icons.profileRespoBorder}
                                                    className="w-[50%] h-[50%]"
                                                    resizeMode='contain'
                                                />
                                            </View>
                                            <View className="w-[90%] h-[80%] justify-center">
                                                <Text className="text-white font-pregular text-xs">
                                                    {request.type.charAt(0).toUpperCase() + request.type.slice(1)} User - {request.address}
                                                </Text>
                                            </View>
                                        </>
                                    </TouchableHighlight>
                                    <View className="w-[20%] h-[80%] absolute right-2 z-30">
                                        {/* <TouchableHighlight
                                            underlayColor={'#86ebaa'}
                                            className="w-full h-full items-center justify-center rounded-2xl"
                                            onPress={handleOK}
                                        >
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={icons.nextArrowBtn}
                                                className="w-[50%] h-[50%]"
                                                resizeMode='contain'
                                            />
                                        </TouchableHighlight> */}
                                    </View>
                                </View>
                            </View>
                            {/* Options */}
                            {request.status === 'pending' && (
                                <View className="w-full h-10 mt-3">
                                <ScrollView className='w-full h-full' horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                    {/* Approve Button */}
                                    <TouchableHighlight 
                                        className={`h-full bg-white rounded-3xl ${getStatusStyles(request.status).borderColor} border-[1px] overflow-hidden px-6 mr-2 ml-3`} 
                                        underlayColor={'#fffd99'} 
                                        onPress={() => handleApprove(request, request.request_id)}
                                    >
                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                            <View className="w-6 h-full items-center justify-center">
                                                <Image
                                                    tintColor={'#57b378'}
                                                    source={icons.verification}
                                                    className="w-[80%] h-[80%]"
                                                    resizeMode='contain'
                                                />
                                            </View>
                                            <View className="h-full justify-center pl-[4%]">
                                                <Text className="text-black font-pregular text-sm">{'Approve'}</Text>
                                            </View>
                                        </View>
                                    </TouchableHighlight>
                                    {/* Reject Button */}
                                    <TouchableHighlight 
                                        className={`h-full bg-white rounded-3xl ${getStatusStyles(request.status).borderColor} border-[1px] overflow-hidden px-6 mr-8`}
                                        underlayColor={'#fffd99'}
                                        onPress={() => handleReject(request.request_id)}
                                    >
                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                            <View className="w-6 h-full items-center justify-center">
                                                <Image
                                                    tintColor={'#e62210'}
                                                    source={icons.close}
                                                    className="w-[50%] h-[50%]"
                                                    resizeMode='contain'
                                                />
                                            </View>
                                            <View className="h-full justify-center pl-[4%]">
                                                <Text className="text-black font-pregular text-sm">{'Reject'}</Text>
                                            </View>
                                        </View>
                                    </TouchableHighlight>
                                </ScrollView>
                                </View>
                            )}
                        </View>
                    )
                ))}
            </>
        )}
        <View className="w-full mb-4" />
        </ScrollView>
    </SafeAreaView>
  );
};

export default RequestScreen;