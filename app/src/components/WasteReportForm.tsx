import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius } from '../theme/colors';
import { fonts, fontSize } from '../theme/typography';
import { Button } from './Button';
import type { WasteStatus } from '../data/wastePoints';

type StatusOption = { value: WasteStatus; label: string };

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'plein', label: 'Plein' },
  { value: 'partiel', label: 'Partiel' },
  { value: 'vide', label: 'Vide' },
];

type WasteReportFormProps = {
  visible: boolean;
  pointName: string;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (status: WasteStatus, note: string) => void;
};

/**
 * Formulaire de signalement — tâche n°13. Écrit toujours en local d'abord
 * (voir submitWasteReport dans src/data/wastePoints.ts) : ce composant ne
 * connaît pas Supabase, il se contente de collecter status + note.
 */
export function WasteReportForm({
  visible,
  pointName,
  submitting,
  onCancel,
  onSubmit,
}: WasteReportFormProps) {
  const [status, setStatus] = useState<WasteStatus>('plein');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    onSubmit(status, note.trim());
    setNote('');
    setStatus('plein');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Signaler ce point</Text>
          <Text style={styles.subtitle}>{pointName}</Text>

          <View style={styles.optionsRow}>
            {STATUS_OPTIONS.map((option) => {
              const selected = option.value === status;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setStatus(option.value)}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Commentaire (optionnel)"
            placeholderTextColor={colors.muted}
            value={note}
            onChangeText={setNote}
            multiline
          />

          <View style={styles.actions}>
            <Button label="Annuler" variant="ghost" onPress={onCancel} disabled={submitting} />
            <Button
              label="Envoyer"
              variant="primary"
              onPress={handleSubmit}
              loading={submitting}
            />
          </View>

          <Text style={styles.offlineHint}>
            Le signalement est enregistré tout de suite, même sans réseau — il sera envoyé
            automatiquement dès que la connexion revient.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 26, 21, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 20,
    gap: 14,
  },
  title: {
    fontFamily: fonts.titleBold,
    fontSize: fontSize.lg,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: -10,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: colors.clay,
    backgroundColor: colors.clayPale,
  },
  optionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  optionLabelSelected: {
    color: colors.clay,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
    minHeight: 60,
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  offlineHint: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
});
