import { logout } from "../api/auth";
import React, { useState } from "react";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { IconRegistry } from "@ui-kitten/components";
import { View, Alert, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Modal, Text as KittenText } from "@ui-kitten/components";
import { startLocationTracking, stopLocationTracking } from "../utils/location";

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

const MainScreen: React.FC<Props> = ({ navigation }) => {
  const [tracking, setTracking] = useState(false);
  const [visible, setVisible] = useState(false);

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

  console.log("MainScreen rendered");

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <View style={styles.container}>
        <KittenText style={styles.statusText}>
          {tracking ? "Tracking your location..." : "Not tracking location"}
        </KittenText>

        <View style={styles.buttonContainer}>
          <Button
            style={[styles.startStopButton, { backgroundColor: tracking ? 'red' : '#059669' }]}
            onPress={tracking ? handleStop : handleStart}
          >
            {tracking ? "Stop Tracking" : "Start Tracking"}
          </Button>
        </View>

        {/* Logout Button */}
        <Button
          style={styles.logoutButton}
          status="danger"
          onPress={showDialog}
        >
          Logout
        </Button>

        {/* Logout Confirmation Dialog */}
        <Modal visible={visible} backdropStyle={styles.backdrop} onBackdropPress={hideDialog}>
          <View style={styles.modalContent}>
            <KittenText category="h5">Confirm Logout</KittenText>
            <KittenText style={styles.modalText}>Are you sure you want to log out?</KittenText>
            <View style={styles.dialogActions}>
              <Button onPress={hideDialog} style={styles.cancelButton}>
                Cancel
              </Button>
              <Button onPress={handleLogout} style={styles.logoutButtonModal}>
                Logout
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    </>
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
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
  },
  logoutButtonModal: {
    flex: 1,
  },
});

export default MainScreen;
