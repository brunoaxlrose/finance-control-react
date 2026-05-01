import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Modal, StatusBar } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';

export const NetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);
  const slideAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const status = state.isConnected && state.isInternetReachable !== false;
      
      if (isConnected && !status) {
        setWasOffline(true);
      }
      
      if (!isConnected && status && wasOffline) {
        handleRestored();
      }

      setIsConnected(status);
    });

    return () => unsubscribe();
  }, [isConnected, wasOffline]);

  const handleRestored = () => {
    setShowRestored(true);
    Animated.spring(slideAnim, {
      toValue: 20,
      useNativeDriver: true,
      tension: 40,
      friction: 7
    }).start();

    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowRestored(false);
        setWasOffline(false);
      });
    }, 3000);
  };

  if (isConnected === false) {
    return (
      <Modal visible={true} animationType="fade" transparent={false}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.offlineContainer}>
          <View style={styles.iconCircle}>
            <Feather name="wifi-off" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.offlineTitle}>Ops! Sem Conexão</Text>
          <Text style={styles.offlineText}>
            Parece que você está sem internet. Verifique seu Wi-Fi ou dados móveis para continuar usando o app.
          </Text>
          <View style={styles.retryContainer}>
            <Animated.View style={styles.dot} />
            <Text style={styles.retryText}>Tentando reconectar automaticamente...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (showRestored) {
    return (
      <Animated.View style={[styles.restoredBanner, { transform: [{ translateY: slideAnim }] }]}>
        <Feather name="check-circle" size={18} color={COLORS.white} />
        <Text style={styles.restoredText}>Conexão Restabelecida!</Text>
      </Animated.View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  offlineContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  offlineTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  offlineText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  retryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  retryText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  restoredBanner: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: COLORS.success,
    height: 50,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  restoredText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
