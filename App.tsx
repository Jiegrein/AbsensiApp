import React from 'react';
import {StyleSheet} from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import Navigation from './src/navigation/Navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <Navigation />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
