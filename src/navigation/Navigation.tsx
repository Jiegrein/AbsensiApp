import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import * as React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import RegisterScreen from "../screens/RegisterScreen";

import { RootDrawerParamList } from '../screens/RootDrawerParams';
const Drawer = createDrawerNavigator<RootDrawerParamList>();

const Navigation = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1}}
    >
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="Register"
          screenOptions={{
            drawerContentContainerStyle: {
              flex: 1,
              justifyContent: "center",
            },
          }}
        >
          <Drawer.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerStyle: {
                shadowOpacity: 0,
                elevation: 0,
              },}}
          />
          <Drawer.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              headerStyle: {
                shadowOpacity: 0,
                elevation: 0,
              },}}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </KeyboardAvoidingView>
  );
};

export default Navigation;