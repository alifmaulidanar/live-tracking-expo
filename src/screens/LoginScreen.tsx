import { login } from "../api/auth";
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect } from "react";
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { IconRegistry } from '@ui-kitten/components';
import { useFocusEffect } from '@react-navigation/native';
import { Input, Button, Text } from '@ui-kitten/components';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Alert, StyleSheet, Platform, Linking } from "react-native";
import LocationPermissionModal from "../components/LocationPermission";

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigation.navigate("Main");
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    }
  };

  // Function to check if location permissions are granted
  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  console.log("LoginScreen rendered");

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        {/* Error Text */}
        {permissionError && (
          <Text style={styles.errorText}>{permissionError}</Text>
        )}

        {/* Button to open Settings */}
        {
          !permissionsGranted && (
            <Button
              status="basic"
              onPress={openAppSettings}
              style={styles.button}
            >
              Open Settings
            </Button>
          )
        }

        {/* Input fields */}
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          disabled={!permissionsGranted}
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          disabled={!permissionsGranted}
        />

        {/* Login Button */}
        <Button
          onPress={handleLogin}
          style={styles.button}
          disabled={!permissionsGranted}
        >
          Login
        </Button>
      </View>

      {/* Location Permission Modal */}
      <LocationPermissionModal />
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
  title: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 24,
    fontWeight: "bold",
    color: "#059669", // Trackify branding color
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 20,
    color: "#fff",
    backgroundColor: "#059669", // Trackify branding color
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
});

export default LoginScreen;
