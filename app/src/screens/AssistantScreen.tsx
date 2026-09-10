import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { radius, type Palette } from '../theme/palettes';
import { usePreferences } from '../theme/PreferencesContext';
import { fonts, fontSize } from '../theme/typography';
import { Icon } from '../theme/Icon';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { getIntentById, matchIntent } from '../lib/assistant/engine';
import type { Lang, QuickReply } from '../lib/assistant/types';
import { FALLBACK_RESPONSE } from '../lib/assistant/intents';
import { askAssistantOnline } from '../lib/assistantOnline';
import { AnimatedPressable } from '../components/AnimatedPressable';

type ChatMessage = {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  quickReplies?: QuickReply[];
  pending?: boolean;
};

let messageCounter = 0;
function nextId() {
  messageCounter += 1;
  return `m${messageCounter}-${Date.now()}`;
}

function buildWelcome(lang: Lang): ChatMessage {
  const content =
    lang === 'fr'
      ? "Bonjour ! Je suis l'assistant Kernel. Pose-moi une question sur tes plantes, les déchets, ou l'écosystème de ton quartier."
      : "Hello! I'm the Kernel assistant. Ask me about your plants, waste reporting, or your neighborhood's ecosystem.";
  return {
    id: nextId(),
    sender: 'bot',
    content,
    quickReplies: [
      { label: { fr: 'Ma plante est malade', en: 'My plant is sick' }, intentId: 'plant_disease' },
      { label: { fr: 'Signaler un déchet', en: 'Report waste' }, intentId: 'waste_report' },
      { label: { fr: "Voir l'écosystème", en: 'View ecosystem' }, intentId: 'ecosystem_info' },
    ],
  };
}

