import { logout } from "../api/auth";
import React, { useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Dialog, Portal } from "react-native-paper";
import { startLocationTracking, stopLocationTracking } from "../utils/location";

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

const MainScreen: React.FC<Props> = ({ navigation }) => {
  const [tracking, setTracking] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleStart = async () => {
    try {
      await startLocationTracking();
      setTracking(true);
    } catch (error: any) {
      Alert.alert("Failed to start tracking", error.message);
    }
  };

  const handleStop = async () => {
    await stopLocationTracking();
    setTracking(false);
  };

  const handleLogout = async () => {
    await logout();
    hideDialog();
    navigation.navigate("Login");
  };

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        {tracking ? "Tracking your location..." : "Not tracking location"}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={[styles.startStopButton, { backgroundColor: tracking ? 'red' : '#059669' }]}
          onPress={tracking ? handleStop : handleStart}
        >
          {tracking ? "Stop Tracking" : "Start Tracking"}
        </Button>
      </View>


      {/* Logout Button */}
      <Button
        mode="contained"
        icon="logout"
        onPress={showDialog}
        style={styles.logoutButton}
        labelStyle={styles.logoutButtonText}
      >
        Logout
      </Button>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to log out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleLogout}>Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  statusText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  startStopButton: {
    width: 200,
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
  logoutButton: {
    backgroundColor: "red",
    position: "absolute",
    marginTop: 20,
    top: 20,
    right: 20,
  },
  logoutButtonText: {
    color: "white",
  },
});

export default MainScreen;
