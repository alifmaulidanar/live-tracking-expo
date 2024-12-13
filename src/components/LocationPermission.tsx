import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Alert, Linking, TouchableOpacity } from 'react-native';

interface LocationPermissionModalProps {
  onPermissionsGranted: () => void; // Callback to inform that permissions are granted
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ onPermissionsGranted }) => {
  const [foregroundStatus, setForegroundStatus] = useState<string | null>(null);
  const [backgroundStatus, setBackgroundStatus] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const checkPermissions = async () => {
    const { status: foreground } = await Location.getForegroundPermissionsAsync();
    setForegroundStatus(foreground);

    const { status: background } = await Location.getBackgroundPermissionsAsync();
    setBackgroundStatus(background);

    if (foreground === 'granted' && background === 'granted') {
      setModalVisible(false);
      onPermissionsGranted(); // Memanggil callback jika kedua izin diberikan
    } else {
      setModalVisible(true); // Menampilkan modal jika izin tidak diberikan
    }
  };


  useEffect(() => {
    const checkPermissions = async () => {
      const { status: foreground } = await Location.getForegroundPermissionsAsync();
      setForegroundStatus(foreground);

      const { status: background } = await Location.getBackgroundPermissionsAsync();
      setBackgroundStatus(background);

      if (foreground !== 'granted' || background !== 'granted') {
        setModalVisible(true);
      } else {
        onPermissionsGranted(); // Call the callback if both permissions are granted
      }
    };

    checkPermissions();
  }, []);

  const requestForegroundPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setForegroundStatus(status);

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
      checkPermissions(); // Recheck permissions after granting
    }
  };

  const requestBackgroundPermission = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    setBackgroundStatus(status);

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
      checkPermissions(); // Recheck permissions after granting
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <View className="justify-center items-center bg-transparent px-6 pt-6">
      <Text className="text-center font-semibold text-md mb-4">Status Izin Akses Aplikasi</Text>
      {/* Foreground Status */}
      <View className="flex-row items-center mb-4">
        <Text className="font-medium text-gray-700 mr-2">Foreground:</Text>
        <View
          className={`flex-row items-center justify-center ${foregroundStatus === 'granted' ? 'bg-green-500' : 'bg-red-500'} 
            text-white rounded-full py-1 px-3 shadow-md`}
        >
          <Text className="font-semibold text-white">{foregroundStatus}</Text>
        </View>
      </View>

      {/* Background Status */}
      <View className="flex-row items-center mb-4">
        <Text className="font-medium text-gray-700 mr-2">Background:</Text>
        <View
          className={`flex-row items-center justify-center ${backgroundStatus === 'granted' ? 'bg-green-500' : 'bg-red-500'} 
            text-white rounded-full py-1 px-3 shadow-md`}
        >
          <Text className="font-semibold text-white">{backgroundStatus}</Text>
        </View>
      </View>

      {/* Modal for location permission */}
      {(backgroundStatus || foregroundStatus !== 'granted') && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseModal}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white rounded-lg p-6 w-80 shadow-lg">
              <Text className="text-center mb-6 text-lg font-semibold text-gray-800">
                Izinkan Akses Lokasi
              </Text>

              {/* Foreground Permission */}
              {foregroundStatus !== 'granted' && (
                <TouchableOpacity
                  onPress={requestForegroundPermission}
                  className="bg-[#84439b] py-3 px-4 rounded-lg mb-4 w-full items-center"
                >
                  <Text className="text-white font-semibold">Izinkan Foreground</Text>
                </TouchableOpacity>
              )}

              {/* Background Permission */}
              {backgroundStatus !== 'granted' && (
                <TouchableOpacity
                  onPress={requestBackgroundPermission}
                  className="bg-[#84439b] py-3 px-4 rounded-lg mb-4 w-full items-center"
                >
                  <Text className="text-white font-semibold">Izinkan Background</Text>
                </TouchableOpacity>
              )}

              {/* Reject Button */}
              <TouchableOpacity
                onPress={handleCloseModal}
                className="bg-gray-300 py-3 px-4 rounded-lg w-full items-center"
              >
                <Text className="text-gray-800 font-semibold">Tolak (Tidak bisa login)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default LocationPermissionModal;
