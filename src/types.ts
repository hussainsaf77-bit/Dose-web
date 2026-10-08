export type SubscriptionTier = 'free' | 'pro' | 'vip';

export interface SubscriptionPackage {
  id: 'weekly' | 'monthly' | '3months' | '6months' | 'yearly';
  tier: SubscriptionTier;
  nameAr: string;
  nameEn: string;
  price: number;
  durationDays: number;
  durationTextAr: string;
  badgeAr?: string;
  iconText?: string;
  popular?: boolean;
  savingsAr?: string;
  buttonLabelTelegram: string;
}

export interface PlanDetails {
  id: SubscriptionTier;
  nameAr: string;
  nameEn: string;
  priceMonthly: number;
  priceYearly?: number;
  badgeAr: string;
  badgeEn: string;
  descriptionAr: string;
  descriptionEn: string;
  featuresAr: string[];
  featuresEn: string[];
  dailyQuota: number;
  maxFilesPerDay: number;
  hasWebAccess: boolean;
  hasBotAccess: boolean;
  hasPrioritySupport: boolean;
  hasAnalytics: boolean;
  hasApiAccess: boolean;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'expired' | 'canceled';
  expiresAt: string; // ISO date
  dailyQuotaUsed: number;
  dailyQuotaTotal: number;
  creditsRemaining: number;
}

export interface TelegramUser {
  id: string; // web uuid
  telegramId: string; // e.g. "987654321"
  username?: string; // e.g. "saf_tech"
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  authSource: 'bot_code' | 'telegram_login' | 'webapp' | 'demo';
  subscription: UserSubscription;
  createdAt: string;
  lastActiveAt?: string;
  totalRequests?: number;
}

export interface BotFeature {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  minTier: SubscriptionTier;
  category: 'ai' | 'automation' | 'management' | 'analytics';
  badgeAr?: string;
  badgeEn?: string;
  iconName: string;
}

export interface SyncLogItem {
  id: string;
  timestamp: string;
  source: 'telegram_bot' | 'web_platform';
  userTelegramId: string;
  userName: string;
  actionAr: string;
  actionEn: string;
  status: 'success' | 'warning' | 'error';
  tierUsed: SubscriptionTier;
}

export interface BotConfigState {
  botTokenConfigured: boolean;
  botUsername: string;
  webhookActive: boolean;
  appUrl: string;
}

// ── Medical & Dose Types from Dose-web ──
export interface DrugInfo {
  id: string;
  name_ar: string;
  name_en: string;
  aliases: string[];
  trade_names?: string[];
  class_ar: string;
  class_en: string;
  indications_ar?: string[];
  indications_en?: string[];
  mpk_min?: number;
  mpk_max?: number;
  freq_ar?: string;
  freq_en?: string;
  adult_min?: number;
  adult_max?: number;
  adult_freq?: string;
  adult_dosage_text_ar?: string;
  adult_dosage_text_en?: string;
  pediatric_dosage_text_ar?: string;
  pediatric_dosage_text_en?: string;
  administration_ar?: string;
  administration_en?: string;
  max_daily?: string;
  conc?: number; // mg per 5ml default
  ab_doses?: {
    ear?: [number, number, number];
    lung?: [number, number, number];
    urinary?: [number, number, number];
    skin?: [number, number, number];
  };
  contra_ar: string;
  contra_en?: string;
  side_ar: string;
  side_en?: string;
  preg: string;
  preg_en?: string;
  preg_badge: 'ok' | 'warn' | 'err';
  lact: string;
  lact_en?: string;
  renal: string;
  renal_en?: string;
  note: string;
  note_en?: string;
  interactions: string[];
  pharmacist_advice_ar?: string;
  pharmacist_advice_en?: string;
  isAiResult?: boolean;
  source?: string;
}

export interface DrugInteractionRule {
  drugs: string[];
  level: 'danger' | 'warn' | 'info';
  msg: string;
}

export interface MedicationReminder {
  id: string;
  drug_name: string;
  dose: string;
  times: string[];
  days: string[];
  email_notify: boolean;
  is_active: boolean;
  created_at: string;
}

export interface PatientReading {
  id: string;
  date: string;
  type: 'bp' | 'sugar' | 'hr' | 'weight';
  value: string;
  numericVal?: number;
  note?: string;
}

export interface PatientProfile {
  fullName: string;
  age: number | string;
  weight: number | string;
  gender: 'male' | 'female';
  bloodType: string;
  allergies: string;
  chronicDiseases: string;
  currentMedications: string;
  notes: string;
}
