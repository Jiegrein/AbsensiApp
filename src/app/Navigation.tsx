import * as React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackParamList } from './routes';
import RegisterScreen from '../features/register/RegisterScreen';
import HomeScreen from '../features/attendance/HomeScreen';
import ScannerScreen from '../features/attendance/ScannerScreen';

const Stack = createNativeStackNavigator<StackParamList>();

const Navigation: React.FC = () => (
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
