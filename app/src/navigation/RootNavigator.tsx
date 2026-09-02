import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';

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
// NOTE — icônes : la maquette utilise un sprite SVG unique (symbol/use),
// pas de librairie d'icônes tierce. Le composant d'icône réel sera branché
// à la tâche n°5 (design system). En attendant, tabBarIcon est omis pour
// ne pas introduire de dépendance provisoire (ex. vector-icons) qu'il
// faudrait ensuite retirer.
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: '#8B9187',
          tabBarStyle: {
            backgroundColor: colors.shell,
            borderTopWidth: 0,
            height: 64,
            paddingTop: 8,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
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
