import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TouchableHighlight, ScrollView, ActivityIndicator, BackHandler, Dimensions, LayoutAnimation, Platform, UIManager } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Swiper from 'react-native-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../../firebaseConfig';
const db = getFirestore(app);

import UserContext from '../../../components/UserContext';
import ToolsContext from '../../../components/ToolsContext';
import { translate, getTitle, setTitle } from '../../../components/ToolsContext';
import { images, icons } from '../../../constants';
import { Success, Failed, Menu } from '../../../components/modals';

import ProfileScreen from './profiles';
import DetailScreen from './details';
import MapScreen from './maps';
import ReportScreen from './reports';
import FormScreen from './documents';
import StatisticsScreen from './statistics';
import HelpScreen from './helps';
import SettingsScreen from './settings';

const HomeScreen = () => {
    // Global Variables
    const { user, isResponder } = useContext(UserContext); // User Container
    const { dictionary } = useContext(ToolsContext); // Dictionary Container
    const auth = getAuth(); // Authenticate User Login
    const { name } = useLocalSearchParams(); // Check Upon Logout
    const { width, height } = Dimensions.get('screen');
    // Modal Variables
    const [isWelcomeVisible, setWelcomeVisible] = useState(false); // Welcome Modal Visibility Variable
    const [isFailedVisible, setFailedVisible] = useState(false); // Failed Modal Visibility Variable
    const [isMenuVisible, setMenuVisible] = useState(false); // Menu Modal Visibility Variable
    const [isShown, setShown] = useState(false); // Monitor if Modal is Shown
    const [failedForm, setFailedForm] = useState({ title: 'Login Failed!', description: '' }); // Fail Modal Title & Description
    const closeModal = () => {setWelcomeVisible(false)}; // Close Welcome Modal
    const closeFModal = () => {setFailedVisible(false)}; // Close Failed Modal
    const closeMenu = () => {setMenuVisible(false)}; // Close Menu
    // Pseudo-Modal Variables
    const [isLoadingVisible, setLoadingVisible] = useState(true);
    const [menuVisible, setLocalMenuVisible] = useState(false);
    const [status, setStatus] = useState('');
    const [expandTitle, setExpandTitle] = useState(true);
    const [expandStatus, setExpandStatus] = useState(false);
    const [statusLoading, setStatusLoading] = useState('LOADING DATA');
    const [statusSuccess, setStatusSuccess] = useState('DATA SAVED');
    const [statusFailed, setStatusFailed] = useState('ERROR SAVING');
    // Local Variables
    const [loading, setLoading] = useState(false); // Add loading state
    const [buttonLock, setButtonLock] = useState({}); // Button Lock - Prevent Double Tap
    const [title, setLocalTitle] = useState(getTitle());
    const [pageHistory, setPageHistory] = useState([]);
    const [key, setKey] = useState(0); // Unmounting Menu for reset
    const [profileImage, setProfileImage] = useState(null);

    // Enable LayoutAnimation on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning, ';
        if (hour < 18) return 'Good Afternoon, ';
        return 'Good Evening, ';
    };

    const toggleView = () => {
        LayoutAnimation.configureNext({
            duration: 200,
            update: {
                type: LayoutAnimation.Types.linear,
                property: LayoutAnimation.Properties.scaleX
            },
        });
        setExpandStatus(!expandStatus);
    };

    const toggleMenu = (bool) => {
        setLocalMenuVisible(bool);
        LayoutAnimation.configureNext({
            duration: 200,
            update: {
              type: LayoutAnimation.Types.easeInEaseOut,
              property: LayoutAnimation.Properties.scaleXY,
            },
        });
    };

    // Show Welcome Modal Logic
    useEffect(() => {
        if (name && !isShown) {
          if (!isShown) {
            setWelcomeVisible(true);
            setShown(true);
          }
        }
      }, [name]);

    useEffect(() => {
        if (user) {
            if (user.profile) {
                setProfileImage(user.profile);
            }
        }
    }, [user])

    // Sync Title Name
    useEffect(() => {
        setLocalTitle(getTitle());
    }, []);

    useEffect(() => {
        let timer;
      
        if (status === 'success') {
          // Timer for changing status to 'complete' after 5 seconds
          timer = setTimeout(() => {
            setStatus('complete');
            LayoutAnimation.configureNext({
              duration: 200,
              update: {
                type: LayoutAnimation.Types.linear,
                property: LayoutAnimation.Properties.scaleX,
              },
            });
          }, 5000); // 5 seconds
        }
      
        if (status === 'complete') {
          // Timer for exit animation and resetting status after animation
          timer = setTimeout(() => {
            LayoutAnimation.configureNext({
              duration: 200,
              update: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
              },
            });
      
            // Reset status after exit animation
            setStatus(' ');
          }, 100); // Short delay for exit animation
        }
      
        // Cleanup the timeout if the component unmounts or status changes
        return () => clearTimeout(timer);
    }, [status]);

    // Loading Expanse Trigger
    useEffect(() => {
        // Trigger the first toggle after
        const firstToggle = setTimeout(() => {
            LayoutAnimation.configureNext({
                duration: 200,
                update: {
                    type: LayoutAnimation.Types.linear,
                    property: LayoutAnimation.Properties.scaleX
                },
            });
            setExpandStatus(true);
        }, 2000);

        // Cleanup timeouts when the component is unmounted
        return () => {
            clearTimeout(firstToggle);
        };
    }, [expandStatus]);

    // Disable the back button action when the component is mounted
    useEffect(() => {
        const backAction = () => {
            handleBackButton();
            return true; 
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        // Cleanup the event listener when the component unmounts
        return () => backHandler.remove();
    }, []);

    // Icon Generator Function
    const icogenerator = (key) => {
        const iconKey = dictionary[key + '_icon'];
        return icons[iconKey] || null;
    };

    // Logout Button Function
    const handleLogout = async () => {
        const currentUser = auth.currentUser;
        setPageHistory([]);
        setLoading(true);

        if (currentUser) {
            try {
                // Query Firestore to find the user document with the given email
                const q = query(collection(db, 'users'), where('email', '==', currentUser.email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];

                    // Update the sessionToken field to null
                    await updateDoc(doc(db, 'users', userDoc.id), { session_token: null });

                    // Sign-out successful, navigate to login screen
                    await signOut(auth);
                    router.push('/log-in'); router.push({ pathname: '/log-in', params: { out: JSON.stringify({ title: 'Logout Successful!', description: 'You have been logged out.' })}, });
                    setMenuVisible(false); // If Menu Shows Up When Logging Out
                    setLoading(false);
                }
            } catch (error) {
                // Handle errors
                setFailedForm({ title: 'Logout Error!', description: error.message })
                setFailedVisible(true);
                setLoading(false);
            }
        }
    };

    // Menu Button Function
    const handlePress = (path) => {
        setTitle(path);
        setLocalTitle(path);
        // Add the current page to the history stack before navigating
        setPageHistory(prevHistory => [...prevHistory, title]);
        if (buttonLock[path]) return;
        LayoutAnimation.configureNext({
            duration: 200,
            update: {
                type: LayoutAnimation.Types.linear,
                property: LayoutAnimation.Properties.scaleXY
            },
        });
        if (path === 'home/documents') {
            setExpandTitle(false);
        } else if (path === 'home/profiles') {
            setExpandTitle(true);
        }

        setButtonLock((prev) => ({ ...prev, [path]: true }));
        setTimeout(() => {
          setButtonLock((prev) => ({ ...prev, [path]: false }));
        }, 500); // Adjust delay as needed

    };

    // In Page Re-routing Function
    const handleChangePage = (path) => {
        setTitle(path);
        setLocalTitle(path);
        setKey(prevKey => prevKey + 1);
        
        // Add the current page to the history stack before navigating
        setPageHistory(prevHistory => [...prevHistory, title]);
        
        if (buttonLock[path]) return;
    
        setButtonLock((prev) => ({ ...prev, [path]: true }));
        setTimeout(() => {
            setButtonLock((prev) => ({ ...prev, [path]: false }));
        }, 500); // Adjust delay as needed
    };

    const handleBackButton = () => {
        if (pageHistory.length > 0) {
            const previousPage = pageHistory[pageHistory.length - 1];
            setPageHistory(prevHistory => prevHistory.slice(0, -1));
            setTitle(previousPage);
            setLocalTitle(previousPage);
            setKey(prevKey => prevKey + 1);
        }
    };

    // Show a loading indicator while checking the user type
    if (loading) {
        return (
            <SafeAreaView className="w-full h-full bg-white">
                {/* Menu Title */}
                <View className="w-full h-[10%] bg-primary flex-row">
                    {/* Menu Button */}
                    <View className="w-1/3 h-full">
                        <TouchableOpacity className="w-full h-full justify-center pl-4" onPress={() => setMenuVisible(true)} disabled>
                            <Image 
                                tintColor="#ffffff"
                                source={icons.menu}
                                className="w-[35%] h-[35%]"
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </View>
                    {/* Menu Title */}
                    <View className="w-1/3 h-full bg-primary justify-center items-center">
                        {title && (<Text className="font-rmedium text-white text-xl">{translate(title)}</Text>)}
                    </View>
                </View>
                {/* Status Indicator */}
                <View className="w-full h-[94%] -top-8 items-center overflow-hidden">
                    <TouchableOpacity className="w-full h-12 justify-center items-center absolute top-[6%] z-10" onPress={toggleView} activeOpacity={1} disabled>
                        {/* Loading Status */}
                        <View className="w-[50%] h-12 items-center bg-white rounded-3xl flex-row overflow-hidden shadow-md shadow-black">
                            <View className="w-1/3 h-full justify-center">
                                <ActivityIndicator size="large" color="#57b378" />
                            </View>
                            <View className="w-2/3 h-full justify-center">
                                <Text className="font-rblack text-primary text-sm text-center" numberOfLines={1} ellipsizeMode="tail">
                                {'LOGGING OUT'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
    
    return (
        <SafeAreaView className="w-full h-full bg-white">
            {/* Modals */}
            <Success visible={isWelcomeVisible} onClose={closeModal} title={'Login Successful!'} description={`Welcome ${name} to GEOMAP`} />
            <Failed visible={isFailedVisible} onClose={closeFModal} title={failedForm.title} description={failedForm.description} />
            <Menu key={key} visible={isMenuVisible} onClose={closeMenu} respo={isResponder} logout={handleLogout} changePage={handlePress} />
            {/* Menu Bar */}
            {!menuVisible ? (
                <>
                    <View className="w-full h-[10%] bg-primary flex-row z-10">
                        {/* Menu Button */}
                        <View className="w-1/3 h-full">
                            <TouchableOpacity className="w-full h-full justify-center pl-4" onPress={() => setMenuVisible(true)}>
                                <Image 
                                    tintColor="#ffffff"
                                    source={icons.menu}
                                    className="w-[35%] h-[35%]"
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>
                        </View>
                        {/* Menu Title */}
                        <View className="w-1/3 h-full justify-center items-center">
                            {title !== null && (
                                <>
                                    <TouchableOpacity 
                                        className="w-full h-full items-center justify-center"
                                        onPress={() => {
                                            LayoutAnimation.configureNext({
                                                duration: 400,
                                                update: {
                                                    type: LayoutAnimation.Types.easeInEaseOut,
                                                    property: LayoutAnimation.Properties.scaleXY
                                                },
                                            });
                                            setExpandTitle(!expandTitle);
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        {expandTitle ? (
                                            <Text className="font-rmedium text-white text-xl">{translate(title)}</Text>
                                        ) : (
                                            <Image
                                                tintColor='#ffffff'
                                                source={icogenerator(title)}
                                                className="w-[30%] h-[30%]"
                                                resizeMode='contain'
                                            />
                                        )}
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                        {/* Other Buttons */}
                        <View className="w-1/3 h-full">
                            <TouchableHighlight underlayColor={"#FDFFAE"} className="w-full h-full items-center justify-center bg-primary" onPress={() => console.log(pageHistory)}>
                                <Text className="text-base font-pregular text-white">MODALS</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </>
            ) : (
                <View className="w-full h-[3.5%] z-10 bg-primary items-center justify-center">
                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => toggleMenu(false)} activeOpacity={0.8}>
                        <Image 
                            tintColor="#ffffff"
                            source={icons.expandDown}
                            className="w-[60%] h-[60%]"
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
                </View>
            )}
            <View className={`w-full ${!menuVisible ? (height <= 900 ? 'h-[95%] -top-8' : 'h-[94%] -top-8') : (height <= 900 ? 'h-[101%] -top-[4%]' : 'h-full -top-[3.5%]')} items-center overflow-hidden`}>
                {/* Pseudo-Modals */}
                <TouchableOpacity className={`w-full h-12 justify-center items-center absolute top-[6%] z-10`} onPress={toggleView} activeOpacity={1}>
                    {status === 'loading' ? (
                        <>
                            {expandStatus ? (
                                /* Loading Frame */
                                <View className="w-[20%] h-full items-center justify-center bg-white rounded-3xl shadow-md shadow-black">
                                    <ActivityIndicator size="large" color="#57b378" />
                                </View>
                            ) : (
                                /* Loading Status */
                                <View className="w-[60%] h-12 items-center bg-white rounded-3xl flex-row overflow-hidden shadow-md shadow-black">
                                    <View className="w-1/3 h-full justify-center">
                                        <ActivityIndicator size="large" color="#57b378" />
                                    </View>
                                    <View className="w-2/3 h-full justify-center">
                                        <Text className="font-rblack text-primary text-sm text-center" numberOfLines={1} ellipsizeMode="tail">
                                        {statusLoading}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </>
                    ) : status === 'success' ? (
                        <>
                            {expandStatus ? (
                                /* Success Frame */
                                <View className="w-[20%] h-12 items-center justify-center bg-primary rounded-3xl shadow-md shadow-black">
                                    <Image
                                        tintColor={"#ffffff"}
                                        source={icons.check}
                                        className="w-[50%] h-[50%]"
                                        resizeMode='contain'
                                    />
                                </View>
                            ) : (
                                /* Success Status */
                                <View className="w-[60%] h-12 items-center bg-white rounded-3xl flex-row overflow-hidden shadow-md shadow-black">
                                    <View className="w-1/3 h-full items-center justify-center bg-primary">
                                        <Image
                                            tintColor={"#ffffff"}
                                            source={icons.check}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    <View className="w-2/3 h-full justify-center">
                                        <Text className="font-rblack text-primary text-sm text-center" numberOfLines={1} ellipsizeMode='tail'>
                                            {statusSuccess}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </>
                    ) : status === 'error' ? (
                        <>
                            {expandStatus ? (
                                /* Error Frame */
                                <View className="w-[20%] h-12 items-center justify-center bg-rose-500 rounded-3xl shadow-md shadow-black">
                                    <Image
                                        tintColor={"#ffffff"}
                                        source={icons.close}
                                        className="w-[50%] h-[50%]"
                                        resizeMode='contain'
                                    />
                                </View>
                            ) : (
                                /* Error Status */
                                <View className="w-[60%] h-12 items-center bg-white rounded-3xl flex-row overflow-hidden shadow-md shadow-black">
                                    <View className="w-1/3 h-full items-center justify-center bg-rose-500">
                                        <Image
                                            tintColor={"#ffffff"}
                                            source={icons.close}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    <View className="w-2/3 h-full justify-center">
                                        <Text className="font-rblack text-rose-500 text-sm text-center" numberOfLines={1} ellipsizeMode='tail'>
                                            {statusFailed}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </>
                    ) : status === 'complete' ? (
                        <>
                            <View className="w-2 h-2 items-center justify-center bg-white rounded-3xl shadow-md shadow-black">
                            </View>
                        </>
                    ) : (
                        <></>
                    )}
                </TouchableOpacity>
                {title === 'home/profiles' ? (
                    <ProfileScreen changePage={handleChangePage} backPage={handleBackButton} />
                ) : title === 'home/details' ? (
                    <DetailScreen changePage={handleChangePage} backPage={handleBackButton} status={setStatus} savings={setStatusSuccess} loadings={setStatusLoading} />
                ) : title === 'home/maps' ? (
                    <MapScreen changePage={handleChangePage} backPage={handleBackButton} status={setStatus} savings={setStatusSuccess} loadings={setStatusLoading} fails={setStatusFailed} hideMenu={toggleMenu}/>
                ) : title === 'home/reports' ? (
                    <ReportScreen changePage={handleChangePage} backPage={handleBackButton} status={setStatus} savings={setStatusSuccess} loadings={setStatusLoading} fails={setStatusFailed} hideMenu={toggleMenu} />
                ) : title === 'home/statistics' ? (
                    <StatisticsScreen changePage={handleChangePage} backPage={handleBackButton} />
                ) : title === 'home/documents' ? (
                    <FormScreen changePage={handleChangePage} backPage={handleBackButton} status={setStatus} savings={setStatusSuccess} loadings={setStatusLoading} />
                ) : title === 'home/settings' ? (
                    <SettingsScreen changePage={handleChangePage} backPage={handleBackButton} />
                ) : title === 'home/helps' ? (
                    <HelpScreen changePage={handleChangePage} backPage={handleBackButton}/> 
                ) : (
                    <View className="w-full h-full bg-white items-center">
                        {/* Quick Actions */}
                        <View className="w-full h-[20%] bg-primary mb-[16%]"/>
                        {/* Title */}
                        <View className="w-full h-[16%] absolute top-[5%] bg-primary">
                            <Text className="text-white font-pregular text-xl px-4">{getGreeting()}<Text className="font-pbold">{user ? user.full_name.first_name : 'User'}</Text></Text>
                            <Text className="text-white font-pregular text-base px-4 -bottom-[10%]">{'Quick Actions'}</Text>
                            <View className="w-full h-[70%] absolute -bottom-[30%]">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                    {/* Resolve a Report Action */}
                                    <View className="w-48 h-[90%] bg-white rounded-lg shadow-lg shadow-black mx-3 overflow-hidden">
                                        <View className="w-[20%] h-[35%] absolute top-[6%] left-[2%] items-center justify-center">
                                            <Image 
                                                tintColor={'#57b378'}
                                                source={icons.mapDefault}
                                                className="w-[80%] h-[80%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="w-full h-[55%] absolute bottom-0 px-3">
                                            <Text className="text-black font-pmedium text-sm">{"Resolve Report"}</Text>
                                            <Text className="text-slate-400 font-pregular text-xs">{translate("structural_fire")}</Text>
                                        </View>
                                    </View>
                                    {/* Report structural_fire */}
                                    <View className="w-48 h-[90%] bg-white rounded-lg shadow-lg shadow-black mr-4 overflow-hidden">
                                        <View className="w-[20%] h-[35%] absolute top-[6%] left-[2%] items-center justify-center">
                                            <Image 
                                                tintColor={'#57b378'}
                                                source={icons.report}
                                                className="w-[80%] h-[80%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="w-full h-[55%] absolute bottom-0 px-3">
                                            <Text className="text-black font-pmedium text-sm">{"Building on Fire"}</Text>
                                            <Text className="text-slate-400 font-pregular text-xs">{translate("structural_fire")}</Text>
                                        </View>
                                    </View>
                                    {/* Find Nearest Amenity Near Me */}
                                    <View className="w-48 h-[90%] bg-white rounded-lg shadow-lg shadow-black mr-6">
                                        <View className="w-[20%] h-[35%] absolute top-[6%] left-[2%] items-center justify-center">
                                            <Image 
                                                tintColor={'#57b378'}
                                                source={icons.barangayMarker}
                                                className="w-full h-full"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="w-full h-[55%] absolute bottom-0 px-3">
                                            <Text className="text-black font-pmedium text-sm">{"Find Nearest Amenity"}</Text>
                                            <Text className="text-slate-400 font-pregular text-xs">{"Get Directions"}</Text>
                                        </View>
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                        {/* Home Page */}
                        <View className="w-[95%] h-[55%] flex-row justify-center items-center">
                            {/* News Page */}
                            <View className="w-[70%] h-full rounded-2xl overflow-hidden shadow-md shadow-black">
                                <Swiper
                                    dotColor='#e2e8f0'
                                    activeDotColor='#57b378'
                                    showsPagination={true}
                                    autoplay={true}
                                    autoplayTimeout={5}
                                    loop
                                >
                                    {/* News 1 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Image 
                                            source={images.news1}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>
                                    {/* News 2 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Image 
                                            source={images.news2}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>  
                                    {/* News 3 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Image 
                                            source={images.news3}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>
                                    {/* News 4 */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Image 
                                            source={images.news4}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>
                                </Swiper>
                            </View>
                            {/* Side Button Container */}
                            <View className="w-[30%] h-full items-center justify-between">
                                {/* Map Button Navigation */}
                                <View className="w-[80%] h-[20%]">
                                    <TouchableHighlight underlayColor={'#fffd99'} className="rounded-3xl" onPress={() => handleChangePage('home/maps')}>
                                        <View className={`w-full h-full items-center justify-center`}>
                                            <Image 
                                                tintColor={'#475569'}
                                                source={icons.mapHome}
                                                className="w-[80%] h-[70%]"
                                                resizeMode='contain'
                                            />
                                            <Text className="text-slate-600 font-psemibold text-base pb-[2%]">{'MAP'}</Text>
                                        </View>
                                    </TouchableHighlight>
                                </View>
                                {/* Details Button Navigation */}
                                <View className="w-[80%] h-[20%]">
                                    <TouchableHighlight underlayColor={'#fffd99'} className="rounded-3xl" onPress={() => handleChangePage('home/details')}>
                                        <View className={`w-full h-full items-center justify-center`}>
                                            <Image 
                                                tintColor={'#475569'}
                                                source={icons.detailHome}
                                                className="w-[80%] h-[65%]"
                                                resizeMode='contain'
                                            />
                                            <Text className="text-slate-600 font-psemibold text-base pb-[2%]">{'DETAILS'}</Text>
                                        </View>
                                    </TouchableHighlight>
                                </View>
                                {/* Responder Sets Button Navigation */}
                                {isResponder ? (
                                    <>
                                        <View className="w-[80%] h-[20%]">
                                            {/* Statistics Button Navigation */}
                                            <TouchableHighlight underlayColor={'#fffd99'} className="rounded-3xl" onPress={() => handleChangePage('home/statistics')}>
                                                <View className={`w-full h-full items-center justify-center`}>
                                                    <Image 
                                                        tintColor={'#475569'}
                                                        source={icons.statisticsHome}
                                                        className="w-[80%] h-[60%]"
                                                        resizeMode='contain'
                                                    />
                                                    <Text className="text-slate-600 font-psemibold text-base top-[4%] pb-[2%]">{'CHARTS'}</Text>
                                                </View>
                                            </TouchableHighlight>
                                        </View>
                                        <View className="w-[80%] h-[20%]">
                                            {/* Documents Button Navigation */}
                                            <TouchableHighlight underlayColor={'#fffd99'} className="rounded-3xl" onPress={() => handleChangePage('home/documents')}>
                                                <View className={`w-full h-full items-center justify-center`}>
                                                    <Image 
                                                        tintColor={'#475569'}
                                                        source={icons.documentsHome}
                                                        className="w-[80%] h-[60%]"
                                                        resizeMode='contain'
                                                    />
                                                    <Text className="text-slate-600 font-psemibold text-base top-[4%] pb-[2%]">{'DOCS'}</Text>
                                                </View>
                                            </TouchableHighlight>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <View className="w-[80%] h-[20%]">
                                            {/* Help Button Navigation */}
                                            <TouchableHighlight underlayColor={'#fffd99'} className="rounded-3xl" onPress={() => handleChangePage('home/helps')}>
                                                <View className={`w-full h-full items-center justify-center`}>
                                                    <Image 
                                                        tintColor={'#475569'}
                                                        source={icons.helpHome}
                                                        className="w-[80%] h-[65%]"
                                                        resizeMode='contain'
                                                    />
                                                    <Text className="text-slate-600 font-psemibold text-base pb-[2%]">{'HELP'}</Text>
                                                </View>
                                            </TouchableHighlight>
                                        </View>
                                        <View className="w-[80%] h-[20%]">
                                            {/* Settings Button Navigation */}
                                            <TouchableHighlight underlayColor={'#fffd99'} className="rounded-3xl" onPress={() => handleChangePage('home/settings')}>
                                                <View className={`w-full h-full items-center justify-center`}>
                                                    <Image 
                                                        tintColor={'#475569'}
                                                        source={icons.settingsHome}
                                                        className="w-[80%] h-[65%]"
                                                        resizeMode='contain'
                                                    />
                                                    <Text className="text-slate-600 font-psemibold text-base pb-[2%]">{'SETTINGS'}</Text>
                                                </View>
                                            </TouchableHighlight>
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>
                        <View className="w-[95%] h-[14%] flex-row justify-evenly items-center">
                            {/* Account Button Navigation */}
                            <View className="w-[24%] h-[80%]">
                                <TouchableHighlight underlayColor={'#fffd99'} className="rounded-3xl" onPress={() => handleChangePage('home/profiles')}>
                                    <View className={`w-full h-full items-center justify-center overflow-hidden`}>
                                        {profileImage ? (
                                            <Image
                                                source={{ uri: profileImage }}
                                                className={`w-full h-full rounded-3xl`}
                                                resizeMode='cover'
                                            />
                                        ) : (
                                            <Image 
                                                tintColor={'#475569'}
                                                source={icons.profile}
                                                className="w-[80%] h-[80%] rounded-full"
                                                resizeMode='contain'
                                            />
                                        )}
                                    </View>
                                </TouchableHighlight>
                            </View>
                            {/* Menu Button Navigation */}
                            <View className="w-[24%] h-[80%]">
                                <TouchableHighlight underlayColor={'#fffd99'} className="rounded-3xl" onPress={() => setMenuVisible(true)}>
                                    <View className={`w-full h-full items-center justify-center`}>
                                        <Image 
                                            tintColor={'#475569'}
                                            source={icons.menuHome}
                                            className="w-[80%] h-[70%]"
                                            resizeMode='contain'
                                        />
                                        <Text className="text-slate-600 font-psemibold text-base -top-[2%]">{'MENU'}</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>
                            {/* Report Button */}
                            <View className="w-[40%] h-[80%]">
                                <TouchableHighlight underlayColor={'#fffd99'} className="rounded-3xl border-2 border-slate-600" onPress={() => handleChangePage('home/reports')}>
                                    <View className={`w-full h-full flex-row`}>
                                        <View className="w-[40%] h-full items-center justify-center">
                                            <Image 
                                                tintColor={'#475569'}
                                                source={icons.reportHome}
                                                className="w-[80%] h-[80%] pl-[4%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="w-[60%] h-full justify-center">
                                            <Text className="text-slate-600 font-psemibold text-lg pl-[8%]">{'REPORT'}</Text>
                                            <Text className="text-slate-600/80 font-rmedium text-sm -top-[5%] pl-[8%]">{'File an Emergency'}</Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                )}
            </View>
            {/* Status Bar */}
            <StatusBar backgroundColor='#57b378' style={'light'} />
        </SafeAreaView>
    )
}

export default HomeScreen;