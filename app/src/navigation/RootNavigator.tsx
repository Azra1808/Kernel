import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { usePreferences } from '../theme/PreferencesContext';
import { fonts, fontSize } from '../theme/typography';
import { Icon, IconName } from '../theme/Icon';

import AccueilScreen from '../screens/AccueilScreen';
import AgricultureScreen from '../screens/AgricultureScreen';
import RessourcesScreen from '../screens/RessourcesScreen';
import EcosystemeScreen from '../screens/EcosystemeScreen';
import AssistantScreen from '../screens/AssistantScreen';
import ParametresScreen from '../screens/ParametresScreen';

export type RootTabParamList = {
  Accueil: undefined;
  Agriculture: undefined;
  Ressources: undefined;
  Ecosysteme: undefined;
  Assistant: undefined;
};

// Paramètres n'est PAS un onglet (fidèle à la maquette : accessible depuis
// l'icône profil/cloche de l'écran Accueil) — d'où le Stack au-dessus des
// Tabs plutôt qu'un 6e onglet.
export type RootStackParamList = {
  Tabs: undefined;
  Parametres: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// NOTE — icônes : branchées via le composant Icon (tâche n°5), qui
// réplique en React Native le sprite SVG unique de la maquette.
const TAB_ICONS: Record<keyof RootTabParamList, IconName> = {
  Accueil: 'home',
  Agriculture: 'leaf',
  Ressources: 'crate',
  Ecosysteme: 'globe',
  Assistant: 'chat',
};

function Tabs() {
  const { colors } = usePreferences();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
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
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen
          name="Parametres"
          component={ParametresScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
