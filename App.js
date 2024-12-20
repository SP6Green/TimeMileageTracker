import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [destination, setDestination] = useState(null);
  
  const GOOGLE_MAPS_APIKEY = '';

  useEffect(() => {
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, 
          distanceInterval: 10, 
        },
        (newLocation) => {
          setLocation(newLocation.coords);
        }
      );
    })();
  }, []);

  if(!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={StyleSheet.paragraph}>
          {errorMsg ? errorMsg : 'Fetching location...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
          />
          {destination && (
            <MapViewDirections
              origin={{latitude: location.latitude, longitude: location.longitude}}
              destination={destination}
              apikey= {GOOGLE_MAPS_APIKEY}
              strokeWidth={3}
              strokeColor='hotpink'
            />
          )}
        </MapView>
        <GooglePlacesAutocomplete
          placeholder='Search for a Destination'
          fetchDetails={true}
          onPress={(data, details=null) => {
            const {lat, lon} = details.geometry.location;
            setDestination({
              latitude: lat,
              longitude: lon,
            });
          }}
          query ={{
            key: GOOGLE_MAPS_APIKEY,
            language: 'en',
          }}
          styles={{
            container: {
              position: 'absolute',
              width: '100%',
              zIndex: 1,
            },
            listView: { backgroundColor: 'white'},
          }} 
        />
        
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            Latitude: {location.latitude}, Longitude: {location.longitude}
          </Text>
        </View>
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  coordinatesContainer: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
  },
  coordinatesText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },

});
