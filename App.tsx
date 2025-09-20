import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// Import your screens
import LoginScreen from './src/screens/LoginScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';

// Define navigation types
export type RootStackParamList = {
  Login: undefined;
  TaskList: undefined;
  AddTask: { taskId?: number; isEdit?: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!userToken);
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; 
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "TaskList" : "Login"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isLoggedIn ? (
          <Stack.Screen 
            name="Login" 
            options={{ headerShown: false }}
            children={props => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          />
        ) : (
          <>
            <Stack.Screen 
              name="TaskList" 
              options={{ 
                title: 'My Tasks',
                headerLeft: () => null, // Disable back button
              }}
              children={props => <TaskListScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            />
            <Stack.Screen 
              name="AddTask" 
              component={AddTaskScreen}
              options={({ route }) => ({
                title: route.params?.isEdit ? 'Edit Task' : 'Add New Task',
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}