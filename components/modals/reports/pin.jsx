import React, { useState, useRef } from 'react';
import { View, Image, Text, TouchableHighlight, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

import { icons } from '../../../constants';

const Pins = ({ visible, onClose, onProceed, onRequest, user }) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const inputs = useRef([]);

    const checkPIN = async (enteredPin) => {
        const amenityRef = doc(db, 'amenity', user.amenity_id);
        const amenitySnap = await getDoc(amenityRef);
    
        if (amenitySnap.exists()) {
            const amenityData = amenitySnap.data();
            return amenityData.amenity_key === enteredPin;
        } else {
            console.error('Amenity document does not exist!');
            return false;
        }
    };

    const handleChange = async (text, index) => {
        const newPin = [...pin];
        newPin[index] = text;
        setPin(newPin);
    
        if (text.length > 0 && index < 3) {
            inputs.current[index + 1].focus();
        }
    
        if (newPin.every(digit => digit !== '')) {
            // Check if the entered PIN matches the amenity_key
            const enteredPin = newPin.join('');
            const isPinCorrect = await checkPIN(enteredPin);
    
            if (isPinCorrect) {
                setSuccessMsg('Access granted');
                setErrorMsg('');
    
                // Update user's on_duty to true and include the amenity_key
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    on_duty: true,
                    amenity_key: enteredPin
                });
    
                onProceed(enteredPin);
                setPin(['', '', '', '']);
                setSuccessMsg('');
                onClose();
            } else {
                setSuccessMsg('');
                setErrorMsg('Wrong PIN Code');
            }
        }
    };   
    
    const handleBackspace = (text, index) => {
        if (text.length === 0 && index > 0) {
            inputs.current[index - 1].focus();
            setErrorMsg('');
            setSuccessMsg('');
        }
    };

    return (
        <Modal
            isVisible={visible}
            onBackButtonPress={onClose}
            onBackdropPress={onClose}
            backdropColor='black'
            backdropOpacity={0.8}
            hideModalContentWhileAnimating={true}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={600}
            animationOutTiming={1000}
        >
            <SafeAreaView className="items-center justify-center">
                {/* Pin Code Modal */}
                <View className="w-[85%] h-fit bg-white items-center justify-center rounded-3xl">
                    {/* Close Modal Button */}
                    <View className="w-[15%] h-[12%] absolute top-4 left-4">
                    <TouchableHighlight className="w-full h-full bg-primary rounded-full items-center justify-center" underlayColor={"#86ebaa"} onPress={onClose}>
                        <Image 
                        tintColor={"#ffffff"}
                        source={icons.prevBtn}
                        className="w-[40%] h-[40%]"
                        resizeMode='contain'
                        />
                    </TouchableHighlight>
                    </View>
                    {/* Enter One-Time Pin */}
                    <Text className="text-black text-2xl font-psemibold pt-6 pb-2" numberOfLines={1} ellipsizeMode='tail'>{'Enter PIN'}</Text>
                    {/* Instructions */}
                    <Text className="text-slate-400 text-base font-rbase text-center px-[9%] pb-6">{'Please enter the One-Time PIN (OTP) just sent to your email.'}</Text>
                    {/* Pin Text Input */}
                    <View className="w-[90%] h-[20%] flex-row items-center justify-evenly gap-y-px">
                        {pin.map((digit, index) => (
                            <View key={index} className={`w-[20%] h-full ${successMsg ? 'border-2 border-primary' : (errorMsg ? 'border-2 border-rose-500' : (focusedIndex === index ? 'border-primary border-2' : 'border-slate-400 border-[1px]'))} rounded-xl items-center justify-center`}>
                                <TextInput
                                    ref={(el) => (inputs.current[index] = el)}
                                    value={digit}
                                    onChangeText={(text) => handleChange(text, index)}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === 'Backspace') {
                                            handleBackspace(digit, index);
                                        }
                                    }}
                                    onFocus={() => setFocusedIndex(index)}
                                    onBlur={() => setFocusedIndex(null)}
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    secureTextEntry
                                    className={`w-full h-full text-center text-3xl ${errorMsg ? 'text-rose-500' : 'text-primary'} font-pbold`}
                                />
                            </View>
                        ))}
                    </View>
                    {/* Indicator if Wrong */}
                    <View className="w-[90%] h-[10%] items-center gap-y-px my-6">
                        <Text className="text-rose-500 text-base font-pregular text-center">{errorMsg ? errorMsg : ''}</Text>
                    </View>
                    {/* Request PIN */}
                    <TouchableHighlight className="w-[90%] py-3 px-4 bg-primary rounded-2xl mb-4" underlayColor={"#86ebaa"} onPress={onRequest}>
                        <Text className="text-white text-base font-pregular text-center">{'Request PIN'}</Text>
                    </TouchableHighlight>
                </View>
            </SafeAreaView>
        </Modal>
    )
};

export default Pins;