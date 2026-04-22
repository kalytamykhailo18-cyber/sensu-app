import { CommonColors } from '@/components/CommonStyles';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useScreenData } from './shared';
import { useAppTheme } from './useAppTheme';

export function useProfileStyles() {
  const theme = useAppTheme();
  const { dimensions, getResponsivePadding } = useScreenData();

  const styles = useMemo(() => {
    const getPad = (s: number, m: number, l: number) => getResponsivePadding(s, m, l);

    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        width: '100%',
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.secondary,
      },
      scrollView: { 
        flex: 1, 
        width: '100%' 
      },
      sessionCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: getPad(16, 20, 24),
      },
      watchesList: {
        marginVertical: 12,
      },
      watchItem: {
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      watchItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      watchInfo: {
        flex: 1,
        marginRight: 12,
      },
      watchActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
      },
      settingsButton: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: theme.colors.primary,
      },
      settingsButtonText: {
        color: theme.colors.surface,
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
      },
      watchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
      },
      watchImei: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 2,
        fontFamily: 'Menlo',
      },
      watchDate: {
        fontSize: 12,
        color: theme.colors.textTertiary,
      },
      unlinkButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
      },
      unlinkButtonText: {
        color: theme.colors.surface,
        fontSize: 12,
        fontWeight: '600',
      },
      sessionTitle: {
        color: theme.isDark ? CommonColors.white : CommonColors.gray333,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
      },
      sessionSubtitle: {
        color: theme.isDark ? CommonColors.gray666 : CommonColors.gray666,
        fontSize: 14,
        marginBottom: 16,
      },
      logoutButton: {
        backgroundColor: theme.colors.error,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
      },
      logoutButtonText: {
        color: CommonColors.white,
        fontSize: 16,
        fontWeight: '600',
      },
      primaryButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
      },
      primaryButtonText: {
        color: CommonColors.white,
        fontSize: 16,
        fontWeight: '600',
      },
    });
  }, [dimensions.width, dimensions.height, getResponsivePadding, theme]);

  return styles;
}
