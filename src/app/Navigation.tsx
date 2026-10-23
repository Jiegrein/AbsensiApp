import * as React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { DarkTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackParamList } from './routes';
import RegisterScreen from '../features/register/RegisterScreen';
import HomeScreen from '../features/attendance/HomeScreen';
import ScannerScreen from '../features/attendance/ScannerScreen';

const Stack = createNativeStackNavigator<StackParamList>();

// Every screen paints #121212; the navigator must too, or transitions and the area under the
// status bar flash the default white.
const appTheme: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: '#121212', card: '#121212' },
};

const Navigation: React.FC = () => (
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
    <NavigationContainer theme={appTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121212' } }}>
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          initialParams={{ idParam: '', workStatusParam: false, breakStatusParam: false }}
        />
        <Stack.Screen name="Scanner" component={ScannerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </KeyboardAvoidingView>
);

export default Navigation;
