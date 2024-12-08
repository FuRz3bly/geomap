import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, TouchableHighlight, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../../constants';

const Terms = ({ visible, onClose, onAccept, page, tab }) => {
    const { height } = Dimensions.get('screen'); // Width of screens for Changes
    const [view, setView] = useState('view1');
    const scrollViewRef = useRef(null);
    const [checkBox, setCheckBox] = useState(false);
    const [authorized, setAuthorized] = useState(false);

    const changeView = (newView) => {
        setView(newView);
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    };

    const toggleUnderstand = () => {
        setAuthorized(true);
        onAccept();
        onClose();
    };

    useEffect(() => {
        if (page) {
          setView(page);
    
          // Delay the scroll action to ensure the modal is fully rendered
          const delay = visible ? 300 : 100; // Longer delay if the modal just became visible
          if (scrollViewRef.current) {
            if (page === 'view2' && tab === 'report') {
              setTimeout(() => {
                if (height < 900) {
                    scrollViewRef.current?.scrollTo({ x: 0, y: 680, animated: true });
                } else {
                    scrollViewRef.current?.scrollTo({ x: 0, y: 830, animated: true });
                }
              }, delay);
            } else if (page === 'view2' && tab === 'account') {
              setTimeout(() => {
                scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
              }, delay);
            }
          }
        } else {
          setView('view1');
        }
        // Reset scroll when view changes
        if (scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
          }, 100);
        }
      }, [page, tab, visible]);

    return (
        <Modal
            isVisible={visible}
            backdropColor='black'
            backdropOpacity={0.3}
            hideModalContentWhileAnimating={true}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={600}
            animationOutTiming={1000}
        >
            <SafeAreaView className="w-full items-center justify-center">
                {/* Terms and Conditions Modal */}
                <View className={`w-[110%] ${height < 900 ? 'h-[101%]' : 'h-[97%]'} bg-white items-center justify-center rounded-3xl overflow-hidden`}>
                    {/* Terms and Conditions - Title */}
                    <View className="w-full border-primary border-b-0.5 items-center py-5">
                        <Text className="text-2xl font-psemibold text-primary">Terms and Conditions</Text>
                    </View>
                    {/* Description */}
                    <Text className="text-sm font-pregular text-black text-justify py-5">
                    {'Our Terms and Conditions were last updated on\n'}<Text className="font-psemibold text-primary">November 12, 2024</Text>{'.'}
                    {'\n\nPlease read these terms and conditions carefully\nbefore using '}<Text className="font-psemibold text-primary">Our Service</Text>.
                    </Text>
                    {/* Container [Button | Text] */}
                    <View className="w-full h-[60%] flex-row bg-primary border-t-0.5 border-primary">
                    {/* Buttons Container */}
                    <View className="w-1/4 h-full bg-primary justify-between">
                        {/* Terms and Conditions */}
                        <TouchableHighlight underlayColor={"#FDFFAE"} className={`w-full h-1/4 py-4 items-center justify-center ${view === 'view1' ? 'border-white bg-white' : 'border-primary bg-primary'}`} onPress={() => changeView('view1')}>
                        <Image 
                            tintColor={view === 'view1' ? '#57b378' : '#ffffff'}
                            source={icons.terms}
                            className="w-full h-full"
                            resizeMode='contain'
                        />
                        </TouchableHighlight>
                        {/* Account Management */}
                        <TouchableHighlight underlayColor={"#FDFFAE"} className={`w-full h-1/4 py-5 items-center justify-center ${view === 'view2' ? 'border-white bg-white' : 'border-primary bg-primary'}`} onPress={() => changeView('view2')}>
                        <Image 
                            tintColor={view === 'view2' ? '#57b378' : '#ffffff'}
                            source={icons.accountManagement}
                            className="w-full h-full"
                            resizeMode='contain'
                        />
                        </TouchableHighlight>
                        {/* Suspension and Termination */}
                        <TouchableHighlight underlayColor={"#FDFFAE"} className={`w-full h-1/4 py-5 items-center justify-center ${view === 'view3' ? 'border-white bg-white' : 'border-primary bg-primary'}`} onPress={() => changeView('view3')}>
                        <Image 
                            tintColor={view === 'view3' ? '#57b378' : '#ffffff'}
                            source={icons.accountBanned}
                            className="w-full h-full"
                            resizeMode='contain'
                        />
                        </TouchableHighlight>
                        {/* Contact Us */}
                        <TouchableHighlight underlayColor={"#FDFFAE"} className={`w-full h-1/4 py-4 items-center justify-center ${view === 'view4' ? 'border-white bg-white' : 'border-primary bg-primary'}`} onPress={() => changeView('view4')}>
                        <Image 
                            tintColor={view === 'view4' ? '#57b378' : '#ffffff'}
                            source={icons.contactUs}
                            className="w-full h-full"
                            resizeMode='contain'
                        />
                        </TouchableHighlight>
                    </View>
                    {view === 'view1' ? (
                        <View className="w-3/4 justify-center bg-white">
                        <ScrollView showsVerticalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center'}} ref={scrollViewRef}>
                            {/* Acknowledgement Form */}
                            <View className="px-3 mx-3">
                            <Text className="text-primary font-pbold text-xl pt-4">Interpretation</Text>
                            <Text className="font-pregular text-sm text-black pt-7 text-justify">The words of which the initial letter is capitalized 
                                have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of 
                                whether they appear in singular or in plural.
                            </Text>
                            <Text className="text-primary font-pbold text-xl pt-7 pb-7">Definitions</Text>
                            <Text className="font-pregular text-sm text-black text-justify">For the purposes of these Terms and Conditions:{'\n'}</Text>
                            <Text className="font-pregular text-sm text-black">
                                <Text className="font-pbold">•{" "}"Account"</Text>{" "}means a unique account created for You to access our Service or parts of our Service.{"\n"}
                                <Text className="font-pbold">•{" "}"Application"</Text>{" "}means GEOMAP and the features it provides.{"\n"}
                                <Text className="font-pbold">•{" "}"Content"</Text>{" "} refers to content such as text, images or other information that can be posted, uploaded, linked to or otherwise made available by You, regardless of the form of the content.{"\n"}
                                <Text className="font-pbold">•{" "}"Device"</Text>{" "}means any device that can access the Service such as a cellphone or a digital tablet.{"\n"}
                                <Text className="font-pbold">•{" "}"Feedback"</Text>{" "}means feedback, innovations or suggestions sent by You regarding the attributes, performance or features of our Service.{"\n"}
                                <Text className="font-pbold">•{" "}"Service"</Text>{" "}refers to the Application.{"\n"}
                                <Text className="font-pbold">•{" "}“Terms and Conditions”</Text>{" "}{"("}also referred as <Text className="font-pbold">“Terms”</Text>{")"} mean these Terms and Conditions that form the entire agreement between You and the Project Researchers regarding the use of the Service.{"\n"}
                                <Text className="font-pbold">•{" "}"You"</Text>{" "} means the individual accessing or using the Service.{"\n"}
                            </Text>
                            <Text className="text-primary font-pbold text-xl py-7">Acknowledgement</Text>
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
                            <Text className="text-primary font-pbold text-xl py-7">Data Privacy</Text>
                            <Text className="font-pregular text-sm text-black text-justify">
                                {`"Data Privacy", also called "Information Privacy" is the principle that a person should have control over their Personal Data, including the ability to decide how organizations collect, store, and use their data. (Kosinski & Forrest 2023)`}
                            </Text>
                            <Text className="text-primary font-pbold text-xl py-7">Why is Data Privacy Important?</Text>
                            <Text className="font-pregular text-sm text-black text-justify">
                                {`We have never given our personal information as easily as we do today. Technology, and the convenience it offers, has seduced us into handing over our names, addresses, and phone numbers so willingly. Personal data is exchanged for free online and offline services, loyalty card discounts, and personalized brand experiences, among others. But giving out personal data comes at a potential cost.  Security breaches happen where personal information gets destroyed, lost, altered or disclosed, accessed, and processed without consent. Many times, these instances lead to identity theft, fraud, duplication of credit cards, blackmail and damaged reputation - both among individuals and organizations. These breaches are on the rise as organizations increasingly rely on digital data, making data protection more important than ever.`}
                            </Text>
                            <Text className="text-primary font-pbold text-xl pt-2 pb-7">Personal VS. Sensitive</Text>
                            <Text className="font-pregular text-sm text-black text-justify">
                                {`Personal Information - Refers to any information whether recorded in material form or not, from which the identity of an individual is apparent or can be reasonably and directly ascertained by the entity holding the information, or when put together with other information would directly and certainly identify an individual such as:`}
                                <Text className="font-pbold">{"\n\n"}•{" "}Full Name</Text>{"\n"}
                                <Text className="font-pbold">•{" "}Address</Text>{"\n"}
                                <Text className="font-pbold">•{" "}Email Address</Text>{"\n"}
                                <Text className="font-pbold">•{" "}Phone Number</Text>{"\n"}
                                <Text className="font-pbold">•{" "}Date of Birth</Text>{"\n\n"}
                                {`Sensitive Personal Information - Data on a person's race, ethnic origin, political opinion, religious/similar beliefs, health, sexual life, (alleged) offenses, and court proceedings, trade union membership.`}
                                <Text className="font-pbold">{"\n\n"}•{" "}Health Records</Text>{"\n"}
                                <Text className="font-pbold">•{" "}Racial or Ethnic Origin</Text>{"\n"}
                                <Text className="font-pbold">•{" "}Religious / Philosophical / Political Beliefs</Text>{"\n"}
                                <Text className="font-pbold">•{" "}Sexual Orientation</Text>{"\n"}
                                <Text className="font-pbold">•{" "}Criminal Record</Text>{"\n"}
                                <Text className="font-pbold">•{" "}Education</Text>{"\n"}
                                <Text className="font-pbold">•{" "}Marital Status</Text>{"\n"}
                                <Text className="font-pbold">•{" "}Age</Text>
                            </Text>
                            <Text className="text-primary font-pbold text-xl py-7">Changes to These Terms and Conditions</Text>
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
                        </View>
                    ) : view === 'view2' ? (
                        <View className="w-3/4 justify-center bg-white">
                        <ScrollView showsVerticalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center'}} ref={scrollViewRef}>
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
                            <Text className="text-primary font-pbold text-xl bottom-2 pt-3">Community Reports</Text>
                            <Text className="font-pregular text-sm text-black pt-5 text-justify">
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
                        </View>
                    ) : view === 'view3' ? (
                        <View className="w-3/4 justify-center bg-white">
                        <ScrollView showsVerticalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center'}} ref={scrollViewRef}>
                            {/* Suspension and Termination Form */}
                            <View className="px-3 mx-3">
                            <Text className="text-primary font-pbold text-xl pt-4">Suspension and Termination</Text>
                            <Text className="font-pregular text-sm text-black pt-7 text-justify">
                                We may suspend or terminate Your Account immediately, without prior notice or liability, for reason such as: {"\n"} 
                            <Text className="font-psemibold">•{" "}</Text>{" "}unauthorized distribution {"(of sensitive details and data, of the application)."}{"\n"}
                            <Text className="font-psemibold">•{" "}</Text>{" "}breach of Terms and Conditions.{"\n"}
                            <Text className="font-psemibold">•{" "}</Text>{" "}multiple filing of false reports {"(maximum of three (3) times)"}{"\n"}{"\n"}
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
                        </View>
                    ) : (
                        <View className="w-3/4 justify-center bg-white">
                        <ScrollView showsVerticalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center'}} ref={scrollViewRef}>
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
                            <TouchableOpacity><Text className="font-pregular text-sm text-blue-500 text-left pb-12">geomap2324@gmail.com</Text></TouchableOpacity>
                            </View>
                        </ScrollView>
                        </View>
                    ) }
                    </View>
                    {/* Bottom Container */}
                    <View className="h-[10%] w-full flex-row bg-white items-center justify-center border-t-0.5 border-primary pr-5 pt-2">
                    {!authorized ? (
                    <>
                        <TouchableOpacity className="w-1/4 items-center" onPress={() => setCheckBox(!checkBox)}>
                            <Image 
                            tintColor='#57b378'
                            source={!checkBox ? icons.checkBox : icons.checkBoxCheck}
                            className="w-8 h-8"
                            resizeMode='contain'
                            />
                        </TouchableOpacity>
                        <TouchableOpacity className={`w-3/4 h-12 ${!checkBox ? 'bg-primary-10' : 'bg-primary'} items-center justify-center rounded-full`} onPress={toggleUnderstand} disabled={!checkBox}>
                            <Text className={`${!checkBox ? 'text-primary/50' : 'text-white'} font-psemibold text-xl`}>I UNDERSTAND</Text>
                        </TouchableOpacity>
                    </>
                ) : 
                <>
                    <TouchableOpacity className={`w-3/4 h-12 bg-primary items-center justify-center rounded-full`} onPress={onClose}>
                        <Text className={`text-white font-psemibold text-xl`}>PROCEED</Text>
                    </TouchableOpacity>
                </>}
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export default Terms;