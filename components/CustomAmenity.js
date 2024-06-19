import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';

const CustomAmenity = ({ onAddAmenity, customAmenities }) => {
  const [newAmenity, setNewAmenity] = useState({ name: '', latitude: '', longitude: '', type: '' });

  const handleAddAmenity = () => {
    const { name, latitude, longitude, type } = newAmenity;
    if (name && latitude && longitude && type) {
      onAddAmenity({
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        type,
      });
      setNewAmenity({ name: '', latitude: '', longitude: '', type: '' });
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Custom Amenity</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={newAmenity.name}
        onChangeText={(text) => setNewAmenity({ ...newAmenity, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        keyboardType="numeric"
        value={newAmenity.latitude}
        onChangeText={(text) => setNewAmenity({ ...newAmenity, latitude: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        keyboardType="numeric"
        value={newAmenity.longitude}
        onChangeText={(text) => setNewAmenity({ ...newAmenity, longitude: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Type (e.g., police, fire_station)"
        value={newAmenity.type}
        onChangeText={(text) => setNewAmenity({ ...newAmenity, type: text })}
      />
      <Button title="Add Amenity" onPress={handleAddAmenity} />
      <FlatList
        data={customAmenities}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.name} - {item.type}</Text>
            <Text>{item.latitude}, {item.longitude}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  listItem: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
});

export default CustomAmenity;