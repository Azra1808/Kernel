import { useMemo } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ACCENT_THEMES, ColorThemeId, Mode, radius, type Palette } from '../theme/palettes';
import { TextSize, usePreferences } from '../theme/PreferencesContext';
import { fonts, fontSize } from '../theme/typography';
import { Icon } from '../theme/Icon';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import type { Lang } from '../lib/assistant/types';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Parametres'>;

const MODE_OPTIONS: { value: Mode; label: { fr: string; en: string }; icon: 'sun' | 'moon' }[] = [
  { value: 'clair', label: { fr: 'Clair', en: 'Light' }, icon: 'sun' },
  { value: 'sombre', label: { fr: 'Sombre', en: 'Dark' }, icon: 'moon' },
];

const LANGUAGE_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];

const TEXT_SIZE_OPTIONS: { value: TextSize; label: { fr: string; en: string } }[] = [
  { value: 'petit', label: { fr: 'Petit', en: 'Small' } },
  { value: 'normal', label: { fr: 'Normal', en: 'Normal' } },
  { value: 'grand', label: { fr: 'Grand', en: 'Large' } },
];

const COLOR_THEME_IDS: ColorThemeId[] = ['argile', 'mousse', 'or', 'riviere'];

// Écran Paramètres — tâche n°19. Pas un onglet (fidèle à la maquette),
// accessible depuis l'icône engrenage de l'écran Accueil.
//
// Préférences persistées localement pour l'instant (AsyncStorage, voir
// PreferencesContext). TODO (tâche n°6) : synchroniser aussi vers
// user_settings côté Supabase une fois l'authentification en place —
// le local reste la source immédiate (principe offline-first).
export default function ParametresScreen({ navigation }: Props) {
  const prefs = usePreferences();
  const { colors, fontScale, mode, colorTheme, language, textSize } = prefs;
  const styles = useMemo(() => createStyles(colors, fontScale), [colors, fontScale]);
  const t = (fr: string, en: string) => (language === 'fr' ? fr : en);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable accessibilityLabel={t('Fermer', 'Close')} hitSlop={8} onPress={() => navigation.goBack()}>
          <Icon name="chevron" color={colors.ink} size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('Paramètres', 'Settings')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* --- Mode clair/sombre --- */}
        <Section title={t('Apparence', 'Appearance')} styles={styles}>
          <View style={styles.segmentRow}>
            {MODE_OPTIONS.map((option) => {
              const selected = option.value === mode;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => prefs.setMode(option.value)}
                  style={[styles.segment, selected && styles.segmentSelected]}
                >
                  <Icon name={option.icon} size={16} color={selected ? colors.white : colors.ink} />
                  <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
                    {t(option.label.fr, option.label.en)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* --- 4 thèmes de couleur --- */}
        <Section title={t("Couleur d'accent", 'Accent color')} styles={styles}>
          <View style={styles.swatchRow}>
            {COLOR_THEME_IDS.map((id) => {
              const def = ACCENT_THEMES[id];
              const selected = id === colorTheme;
              return (
                <Pressable
                  key={id}
                  onPress={() => prefs.setColorTheme(id)}
                  style={styles.swatchColumn}
                  accessibilityLabel={t(def.label.fr, def.label.en)}
                >
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: def.accent },
                      selected && styles.swatchSelected,
                    ]}
                  />
                  <Text style={[styles.swatchLabel, selected && styles.swatchLabelSelected]}>
                    {t(def.label.fr, def.label.en)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* --- Aperçu en direct --- */}
        <Section title={t('Aperçu', 'Preview')} styles={styles}>
          <Card tone="paper" style={styles.previewCard}>
            <View style={styles.previewRow}>
              <Chip label={t('Exemple', 'Sample')} tone="neutral" />
              <Chip label={t('Sain', 'Healthy')} tone="moss" />
            </View>
            <Button label={t('Bouton principal', 'Primary button')} onPress={() => {}} variant="primary" />
          </Card>
        </Section>

        {/* --- Langue --- */}
        <Section title={t('Langue', 'Language')} styles={styles}>
          <View style={styles.segmentRow}>
            {LANGUAGE_OPTIONS.map((option) => {
              const selected = option.value === language;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => prefs.setLanguage(option.value)}
                  style={[styles.segment, selected && styles.segmentSelected]}
                >
                  <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>
            {t(
              "S'applique à l'assistant Kernel dès maintenant. Le reste de l'interface suivra à mesure que chaque écran est traduit.",
              'Applies to the Kernel assistant right away. The rest of the interface will follow as each screen gets translated.'
            )}
          </Text>
        </Section>

        {/* --- Taille du texte --- */}
        <Section title={t('Taille du texte', 'Text size')} styles={styles}>
          <View style={styles.segmentRow}>
            {TEXT_SIZE_OPTIONS.map((option) => {
              const selected = option.value === textSize;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => prefs.setTextSize(option.value)}
                  style={[styles.segment, selected && styles.segmentSelected]}
                >
                  <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
                    {t(option.label.fr, option.label.en)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  children,
  styles,
}: {
  title: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function createStyles(colors: Palette, fontScale: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.paper,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    headerTitle: {
      fontFamily: fonts.titleBold,
      fontSize: fontSize.lg * fontScale,
      color: colors.ink,
    },
    content: {
      padding: 20,
      gap: 22,
    },
    section: {
      gap: 10,
    },
    sectionTitle: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.sm * fontScale,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    segmentRow: {
      flexDirection: 'row',
      gap: 8,
    },
    segment: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.line,
    },
    segmentSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    segmentLabel: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.sm * fontScale,
      color: colors.ink,
    },
    segmentLabelSelected: {
      color: colors.white,
    },
    swatchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    swatchColumn: {
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    swatch: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 3,
      borderColor: 'transparent',
    },
    swatchSelected: {
      borderColor: colors.ink,
    },
    swatchLabel: {
      fontFamily: fonts.body,
      fontSize: fontSize.xs * fontScale,
      color: colors.muted,
    },
    swatchLabelSelected: {
      color: colors.ink,
      fontFamily: fonts.bodySemiBold,
    },
    previewCard: {
      gap: 12,
    },
    previewRow: {
      flexDirection: 'row',
      gap: 8,
    },
    hint: {
      fontFamily: fonts.body,
      fontSize: fontSize.xs * fontScale,
      color: colors.muted,
      lineHeight: 16,
    },
  });
}
