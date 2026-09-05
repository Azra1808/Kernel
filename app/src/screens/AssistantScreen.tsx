import { useCallback, useRef, useState } from 'react';
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
import { colors, radius } from '../theme/colors';
import { fonts, fontSize } from '../theme/typography';
import { Icon } from '../theme/Icon';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { getIntentById, matchIntent } from '../lib/assistant/engine';
import type { Lang, QuickReply } from '../lib/assistant/types';
import { FALLBACK_RESPONSE } from '../lib/assistant/intents';

// TODO (tâche n°19) : remplacer par la vraie préférence utilisateur
// (user_settings.language) une fois l'écran Paramètres branché à l'auth.
// Le contenu anglais existe déjà dans intents.ts — seul ce point de
// lecture doit changer.
const CURRENT_LANG: Lang = 'fr';

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

const WELCOME: ChatMessage = {
  id: nextId(),
  sender: 'bot',
  content:
    "Bonjour ! Je suis l'assistant Kernel. Pose-moi une question sur tes plantes, les déchets, ou l'écosystème de ton quartier.",
  quickReplies: [
    { label: { fr: 'Ma plante est malade', en: 'My plant is sick' }, intentId: 'plant_disease' },
    { label: { fr: 'Signaler un déchet', en: 'Report waste' }, intentId: 'waste_report' },
    { label: { fr: "Voir l'écosystème", en: 'View ecosystem' }, intentId: 'ecosystem_info' },
  ],
};

// Assistant Kernel (Azra) — tâche n°17 : moteur hors ligne.
// La réponse est calculée localement (src/lib/assistant/engine.ts), sans
// connexion requise. L'intégration API Claude pour les questions plus
// complexes (tâche n°18) et la persistance dans chat_messages (liée au
// module offline de la tâche n°7) viendront s'ajouter à cet écran, pas le
// remplacer.
export default function AssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const respondTo = useCallback(
    (userText: string) => {
      const { response, intent } = matchIntent(userText, CURRENT_LANG);
      const botMessage: ChatMessage = {
        id: nextId(),
        sender: 'bot',
        content: response,
        quickReplies: intent?.quickReplies,
      };
      setMessages((prev) => [...prev, botMessage]);
      scrollToEnd();
    },
    [scrollToEnd]
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
        const userMessage: ChatMessage = { id: nextId(), sender: 'user', content: reply.label[CURRENT_LANG] };
        const botMessage: ChatMessage = {
          id: nextId(),
          sender: 'bot',
          content: intent?.responses[CURRENT_LANG][0] ?? FALLBACK_RESPONSE[CURRENT_LANG],
          quickReplies: intent?.quickReplies,
        };
        setMessages((prev) => [...prev, userMessage, botMessage]);
        scrollToEnd();
      }
    },
    [navigation, scrollToEnd]
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
        renderItem={({ item }) => <MessageBubble message={item} onQuickReply={handleQuickReply} />}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Écris ta question..."
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
          <Icon name="send" color={colors.paper} size={18} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({
  message,
  onQuickReply,
}: {
  message: ChatMessage;
  onQuickReply: (reply: QuickReply) => void;
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
              key={reply.label[CURRENT_LANG]}
              style={styles.quickReplyChip}
              onPress={() => onQuickReply(reply)}
            >
              <Text style={styles.quickReplyLabel}>{reply.label[CURRENT_LANG]}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.clay,
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    lineHeight: 20,
  },
  bubbleTextBot: {
    color: colors.ink,
  },
  bubbleTextUser: {
    color: colors.paper,
  },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  quickReplyChip: {
    borderWidth: 1.5,
    borderColor: colors.clay,
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  quickReplyLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.clay,
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
    fontSize: fontSize.base,
    color: colors.ink,
  },
  sendButton: {
    backgroundColor: colors.clay,
    borderRadius: radius.md,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
