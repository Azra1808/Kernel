import { ReactNode } from 'react';
import { Insets, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type AnimatedPressableProps = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Intensité de la réduction d'échelle au toucher. 0.96 = discret, 0.9 = marqué. */
  pressScale?: number;
  /** Vibration légère à l'appui — désactivable pour les éléments très fréquents (ex. touches de clavier). */
  haptics?: boolean;
  accessibilityLabel?: string;
  hitSlop?: number | Insets;
};

/**
 * Sur le web, "survoler" un élément à la souris déclenche un changement
 * visuel (hover). Sur mobile, il n'y a pas de souris : l'équivalent est
 * le retour au TOUCHER — quelque chose doit visiblement réagir dès que
 * le doigt appuie, avant même que onPress ne se déclenche. C'est ce que
 * ce composant apporte partout où il remplace un Pressable brut :
 * légère réduction d'échelle + vibration discrète.
 *
 * Utilisé par Button, Card (quand tappable) et les cartes de modules de
 * l'Accueil. Tâche n°19 (suite) / anticipe une partie de la tâche n°23
 * (micro-interactions) pour les éléments déjà construits.
 */
export function AnimatedPressable({
  children,
  onPress,
  disabled,
  style,
  pressScale = 0.96,
  haptics = true,
  accessibilityLabel,
  hitSlop,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Pattern voulu par Reanimated : `.value` sur un SharedValue n'est pas du
  // state React, sa mutation directe est l'API officielle de la librairie.
  const handlePressIn = () => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(pressScale, { damping: 16, stiffness: 320 });
  };

  const handlePressOut = () => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(1, { damping: 12, stiffness: 220 });
  };

  const handlePress = () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Pas de retour haptique disponible (web, simulateur) — non bloquant.
      });
    }
    onPress?.();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={style}
        accessibilityLabel={accessibilityLabel}
        hitSlop={hitSlop}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
