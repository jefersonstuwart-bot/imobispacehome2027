export const MARITAL_STATUS_LABELS = {
  single: 'Solteiro(a)',
  married: 'Casado(a)',
  divorced: 'Divorciado(a)',
  widowed: 'Viúvo(a)',
} as const;

export const PROPOSAL_TYPE_LABELS = {
  cash: 'À Vista',
  financed: 'Financiado',
} as const;

export const PROPOSAL_STATUS_LABELS = {
  new: 'Nova',
  pending_acceptance: 'Aguardando Aceite',
  in_progress: 'Em Atendimento',
  completed: 'Finalizada',
  redistributed: 'Redistribuída',
} as const;

export const BROKER_STATUS_LABELS = {
  online: 'Online',
  offline: 'Offline',
} as const;

export const DOCUMENT_TYPES = [
  { id: 'cpf', label: 'CPF', required: true },
  { id: 'rg', label: 'RG', required: true },
  { id: 'proof_of_address', label: 'Comprovante de Endereço', required: true },
  { id: 'work_card', label: 'Carteira de Trabalho', required: true },
  { id: 'payslip_or_ir', label: 'Holerite ou Imposto de Renda', required: true },
] as const;

export const SPOUSE_DOCUMENT_TYPES = [
  { id: 'spouse_cpf', label: 'CPF do Cônjuge', required: true },
  { id: 'spouse_rg', label: 'RG do Cônjuge', required: true },
  { id: 'spouse_income_proof', label: 'Comprovante de Renda do Cônjuge', required: true },
] as const;

export const LEAD_ACCEPTANCE_TIMEOUT_MINUTES = 5;
