import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { icons } from '../../constants'

const Terms = ({ visible, onClose }) => {
  const [view, setView] = useState('view1');
  const [checkBox, setCheckBox] = useState(false)

  const handleAgree = () => {
    // Implement agree logic here
    console.log('Terms and Conditions Agreed!');
  };

  return (
    <Modal
      transparent={true}
      animationType='slide'
      visible={visible}
      onRequestClose={onClose}
    >
    <SafeAreaView className="bg-white h-full w-full pt-6">

        <View className="top-2 border-primary-100 border-b-2 items-center pb-4">
          <Text className="text-3xl font-pbold text-primary">Terms and Conditions</Text>
        </View>
      <View className="items-center pr-2 pl-2">
        {/* Title: Terms and Conditions */}
        <View className="px-2 pb-2">
          {/* Description */}
          <Text className="text-md font-pregular text-black pt-5 pr-2">Our Terms and Conditions were last updated on{' '}<Text className="font-psemibold text-primary">May 09, 2024</Text>.
            {"\n"}Read the following carefully before using{" "}<Text className="font-psemibold text-primary">Our Service</Text>.
          </Text>
        </View>

        {/* Text Container - Split into Two (Button Container and Terms Container) */}
        <View className="bg-primary w-full flex-row rounded-2xl" style={{paddingVertical: 15}}>

            {/* Button Container */}
            <View className="w-1/4 h-[70%] justify-center">
              <View className="pt-36"></View>

              {/* Acknowledgement Button
                This logic is used because we want a border when clicking the button*/}
              {view === 'view1' ? (
                <TouchableOpacity className="bg-white items-center py-5 border-l-4 border-t-4 border-b-4 border-r-0 border-secondary-100" onPress={() => setView('view1')}>
                  <Image 
                    tintColor="#57b378"
                    source={icons.terms}
                    className="w-12 h-12"
                    resizeMode='contain'
                    />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity className="bg-slate-200 items-center py-5 border-l-4 border-t-4 border-b-4 border-r-0 border-primary" onPress={() => setView('view1')}>
                  <Image 
                    tintColor="#57b378"
                    source={icons.terms}
                    className="w-12 h-12"
                    resizeMode='contain'
                    />
                </TouchableOpacity>
              )}

              <View className="pb-3"></View>

              {/* Accounts and Features Button */}
              {view === 'view2' ? (
                <TouchableOpacity className="bg-white items-center py-5 border-l-4 border-t-4 border-b-4 border-r-0 border-secondary-100" onPress={() => setView('view2')}>
                <Image 
                  tintColor="#57b378"
                  source={icons.accountManagement}
                  className="w-12 h-12"
                  resizeMode='contain'
                  />
              </TouchableOpacity>
              ) : (
                <TouchableOpacity className="bg-slate-200 items-center py-5 border-l-4 border-t-4 border-b-4 border-r-0 border-primary" onPress={() => setView('view2')}>
                  <Image 
                    tintColor="#57b378"
                    source={icons.accountManagement}
                    className="w-12 h-12"
                    resizeMode='contain'
                    />
                </TouchableOpacity>
              )}

              <View className="pb-3"></View>

              {/* Suspension and Termination Button */}
              {view === 'view3' ? (
                <TouchableOpacity className="bg-white items-center py-5 border-l-4 border-t-4 border-b-4 border-r-0 border-secondary-100" onPress={() => setView('view3')}>
                <Image 
                  tintColor="#57b378"
                  source={icons.accountBanned}
                  className="w-12 h-12"
                  resizeMode='contain'
                  />
              </TouchableOpacity>
              ) : (
                <TouchableOpacity className="bg-slate-200 items-center py-5 border-l-4 border-t-4 border-b-4 border-r-0 border-primary" onPress={() => setView('view3')}>
                  <Image 
                    tintColor="#57b378"
                    source={icons.accountBanned}
                    className="w-12 h-12"
                    resizeMode='contain'
                    />
                </TouchableOpacity>
              )}

              <View className="pb-3"></View>
              
              {/* Contact Us Button */}
              {view === 'view4' ? (
                <TouchableOpacity className="bg-white items-center py-5 border-l-4 border-t-4 border-b-4 border-r-0 border-secondary-100" onPress={() => setView('view4')}>
                <Image 
                  tintColor="#57b378"
                  source={icons.contactUs}
                  className="w-12 h-12"
                  resizeMode='contain'
                  />
              </TouchableOpacity>
              ) : (
                <TouchableOpacity className="bg-slate-200 items-center py-5 border-l-4 border-t-4 border-b-4 border-r-0 border-primary" onPress={() => setView('view4')}>
                  <Image 
                    tintColor="#57b378"
                    source={icons.contactUs}
                    className="w-12 h-12"
                    resizeMode='contain'
                    />
                </TouchableOpacity>
              )}
            </View>

            {/* Terms Container */}
            <View className="w-3/4 justify-center">
              {/* Same logic is used for Different Views */}
            {view === 'view1' ? (
              <ScrollView style={{width: '95%', height: '70%' , backgroundColor: 'white'}}>
                {/* Acknowledgement Form */}
                <View className="px-3 mx-3">
                  <Text className="text-primary font-pbold text-xl pt-4">Interpretation</Text>
                  <Text className="font-pregular text-sm text-black pt-7 text-justify">The words of which the initial letter is capitalized 
                    have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of 
                    whether they appear in singular or in plural.
                  </Text>
                  <Text className="text-primary font-pbold text-xl pt-7 pb-7">Definitions</Text>
                  <Text className="font-pregular text-sm text-black text-justify">For the purposes of these Terms and Conditions: {"\n"} {"\n"}
                    <Text className="font-pbold">•{"   "}"Account"</Text>{" "}means a unique account created for You to access our Service or parts of our Service. {"\n"}
                    <Text className="font-pbold">•{"   "}"Application"</Text>{" "}means GEOMAP and the features it provides.{"\n"}
                    <Text className="font-pbold">•{"   "}"Content"</Text>{" "} refers to content such as text, images or other information that can be posted, uploaded, linked to or otherwise made available by You, regardless of the form of the content.{"\n"}
                    <Text className="font-pbold">•{"   "}"Device"</Text>{" "}means any device that can access the Service such as a cellphone or a digital tablet.{"\n"}
                    <Text className="font-pbold">•{"   "}"Feedback"</Text>{" "}means feedback, innovations or suggestions sent by You regarding the attributes, performance or features of our Service.{"\n"}
                    <Text className="font-pbold">•{"   "}"Service"</Text>{" "}refers to the Application.{"\n"}
                    <Text className="font-pbold">•{"   "}“Terms and Conditions”</Text>{" "}{"("}also referred as <Text className="font-pbold">“Terms”</Text>{")"} mean these Terms and Conditions that form the entire agreement between You and the Project Researchers regarding the use of the Service.{"\n"}
                    <Text className="font-pbold">•{"   "}"You"</Text>{" "} means the individual accessing or using the Service.{"\n"}
                  </Text>
                  <Text className="text-primary font-pbold text-xl pt-7 pb-7">Acknowledgement</Text>
                  <Text className="font-pregular text-sm text-black text-justify">
                    These are the Terms and Conditions governing the use of this Service and the agreement that operates between 
                    You and the Project Researchers. These Terms and Conditions set out the rights and obligations of all users regarding 
                    the use of the Service. {"\n"} {"\n"}
                    Your access to use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. 
                    These Terms and Conditions apply to all visitors, users, administrators, and others who access or use the Service. {"\n"} {"\n"}
                    By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part 
                    of these Terms and Conditions then You may not access the Service. {"\n"} {"\n"}
                    You represent that you are a registered citizen with a government approved identification in your barangay, municipality 
                    or city. The Application does not permit individuals without a government identification card. {"\n"} {"\n"}
                    Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy 
                    Policy of the Application. Our Privacy Policy describes Our policies and procedures on the collection, use and 
                    disclosure of Your personal information when You use the Application and tells You about Your privacy rights and 
                    how the law protects You. {"\n"}
                    Please read Our Privacy Policy carefully before using Our Service.
                  </Text>
                  <Text className="text-primary font-pbold text-xl pb-7">Changes to These Terms and Conditions</Text>
                  <Text className="font-pregular text-sm text-black text-justify">
                  We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. 
                  If a revision is material, We will make reasonable efforts to provide at least thirty {"(30) days’ "}
                  notice prior to any new terms taking effect. What constitutes a material change will be determined 
                  at Our sole discretion. {"\n"} {"\n"}
                  By continuing access or using Our Service after those revisions become effective, 
                  You agree to be bound by the revised terms. If You do not agree to the new Terms and Conditions, 
                  in whole or in part, please stop using the application and the Service.
                  </Text>
                </View>
              </ScrollView>
            ) : view === 'view2' ? (
              <ScrollView style={{width: '95%', height: '70%' , backgroundColor: 'white'}}>
                {/* Account and Features Form */}
                <View className="px-3 mx-3">
                  <Text className="text-primary font-pbold text-xl pt-4">User Accounts</Text>
                  <Text className="font-pregular text-sm text-black pt-7 text-justify">
                    When You create an account with Us, You must provide Us information that is accurate, 
                    complete and updated at all times, such as full name, address, phone number, current email address 
                    and a proof of identification or residency, any government approved identification card. 
                    Failure to comply constitutes a breach of the Terms, which may result in immediate termination of 
                    Your account on Our Service. {"\n"} {"\n"}
                    You are responsible for safeguarding the password that You use to access the Service for any activities 
                    or actions under Your password, whether Your password is with Our Service or a Third-Party Service. {"\n"} {"\n"}
                    You agree not to disclose Your password to any third party. You must notify Us immediately upon becoming aware 
                    of any breach of security or unauthorized use of Your account. {"\n"} {"\n"}
                    You may not use as a username the name of another person or entity or that is not lawfully available for use, 
                    a name or trademark that is subject to any rights of another person or entity other than You without appropriate 
                    authorization, or a name that is otherwise offensive, vulgar or obscene.
                  </Text>
                  <Text className="text-primary font-pbold text-xl pt-4">Community Reports</Text>
                  <Text className="font-pregular text-sm text-black pt-7 text-justify">
                  When You report an emergency using Our Service, You must include important and precise details such as 
                  the type of accident, incident or emergency that happened, how many victims / individuals are involved with 
                  the emergency, and if there is a need for any medical services and if the first aid is administered {"(if any)"}.{"\n"} {"\n"}
                  Your Reports will follow five {"(5) Ws and one (1)"} H structure beginning with; {"\n"}
                  <Text className="font-pbold">What</Text>, what type of accident, incident or emergency happened; {"\n"}
                  <Text className="font-pbold">Where</Text>, where did it happened; {"\n"}
                  <Text className="font-pbold">When</Text>, when did the emergency happened; {"\n"}
                  <Text className="font-pbold">Who</Text>, who are the individuals involved; {"\n"}
                  <Text className="font-pbold">Why</Text>, why did the emergency happened, and finally; {"\n"}
                  <Text className="font-pbold">How</Text>, how did the emergency happened.{"\n"} {"\n"}
                  You are agreeing to Report with <Text className="font-psemibold">accuracy, credibility and validity</Text>. 
                  Whether or not, <Text className="font-psemibold">Our Responders will treat every Report as serious and are acted upon</Text>. Any false Reports will be 
                  faced with appropriate repercussions, such as <Text className="font-psemibold">account suspension or termination</Text>. {"\n"} {"\n"}
                  You are agreeing to not distribute and disclose Your Report to Non-Authorized Personnel. 
                  Your Reports will be treated with Privacy for the individuals and Responders involved.
                  </Text>
                  <Text className="text-primary font-pbold text-xl pt-7 pb-7">Tracking and Camera</Text>
                  <Text className="font-pregular text-sm text-black text-justify">
                  You agree to turn on Your Global Positioning System {"(GPS)"} when using Our Services. 
                  You are agreeing to be tracked upon filing a Report. By doing this, You grant Us to provide the exact 
                  location of the Emergency to Our Responders. {"\n"} {"\n"}
                  You are giving Us permission to use Your Camera and use Your Captured Photo of the emergency as evidence for 
                  Emergency and Report Verification. You are assigning Us all the rights of Your Captured Photo, 
                  You allow Us and Our Service to extract relevant data from Your Captured Photo such as, time it was taken, 
                  location where it was taken and Photo ID. {"\n"} {"\n"}
                  By doing this, You provided the answer to Where, as Our Service will extract the data of Your location 
                  from the moment You hit Report, and When, as Our Service will extract data from Your Capture Photo from the 
                  moment You hit Submit.
                  </Text>
              </View>
              </ScrollView>
            ) : view === 'view3' ? (
              <ScrollView style={{width: '95%', height: '70%' , backgroundColor: 'white'}}>
                {/* Suspension and Termination Form */}
                <View className="px-3 mx-3">
                  <Text className="text-primary font-pbold text-xl pt-4">Suspension and Termination</Text>
                  <Text className="font-pregular text-sm text-black pt-7 text-justify">
                  We may suspend or terminate Your Account immediately, without prior notice or liability, for reason such as: {"\n"} 
                  <Text className="font-psemibold">•{" "}</Text>{" "}unauthorized distribution {"(of sensitive details and data, of the application)."}{"\n"}
                  <Text className="font-psemibold">•{" "}</Text>{" "}breach of Terms and Conditions.{"\n"}
                  <Text className="font-psemibold">•{" "}</Text>{" "}multiple filing of false reports {"(maximum of three (3) times)"}{"\n"} {"\n"}
                  Upon termination, Your right to use the Service will cease immediately. If You wish to terminate Your Account, 
                  You may simply discontinue using the Service.
                  </Text>
                  <Text className="text-primary font-pbold text-xl pt-4">Governing Law</Text>
                  <Text className="font-pregular text-sm text-black pt-7 text-justify">
                  The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. 
                  Your use of the Application may also be subjected to other local, state, national or international laws.
                  </Text>
                  <Text className="text-primary font-pbold text-xl pt-4">Disputes Resolution</Text>
                  <Text className="font-pregular text-sm text-black pt-7 pb-12 text-justify">
                  If You have any concerns or disputes about the Service, You agree to first try to resolve 
                  the dispute informally by contacting Us the Project Researchers.
                  </Text>
                </View>
              </ScrollView>
            ) : (
              <ScrollView style={{width: '95%', height: '70%' , backgroundColor: 'white'}}>
                {/* Contact Us Form */}
                <View className="px-3 mx-3">
                  <Text className="text-primary font-pbold text-xl pt-4">Your Feedback to Us</Text>
                  <Text className="font-pregular text-sm text-black pt-7 text-justify">
                  You assign all rights, title and interest in any Feedback You provide the Application. 
                  If for any reason such assignment is ineffective, You agree to grant Us to use your 
                  feedback to improve, upgrade, collect and use in our Results and Discussion. 
                  You also allow Us to disclose, use, modify and distribute such Feedback without restrictions.
                  </Text>
                  <Text className="text-primary font-pbold text-xl pt-4">Contact Us</Text>
                  <Text className="font-pregular text-sm text-black pt-7 text-left">
                  If you have any questions about these Terms and Conditions, You can contact us: {"\n"} {"\n"}
                  <Text className="font-psemibold">•{" "}</Text>{" "}By using the About Us Page. {"\n"}
                  <Text className="font-psemibold">•{" "}</Text>{" "}By sending us an email:
                  </Text>
                  <TouchableOpacity><Text className="font-pregular text-sm text-blue-500 text-left pb-12">geomap24@gmail.com</Text></TouchableOpacity>
                </View>
              </ScrollView>
            )}
            </View>
        </View>
      </View>
      {/* Footer */}
      <View className="bottom-7 h-28 w-full flex-row bg-primary items-center justify-center border-t-2 border-primary-100 pr-5 pb-4">
          <TouchableOpacity className="w-1/4 items-center" onPress={() => setCheckBox(!checkBox)}>
            <Image 
              tintColor="#ffffff"
              source={!checkBox ? icons.checkBox : icons.checkBoxCheck}
              className="w-6 h-6"
              resizeMode='contain'
            />
          </TouchableOpacity>
          <TouchableOpacity className="w-3/4 h-12" style={styles.agreeButton} onPress={onClose}>
              <Text className="text-primary font-psemibold text-xl">I UNDERSTAND</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
    </Modal>
  )
}

export default Terms

const styles = StyleSheet.create({
  agreeButton: {
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
},
})