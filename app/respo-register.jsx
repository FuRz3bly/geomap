import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, setDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { app, auth, db } from '../firebaseConfig';
import { useRouter } from 'expo-router';

const RespoRegister = () => {
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    phoneNumber: '',
    birthdate: '',
  });
  const [error, setError] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'amenity'));
        const amenitiesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAmenities(amenitiesList);
      } catch (error) {
        console.error('Error fetching amenities: ', error);
      }
    };

    fetchAmenities();
  }, []);

  const handleInputChange = (field, value) => {
    setUserForm({ ...userForm, [field]: value });
  };

  const generateUserId = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const userCount = usersSnapshot.size;
    return `200-000-${String(userCount + 1).padStart(3, '0')}`;
  };

  const registerUser = async () => {
    const { email, password, username, firstName, middleName, lastName, address, phoneNumber, birthdate } = userForm;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const newUserId = await generateUserId();

      const userData = {
        user_id: newUserId,
        uid: user.uid,
        type: "responder",
        full_name: {
          last_name: lastName,
          first_name: firstName,
          middle_name: middleName,
        },
        username: `${username}@respo`,
        address: address,
        phone_number: phoneNumber,
        birthdate: birthdate,
        email: email,
        photo_id: null
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      if (selectedAmenity) {
        await updateDoc(doc(db, 'amenity', selectedAmenity.id), {
          responders: arrayUnion({
            user_id: newUserId,
            uid: user.uid,
            full_name: userData.full_name,
            username: userData.username,
            phone_number: userData.phone_number,
            email: userData.email
          })
        });
      }

      Alert.alert(`Welcome ${firstName}`, `Your username is ${username}@respo`);
      setUserForm({
        email: '',
        password: '',
        username: '',
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        phoneNumber: '',
        birthdate: '',
      });
      router.push('/log-in');
    } catch (e) {
      setError(e.message);
      Alert.alert('Registration Error', e.message);
    }
  };

  return (
    <View style={{padding: 20, paddingTop: 50}}>
      <View className="py-2">
        <Text className="font-pbold text-xl">Responder Registration</Text>
      </View>
      <ScrollView className="my-4">
        <Text>First Name</Text>
        <TextInput
          value={userForm.firstName} 
          onChangeText={(value) => handleInputChange('firstName', value)}
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <Text>Middle Name</Text>
        <TextInput
          value={userForm.middleName} 
          onChangeText={(value) => handleInputChange('middleName', value)}
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <Text>Last Name</Text>
        <TextInput
          value={userForm.lastName}
          onChangeText={(value) => handleInputChange('lastName', value)}
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <Text>Username</Text>
        <TextInput
          value={userForm.username}
          onChangeText={(value) => handleInputChange('username', value)}
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <Text>Password</Text>
        <TextInput
          value={userForm.password}
          onChangeText={(value) => handleInputChange('password', value)} secureTextEntry
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <Text>Email</Text>
        <TextInput
          value={userForm.email}
          onChangeText={(value) => handleInputChange('email', value)}
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <Text>Address</Text>
        <TextInput
          value={userForm.address}
          onChangeText={(value) => handleInputChange('address', value)}
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <Text>Phone Number</Text>
        <TextInput
          value={userForm.phoneNumber}
          onChangeText={(value) => handleInputChange('phoneNumber', value)}
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <Text>Birthdate {"(YYYY-MM-DD)"}</Text>
        <TextInput
          value={userForm.birthdate}
          onChangeText={(value) => handleInputChange('birthdate', value)}
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <Text>Select Amenity:</Text>
        <Text/>
        <ScrollView>
          {amenities.map((amenity, index) => (
            <View key={amenity.id}>
              <Button
                title={`${amenity.name} ${amenity.description}`}
                onPress={() => setSelectedAmenity(amenity)}
                color={selectedAmenity?.id === amenity.id ? '#3abd64' : '#219683'}
              />
              {/* Add a small gap except after the last item */}
              {index < amenities.length - 1 && <View style={{ height: 10 }} />}
            </View>
        ))}
        </ScrollView>
        <Text/>
        <Button title="Register" onPress={registerUser} />
        {error && <Text>{error}</Text>}
        <View className="pb-10"/>
      </ScrollView>
    </View>
  );
};

export default RespoRegister;