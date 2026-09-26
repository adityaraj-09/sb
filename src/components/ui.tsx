import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, radius, space } from '../theme';

export function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={['top', 'bottom']}>
      {children}
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Mono({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <Text style={[styles.mono, style as object]}>{children}</Text>;
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        selectionColor={colors.ink}
        style={styles.input}
      />
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  tone = 'primary',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: 'primary' | 'danger' | 'ghost';
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        tone === 'danger' && styles.buttonDanger,
        tone === 'ghost' && styles.buttonGhost,
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone === 'primary' ? colors.primaryInk : colors.ink} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            tone === 'ghost' && styles.buttonGhostText,
            tone === 'danger' && styles.buttonDangerText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function ErrorText({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }
  return <Text style={styles.error}>{message}</Text>;
}

export function Pill({
  label,
  tone = 'muted',
}: {
  label: string;
  tone?: 'success' | 'warn' | 'muted';
}) {
  return (
    <View
      style={[
        styles.pill,
        tone === 'success' && styles.pillSuccess,
        tone === 'warn' && styles.pillWarn,
      ]}
    >
      <Text
        style={[
          styles.pillText,
          tone === 'success' && styles.pillSuccessText,
          tone === 'warn' && styles.pillWarnText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: space.lg,
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.8,
    fontFamily: fonts.sansSemi,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.sans,
    color: colors.muted,
  },
  mono: {
    fontFamily: fonts.mono,
    color: colors.muted,
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: fonts.monoMedium,
    color: colors.muted,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  buttonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line,
  },
  buttonDisabled: {
    opacity: 0.38,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: colors.primaryInk,
    fontSize: 15,
    fontFamily: fonts.sansMedium,
  },
  buttonGhostText: {
    color: colors.ink,
  },
  buttonDangerText: {
    color: colors.ink,
  },
  error: {
    color: colors.ink,
    fontSize: 14,
    fontFamily: fonts.sans,
    borderLeftWidth: 2,
    borderLeftColor: colors.ink,
    paddingLeft: 10,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pillSuccess: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillWarn: {
    backgroundColor: 'transparent',
    borderColor: colors.lineStrong,
  },
  pillText: {
    fontSize: 11,
    letterSpacing: 0.4,
    fontFamily: fonts.monoMedium,
    color: colors.muted,
  },
  pillSuccessText: {
    color: colors.primaryInk,
  },
  pillWarnText: {
    color: colors.warn,
  },
});
