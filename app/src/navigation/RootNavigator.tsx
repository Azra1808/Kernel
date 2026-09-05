import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { fonts, fontSize } from '../theme/typography';
import { Icon, IconName } from '../theme/Icon';

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

// 5 onglets principaux, dans l'ordre et avec les libellés courts de la
// maquette validée (Accueil / Agri / Ressources / Kernel / Chat).
// Paramètres n'est PAS un onglet : accessible depuis l'icône profil/cloche
// de l'écran Accueil (voir maquette).
//
// NOTE — icônes : branchées via le composant Icon (tâche n°5), qui
// réplique en React Native le sprite SVG unique de la maquette.
const TAB_ICONS: Record<keyof RootTabParamList, IconName> = {
  Accueil: 'home',
  Agriculture: 'leaf',
  Ressources: 'crate',
  Ecosysteme: 'globe',
  Assistant: 'chat',
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
          tabBarStyle: {
            backgroundColor: colors.shell,
            borderTopWidth: 0,
            height: 70,
            paddingTop: 8,
            paddingBottom: 10,
          },
          tabBarLabelStyle: {
            fontFamily: fonts.bodySemiBold,
            fontSize: fontSize.xs,
          },
          tabBarIcon: ({ color, size }) => (
            <Icon name={TAB_ICONS[route.name as keyof RootTabParamList]} color={color} size={size - 2} />
          ),
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