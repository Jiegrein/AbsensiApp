import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from "@react-navigation/native";
import * as React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

import { StackParamList } from '../screens/StackParams';
import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator<StackParamList>();

const Navigation : React.FC = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <NavigationContainer>
        <Stack.Navigator>
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