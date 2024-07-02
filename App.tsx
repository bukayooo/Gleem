import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import SchedulingScreen from './SchedulingScreen';
import {enableScreens} from 'react-native-screens';

enableScreens();

// Define the types for the navigation stack
type RootStackParamList = {
  Home: undefined; // No parameters expected for HomeScreen
  Schedule: undefined; // No parameters expected for SchedulingScreen
  Address: undefined; // No parameters expected for AddressScreen
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Schedule"
          component={SchedulingScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