// Assistant Kernel (Azra) — tâche n°17 (moteur hors ligne) + tâche n°18
// (intégration en ligne, choix retenu : Gemini via Edge Function
// Supabase, voir src/lib/assistantOnline.ts). Le moteur local reste
// toujours essayé EN PREMIER — l'API en ligne n'est appelée que quand
// aucune intention locale ne correspond, jamais pour remplacer une
// réponse déjà connue hors ligne (garde le ton/les garde-fous cohérents,
// et évite un aller-retour réseau inutile la plupart du temps).
export default function AssistantScreen() {
  const { colors, fontScale, language } = usePreferences();
  const styles = useMemo(() => createStyles(colors, fontScale), [colors, fontScale]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildWelcome(language)]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const respondTo = useCallback(
    async (userText: string) => {
      const { response, intent } = matchIntent(userText, language);

      // Intention locale trouvée : réponse immédiate, pas d'appel réseau.
      if (intent) {
        const botMessage: ChatMessage = {
          id: nextId(),
          sender: 'bot',
          content: response,
          quickReplies: intent.quickReplies,
        };
        setMessages((prev) => [...prev, botMessage]);
        scrollToEnd();
        return;
      }

      // Aucune intention locale : on tente l'API en ligne (tâche n°18),
      // avec un indicateur temporaire pendant l'attente.
      const thinkingId = nextId();
      const thinkingMessage: ChatMessage = {
        id: thinkingId,
        sender: 'bot',
        content: language === 'fr' ? 'Kernel réfléchit...' : 'Kernel is thinking...',
        pending: true,
      };
      setMessages((prev) => [...prev, thinkingMessage]);
      scrollToEnd();

      const online = await askAssistantOnline(userText, language);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? { id: thinkingId, sender: 'bot', content: online.ok ? online.reply : FALLBACK_RESPONSE[language] }
            : m
        )
      );
      scrollToEnd();
    },
    [language, scrollToEnd]
  );

  const sendUserMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMessage: ChatMessage = { id: nextId(), sender: 'user', content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setDraft('');
      scrollToEnd();

      // Petit délai pour que ça ne semble pas instantané/robotique.
      setTimeout(() => {
        respondTo(trimmed);
      }, 300);
    },
    [respondTo, scrollToEnd]
  );

  const handleQuickReply = useCallback(
    (reply: QuickReply) => {
      if (reply.goToTab) {
        navigation.navigate(reply.goToTab as never);
        return;
      }
      if (reply.intentId) {
        const intent = getIntentById(reply.intentId);
        // On affiche la puce comme un message utilisateur pour garder un
        // fil de conversation lisible, puis on répond directement avec
        // l'intention ciblée (pas besoin de repasser par le matching).
        const userMessage: ChatMessage = { id: nextId(), sender: 'user', content: reply.label[language] };
        const botMessage: ChatMessage = {
          id: nextId(),
          sender: 'bot',
          content: intent?.responses[language][0] ?? FALLBACK_RESPONSE[language],
          quickReplies: intent?.quickReplies,
        };
        setMessages((prev) => [...prev, userMessage, botMessage]);
        scrollToEnd();
      }
    },
    [language, navigation, scrollToEnd]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MessageBubble message={item} onQuickReply={handleQuickReply} styles={styles} language={language} />
        )}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder={language === 'fr' ? 'Écris ta question...' : 'Type your question...'}
          placeholderTextColor={colors.muted}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => sendUserMessage(draft)}
          returnKeyType="send"
        />
        <AnimatedPressable
          style={styles.sendButton}
          onPress={() => sendUserMessage(draft)}
          disabled={!draft.trim()}
          pressScale={0.9}
          accessibilityLabel={language === 'fr' ? 'Envoyer' : 'Send'}
        >
          <Icon name="send" color={colors.white} size={18} />
        </AnimatedPressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({
  message,
  onQuickReply,
  styles,
  language,
}: {
  message: ChatMessage;
  onQuickReply: (reply: QuickReply) => void;
  styles: ReturnType<typeof createStyles>;
  language: Lang;
}) {
  const isBot = message.sender === 'bot';
  return (
    <View style={[styles.bubbleRow, isBot ? styles.rowLeft : styles.rowRight]}>
      <View style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
        <Text
          style={[
            styles.bubbleText,
            isBot ? styles.bubbleTextBot : styles.bubbleTextUser,
            message.pending && styles.bubbleTextPending,
          ]}
        >
          {message.content}
        </Text>
      </View>
      {isBot && message.quickReplies && message.quickReplies.length > 0 && (
        <View style={styles.quickReplies}>
          {message.quickReplies.map((reply) => (
            <Pressable
              key={reply.label[language]}
              style={styles.quickReplyChip}
              onPress={() => onQuickReply(reply)}
            >
              <Text style={styles.quickReplyLabel}>{reply.label[language]}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: Palette, fontScale: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.paper,
    },
    list: {
      padding: 16,
      gap: 10,
    },
    bubbleRow: {
      marginBottom: 4,
      maxWidth: '85%',
    },
    rowLeft: {
      alignSelf: 'flex-start',
    },
    rowRight: {
      alignSelf: 'flex-end',
    },
    bubble: {
      borderRadius: radius.md,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    bubbleBot: {
      backgroundColor: colors.paperWarm,
      borderWidth: 1,
      borderColor: colors.line,
    },
    bubbleUser: {
      backgroundColor: colors.accent,
    },
    bubbleText: {
      fontFamily: fonts.body,
      fontSize: fontSize.base * fontScale,
      lineHeight: 20,
    },
    bubbleTextBot: {
      color: colors.ink,
    },
    bubbleTextUser: {
      color: colors.white,
    },
    bubbleTextPending: {
      fontStyle: 'italic',
      opacity: 0.6,
    },
    quickReplies: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 6,
    },
    quickReplyChip: {
      borderWidth: 1.5,
      borderColor: colors.accent,
      borderRadius: 100,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    quickReplyLabel: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.xs * fontScale,
      color: colors.accent,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: colors.line,
      backgroundColor: colors.paper,
    },
    input: {
      flex: 1,
      backgroundColor: colors.paperWarm,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontFamily: fonts.body,
      fontSize: fontSize.base * fontScale,
      color: colors.ink,
    },
    sendButton: {
      backgroundColor: colors.accent,
      borderRadius: radius.md,
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
