import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { translateError } from '../utils/errorHandlers';
import { emailService } from '../services/emailService';

interface AuthContextData {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordOTP: () => Promise<{ success: boolean; message: string }>;
  confirmPasswordOTP: (otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        mapSupabaseUserToAppUser(session.user);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        mapSupabaseUserToAppUser(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function mapSupabaseUserToAppUser(supabaseUser: any) {
    setUser({
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
      email: supabaseUser.email || '',
      password: '', // We don't store passwords on the client
      createdAt: supabaseUser.created_at,
    });
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: translateError(error) };
    }

    return { success: true, message: 'Login realizado com sucesso!' };
  }

  async function signUp(name: string, email: string, password: string) {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://finance-control-react.onrender.com';
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      return await signIn(email, password);
    } catch (error: any) {
      return { success: false, message: translateError(error.message) };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, message: translateError(error) };
    }

    if (user?.email) {
      emailService.sendPasswordChangedNotification(user.email);
    }

    return { success: true, message: 'Senha atualizada com sucesso!' };
  }

  async function sendPasswordResetEmail(email: string) {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://finance-control-react.onrender.com';
      const response = await fetch(`${apiUrl}/auth/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao solicitar recuperação');
      }

      // Envia o e-mail customizado via Resend com o link gerado pelo Supabase
      await emailService.sendPasswordReset(email, data.link);

      return { success: true, message: 'E-mail de recuperação enviado!' };
    } catch (error: any) {
      return { success: false, message: translateError(error.message) };
    }
  }

  async function requestPasswordOTP() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://finance-control-react.onrender.com';
      
      const response = await fetch(`${apiUrl}/auth/password-otp-request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao solicitar token');

      // Envia o OTP via e-mail (O backend gerou e retornou o OTP para o frontend enviar via Resend)
      if (user?.email) {
        await emailService.sendOTP(user.email, data.otp);
      }

      return { success: true, message: 'Código enviado para seu e-mail!' };
    } catch (error: any) {
      return { success: false, message: translateError(error.message) };
    }
  }

  async function confirmPasswordOTP(otp: string, newPassword: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://finance-control-react.onrender.com';
      
      const response = await fetch(`${apiUrl}/auth/password-otp-confirm`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ otp, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Token inválido ou expirado');

      return { success: true, message: 'Senha alterada com sucesso!' };
    } catch (error: any) {
      return { success: false, message: translateError(error.message) };
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, session, isLoading, signIn, signUp, signOut, updatePassword, 
      sendPasswordResetEmail, requestPasswordOTP, confirmPasswordOTP 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
