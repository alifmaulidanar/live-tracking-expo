import "./global.css"
import React from 'react';
import store from "./src/store/index";
import { Provider } from 'react-redux';
import { StatusBar } from "react-native";
import MainScreen from './src/screens/MainScreen';
import LoginScreen from './src/screens/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createStackNavigator();

export default function App() {
  StatusBar.setBarStyle('dark-content');
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setTranslucent(true);
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
