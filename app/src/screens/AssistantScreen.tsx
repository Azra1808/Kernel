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

type ChatMessage = {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  quickReplies?: QuickReply[];
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

// Assistant Kernel (Azra) — tâche n°17 : moteur hors ligne, désormais
// branché à la vraie préférence de langue (tâche n°19, PreferencesContext)
// au lieu d'une constante CURRENT_LANG figée. Le contenu anglais existait
// déjà dans intents.ts depuis la tâche 17 — seul ce point de lecture a
// changé, comme prévu par le TODO laissé à l'époque.
//
// La réponse est calculée localement (src/lib/assistant/engine.ts), sans
// connexion requise. L'intégration API pour les questions plus complexes
// (tâche n°18) et la persistance dans chat_messages (liée au module
// offline de la tâche n°7) viendront s'ajouter à cet écran, pas le
// remplacer.
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
    (userText: string) => {
      const { response, intent } = matchIntent(userText, language);
      const botMessage: ChatMessage = {
        id: nextId(),
        sender: 'bot',
        content: response,
        quickReplies: intent?.quickReplies,
      };
      setMessages((prev) => [...prev, botMessage]);
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
      setTimeout(() => respondTo(trimmed), 300);
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
        <Pressable
          style={styles.sendButton}
          onPress={() => sendUserMessage(draft)}
          disabled={!draft.trim()}
        >
          <Icon name="send" color={colors.white} size={18} />
        </Pressable>
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
        <Text style={[styles.bubbleText, isBot ? styles.bubbleTextBot : styles.bubbleTextUser]}>
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
