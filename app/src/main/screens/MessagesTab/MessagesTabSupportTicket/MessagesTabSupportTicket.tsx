import React, { FunctionComponent, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';

// types
import { RootMessagesTabParamList } from 'main/navigators/MessagesTabStacks/MessagesTabStacks.types';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import HeaderTabScreen from 'components/HeaderTabScreen/HeaderTabScreen';
import Input from 'components/Input/Input';
import Button from 'components/Button/Button';

// providers
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';

// constants
import { PATHS_MESSAGES_TAB } from 'main/navigators/paths';

// backend
import {
  SUPABASE_ENABLED,
  SUPPORT_PROFILE_ID,
} from 'services/supabase/backend.config';
import {
  createSupportTicket,
  SUPPORT_CATEGORIES,
} from 'services/supabase/supabase.support';

// styles
import styles from './MessagesTabSupportTicket.styles';

type Props = {
  navigation: NativeStackNavigationProp<RootMessagesTabParamList>;
};

const STEPS = ['category', 'subject', 'description'] as const;
const DESCRIPTION_MAX = 1000;

const MessagesTabSupportTicket: FunctionComponent<Props> = ({ navigation }) => {
  const { showToast } = useToastProvider();

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canContinue = useMemo(() => {
    if (step === 0) return !!category;
    if (step === 1) return subject.trim().length > 0;
    if (step === 2) return description.trim().length > 0;
    return false;
  }, [step, category, subject, description]);

  const goBack = () => {
    if (step === 0) {
      navigation.goBack();
      return;
    }
    setStep(s => s - 1);
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { conversationId } = await createSupportTicket(SUPPORT_PROFILE_ID, {
        category,
        subject,
        description,
      });

      if (!conversationId) {
        // Ticket logged, but support chat couldn't open — confirm and exit
        // rather than pushing a broken chat screen.
        showToast({
          type: 'success',
          message: 'Ticket received — our support team will be in touch.',
        });
        navigation.dispatch(
          CommonActions.navigate({ name: PATHS_MESSAGES_TAB.messagesTabMain }),
        );
        return;
      }

      showToast({
        type: 'success',
        message: 'Ticket sent — our support team will reply here.',
      });
      // Drop the user into the support DM with their summary already posted.
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: PATHS_MESSAGES_TAB.messagesTabMain },
            {
              name: PATHS_MESSAGES_TAB.messagesTabChat,
              params: {
                channelUrl: conversationId,
                userId: SUPPORT_PROFILE_ID,
              },
            },
          ],
        }),
      );
    } catch (error: any) {
      showToast({
        type: 'error',
        message:
          error?.message ??
          'Could not submit your ticket. Please try again in a moment.',
      });
      if (__DEV__) console.warn('support ticket submit failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const onPrimary = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      return;
    }
    submit();
  };

  const primaryTitle =
    step < STEPS.length - 1
      ? 'Continue'
      : submitting
        ? 'Sending…'
        : 'Submit ticket';

  return (
    <BackgroundScreen type="messages">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <HeaderTabScreen title="Contact support" onPressLeft={goBack} />
        <View style={styles.container}>
          <View style={styles.progressRow}>
            {STEPS.map((_, i) => (
              <View
                key={`dot-${i}`}
                style={[
                  styles.progressDot,
                  i <= step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {step === 0 && (
              <>
                <Text style={styles.stepLabel}>Step 1 of 3</Text>
                <Text style={styles.title}>What do you need help with?</Text>
                <Text style={styles.subtitle}>
                  Pick the option that best fits your issue.
                </Text>
                <View style={styles.categoryList}>
                  {SUPPORT_CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryItem,
                        category === cat && styles.categoryItemActive,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={styles.categoryText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {step === 1 && (
              <>
                <Text style={styles.stepLabel}>Step 2 of 3</Text>
                <Text style={styles.title}>Give it a subject</Text>
                <Text style={styles.subtitle}>
                  A short summary so we can route your request.
                </Text>
                <Input
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="e.g. Can’t update my email"
                  autoCapitalize="sentences"
                  maxLength={200}
                />
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.stepLabel}>Step 3 of 3</Text>
                <Text style={styles.title}>Describe your issue</Text>
                <Text style={styles.subtitle}>
                  Add as much detail as you can — what happened, and what you
                  expected.
                </Text>
                <TextInput
                  style={styles.textArea}
                  value={description}
                  onChangeText={t => setDescription(t.slice(0, DESCRIPTION_MAX))}
                  placeholder="Tell us what’s going on…"
                  multiline
                  maxLength={DESCRIPTION_MAX}
                />
                <Text style={styles.charCount}>
                  {description.length}/{DESCRIPTION_MAX}
                </Text>

                <View style={{ marginTop: 20 }}>
                  <Text style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Category: </Text>
                    {category}
                  </Text>
                  <Text style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subject: </Text>
                    {subject}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={primaryTitle}
              onPress={onPrimary}
              disabled={!canContinue || submitting || !SUPABASE_ENABLED}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </BackgroundScreen>
  );
};

export default MessagesTabSupportTicket;
