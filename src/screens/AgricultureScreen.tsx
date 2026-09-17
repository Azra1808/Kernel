import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { radius, type Palette } from '../theme/palettes';
import { usePreferences } from '../theme/PreferencesContext';
import { fonts, fontSize } from '../theme/typography';
import { Icon } from '../theme/Icon';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Chip, ChipTone } from '../components/Chip';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { diagnosePlant, type PlantDiagnosisResult } from '../lib/plantModel';
import { saveDiagnosis } from '../data/diagnoses';

type ScreenState = 'idle' | 'preview' | 'analyzing' | 'result' | 'saved';

// Couleurs de statut fixes (voir theme/palettes.ts) — la sévérité d'une
// maladie garde le même code couleur que "plein/partiel/vide" ailleurs
// dans l'app, indépendamment du thème d'accent choisi dans les Paramètres.
const SEVERITY_TONE: Record<PlantDiagnosisResult['severity'], ChipTone> = {
  faible: 'moss',
  moyen: 'gold',
  eleve: 'clay',
};

// Module Agriculture (Michel) — tâches n°9 (capture photo) et n°11
// (résultat + sauvegarde) réunies dans un seul écran à états. La tâche
// n°10 (vrai modèle TFLite) est un MOCK pour l'instant — voir le
// commentaire détaillé en tête de src/lib/plantModel.ts avant de
// présenter le projet au jury.
export default function AgricultureScreen() {
  const { colors, fontScale, language } = usePreferences();
  const styles = useMemo(() => createStyles(colors, fontScale), [colors, fontScale]);
  const t = useCallback((fr: string, en: string) => (language === 'fr' ? fr : en), [language]);

  const [state, setState] = useState<ScreenState>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<PlantDiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setImageUri(null);
    setResult(null);
    setError(null);
  }, []);

  const handlePickFrom = useCallback(
    async (source: 'camera' | 'gallery') => {
      setError(null);
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          t(
            "Autorisation refusée. Active l'accès dans les réglages du téléphone pour utiliser cette fonction.",
            'Permission denied. Enable access in your phone settings to use this feature.'
          )
        );
        return;
      }

      const pickerResult =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] })
          : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });

      if (pickerResult.canceled || !pickerResult.assets?.[0]) return;

      setImageUri(pickerResult.assets[0].uri);
      setState('preview');
    },
    [t]
  );

  const handleAnalyze = useCallback(async () => {
    if (!imageUri) return;
    setState('analyzing');
    setError(null);
    try {
      const diagnosis = await diagnosePlant(imageUri, language);
      setResult(diagnosis);
      setState('result');
    } catch (err) {
      console.warn('[Agriculture] échec du diagnostic :', err);
      setError(t('Le diagnostic a échoué. Réessaie.', 'Diagnosis failed. Please try again.'));
      setState('preview');
    }
  }, [imageUri, language, t]);

  const handleSave = useCallback(async () => {
    if (!imageUri || !result) return;
    try {
      await saveDiagnosis(imageUri, result.cropType, result, language);
      setState('saved');
    } catch (err) {
      console.warn('[Agriculture] échec de la sauvegarde :', err);
      setError(
        t(
          'La sauvegarde a échoué localement — inhabituel, vérifie le stockage du téléphone.',
          'Local save failed — unusual, check your phone storage.'
        )
      );
    }
  }, [imageUri, result, language, t]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBlock}>
        <View style={styles.brandRow}>
          <Icon name="leaf" color={colors.moss} size={22} />
          <Text style={styles.title}>{t('Agriculture', 'Agriculture')}</Text>
        </View>
        <Text style={styles.subtitle}>
          {t(
            'Photographie une feuille pour diagnostiquer une maladie — fonctionne hors ligne.',
            'Photograph a leaf to diagnose a disease — works offline.'
          )}
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {state === 'idle' && (
        <View style={styles.idleBlock}>
          <View style={styles.photoFrame}>
            <Icon name="camera" color={colors.moss} size={40} />
          </View>
          <Button label={t('Prendre une photo', 'Take a photo')} onPress={() => handlePickFrom('camera')} />
          <Button
            label={t('Choisir dans la galerie', 'Choose from gallery')}
            variant="secondary"
            onPress={() => handlePickFrom('gallery')}
          />
        </View>
      )}

      {(state === 'preview' || state === 'analyzing') && imageUri && (
        <View style={styles.previewBlock}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          {state === 'analyzing' ? (
            <View style={styles.analyzingRow}>
              <ActivityIndicator color={colors.moss} />
              <Text style={styles.analyzingText}>{t('Analyse en cours...', 'Analyzing...')}</Text>
            </View>
          ) : (
            <View style={styles.previewActions}>
              <Button label={t('Analyser', 'Analyze')} onPress={handleAnalyze} />
              <Button label={t('Reprendre', 'Retake')} variant="ghost" onPress={reset} />
            </View>
          )}
        </View>
      )}

      {(state === 'result' || state === 'saved') && result && imageUri && (
        <View style={styles.resultBlock}>
          <Image source={{ uri: imageUri }} style={styles.previewImageSmall} />

          <Card tone="paper" style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.diseaseLabel}>{result.diseaseLabel}</Text>
              <Chip
                label={`${Math.round(result.confidence * 100)}%`}
                tone={SEVERITY_TONE[result.severity]}
              />
            </View>
            <Text style={styles.adviceText}>{result.advice}</Text>
          </Card>

          {state === 'result' ? (
            <View style={styles.previewActions}>
              <Button label={t('Enregistrer', 'Save')} onPress={handleSave} />
              <Button label={t('Nouvelle photo', 'New photo')} variant="ghost" onPress={reset} />
            </View>
          ) : (
            <View style={styles.savedBlock}>
              <View style={styles.savedRow}>
                <Icon name="leaf" color={colors.moss} size={16} />
                <Text style={styles.savedText}>
                  {t('Diagnostic enregistré.', 'Diagnosis saved.')}
                </Text>
              </View>
              <AnimatedPressable onPress={reset} style={styles.newDiagnosisButton}>
                <Text style={styles.newDiagnosisLabel}>
                  {t('Faire un nouveau diagnostic', 'Start a new diagnosis')}
                </Text>
              </AnimatedPressable>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(colors: Palette, fontScale: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.paper,
    },
    content: {
      padding: 20,
      gap: 16,
    },
    headerBlock: {
      gap: 4,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontFamily: fonts.titleBold,
      fontSize: fontSize.xxl * fontScale,
      color: colors.ink,
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm * fontScale,
      color: colors.muted,
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
    idleBlock: {
      gap: 12,
      alignItems: 'stretch',
    },
    photoFrame: {
      height: 180,
      borderRadius: radius.lg,
      backgroundColor: colors.mossPale,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    previewBlock: {
      gap: 14,
    },
    previewImage: {
      width: '100%',
      height: 280,
      borderRadius: radius.lg,
    },
    previewImageSmall: {
      width: '100%',
      height: 180,
      borderRadius: radius.lg,
    },
    previewActions: {
      gap: 10,
    },
    analyzingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 8,
    },
    analyzingText: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.base * fontScale,
      color: colors.ink,
    },
    resultBlock: {
      gap: 14,
    },
    resultCard: {
      gap: 10,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    diseaseLabel: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.md * fontScale,
      color: colors.ink,
      flex: 1,
    },
    adviceText: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm * fontScale,
      color: colors.ink,
      opacity: 0.85,
      lineHeight: 20,
    },
    savedBlock: {
      gap: 12,
      alignItems: 'center',
    },
    savedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    savedText: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.sm * fontScale,
      color: colors.moss,
    },
    newDiagnosisButton: {
      paddingVertical: 8,
    },
    newDiagnosisLabel: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.sm * fontScale,
      color: colors.accent,
      textDecorationLine: 'underline',
    },
  });
}
