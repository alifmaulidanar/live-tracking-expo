import { logout } from "../api/auth";
import { RootState } from '../store';
import { useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
import React, { useState, useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Alert, Text, Button, Modal, TouchableOpacity } from "react-native";
import { startLocationTracking, stopLocationTracking } from "../utils/location";

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

const MainScreen: React.FC<Props> = ({ navigation }) => {
  const [tracking, setTracking] = useState(false);
  const [visible, setVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [time, setTime] = useState(0);  // To store the time in seconds

  // Ambil user data dari Redux store
  const userData = useSelector((state: RootState) => state.user);

  // Handle Start Tracking
  const handleStart = async () => {
    try {
      await startLocationTracking();  // Start tracking location
      setTracking(true);
    } catch (error: any) {
      Alert.alert("Failed to start tracking", error.message);
    }
  };

  // Handle Stop Tracking
  const handleStop = async () => {
    await stopLocationTracking();  // Stop tracking location
    setTracking(false);
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    hideDialog();
    navigation.navigate("Login");
  };

  // Show Dialog for Logout confirmation
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  // Show Profile Modal
  const showProfile = () => setProfileVisible(true);
  const hideProfile = () => setProfileVisible(false);

  // Stopwatch effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (tracking) {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 1);  // Increment time by 1 second
      }, 1000);
    } else {
      setTime(0);  // Reset time when tracking stops
    }

    return () => {
      if (timer) clearInterval(timer);  // Cleanup timer on component unmount or tracking stop
    };
  }, [tracking]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 bg-[#f5f5f5] p-6 mt-4">
      {/* Header: Profile Button (Left) and Logout Button (Right) */}
      <View className="flex-row justify-between items-center w-full">
        {/* Profile Button */}
        <View className="flex items-start gap-y-1">
          {/* <TouchableOpacity onPress={showProfile} className="flex-row items-center">
            <FontAwesome name="user-circle-o" size={32} color="#84439b" />
          </TouchableOpacity> */}
          <Text className="text-xl font-bold text-center">
            Halo,
          </Text>
          <Text className="text-xl font-bold text-center">
            {userData?.username || "User"}
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={showDialog} className="flex-row items-center">
          <Text className="text-white font-semibold bg-red-500 py-2 px-4 rounded-full">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View className="flex justify-start mt-8 p-8 items-start bg-white rounded-3xl">
        <Text className="text-2xl font-bold text-center mb-4">
          {userData?.username}
        </Text>
        <View className="flex-row items-center gap-x-2">
          <Text className="text-lg">Email:</Text>
          <Text className="text-lg">{userData?.email}</Text>
        </View>
        <View className="flex-row items-center gap-x-2">
          <Text className="text-lg">Telepon:</Text>
          <Text className="text-lg">{userData?.phone}</Text>
        </View>
      </View>

      {/* Activity Card */}
      <View className="flex-1 justify-start mt-8 p-8 items-center bg-white rounded-3xl">
        <View className="flex-1 w-full justify-start items-center relative">
          <Text className="text-2xl font-bold text-center mb-4">Aktivitas</Text>
          <Text className="text-center text-lg mb-4">
            {tracking ? "Berjalan..." : "Idle"}
          </Text>
          {tracking && (
            <Text className="text-center text-xl mb-4">
              {formatTime(time)}
            </Text>
          )}

          {/* Idle */}
          {/* Lottie Animation (Position absolute to avoid shifting other components) */}
          {!tracking && (
            <LottieView
              source={require('../../assets/animations/idle1.json')}
              autoPlay
              loop
              style={{
                position: 'absolute',  // Use absolute positioning
                top: '50%',            // Position it centrally in the container
                left: '50%',
                transform: [
                  { translateX: -150 }, // Center horizontally by shifting half of the width
                  { translateY: -150 }, // Center vertically by shifting half of the height
                ],
                width: 300,
                height: 300,
                zIndex: 1, // Make sure it appears on top of other content
              }}
            />
          )}

          {/* Working */}
          {/* Lottie Animation (Position absolute to avoid shifting other components) */}
          {tracking && (
            <LottieView
              source={require('../../assets/animations/working1.json')}
              autoPlay
              loop
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [
                  { translateX: -150 },
                  { translateY: -150 },
                ],
                width: 300,
                height: 300,
                zIndex: 1,
              }}
            />
          )}
        </View>

        {/* Tombol outside the wrapper */}
        <TouchableOpacity
          onPress={tracking ? handleStop : handleStart}
          className={`items-center w-full py-4 px-8 rounded-full ${tracking ? "bg-red-500" : "bg-[#059669]"}`}
          activeOpacity={0.7}
        >
          <Text className="text-white text-xl font-bold">
            {tracking ? "Selesai" : "Mulai Bekerja"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
      {visible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={visible}
          onRequestClose={hideDialog}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white p-6 rounded-lg w-80">
              <Text className="text-center text-xl mb-4">Konfirmasi Logout</Text>
              <Text className="text-center mb-6">Apakah yakin ingin logout?</Text>
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={hideDialog}
                  className="bg-gray-500 px-4 py-2 rounded"
                >
                  <Text className="text-white">Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLogout}
                  className="bg-red-500 px-4 py-2 rounded"
                >
                  <Text className="text-white">Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Profile Modal */}
      {profileVisible && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={profileVisible}
          onRequestClose={hideProfile}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white p-6 rounded-lg w-80">
              <Text className="text-center text-xl mb-4">Profile</Text>
              <Text className="mb-4">Username: {userData?.username}</Text>
              <Text className="mb-4">Email: {userData?.email}</Text>
              <Text className="mb-4">Phone: {userData?.phone}</Text>
              <TouchableOpacity
                onPress={hideProfile}
                className="bg-gray-500 px-4 py-2 rounded mt-4"
              >
                <Text className="text-white text-center">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default MainScreen;
