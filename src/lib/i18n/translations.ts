export type Language = 'en' | 'es' | 'fr' | 'it' | 'zh' | 'de' | 'pt' | 'ru' | 'ar' | 'pl';

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  zh: '中文',
  de: 'Deutsch',
  pt: 'Português',
  ru: 'Русский',
  ar: 'العربية',
  pl: 'Polski',
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', it: '🇮🇹', zh: '🇨🇳',
  de: '🇩🇪', pt: '🇵🇹', ru: '🇷🇺', ar: '🇸🇦', pl: '🇵🇱',
};

const en = {
  'chat.headline': 'Where would you like to go?',
  'chat.subtitle': 'Tell our AI travel agent about your dream trip and get a personalized itinerary in seconds.',
  'chat.placeholder': 'Tell me about your dream trip...',
  'chat.disclaimer': 'ExplorePlan can make mistakes. Verify important travel details before booking.',
  'chat.typing': 'Planning your adventure...',
  'chat.errorMessage': 'Something went wrong. Please try again.',
  'chat.retry': 'Retry',
  'chat.newChat': 'New chat',
  'chat.backHome': 'Back to home',
  'quickAction.newTrip': 'Create a new trip',
  'quickAction.inspire': 'Inspire me where to go',
  'quickAction.roadTrip': 'Plan a road trip',
  'quickAction.lastMinute': 'Plan a last-minute escape',
  'quickAction.quiz': 'Take a quiz',
  'cta.startChatting': 'Start chatting',
  'cta.seeHowItWorks': 'See how it works',
};

const es: Record<string, string> = {
  'chat.headline': '¿A dónde te gustaría ir?',
  'chat.subtitle': 'Cuéntale a nuestro agente de viajes con IA sobre tu viaje soñado y obtén un itinerario personalizado en segundos.',
  'chat.placeholder': 'Cuéntame sobre tu viaje soñado...',
  'chat.disclaimer': 'ExplorePlan puede cometer errores. Verifica los detalles importantes antes de reservar.',
  'chat.errorMessage': 'Algo salió mal. Por favor, inténtalo de nuevo.',
  'chat.retry': 'Reintentar',
  'cta.startChatting': 'Empezar a chatear',
};

const fr: Record<string, string> = {
  'chat.headline': 'Où aimeriez-vous aller ?',
  'chat.subtitle': 'Parlez de votre voyage de rêve à notre agent IA et obtenez un itinéraire personnalisé en quelques secondes.',
  'chat.placeholder': 'Parlez-moi de votre voyage de rêve...',
  'chat.disclaimer': 'ExplorePlan peut faire des erreurs. Vérifiez les détails importants avant de réserver.',
  'chat.errorMessage': 'Une erreur est survenue. Veuillez réessayer.',
  'chat.retry': 'Réessayer',
  'cta.startChatting': 'Commencer à discuter',
};

const it: Record<string, string> = {
  'chat.headline': 'Dove vorresti andare?',
  'chat.subtitle': 'Racconta al nostro agente di viaggio AI del tuo viaggio dei sogni e ottieni un itinerario personalizzato in pochi secondi.',
  'chat.placeholder': 'Raccontami del tuo viaggio dei sogni...',
  'chat.errorMessage': 'Qualcosa è andato storto. Per favore riprova.',
  'cta.startChatting': 'Inizia a chattare',
};

const zh: Record<string, string> = {
  'chat.headline': '你想去哪里？',
  'chat.subtitle': '告诉我们的AI旅行顾问你的梦想之旅，几秒内获取个性化行程。',
  'chat.placeholder': '告诉我你的梦想之旅...',
  'chat.errorMessage': '出了点问题，请重试。',
  'cta.startChatting': '开始聊天',
};

const de: Record<string, string> = {
  'chat.headline': 'Wohin möchten Sie reisen?',
  'chat.subtitle': 'Erzählen Sie unserem KI-Reiseagenten von Ihrer Traumreise und erhalten Sie in Sekunden einen personalisierten Reiseplan.',
  'chat.placeholder': 'Erzählen Sie mir von Ihrer Traumreise...',
  'chat.errorMessage': 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
  'cta.startChatting': 'Chat starten',
};

const pt: Record<string, string> = {
  'chat.headline': 'Para onde gostaria de ir?',
  'chat.subtitle': 'Conte ao nosso agente de viagens IA sobre a sua viagem dos sonhos e receba um itinerário personalizado em segundos.',
  'chat.placeholder': 'Conte-me sobre a sua viagem dos sonhos...',
  'chat.errorMessage': 'Algo deu errado. Por favor, tente novamente.',
  'cta.startChatting': 'Começar a conversar',
};

const ru: Record<string, string> = {
  'chat.headline': 'Куда бы вы хотели поехать?',
  'chat.subtitle': 'Расскажите нашему ИИ-агенту о путешествии вашей мечты и получите персонализированный маршрут за считанные секунды.',
  'chat.placeholder': 'Расскажите о путешествии вашей мечты...',
  'chat.errorMessage': 'Что-то пошло не так. Попробуйте снова.',
  'cta.startChatting': 'Начать чат',
};

const ar: Record<string, string> = {
  'chat.headline': 'إلى أين تريد أن تذهب؟',
  'chat.subtitle': 'أخبر وكيل السفر الذكي عن رحلة أحلامك واحصل على خطة سفر مخصصة في ثوانٍ.',
  'chat.placeholder': 'أخبرني عن رحلة أحلامك...',
  'chat.errorMessage': 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
  'cta.startChatting': 'ابدأ المحادثة',
};

const pl: Record<string, string> = {
  'chat.headline': 'Dokąd chciałbyś pojechać?',
  'chat.subtitle': 'Opowiedz naszemu agentowi AI o swojej wymarzonej podróży i otrzymaj spersonalizowany plan w kilka sekund.',
  'chat.placeholder': 'Opowiedz mi o swojej wymarzonej podróży...',
  'chat.errorMessage': 'Coś poszło nie tak. Spróbuj ponownie.',
  'cta.startChatting': 'Rozpocznij czat',
};

export const translations: Record<Language, Record<string, string>> = {
  en, es, fr, it, zh, de, pt, ru, ar, pl,
};
