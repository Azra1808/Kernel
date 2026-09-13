import { useCallback, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, type Palette } from '../theme/palettes';
import { usePreferences } from '../theme/PreferencesContext';
import { fonts, fontSize } from '../theme/typography';
import { Icon } from '../theme/Icon';
import { Button } from '../components/Button';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { signIn, signUp } from '../lib/auth';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;
type Mode = 'signin' | 'signup';

// Écran Connexion / Inscription — tâche n°6. Email + mot de passe
// (Supabase Auth standard) plutôt que numéro de téléphone comme évoqué
// dans la doc d'origine : l'auth par SMS demande un fournisseur payant à
// configurer côté Supabase, pas idéal pour le calendrier du hackathon.
//
// Si l'utilisateur avait déjà une session anonyme (cas normal — voir
// session.ts), l'inscription CONVERTIT cette session en vrai compte au
// lieu d'en créer une nouvelle, pour garder tout ce qu'il avait déjà
// fait (diagnostics, signalements) — voir lib/auth.ts::signUp().
export default function AuthScreen({ navigation }: Props) {
  const { colors, fontScale, language } = usePreferences();
  const styles = useMemo(() => createStyles(colors, fontScale), [colors, fontScale]);
  const t = useCallback((fr: string, en: string) => (language === 'fr' ? fr : en), [language]);

  const [mode, setMode] = useState<Mode>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError(t('Remplis email et mot de passe.', 'Fill in email and password.'));
      return;
    }

    setLoading(true);
    const result =
      mode === 'signup' ? await signUp(email.trim(), password, fullName.trim()) : await signIn(email.trim(), password);
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigation.goBack();
  }, [email, password, fullName, mode, t, navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <AnimatedPressable
          accessibilityLabel={t('Fermer', 'Close')}
          hitSlop={8}
          onPress={() => navigation.goBack()}
          pressScale={0.85}
        >
          <Icon name="chevron" color={colors.ink} size={22} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>
          {mode === 'signup' ? t('Créer un compte', 'Create account') : t('Connexion', 'Sign in')}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>
          {mode === 'signup'
            ? t(
                'Crée un compte pour retrouver tes diagnostics et signalements sur un autre appareil.',
                'Create an account to find your diagnoses and reports on another device.'
              )
            : t('Connecte-toi à ton compte existant.', 'Sign in to your existing account.')}
        </Text>

        {mode === 'signup' && (
          <View style={styles.field}>
            <Text style={styles.label}>{t('Nom (optionnel)', 'Name (optional)')}</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('Ton nom', 'Your name')}
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="toi@exemple.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('Mot de passe', 'Password')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
            secureTextEntry
          />
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Button
          label={
            loading
              ? t('Chargement...', 'Loading...')
              : mode === 'signup'
                ? t('Créer mon compte', 'Create my account')
                : t('Se connecter', 'Sign in')
          }
          onPress={handleSubmit}
          disabled={loading}
        />
        {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: 8 }} />}

        <AnimatedPressable
          onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
          style={styles.switchModeButton}
          haptics={false}
        >
          <Text style={styles.switchModeText}>
            {mode === 'signup'
              ? t('Déjà un compte ? Se connecter', 'Already have an account? Sign in')
              : t('Pas de compte ? Créer un compte', "Don't have an account? Sign up")}
          </Text>
        </AnimatedPressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
      gap: 14,
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm * fontScale,
      color: colors.muted,
      marginBottom: 6,
    },
    field: {
      gap: 6,
    },
    label: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.sm * fontScale,
      color: colors.ink,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontFamily: fonts.body,
      fontSize: fontSize.base * fontScale,
      color: colors.ink,
      backgroundColor: colors.paperWarm,
    },
    errorBanner: {
      backgroundColor: colors.clayPale,
      borderRadius: radius.sm,
      padding: 12,
    },
    errorText: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm * fontScale,
      color: colors.clay,
    },
    switchModeButton: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    switchModeText: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.sm * fontScale,
      color: colors.accent,
    },
  });
}
