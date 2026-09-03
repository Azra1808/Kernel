import Feather from '@expo/vector-icons/Feather';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, fontFamily } from '../theme/colors';

import AccueilScreen from '../screens/AccueilScreen';
import AgricultureScreen from '../screens/AgricultureScreen';
import RessourcesScreen from '../screens/RessourcesScreen';
import EcosystemeScreen from '../screens/EcosystemeScreen';
import AssistantScreen from '../screens/AssistantScreen';

export type RootTabParamList = {
  Accueil: undefined;
  Agriculture: undefined;
  Ressources: undefined;
  Ecosysteme: undefined;
  Assistant: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const tabIcons: Record<keyof RootTabParamList, keyof typeof Feather.glyphMap> = {
  Accueil: 'home',
  Agriculture: 'feather',
  Ressources: 'archive',
  Ecosysteme: 'globe',
  Assistant: 'message-circle',
};

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: '#8B9187',
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ color, size }) => <Feather color={color} name={tabIcons[route.name]} size={size} />,
          tabBarStyle: {
            backgroundColor: colors.shell,
            borderTopWidth: 0,
            height: 70,
            paddingTop: 8,
            paddingBottom: 10,
          },
          tabBarLabelStyle: {
            fontFamily: fontFamily.bodySemibold,
            fontSize: 11,
          },
        })}
      >
        <Tab.Screen name="Accueil" component={AccueilScreen} options={{ tabBarLabel: 'Accueil' }} />
        <Tab.Screen name="Agriculture" component={AgricultureScreen} options={{ tabBarLabel: 'Agri' }} />
        <Tab.Screen name="Ressources" component={RessourcesScreen} options={{ tabBarLabel: 'Ressources' }} />
        <Tab.Screen name="Ecosysteme" component={EcosystemeScreen} options={{ tabBarLabel: 'Kernel' }} />
        <Tab.Screen name="Assistant" component={AssistantScreen} options={{ tabBarLabel: 'Chat' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
