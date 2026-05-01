export function validateEmail(email: string): string | null {
  const trimmedEmail = email.trim();
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!trimmedEmail) return 'E-mail é obrigatório.';
  if (!re.test(trimmedEmail)) return 'E-mail inválido.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Senha é obrigatória.';
  if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres.';
  return null;
}

export function validateName(name: string): string | null {
  if (!name || name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres.';
  return null;
}

export function validateAmount(value: string): string | null {
  const num = parseFloat(value.replace(/\./g, '').replace(',', '.'));
  if (!value) return 'Valor é obrigatório.';
  if (isNaN(num) || num <= 0) return 'Insira um valor válido maior que zero.';
  if (num > 999999999.99) return 'Valor máximo permitido é R$ 999.999.999,99';
  return null;
}

export function validateDescription(desc: string): string | null {
  if (!desc || desc.trim().length < 2) return 'Descrição deve ter pelo menos 2 caracteres.';
  return null;
}
