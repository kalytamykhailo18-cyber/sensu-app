import { Card, LoadingState, Button } from '@/components/shared';
import { ThemedText } from '@/components/ThemedText';
import { useCommunicationLogs } from '@/hooks/useCommunicationLogs';
import { useScreenData } from '@/hooks/shared';
import { useAppTheme } from '@/hooks/useAppTheme';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export function LogViewerCard() {
  const theme = useAppTheme();
  const { getResponsivePadding, getResponsiveFontSize } = useScreenData();
  const {
    enabled,
    limit,
    logs,
    loading,
    error,
    fetchLogs,
    resetLogs,
    limitsConfig,
  } = useCommunicationLogs();

  const [limitInput, setLimitInput] = useState<string>(String(limit));
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    setLimitInput(String(limit));
  }, [limit]);

  const handleFetchLogs = useCallback(() => {
    const trimmed = limitInput.trim();
    const parsed = Number.parseInt(trimmed, 10);

    if (Number.isNaN(parsed)) {
      setInputError('Ingresa un número válido de líneas.');
      return;
    }

    setInputError(null);
    fetchLogs(parsed);
  }, [fetchLogs, limitInput]);

  const handleReset = useCallback(() => {
    resetLogs();
  }, [resetLogs]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: getResponsivePadding(12, 16, 20),
        },
        header: {
          gap: getResponsivePadding(4, 6, 8),
        },
        description: {
          fontSize: getResponsiveFontSize(12, 14, 16),
          color: theme.colors.textSecondary,
          lineHeight: getResponsiveFontSize(18, 20, 22),
        },
        inputContainer: {
          gap: getResponsivePadding(6, 8, 10),
        },
        label: {
          fontSize: getResponsiveFontSize(12, 14, 16),
          fontWeight: '600',
          color: theme.colors.text,
        },
        input: {
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: inputError ? theme.colors.error : theme.colors.border,
          borderRadius: getResponsivePadding(8, 10, 12),
          paddingVertical: getResponsivePadding(10, 12, 14),
          paddingHorizontal: getResponsivePadding(12, 14, 16),
          fontSize: getResponsiveFontSize(14, 16, 18),
          color: theme.colors.text,
        },
        helper: {
          fontSize: getResponsiveFontSize(11, 12, 13),
          color: theme.colors.textSecondary,
        },
        errorText: {
          fontSize: getResponsiveFontSize(11, 12, 13),
          color: theme.colors.error,
        },
        actionsRow: {
          flexDirection: 'row',
          gap: getResponsivePadding(8, 10, 12),
        },
        logsContainer: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          borderRadius: getResponsivePadding(8, 10, 12),
          minHeight: getResponsivePadding(160, 200, 240),
          maxHeight: getResponsivePadding(260, 320, 380),
          overflow: 'hidden',
        },
        logsScroll: {
          padding: getResponsivePadding(12, 14, 16),
        },
        logText: {
          fontSize: getResponsiveFontSize(12, 13, 14),
          color: theme.colors.text,
          lineHeight: getResponsiveFontSize(16, 18, 20),
          fontFamily: Platform.select({
            ios: 'Menlo',
            android: 'monospace',
            default: 'Courier',
          }),
        },
      }),
    [
      getResponsiveFontSize,
      getResponsivePadding,
      inputError,
      theme.colors.background,
      theme.colors.border,
      theme.colors.error,
      theme.colors.surface,
      theme.colors.text,
      theme.colors.textSecondary,
    ]
  );

  if (!enabled) {
    return null;
  }

  const showError = inputError ?? error;

  return (
    <Card variant="filled">
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Logs de Comunicación</ThemedText>
          <ThemedText style={styles.description}>
            Consulta los mensajes de entrada y salida registrados por el servidor del reloj.
          </ThemedText>
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Líneas a mostrar</ThemedText>
          <TextInput
            value={limitInput}
            onChangeText={setLimitInput}
            keyboardType="numeric"
            placeholder={`Entre ${limitsConfig.min} y ${limitsConfig.max}`}
            style={styles.input}
            returnKeyType="done"
          />
          <ThemedText style={styles.helper}>
            Valores permitidos: {limitsConfig.min} - {limitsConfig.max} líneas. Valor predeterminado {limitsConfig.default}.
          </ThemedText>
          {showError && (
            <ThemedText style={styles.errorText}>
              {showError}
            </ThemedText>
          )}
        </View>

        <View style={styles.actionsRow}>
          <Button
            title="Ver Logs"
            onPress={handleFetchLogs}
            loading={loading}
            icon="doc.text.magnifyingglass"
            style={{ flex: 1 }}
          />
          <Button
            title="Limpiar"
            onPress={handleReset}
            variant="secondary"
            icon="trash"
            style={{ flex: 1 }}
            disabled={!logs}
          />
        </View>

        <View style={styles.logsContainer}>
          {loading ? (
            <LoadingState
              message="Cargando logs..."
              icon="waveform.path.ecg"
              iconColor={theme.colors.info}
              variant="compact"
            />
          ) : (
            <ScrollView style={styles.logsScroll}>
              <ThemedText style={styles.logText}>
                {logs.trim().length > 0 ? logs : 'No hay logs disponibles.'}
              </ThemedText>
            </ScrollView>
          )}
        </View>
      </View>
    </Card>
  );
}

