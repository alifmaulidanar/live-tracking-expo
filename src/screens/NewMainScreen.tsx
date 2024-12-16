import { logout } from "../api/auth";
import { RootState } from '../store';
import { useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
import React, { useState, useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Alert, Text, Button, Modal, TouchableOpacity } from "react-native";
import { startBackgroundTracking, stopBackgroundTracking, initializeRadar, setupRadarTracking } from "../utils/radar";

type RootStackParamList = {
  Login: undefined;
  NewMain: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "NewMain">;

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
      startBackgroundTracking('RESPONSIVE');  // Start Radar location tracking
      setTracking(true);
    } catch (error: any) {
      Alert.alert("Failed to start tracking", error.message);
    }
  };

  // Handle Stop Tracking
  const handleStop = async () => {
    stopBackgroundTracking();  // Stop Radar location tracking
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

  // Initialize Radar SDK and permissions
  useEffect(() => {
    const initialize = async () => {
      try {
        // Set up Radar with the publishable key
        await setupRadarTracking();
      } catch (error) {
        console.error("Error setting up Radar:", error);
      }
    };

    initialize();
  }, []);

  return (
    <View className="flex-1 bg-[#f5f5f5] p-6 mt-4">
      {/* Header: Profile Button (Left) and Logout Button (Right) */}
      <View className="flex-row items-center justify-between w-full">
        {/* Profile Button */}
        <View className="flex items-start gap-y-1">
          <Text className="text-xl font-bold text-center">
            Halo,
          </Text>
          <Text className="text-xl font-bold text-center">
            {userData?.username || "User"}
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={showDialog} className="flex-row items-center">
          <Text className="px-4 py-2 font-semibold text-white bg-red-500 rounded-full">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View className="flex items-start justify-start p-8 mt-8 bg-white rounded-3xl">
        <Text className="mb-4 text-2xl font-bold text-center">
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
      <View className="items-center justify-start flex-1 p-8 mt-8 bg-white rounded-3xl">
        <View className="relative items-center justify-start flex-1 w-full">
          <Text className="mb-4 text-2xl font-bold text-center">Aktivitas</Text>
          <Text className="mb-4 text-lg text-center">
            {tracking ? "Berjalan..." : "Idle"}
          </Text>
          {tracking && (
            <Text className="mb-4 text-xl text-center">
              {formatTime(time)}
            </Text>
          )}

          {/* Idle */}
          {!tracking && (
            <LottieView
              source={require('../../assets/animations/idle1.json')}
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

          {/* Working */}
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

        {/* Start/Stop Button */}
        <TouchableOpacity
          onPress={tracking ? handleStop : handleStart}
          className={`items-center w-full py-4 px-8 rounded-full ${tracking ? "bg-red-500" : "bg-[#059669]"}`}
          activeOpacity={0.7}
        >
          <Text className="text-xl font-bold text-white">
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
          <View className="items-center justify-center flex-1 bg-black bg-opacity-50">
            <View className="p-6 bg-white rounded-lg w-80">
              <Text className="mb-4 text-xl text-center">Konfirmasi Logout</Text>
              <Text className="mb-6 text-center">Apakah yakin ingin logout?</Text>
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={hideDialog}
                  className="px-4 py-2 bg-gray-500 rounded"
                >
                  <Text className="text-white">Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLogout}
                  className="px-4 py-2 bg-red-500 rounded"
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
          <View className="items-center justify-center flex-1 bg-black bg-opacity-50">
            <View className="p-6 bg-white rounded-lg w-80">
              <Text className="mb-4 text-xl text-center">Profile</Text>
              <Text className="text-center">{userData?.username}</Text>
              <Text className="text-center">{userData?.email}</Text>
              <TouchableOpacity onPress={hideProfile} className="px-4 py-2 mt-4 bg-blue-500 rounded-full">
                <Text className="text-center text-white">Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default MainScreen;
