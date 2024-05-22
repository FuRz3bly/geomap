import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { Link, useRouter } from 'expo-router';
import React from 'react'

const Profile = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.titleFont}>ACCOUNT SIGNUP</Text>
      <View style={styles.mergeText}>
      <Text style={styles.descriptionFont}>Please read and agree to the</Text>
      <Text style={styles.termsFont}>Terms and Conditions</Text>
      </View>
      <Text style={styles.descriptionFont}>in order to use our Service.</Text>

      <View style={styles.buttonView}>

        <View style={styles.mergeButtons}>
        <TouchableOpacity style={styles.communityButton} onPress={() => {router.push("/signupPage/communitySignup")}}>
          <Text style={styles.buttonText}>As Community</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton}><Text style={styles.buttonText}>?</Text></TouchableOpacity>
        </View>

        <View style={styles.mergeButtons}>
        <TouchableOpacity style={styles.responderButton} onPress={() => {router.push("/signupPage/responderSignup")}}>
          <Text style={styles.buttonText}>As Emergency Responder</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton}><Text style={styles.buttonText}>?</Text></TouchableOpacity>
        </View>

      </View>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
},
  buttonView: {
    paddingTop: 30,
    alignItems: 'center'
},
  mergeText: {
    display: 'flex',
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center'
},
  mergeButtons: {
    display: 'flex',
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center'
},
  titleFont: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 35,
    paddingBottom: 10
},
  descriptionFont: {
    color: 'black',
    alignContent: 'center',
    justifyContent: 'center',
    fontSize: 12
},
  termsFont: {
    color: 'blue',
    alignContent: 'center',
    justifyContent: 'center',
    fontSize: 12
},
  communityButton: {
    width: 250,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#57b378"
},
  responderButton: {
    width: 250,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#57b378"
},
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
},
  helpButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#57b378"
},
})