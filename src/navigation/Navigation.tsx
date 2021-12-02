import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import * as React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import HomeScreen from "../screens/HomeScreen";

const Drawer = createDrawerNavigator();

const Navigation = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1}}
    >
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="Home"
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
              },

              // headerShown: false,
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </KeyboardAvoidingView>
  );
};

export default Navigation;