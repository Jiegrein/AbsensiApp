import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from "@react-navigation/native";
import * as React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';

import { StackParamList } from '../screens/StackParams';
import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator<StackParamList>();

async function save(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

async function getValueFor(key: string) {
  let result = await SecureStore.getItemAsync(key);
  if (result) {
    alert("🔐 Here's your value 🔐 \n" + result);
  } else {
    alert('No values stored under that key.');
  }
}

const Navigation: React.FC = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}>
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            initialParams={{
              idParam: '',
              workStatusParam: false,
              breakStatusParam: false
            }}
          />
          <Stack.Screen
            name="Scanner"
            component={ScannerScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </KeyboardAvoidingView>
  );
};

export default Navigation;