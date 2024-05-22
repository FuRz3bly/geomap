import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Modal, Alert, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function App() {
    const [userame, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();
  return (
    /** Log in Page */
    <View style={styles.container}>
      <StatusBar style="auto"/>
      <Image style={styles.imageLogo} source = {require("../assets/geomap-title_b.png")}/>
      
      <View style={styles.inputView}>
        <TextInput style={styles.TextInput} placeholder='Username' onChangeText={(userame => setUsername(userame))} />
      </View>
      <View style={styles.inputView}>
        <TextInput style={styles.TextInput} placeholder='Password' secureTextEntry={true} onChangeText={(password => setPassword(password))} />
      </View>

      <TouchableOpacity>
          <Text style={styles.forgotButton}>Forgot Password?</Text>
      </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={() => {router.push("/Map-Page")}}>
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupButton} onPress={() => {router.push("/selectType")}}>
          <Text style={styles.signupText}>Sign up</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageLogo :{
    height: 75,
    width: 300,
    marginBottom: 40
  },

  inputView: {
    borderRadius: 30,
    width: "70%",
    height: 45, 
    marginBottom: 10,
    backgroundColor: "#efefef",
    alignItems: "center"
  },

  TextInput: {
    height: 50,
    flex: 1,
    padding: 10,
    alignItems: "center"
  },

  forgotButton: {
    height: 30,
    marginBottom: 30
  },

  loginButton: {
    width: "50%",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "#57b378"
  },

  loginText: {
    color: "white"
  },

  signupButton: {
    width: "50%",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "#57b378"
  },
   
  signupText: {
    color: "white"
  },

  modalView: {
    margin: 30,
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 6
  },
});
