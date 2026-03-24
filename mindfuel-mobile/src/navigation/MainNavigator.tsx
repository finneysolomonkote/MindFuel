import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, HomeStackParamList, LibraryStackParamList } from '../types';
import HomeScreen from '../screens/home/HomeScreen';
import AIChatScreen from '../screens/ai/AIChatScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import BookDetailsScreen from '../screens/library/BookDetailsScreen';
import ReaderScreen from '../screens/library/ReaderScreen';
import ShopScreen from '../screens/shop/ShopScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>();

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'MindFuel AI' }}
    />
    <HomeStack.Screen
      name="BookDetails"
      component={BookDetailsScreen}
      options={{ title: 'Book Details' }}
    />
    <HomeStack.Screen
      name="Reader"
      component={ReaderScreen}
      options={{ headerShown: false }}
    />
  </HomeStack.Navigator>
);

const LibraryStackNavigator: React.FC = () => (
  <LibraryStack.Navigator>
    <LibraryStack.Screen
      name="Library"
      component={LibraryScreen}
      options={{ title: 'My Library' }}
    />
    <LibraryStack.Screen
      name="BookDetails"
      component={BookDetailsScreen}
      options={{ title: 'Book Details' }}
    />
    <LibraryStack.Screen
      name="Reader"
      component={ReaderScreen}
      options={{ headerShown: false }}
    />
  </LibraryStack.Navigator>
);

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="AITab"
        component={AIChatScreen}
        options={{
          title: 'AI Coach',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🤖</Text>,
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryStackNavigator}
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopScreen}
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🛍️</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
