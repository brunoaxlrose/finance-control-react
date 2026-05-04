/**
 * Serviço de E-mail via Resend
 * 
 * Este serviço permite enviar e-mails diretamente do app.
 * Nota: Para "Confirmação de Cadastro" e "Redefinir Senha", 
 * a forma recomendada e ilimitada é configurar o Custom SMTP 
 * no painel do Supabase usando as credenciais do Resend.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const API_KEY = process.env.EXPO_PUBLIC_RESEND_API_KEY;

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export const emailService = {
  async send({ to, subject, html, from }: EmailOptions) {
    if (!API_KEY || API_KEY === 're_123456789') {
      console.warn('Resend API Key não configurada no .env');
      return { error: 'API Key ausente' };
    }

    try {
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          from: from || 'onboarding@resend.dev',
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar e-mail');
      }

      return { data, success: true };
    } catch (error: any) {
      console.error('Erro no emailService:', error);
      return { error: error.message, success: false };
    }
  },

  async sendPasswordReset(email: string, link: string) {
    return this.send({
      to: email,
      subject: 'Recuperação de Senha - Project Finance 🔐',
      html: `
        <div style="font-family: sans-serif; color: #2C2924; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2001A; border-radius: 10px;">
          <h1 style="color: #E2001A;">Recuperação de Senha</h1>
          <p>Você solicitou a alteração da sua senha no Project Finance.</p>
          <p>Clique no botão abaixo para definir uma nova senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #E2001A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Alterar Senha</a>
          </div>
          <p style="font-size: 12px; color: #A8998A;">Se você não solicitou isso, ignore este e-mail.</p>
          <hr style="border: 0; border-top: 1px solid #4D473F; margin: 20px 0;">
          <p style="font-size: 12px; color: #A8998A;">Equipe Project Finance</p>
        </div>
      `,
    });
  },

  async sendPasswordChangedNotification(email: string) {
    return this.send({
      to: email,
      subject: 'Sua senha foi alterada! 🛡️',
      html: `
        <div style="font-family: sans-serif; color: #2C2924; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2001A; border-radius: 10px;">
          <h1 style="color: #E2001A;">Aviso de Segurança</h1>
          <p>Olá,</p>
          <p>Informamos que a senha da sua conta no Project Finance foi alterada com sucesso.</p>
          <p>Se foi você quem realizou essa alteração, pode ignorar este e-mail.</p>
          <p><strong>Caso você não tenha solicitado essa alteração, entre em contato com nosso suporte imediatamente.</strong></p>
          <hr style="border: 0; border-top: 1px solid #4D473F; margin: 20px 0;">
          <p style="font-size: 12px; color: #A8998A;">Equipe Project Finance</p>
        </div>
      `,
    });
  },

  async sendWelcome(email: string, name: string) {
    return this.send({
      to: email,
      subject: 'Bem-vindo(a) ao Project Finance! 🚀',
      html: `
        <div style="font-family: sans-serif; color: #2C2924; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2001A; border-radius: 10px;">
          <h1 style="color: #E2001A;">Olá, ${name}!</h1>
          <p>Estamos muito felizes em ter você conosco.</p>
          <p>Agora você pode controlar suas finanças com elegância e inteligência.</p>
          <hr style="border: 0; border-top: 1px solid #4D473F; margin: 20px 0;">
          <p style="font-size: 12px; color: #A8998A;">Equipe Project Finance</p>
        </div>
      `,
    });
  },

  async sendOTP(email: string, otp: string) {
    return this.send({
      to: email,
      subject: 'Seu Código de Segurança - Project Finance 🛡️',
      html: `
        <div style="font-family: sans-serif; color: #2C2924; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2001A; border-radius: 10px;">
          <h1 style="color: #E2001A; text-align: center;">Código de Verificação</h1>
          <p>Você solicitou uma operação sensível no Project Finance.</p>
          <div style="background-color: #F4F1EE; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #2C2924;">${otp}</span>
          </div>
          <p>Este código expira em 10 minutos.</p>
          <hr style="border: 0; border-top: 1px solid #4D473F; margin: 20px 0;">
          <p style="font-size: 12px; color: #A8998A;">Se não foi você, mude sua senha imediatamente.</p>
        </div>
      `,
    });
  }
};
