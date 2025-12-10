import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { Stack, router } from 'expo-router';
import { Dices, Sword, Shield, Scroll, AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
// i18next init should be handled globally, assuming it works or we fallback to keys

export default function LoginScreen() {
  const { user, signInWithGoogle, loading, error } = useAuth();
  const { t } = useTranslation();

  // Redirect if logged in
  React.useEffect(() => {
    if (user) {
        router.replace('/');
    }
  }, [user]);

  if (loading) {
    return (
        <View className="flex-1 bg-slate-900 justify-center items-center">
            <Text className="text-amber-500">{t('common.loading', 'Yükleniyor...')}</Text>
        </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center p-4 relative overflow-hidden">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background Elements - Using absolute positioning */}
      {/* Note: Animations are simplified here. Reanimated could be used for pulse. */}
      <View className="absolute top-10 left-10 opacity-20">
          <Dices size={120} color="#1e293b" />
      </View>
      <View className="absolute bottom-10 right-10 opacity-20">
          <Sword size={120} color="#1e293b" />
      </View>
      <View className="absolute top-1/4 right-1/4 opacity-20">
          <Shield size={80} color="#1e293b" />
      </View>
      <View className="absolute bottom-1/4 left-1/4 opacity-20">
          <Scroll size={80} color="#1e293b" />
      </View>

      <View className="w-full max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 items-center shadow-xl">
        <View className="flex justify-center mb-6">
          <View className="bg-slate-900 p-4 rounded-full border-2 border-amber-500 shadow-sm">
             <Dices size={64} color="#f59e0b" />
          </View>
        </View>

        <Text className="text-3xl font-bold text-amber-500 mb-2 text-center">
          {t('auth.title', 'Zindan Ustası')}
        </Text>
        <Text className="text-slate-400 mb-8 text-center">
          {t('auth.subtitle', 'Maceranıza başlamak için giriş yapın')}
        </Text>

        {error && (
          <View className="mb-6 bg-red-900/20 border border-red-700 p-3 rounded-lg flex-row items-start w-full">
            <AlertCircle size={20} color="#fecaca" style={{ marginRight: 8, marginTop: 2 }} />
            <Text className="text-red-200 flex-1">{error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={signInWithGoogle}
          className="w-full bg-white py-3 px-4 rounded-xl flex-row items-center justify-center shadow-lg active:bg-slate-200"
        >
          {/* Simple Google Icon using Text or SVG if available. Using text for simplicity or generic icon */}
          <Text className="text-slate-900 font-bold text-lg ml-3">{t('auth.google_signin', 'Google ile Giriş Yap')}</Text>
        </TouchableOpacity>

        <Text className="mt-6 text-xs text-slate-500 text-center">
            {t('auth.terms', 'Giriş yaparak Hizmet Şartlarımızı ve Gizlilik Politikamızı kabul etmiş olursunuz.')}
        </Text>
      </View>
    </View>
  );
}
