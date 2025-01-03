import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, BackHandler, TextInput, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import UserContext from '../../../components/UserContext';
import { translate } from '../../../components/ToolsContext';
import { Reporting, Exploring, Applying } from '../../../components/modals';

import { images, icons } from '../../../constants';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HelpScreen = ({ changePage, backPage }) => {
  // Local Variables
  const [searchQuery, setSearchQuery] = useState(''); // Search Query Container
  const [filteredFAQs, setFilteredFAQs] = useState([]); // Filtered FAQs Container
  const FAQdata = [
    {
      id: 1,
      question: 'What is GEOMAP?',
      answer: 'GEOMAP is an app designed to help users report emergencies and locate nearby amenities. It connects users with responders for quick assistance.',
      tags: ['introduction', 'overview', 'features', 'GEOMAP'],
    },
    {
      id: 2,
      question: 'How do I report an emergency on GEOMAP?',
      answer: 'The user is able to report an emergency by accessing the menu. The menu button can be seen on the left top button of the home screen page. When the user is in the map page, they can also report by pressing the Megaphone icon that can be seen on the bottom right of the screen.',
      tags: ['report', 'emergency', 'menu', 'guide'],
    },
    {
      id: 3,
      question: 'What types of emergencies can I report?',
      answer: 'The user is able to report different types of incidents such as fire-related incidents, police-related incidents, disaster-related incidents, and barangay-related incidents. To view the specific incidents provided in the application, the user must navigate to the Report Page of the application and select what types of incident you want to report.',
      tags: ['emergency types', 'emergency', 'report', 'fire', 'police', 'disaster', 'barangay'],
    },
    {
      id: 4,
      question: 'How does GEOMAP determine my location?',
      answer: "GEOMAP uses the user's device GPS and Google Maps to pinpoint the user location accurately, helping responders find the user faster during emergencies. The user's location is updated continuously, ensuring that assistance arrives to the user at the right location.",
      tags: ['location', 'GPS', 'accuracy', 'Google Maps'],
    },
    {
      id: 5,
      question: 'How accurate is the estimated response time?',
      answer: 'The estimated response time (ETA) is based on factors such as the proximity of available responders, traffic conditions, and the nature of the incident. While the ETA provides an approximation, actual response times may vary depending on real-time circumstances.',
      tags: ['response time', 'accuracy', 'ETA', 'conditions'],
    },
    {
      id: 6,
      question: 'Can I edit or cancel a report after submitting it?',
      answer: 'Unfortunately, once a report is submitted, it cannot be edited or canceled. It is important for the user to be certain before reporting an incident.',
      tags: ['edit', 'cancel', 'report', 'submission'],
    },
    {
      id: 7,
      question: 'How does GEOMAP notify responders?',
      answer: "GEOMAP sends report notifications directly to the responders’ notification list as soon as their status is On Duty, ensuring they’re alerted promptly to any new incidents.",
      tags: ['notifications', 'responders', 'on duty', 'alerts'],
    },
    {
      id: 8,
      question: 'Does GEOMAP work offline?',
      answer: 'No, GEOMAP requires an active internet connection or mobile data to function properly, as it depends on up-to-date data and GPS for reporting and responding to emergencies.',
      tags: ['offline', 'internet connection', 'data', 'functionality'],
    },
    {
      id: 9,
      question: "Can I see all past reports I’ve made?",
      answer: 'Yes, the user can view all past reports by navigating to the Details page through the Menu.',
      tags: ['history', 'past reports', 'details', 'records'],
    },
    {
      id: 10,
      question: "What if I don’t have Google Maps installed on my device? Can I still use GEOMAP?",
      answer: 'The user will be required to install or update Google Maps via the Google Play Store in order for GEOMAP to function properly.',
      tags: ['Google Maps', 'installation', 'requirements', 'device'],
    },
    {
      id: 11,
      question: 'How do I contact support if I encounter an issue?',
      answer: 'The user can contact support by navigating to the Menu section, selecting Settings, and then pressing the "Contact Support" option for assistance.',
      tags: ['support', 'contact', 'help', 'issues'],
    },
    {
      id: 12,
      question: 'Are my location and personal details safe with GEOMAP?',
      answer: "Yes, the user's location and personal details are secured with GEOMAP. The app follows strict privacy measures to protect all the user's information.",
      tags: ['privacy', 'security', 'personal details', 'location'],
    },
    {
      id: 13,
      question: 'Can I upload photos or videos with my report?',
      answer: "No, GEOMAP requires the user to take photographic evidence via the phone's camera, and it does not allow uploading photos or videos from the device's gallery.",
      tags: ['photos', 'videos', 'evidence', 'upload'],
    },
    {
      id: 14,
      question: 'Are there any fees for using GEOMAP?',
      answer: 'GEOMAP does not require any fees or payment to use the application.',
      tags: ['fees', 'cost', 'free', 'payment'],
    },
    {
      id: 15,
      question: 'How do I know if my report has been received?',
      answer: "An alert will appear on the user's screen indicating that the report has been acknowledged and received by the emergency responders.",
      tags: ['report status', 'received', 'confirmation', 'alert'],
    },
    {
      id: 16,
      question: 'Is Google Maps required to use GEOMAP?',
      answer: 'Yes, it is required to have Google Maps installed on the device in order to use GEOMAP, as it relies on Google Maps for location tracking and emergency reporting functionality.',
      tags: ['requirements', 'Google Maps', 'installation', 'location tracking'],
    },
  ]; // Frequently asked questions and Answers
  const [showTutorial, setShowTutorial] = useState(false); // Tutorial Display
  const [selectedTutorial, setSelectedTutorial] = useState('reporting'); // Selected Tutorial - 'reporting', 'exploring', 'applying'

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

  // Search Query Function
  const handleSearch = (query) => {
    setSearchQuery(query);

    const filtered = FAQdata.filter((faq) => 
      faq.question.toLowerCase().includes(query.toLowerCase()) ||
      faq.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredFAQs(filtered);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  // Frequently Ask Questions Dropdown Button
  const FAQList = ({ faqs }) => {
    const [visibleFAQs, setVisibleFAQs] = useState({}); // Track visibility for each FAQ item
  
    const toggleFAQ = (id) => {
      LayoutAnimation.configureNext({
        duration: 400,
        update: {
          type: LayoutAnimation.Types.easeOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
  
      setVisibleFAQs((prevVisible) => ({
        ...prevVisible,
        [id]: !prevVisible[id], // Toggle visibility for the specific FAQ
      }));
    };
  
    return (
      <View>
        {faqs.map((faq, index) => (
          <View key={index} className="mb-1">
            {!visibleFAQs[faq.id] ? (
              <>
                <TouchableHighlight
                  underlayColor={"#d9ffe6"}
                  className="w-full rounded-xl bg-white z-10"
                  onPress={() => toggleFAQ(faq.id)}
                >
                  <View className="w-full flex-row px-3 py-2 rounded-xl border-2 border-primary items-center">
                    <Text className="w-[90%] font-rbase text-base">{faq.question}</Text>
                    <View className="w-[10%] items-end justify-center">
                      <Image
                        tintColor="#57b378"
                        source={icons.arrowD}
                        className="w-3 h-3"
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </TouchableHighlight>
                <View className="h-0 border-b-2 border-2 border-primary overflow-hidden rounded-b-xl -top-7 -z-10"/>
              </>
            ) : (
              <>
                <TouchableHighlight
                  underlayColor={"#d9ffe6"}
                  className="w-full rounded-xl bg-white z-10"
                  onPress={() => toggleFAQ(faq.id)}
                >
                  <View className="w-full flex-row px-3 py-2 rounded-t-xl border-2 border-primary items-center">
                    <Text className="w-[90%] font-rbase text-base text-black">{faq.question}</Text>
                    <View className="w-[10%] items-end justify-center">
                      <Image
                        tintColor="#57b378"
                        source={icons.arrowU}
                        className="w-3 h-3"
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </TouchableHighlight>
                <View className="border-b-2 border-x-2 border-primary rounded-b-xl overflow-hidden">
                  <View className="w-full h-fit items-center justify-center py-4">
                    <Text className="font-rbase text-justify text-base text-black px-3">
                      {faq.answer}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="w-full h-full bg-white justify-center items-center">
      <Reporting visible={showTutorial && selectedTutorial === 'reporting'} onClose={closeTutorial} />
      <Exploring visible={showTutorial && selectedTutorial === 'exploring'} onClose={closeTutorial} />
      <Applying visible={showTutorial && selectedTutorial === 'applying'} onClose={closeTutorial} />
      <View className="w-full h-full bg-white">
        <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full bg-white" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
          {/* Tutorial */}
          <View className="w-full min-h-[30vh] bg-white">
            <Text className="font-rbold text-2xl text-black pt-[5%] pb-[3%] left-[5%]">{'Tutorials'}</Text>
            <Text className=" font-rbase text-base text-black left-[5%] mb-[2%]">{'For your guides and process tutorial.'}</Text>
            <View className="w-full h-[250px] mb-[2%]">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                {/* Report Emergency Tutorial */}
                <View className="w-36 h-[90%] bg-blue-400 rounded-lg shadow-lg shadow-black mx-3 overflow-hidden">
                  <View className="w-full h-[50%]">
                    <Image 
                      tintColor='#c7e0ff'
                      source={icons.reportPoster}
                      className="w-20 h-20 absolute top-[10%] right-[3%]"
                      style={{ transform: [{ rotate: '-20deg' }] }}
                      resizeMode='contain'
                    />
                  </View>
                  <Image 
                    tintColor='#94c4ff'
                    source={icons.close}
                    className="w-8 h-8 absolute top-[10%] left-[3%] z-10"
                    style={{ transform: [{ rotate: '-20deg' }] }}
                    resizeMode='contain'
                  />
                  <View className="w-40 h-40 bg-[#80b9ff] rounded-full absolute -bottom-[30%] -right-[30%]"/>
                  <View className="w-full h-[50%] items-center">
                    <View className="w-full h-fit top-[%]">
                      <Text className="text-white font-psemibold text-sm px-3 text-left">{"HOW DO I"}</Text>
                      <Text className="text-white font-psemibold text-sm px-3 text-left -top-[8%]">{"REPORT AN"}</Text>
                      <Text className="text-white font-pbold text-lg px-3 text-left -top-[16%]">{"EMERGENCY"}</Text>
                    </View>
                    <TouchableOpacity 
                      className="w-[90%] h-fit rounded-sm bg-black z-10 items-center justify-center absolute bottom-[14%]" 
                      onPress={() => {
                        setShowTutorial(true);
                        setSelectedTutorial('reporting');
                      }}
                    >
                      <Text className="py-1 text-white font-pregular text-sm">{"Get Started"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Explore Map Tutorial */}
                <View className="w-36 h-[90%] bg-lime-400 rounded-lg shadow-lg shadow-black mr-4 overflow-hidden">
                  <View className="w-full h-[50%] items-center justify-center z-10">
                    <View className="w-full h-fit">
                      <Text className="text-white font-psemibold text-sm px-3 text-left">{"HOW DO I"}</Text>
                      <Text className="text-white font-psemibold text-sm px-3 text-left -top-[8%]">{"EXPLORE THE"}</Text>
                      <Text className="text-white font-pbold text-xl px-3 text-left -top-[16%]">{"MAP"}</Text>
                    </View>
                  </View>
                  <View className="w-full h-[50%] items-center justify-center">
                    <Image 
                      tintColor='#f7ffe8'
                      source={icons.mapPoster}
                      className="w-20 h-20 absolute -top-[20%] right-[3%]"
                      resizeMode='contain'
                    />
                    <TouchableOpacity 
                      className="w-[90%] h-fit rounded-sm bg-black z-20 items-center justify-center absolute bottom-[14%]"
                      onPress={() => {
                        setShowTutorial(true);
                        setSelectedTutorial('exploring');
                      }}
                    >
                      <Text className="py-1 text-white font-pregular text-sm">{"Get Started"}</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="w-40 h-40 bg-[#94d130] rounded-full absolute -top-[20%] -left-[30%]"/>
                </View>
                {/* Apply To Be Responder Tutorial */}
                <View className="w-36 h-[90%] bg-violet-400 rounded-lg shadow-lg shadow-black mr-3 overflow-hidden">
                  <View className="w-full h-[50%] items-center justify-center z-10">
                    <View className="w-full h-fit">
                      <Text className="text-white font-psemibold text-sm px-3 text-right">{"HOW DO I"}</Text>
                      <Text className="text-white font-psemibold text-sm px-3 text-right -top-[8%]">{"APPLY AS A"}</Text>
                      <Text className="text-white font-pbold text-xl px-3 text-right -top-[16%]">{"RESPONDER"}</Text>
                    </View>
                  </View>
                  <View className="w-full h-[50%] items-center justify-center">
                    <View className="w-20 h-20 rounded-full absolute -top-[20%] left-[3%] z-10 items-center justify-center overflow-hidden">
                      <Image 
                        tintColor='#f5f2ff'
                        source={icons.responder}
                        className="w-full h-full"
                        style={{ transform: [{ rotate: '-10deg' }] }}
                        resizeMode='contain'
                      />
                    </View>
                    <Image 
                      tintColor='#c8b5ff'
                      source={icons.electric}
                      className="w-10 h-10 absolute top-[10%] right-[10%]"
                      resizeMode='contain'
                      style={{ transform: [{ rotate: '-10deg' }] }}
                    />
                    <TouchableOpacity 
                      className="w-[90%] h-fit rounded-sm bg-black z-20 items-center justify-center absolute bottom-[14%]"
                      onPress={() => {
                        setShowTutorial(true);
                        setSelectedTutorial('applying');
                      }}
                    >
                      <Text className="py-1 text-white font-pregular text-sm">{"Get Started"}</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="w-40 h-40 bg-[#9a78ff] rounded-full absolute -top-[25%] -right-[5%] -z-20"/>
                </View>
              </ScrollView>
            </View>
          </View>
          {/* FAQ */}
          <View className="w-full bg-white pb-6">
            <View className="w-[60%] h-12 z-20 absolute right-[2%] top-2 items-center flex-row bg-white border-b-2 border-slate-400">
              <View className="w-[20%] h-full items-center justify-center">
                <Image 
                    tintColor='#94a3b8'
                    source={icons.search}
                    className="w-[40%] h-[40%]"
                    resizeMode='contain'
                  />
              </View>
              <View className="w-[80%] h-full items-center justify-center px-2">
                <TextInput
                  placeholder="Ask Question"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  editable={true}
                  className="w-full h-full z-30 text-base font-rbase text-black"
                />
              </View>
            </View>
            <Text className="font-rbold text-2xl text-black pt-[5%] pb-[3%] left-[5%]">{'FAQ'}</Text>
            {/* Frequently Asked Questions */}
            <View className="w-full bg-white p-2">
              {searchQuery && filteredFAQs.length === 0 ? (
                <>
                  <TouchableHighlight
                    underlayColor={"#d9ffe6"}
                    className="w-full rounded-xl bg-white z-10"
                    onPress={() => changePage('home/settings')}
                  >
                    <View className="w-full flex-row px-3 py-2 rounded-xl border-2 border-primary items-center">
                      <Text className="w-[90%] font-rbase text-base">
                        {'Ask Your Question to Support'}
                      </Text>
                      <View className="w-[10%] items-end justify-center">
                        <Image
                          tintColor="#57b378"
                          source={icons.missing}
                          className="w-6 h-6"
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                  </TouchableHighlight>
                  <View className="h-0 border-b-2 border-2 border-primary overflow-hidden rounded-b-xl -top-7 -z-10"/>
                </>
              ) : (
                <FAQList faqs={searchQuery ? filteredFAQs.slice(0, 10) : FAQdata.slice(0, 5)} />
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HelpScreen;