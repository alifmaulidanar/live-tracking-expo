import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

// Komponen untuk meminta izin lokasi
const LocationPermissionModal = () => {
  const [foregroundStatus, setForegroundStatus] = useState<string | null>(null);
  const [backgroundStatus, setBackgroundStatus] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const { status: foreground } = await Location.getForegroundPermissionsAsync();
      setForegroundStatus(foreground);
      console.log('Foreground location permission status:', foreground);

      const { status: background } = await Location.getBackgroundPermissionsAsync();
      setBackgroundStatus(background);
      console.log('Background location permission status:', background);

      // Jika salah satu izin belum diberikan, tampilkan modal untuk meminta izin
      if (foreground !== 'granted' || background !== 'granted') {
        setModalVisible(true);
      }
    };

    checkPermissions();
  }, []);

  // Fungsi untuk meminta izin lokasi foreground
  const requestForegroundPermission = async () => {
    console.log('Requesting foreground location permission...');
    const { status } = await Location.requestForegroundPermissionsAsync();
    setForegroundStatus(status);
    console.log('Foreground location permission granted:', status);

    if (status === 'denied') {
      Alert.alert(
        'Permission Denied',
        'You have denied foreground location permission. Please enable it in settings.',
        [
          { text: 'Go to Settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel', onPress: () => { } },
        ]
      );
    } else if (status === 'granted') {
      console.log('Foreground location permission granted');
    }
  };

  // Fungsi untuk meminta izin lokasi background
  const requestBackgroundPermission = async () => {
    console.log('Requesting background location permission...');
    const { status } = await Location.requestBackgroundPermissionsAsync();
    setBackgroundStatus(status);
    console.log('Background location permission granted:', status);

    if (status === 'denied') {
      Alert.alert(
        'Permission Denied',
        'You have denied background location permission. Please enable it in settings.',
        [
          { text: 'Go to Settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel', onPress: () => { } },
        ]
      );
    } else if (status === 'granted') {
      console.log('Background location permission granted');
    }
  };

  // Fungsi untuk menutup modal jika izin sudah diberikan
  const handleCloseModal = () => {
    setModalVisible(false);
    console.log('Modal closed');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Location Permission Status</Text>
      <Text>Foreground: {foregroundStatus}</Text>
      <Text>Background: {backgroundStatus}</Text>

      {/* Modal untuk meminta izin */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <View style={{
            backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center', width: 250,
          }}>
            <Text style={{ marginBottom: 10 }}>We need your location permission</Text>
            {foregroundStatus !== 'granted' && (
              <Button title="Grant Foreground Permission" onPress={requestForegroundPermission} />
            )}
            {backgroundStatus !== 'granted' && (
              <Button title="Grant Background Permission" onPress={requestBackgroundPermission} />
            )}
            <Button title="Close" onPress={handleCloseModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LocationPermissionModal;
