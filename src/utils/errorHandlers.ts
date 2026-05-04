export function translateError(error: any): string {
  if (!error) return 'Ocorreu um erro inesperado.';
  
  const message = typeof error === 'string' ? error : error.message || '';
  
  // Supabase Auth Errors
  if (message.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (message.includes('User already registered')) {
    return 'Este e-mail já está cadastrado.';
  }
  if (message.includes('Password should be at least 6 characters')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (message.includes('Email not confirmed')) {
    return 'E-mail não confirmado. Verifique sua caixa de entrada.';
  }
  if (message.includes('Signup disabled')) {
    return 'O cadastro está temporariamente desativado.';
  }
  if (message.includes('Invalid format')) {
    return 'Formato inválido. Verifique os campos.';
  }
  if (message.includes('Database error')) {
    return 'Erro no banco de dados. Tente novamente.';
  }
  if (message.includes('Network request failed') || message.includes('fetch')) {
    return 'Erro de conexão. Verifique sua internet.';
  }
  if (message.includes('Too many requests')) {
    return 'Muitas solicitações. Tente novamente em alguns minutos.';
  }
  if (message.includes('User not found')) {
    return 'Usuário não encontrado.';
  }
  if (message.includes('Weak password')) {
    return 'A senha é muito fraca.';
  }

  // Generic fallback
  console.log('Unhandled error message:', message);
  return 'Ocorreu um erro ao processar sua solicitação.';
}
