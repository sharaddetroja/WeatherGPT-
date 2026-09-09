import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Radio, 
  Languages, 
  ChevronDown, 
  Bot, 
  User, 
  PanelLeftClose, 
  PanelLeft, 
  PhoneOff, 
  Compass, 
  RefreshCw 
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useUserProfile } from '../hooks/useUserProfile';

// Supported Languages for Voice & Text
export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechLang: string;
  greeting: string;
  suggestions: string[];
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'auto',
    name: 'Auto Detect Any Language',
    nativeName: '✨ Auto-Detect (કોઈપણ ભાષા / सभी भाषाएँ)',
    flag: '🌐',
    speechLang: 'en-US',
    greeting: "Hello! I am WeatherGPT Multi-Lingual Voice AI. Speak or type in ANY language (Gujarati, Hindi, Marathi, Bengali, Tamil, Telugu, Spanish, French, etc.) and I will detect and answer in your language!",
    suggestions: [
      "Will it rain today in Rajkot?",
      "શું આજે વરસાદ પડશે?",
      "क्या आज बारिश होगी?",
      "आज पाऊस पडेल का?"
    ]
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    speechLang: 'gu-IN',
    greeting: "નમસ્તે! હું WeatherGPT વોઇસ આસિસ્ટન્ટ છું. મને ગુજરાત અને રાજકોટના હવામાન, વરસાદ અને તાપમાન વિશે પૂછો!",
    suggestions: [
      "શું આજે રાજકોટમાં વરસાદ પડશે?",
      "શું મારે આજે છત્રી રાખવાની જરૂર છે?",
      "આ અઠવાડિયે તાપમાન કેટલું રહેશે?",
      "ખેતીના પાક માટે આજનું હવામાન કેવું છે?"
    ]
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    speechLang: 'hi-IN',
    greeting: "नमस्ते! मैं WeatherGPT वॉयस असिस्टेंट हूँ। मुझसे आज के मौसम, बारिश, तापमान या यात्रा के बारे में पूछें!",
    suggestions: [
      "क्या आज राजकोट में बारिश होगी?",
      "क्या मुझे शाम को छाता लेकर जाना चाहिए?",
      "अगले 7 दिनों का तापमान कैसा रहेगा?",
      "क्या कोई आंधी या तूफान की चेतावनी है?"
    ]
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    speechLang: 'mr-IN',
    greeting: "नमस्कार! मी WeatherGPT व्हॉइस असिस्टंट आहे. मला हवामान, पाऊस आणि तापमानाबद्दल काहीही विचारा!",
    suggestions: [
      "आज पाऊस पडेल का?",
      "मला छत्री सोबत घेण्याची गरज आहे का?",
      "पुढील ७ दिवसांचे तापमान कसे असेल?",
      "शेतीच्या पिकांसाठी आजचे हवामान कसे आहे?"
    ]
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    speechLang: 'bn-IN',
    greeting: "নমস্কার! আমি WeatherGPT ভয়েস অ্যাসিস্ট্যান্ট। আবহাওয়া, বৃষ্টি বা তাপমাত্রা সম্পর্কে আমাকে যেকোনো প্রশ্ন করুন!",
    suggestions: [
      "আজ কি বৃষ্টি হবে?",
      "আমার কি ছাতা নেওয়া উচিত?",
      "তাপমাত্রার পূর্বাভাস কেমন?",
      "কোনো ঝড়ের সতর্কতা আছে কি?"
    ]
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    speechLang: 'ta-IN',
    greeting: "வணக்கம்! நான் WeatherGPT குரல் உதவியாளர். வானிலை, மழை மற்றும் வெப்பநிலை பற்றி என்னிடம் கேளுங்கள்!",
    suggestions: [
      "இன்று மழை பெய்யுமா?",
      "நான் குடை எடுத்துச் செல்ல வேண்டுமா?",
      "வானிலை முன்னறிவிப்பு என்ன?",
      "புயல் எச்சரிக்கை உள்ளதா?"
    ]
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    speechLang: 'te-IN',
    greeting: "నమస్కారం! నేను WeatherGPT వాయిస్ అసిస్టెంట్. వాతావరణం, వర్షం మరియు ఉష్ణోగ్రత గురించి నన్ను అడగండి!",
    suggestions: [
      "ఈరోజు వర్షం పడుతుందా?",
      "నేను గొడుగు తీసుకెళ్లాలా?",
      "ఉష్ణోగ్రత ఎలా ఉంటుంది?",
      "ఏదైనా తుఫాను హెచ్చరిక ఉందా?"
    ]
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    speechLang: 'kn-IN',
    greeting: "ನಮಸ್ಕಾರ! ನಾನು WeatherGPT ಧ್ವನಿ ಸಹಾಯಕ. ಹವಾಮಾನ, ಮಳೆ ಮತ್ತು ತಾಪಮಾನದ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ!",
    suggestions: [
      "ಇಂದು ಮಳೆಯಾಗುತ್ತದೆಯೇ?",
      "ನಾನು ಛತ್ರಿ ಕೊಂಡೊಯ್ಯಬೇಕೇ?",
      "ತಾಪಮಾನದ ಮುನ್ಸೂಚನೆ ಏನು?",
      "ಯಾವುದಾದರೂ ಬಿರುಗಾಳಿ ಎಚ್ಚರಿಕೆ ಇದೆಯೇ?"
    ]
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    speechLang: 'ml-IN',
    greeting: "നമസ്കാരം! ഞാൻ WeatherGPT വോയ്സ് അസിസ്റ്റന്റാണ്. കാലാവസ്ഥയെയും മഴയെയും കുറിച്ച് എന്നോട് ചോദിക്കൂ!",
    suggestions: [
      "ഇന്ന് മഴ പെയ്യുമോ?",
      "ഞാൻ കുട കരുതേണ്ടതുണ്ടോ?",
      "കാലാവസ്ഥ പ്രവചനം എന്താണ്?",
      "എന്തെങ്കിലും കൊടുങ്കാറ്റ് മുന്നറിയിപ്പ് ഉണ്ടോ?"
    ]
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    speechLang: 'pa-IN',
    greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ WeatherGPT ਵਾਇਸ ਅਸਿਸਟੈਂਟ ਹਾਂ। ਮੈਨੂੰ ਮੌਸਮ, ਮੀਂਹ ਅਤੇ ਤਾਪਮਾਨ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ!",
    suggestions: [
      "ਕੀ ਅੱਜ ਮੀਂਹ ਪਵੇਗਾ?",
      "ਕੀ ਮੈਨੂੰ ਛਤਰੀ ਲੈ ਕੇ ਜਾਣੀ ਚਾਹੀਦੀ ਹੈ?",
      "ਅਗਲੇ ਦਿਨਾਂ ਦਾ ਮੌਸਮ ਕਿਵੇਂ ਰਹੇਗਾ?",
      "ਕੀ ਕੋਈ ਤੂਫਾਨ ਦੀ ਚੇਤਾਵਨੀ ਹੈ?"
    ]
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    speechLang: 'ur-PK',
    greeting: "السلام علیکم! میں WeatherGPT وائس اسسٹنٹ ہوں۔ مجھ سے موسم، بارش اور درجہ حرارت کے بارے میں پوچھیں!",
    suggestions: [
      "کیا آج بارش ہوگی؟",
      "کیا مجھے چھتری ساتھ رکھنی چاہیے؟",
      "آنے والے دنوں کا موسم کیسا رہے گا؟",
      "کیا طوفان کا کوئی الرٹ ہے؟"
    ]
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    speechLang: 'en-US',
    greeting: "Hello! I'm WeatherGPT Voice Assistant. Ask me anything about the weather, forecasts, storms, or travel tips!",
    suggestions: [
      "Will it rain today in Rajkot?",
      "Should I carry an umbrella this evening?",
      "What is the 7-day temperature trend?",
      "Give me a severe weather alert summary"
    ]
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    speechLang: 'es-ES',
    greeting: "¡Hola! Soy el asistente de voz WeatherGPT. ¡Pregúntame sobre el pronóstico, lluvias o clima para viajar!",
    suggestions: [
      "¿Lloverá hoy en la región?",
      "¿Debería llevar un paraguas hoy?",
      "¿Cuál es el pronóstico de 7 días?",
      "¿Hay alertas de clima extremo?"
    ]
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    speechLang: 'fr-FR',
    greeting: "Bonjour ! Je suis l'assistant vocal WeatherGPT. Posez-moi vos questions météo, pluie ou prévisions !",
    suggestions: [
      "Va-t-il pleuvoir aujourd'hui ?",
      "Dois-je prendre un parapluie ce soir ?",
      "Quelle est la tendance des températures ?",
      "Y a-t-il des alertes météo en cours ?"
    ]
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    speechLang: 'de-DE',
    greeting: "Hallo! Ich bin der WeatherGPT Sprachassistent. Fragen Sie mich alles über Wetter, Regen oder Stürme!",
    suggestions: [
      "Wird es heute regnen?",
      "Sollte ich einen Regenschirm mitnehmen?",
      "Wie entwickeln sich die Temperaturen?",
      "Gibt es Unwetterwarnungen?"
    ]
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    speechLang: 'it-IT',
    greeting: "Ciao! Sono l'assistente vocale WeatherGPT. Chiedimi qualsiasi cosa su meteo, pioggia e previsioni!",
    suggestions: [
      "Pioverà oggi?",
      "Dovrei portare un ombrello stasera?",
      "Quali sono le temperature per la settimana?",
      "Ci sono allarmi per maltempo?"
    ]
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    speechLang: 'pt-BR',
    greeting: "Olá! Sou o assistente de voz WeatherGPT. Pergunte-me sobre previsão do tempo, chuvas ou tempestades!",
    suggestions: [
      "Vai chover hoje?",
      "Devo levar um guarda-chuva?",
      "Qual é a previsão para os próximos dias?",
      "Há alerta de temporal?"
    ]
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    speechLang: 'ru-RU',
    greeting: "Здравствуйте! Я голосовой помощник WeatherGPT. Задайте вопрос о погоде, осадках и прогнозе!",
    suggestions: [
      "Будет ли сегодня дождь?",
      "Стоит ли взять с собой зонт?",
      "Какая температура ожидается на неделе?",
      "Есть ли штормовые предупреждения?"
    ]
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    speechLang: 'zh-CN',
    greeting: "您好！我是 WeatherGPT 语音助手。您可以向我咨询天气、降雨概率或台风预警！",
    suggestions: [
      "今天会下雨吗？",
      "今天出门需要带雨伞吗？",
      "未来7天的气温趋势如何？",
      "是否有恶劣天气预警？"
    ]
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    speechLang: 'ja-JP',
    greeting: "こんにちは！WeatherGPT 音声アシスタントです。天気予報、降雨確率、気温について何でもお尋ねください！",
    suggestions: [
      "今日は雨が降りますか？",
      "夕方傘を持っていくべきですか？",
      "今週の週間天気予報を教えてください",
      "台風や強風の警报はありますか？"
    ]
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    speechLang: 'ko-KR',
    greeting: "안녕하세요! WeatherGPT 음성 비서입니다. 날씨, 강수 확률, 기온에 대해 무엇이든 물어보세요!",
    suggestions: [
      "오늘 비가 올까요?",
      "오늘 우산을 챙겨야 할까요?",
      "주간 기온 전망은 어떤가요?",
      "기상 특보나 폭우 경보가 있나요?"
    ]
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    speechLang: 'ar-SA',
    greeting: "مرحباً! أنا مساعد WeatherGPT الصوتي. اسألني عن توقعات الطقس، الأمطار، درجات الحرارة أو تنبيهات العواصف!",
    suggestions: [
      "هل ستمطر اليوم في المنطقة؟",
      "هل أحتاج إلى مظلة هذا المساء؟",
      "ما هي توقعات درجات الحرارة لـ 7 أيام؟",
      "هل توجد تحذيرات من طقس قاسي؟"
    ]
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    speechLang: 'tr-TR',
    greeting: "Merhaba! Ben WeatherGPT Sesli Asistanıyım. Hava durumu, yağmur ve fırtına uyarıları hakkında her şeyi sorabilirsiniz!",
    suggestions: [
      "Bugün yağmur yağacak mı?",
      "Akşam yanıma şemsiye almalı mıyım?",
      "Haftalık sıcaklık tahmini nedir?",
      "Herhangi bir fırtına uyarısı var mı?"
    ]
  }
];

// Automatically detects which language the user is speaking or typing in
export const detectLanguage = (text: string): string => {
  if (!text) return 'en';
  // Check distinctive script unicode ranges
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Punjabi (Gurmukhi)
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
  if (/[\u3040-\u30FF]/.test(text)) return 'ja'; // Japanese
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko'; // Korean
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese
  if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian
  if (/[\u0600-\u06FF]/.test(text)) {
    // Check Urdu vs Arabic
    if (/کیا|بارش|موسم|ہے|نہیں|پانی|چھتری|کب/.test(text)) return 'ur';
    return 'ar';
  }
  if (/[\u0900-\u097F]/.test(text)) {
    // Check Marathi vs Hindi words
    if (/पाऊस|आहे|काय|तापमान|वारा|हवामान|छत्री|कधी|जावे/.test(text)) return 'mr';
    return 'hi';
  }
  
  const lower = text.toLowerCase();
  if (/\b(lluvia|paraguas|clima|tiempo|hoy|temperatura|calor|viento|llover|nublado)\b/i.test(lower)) return 'es';
  if (/\b(pluie|parapluie|temps|aujourd'hui|météo|chaleur|vent|pleuvoir|nuageux)\b/i.test(lower)) return 'fr';
  if (/\b(regen|wetter|heute|temperatur|wind|schirm|sonne|regnen|gewitter)\b/i.test(lower)) return 'de';
  if (/\b(pioggia|ombrello|meteo|tempo|oggi|temperatura|caldo|vento|piovere)\b/i.test(lower)) return 'it';
  if (/\b(chuva|guarda-chuva|tempo|hoje|temperatura|calor|vento|chover)\b/i.test(lower)) return 'pt';
  if (/\b(yağmur|hava|bugün|sıcaklık|şemsiye|rüzgar|durumu)\b/i.test(lower)) return 'tr';

  return 'en';
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  dateCategory: 'Today' | 'Yesterday' | 'Previous 7 Days';
  messages: ChatMessage[];
  languageCode: string;
  updatedAt: number;
}

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    title: 'Rajkot Rain & Monsoon Alert',
    dateCategory: 'Today',
    languageCode: 'en',
    updatedAt: Date.now(),
    messages: [
      {
        id: 'm-1',
        role: 'assistant',
        content: "Hello! I'm WeatherGPT Voice Assistant. There is currently an 80% chance of precipitation expected in Rajkot this evening between 5:00 PM and 8:00 PM. How can I assist your plans today?",
        timestamp: '10:15 AM',
        language: 'en'
      }
    ]
  },
  {
    id: 'session-2',
    title: 'Weekend Travel Weather Advisory',
    dateCategory: 'Yesterday',
    languageCode: 'en',
    updatedAt: Date.now() - 86400000,
    messages: [
      {
        id: 'm-2',
        role: 'user',
        content: 'Is it safe to drive to Ahmedabad this weekend?',
        timestamp: 'Yesterday 3:40 PM',
        language: 'en'
      },
      {
        id: 'm-3',
        role: 'assistant',
        content: 'Heavy rain warnings are active along the NH47 corridor toward Ahmedabad. Winds will peak at 45 km/h. If traveling, Saturday morning offers the best window with lighter rainfall.',
        timestamp: 'Yesterday 3:41 PM',
        language: 'en'
      }
    ]
  },
  {
    id: 'session-3',
    title: 'ખેતી માટે વરસાદનું પૂર્વાનુમાન (Gujarat Crop Weather)',
    dateCategory: 'Previous 7 Days',
    languageCode: 'gu',
    updatedAt: Date.now() - 3 * 86400000,
    messages: [
      {
        id: 'm-4',
        role: 'assistant',
        content: 'નમસ્તે! આ અઠવાડિયે સૌરાષ્ટ્ર અને રાજકોટ જિલ્લામાં ભેજ 68% થી 85% રહેવાની ધારણા છે, જે ખરીફ પાક જેવા કે મગફળી અને કપાસ માટે ખૂબ અનુકૂળ છે.',
        timestamp: 'Sep 4, 11:20 AM',
        language: 'gu'
      }
    ]
  }
];

export default function VoiceAssistantPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatTemp, profile } = useUserProfile();

  // Sessions and Active Chat
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('weathergpt_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SESSIONS;
      }
    }
    return INITIAL_SESSIONS;
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-1';
  });

  // Selected Language
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(() => {
    return SUPPORTED_LANGUAGES[0]; // English default
  });
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Sidebar & Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Input state
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Voice Mode (ChatGPT Voice Assistant UI)
  const [isLiveVoiceMode, setIsLiveVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('weathergpt_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Handle URL query prompt (e.g. from Map page "Ask AI about this area")
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam) {
      setInput(promptParam);
    }
  }, [searchParams]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping, liveTranscript]);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Text-to-Speech function with native voice matching
  const speakText = (text: string, langCode: string = selectedLang.speechLang) => {
    if (isAudioMuted || !synthRef.current) return;

    try {
      synthRef.current.cancel(); // Stop previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select voice matching language if available
      const voices = synthRef.current.getVoices();
      const matchVoice = voices.find(v => v.lang.startsWith(langCode.slice(0, 2)));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      utterance.onstart = () => {
        setVoiceState('speaking');
      };
      utterance.onend = () => {
        setVoiceState('idle');
        // If in live mode, automatically resume listening!
        if (isLiveVoiceMode) {
          startSpeechRecognition();
        }
      };
      utterance.onerror = () => {
        setVoiceState('idle');
      };

      activeUtteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setVoiceState('idle');
    }
  };

  // Speech Recognition (Live Voice Dictation)
  const startSpeechRecognition = () => {
    const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRec) {
      alert('Speech Recognition is not supported by this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = selectedLang.speechLang;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsSpeechRecognitionActive(true);
        setVoiceState('listening');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setLiveTranscript(transcript);
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsSpeechRecognitionActive(false);
        if (voiceState !== 'speaking') {
          setVoiceState('idle');
        }
      };

      recognition.onend = () => {
        setIsSpeechRecognitionActive(false);
        // If user said something, send it!
        if (liveTranscript.trim()) {
          const finalQuery = liveTranscript.trim();
          setLiveTranscript('');
          handleSendMessage(finalQuery);
        } else if (voiceState !== 'speaking') {
          setVoiceState('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsSpeechRecognitionActive(false);
      setVoiceState('idle');
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsSpeechRecognitionActive(false);
    if (voiceState === 'listening') {
      setVoiceState('idle');
    }
  };

  // Generate Multilingual Realistic AI Weather Response for ALL languages
  const generateWeatherResponse = (query: string, langCode: string): string => {
    // If auto-detect, determine language from query text
    const activeLang = langCode === 'auto' ? detectLanguage(query) : langCode;
    const q = query.toLowerCase();

    // Dynamic temperature strings matching user unit (°C or °F)
    const curTemp = formatTemp(28);
    const feelsTemp = formatTemp(30);
    const maxTemp = formatTemp(32);
    const minTemp = formatTemp(24);

    // Check if user mentioned a specific location
    const locationMatch = query.match(/\b(rajkot|ahmedabad|surat|vadodara|mumbai|delhi|bengaluru|chennai|kolkata|pune|hyderabad|london|paris|dubai|tokyo|new york)\b/i);
    const locName = locationMatch ? locationMatch[0].charAt(0).toUpperCase() + locationMatch[0].slice(1).toLowerCase() : (profile.location ? profile.location.split(',')[0].trim() : "Rajkot");

    // 1. GUJARATI (ગુજરાતી)
    if (activeLang === 'gu') {
      if (q.includes('વરસાદ') || q.includes('છત્રી') || q.includes('પાણી') || q.includes('મેઘ') || q.includes('ઝરમર')) {
        return `${locName}માં આજે સાંજે 5:00 થી 8:00 વાગ્યા દરમિયાન 80% ગાજવીજ સાથે ભારે વરસાદની શક્યતા છે. હવામાં ભેજ 68% છે અને પવન 15.4 કિમી/કલાકની ઝડપે ફૂંકાઈ રહ્યો છે. જો તમે બહાર નીકળતા હોવ તો સાથે છત્રી અથવા રેઈનકોટ ચોક્કસ રાખવો!`;
      } else if (q.includes('તાપમાન') || q.includes('ગરમી') || q.includes('તડકો')) {
        return `${locName}નું હાલનું તાપમાન ${curTemp} છે (અનુભવાતું તાપમાન ${feelsTemp}). દિવસ દરમિયાન મહત્તમ તાપમાન ${maxTemp} અને રાત્રે લઘુત્તમ ${minTemp} રહેશે. બપોરના સમયે UV ઇન્ડેક્સ 6 (મધ્યમ) રહેશે.`;
      } else if (q.includes('ખેતી') || q.includes('પાક') || q.includes('જમીન')) {
        return `ખેડૂત મિત્રો માટે કૃષિ હવામાન સલાહ: આગામી 48 કલાકમાં હળવોથી મધ્યમ વરસાદ મગફળી અને કપાસના પાક માટે લાભદાયી છે. પરંતુ ખેતરમાં વધુ પડતું પાણી ભરાય નહીં તેની નિકાલ વ્યવસ્થા રાખવી.`;
      } else if (q.includes('પવન') || q.includes('વાવાઝોડું') || q.includes('તોફાન') || q.includes('આગાહી')) {
        return `${locName} વિસ્તારમાં પવનની ઝડપ 15 થી 25 કિમી/કલાક રહેવાની સંભાવના છે. દરિયાકાંઠાના વિસ્તારોમાં હળવા વાવાઝોડાની ચેતવણી જારી કરવામાં આવી છે.`;
      }
      return `${locName}માં આજનું હવામાન વાદળછાયું અને આહલાદક છે. તાપમાન ${curTemp}, ભેજ 68% અને સાંજે 80% વરસાદની શક્યતા છે. તમે 7 દિવસનું પૂર્વાનુમાન અથવા રડાર મેપ વિશે પણ પૂછી શકો છો!`;
    }

    // 2. HINDI (हिन्दी)
    if (activeLang === 'hi') {
      if (q.includes('बारिश') || q.includes('छाता') || q.includes('पानी') || q.includes('मानसून')) {
        return `${locName} में आज शाम 5:00 बजे से रात 8:00 बजे के बीच 80% बारिश और गरज-चमक की संभावना है। आर्द्रता 68% है। यदि आप शाम को बाहर जा रहे हैं, तो छाता या रेनकोट अवश्य साथ रखें!`;
      } else if (q.includes('तापमान') || q.includes('गर्मी') || q.includes('धूप')) {
        return `${locName} का वर्तमान तापमान ${curTemp} है और 'फील्स लाइक' तापमान ${feelsTemp} दर्ज किया गया है। आज अधिकतम तापमान ${maxTemp} और रात में न्यूनतम ${minTemp} रहेगा।`;
      } else if (q.includes('हवा') || q.includes('तूफान') || q.includes('आंधी') || q.includes('अलर्ट')) {
        return `मौसम चेतावनी: ${locName} और आसपास के जिलों में 40 किमी/घंटा तक के तेज हवा के झोंके और मूसलाधार बारिश का येलो अलर्ट जारी किया गया है।`;
      }
      return `${locName} में आज का मौसम आंशिक रूप से बादलों भरा और सुहावना है। तापमान ${curTemp} है तथा शाम को बारिश का अनुमान है। क्या आप 7 दिनों का पूर्वानुमान या यात्रा सलाह जानना चाहते हैं?`;
    }

    // 3. MARATHI (मराठी)
    if (activeLang === 'mr') {
      if (q.includes('पाऊस') || q.includes('छत्री') || q.includes('पाणी')) {
        return `${locName}मध्ये आज संध्याकाळी 5:00 ते रात्री 8:00 दरम्यान 80% मुसळधार पावसाची शक्यता आहे. हवेतील आर्द्रता 68% आहे. बाहेर जाताना छत्री नक्की सोबत ठेवा!`;
      } else if (q.includes('तापमान') || q.includes('उष्णता') || q.includes('ऊन')) {
        return `${locName}चे सध्याचे तापमान ${curTemp} असून जाणवणारे तापमान ${feelsTemp} आहे. कमाल तापमान ${maxTemp} आणि किमान तापमान ${minTemp} राहण्याचा अंदाज आहे.`;
      }
      return `${locName}मध्ये आज ढगाळ हवामान राहील. सध्या तापमान ${curTemp} असून वारे ताशी 15.4 किमी वेगाने वाहत आहेत. संध्याकाळी पावसाचा अंदाज आहे.`;
    }

    // 4. BENGALI (বাংলা)
    if (activeLang === 'bn') {
      if (q.includes('বৃষ্টি') || q.includes('ছাতা') || q.includes('জল')) {
        return `${locName}-এ আজ সন্ধ্যা ৫:০০ থেকে রাত ৮:০০ এর মধ্যে ৮০% বজ্রসহ বৃষ্টির সম্ভাবনা রয়েছে। বাতাসে আর্দ্রতা ৬৮%। বাইরে যাওয়ার সময় সঙ্গে ছাতা রাখার পরামর্শ দেওয়া হচ্ছে!`;
      } else if (q.includes('তাপমাত্রা') || q.includes('গরম')) {
        return `${locName}-এর বর্তমান তাপমাত্রা ${curTemp} এবং অনুভূত তাপমাত্রা ${feelsTemp}। দিনের সর্বোচ্চ তাপমাত্রা ${maxTemp} পর্যন্ত পৌঁছাতে পারে।`;
      }
      return `${locName}-এ আজ আংশিক মেঘলা আবহাওয়া থাকবে। তাপমাত্রা ${curTemp} এবং সন্ধ্যার দিকে বৃষ্টির সম্ভাবনা রয়েছে।`;
    }

    // 5. TAMIL (தமிழ்)
    if (activeLang === 'ta') {
      if (q.includes('மழை') || q.includes('குடை')) {
        return `${locName} பகுதியில் இன்று மாலை 5 மணி முதல் 8 மணி வரை 80% இடியுடன் கூடிய கனமழை பெய்ய வாய்ப்புள்ளது. ஈரப்பதம் 68%. வெளியே செல்லும்போது குடை எடுத்துச் செல்லுங்கள்!`;
      } else if (q.includes('வெப்பநிலை') || q.includes('வெயில்')) {
        return `${locName} தற்போதைய வெப்பநிலை ${curTemp} (உணரப்படும் வெப்பநிலை ${feelsTemp}). இன்றைய அதிகபட்ச வெப்பநிலை ${maxTemp} ஆக இருக்கும்.`;
      }
      return `${locName} பகுதியில் இன்று வானம் மேகமூட்டத்துடன் காணப்படும். வெப்பநிலை ${curTemp} மற்றும் மாலை நேரத்தில் மழை பெய்ய வாய்ப்புள்ளது.`;
    }

    // 6. TELUGU (తెలుగు)
    if (activeLang === 'te') {
      if (q.includes('వర్షం') || q.includes('గొడుగు')) {
        return `${locName}లో ఈరోజు సాయంత్రం 5:00 నుండి 8:00 గంటల మధ్య 80% ఉరుములతో కూడిన వర్షం పడే అవకాశం ఉంది. గాలిలో తేమ 68%. బయటకు వెళ్లేటప్పుడు గొడుగు తీసుకెళ్లడం మంచిది!`;
      }
      return `${locName}లో ప్రస్తుత ఉష్णోగ్రత ${curTemp}. ఆకాశం పాక్షికంగా మేఘావృతమై ఉంటుంది మరియు సాయంత్రం వర్ష సూచన ఉంది.`;
    }

    // 7. KANNADA (ಕನ್ನಡ)
    if (activeLang === 'kn') {
      if (q.includes('ಮಳೆ') || q.includes('ಛತ್ರಿ')) {
        return `${locName}ನಲ್ಲಿ ಇಂದು ಸಂಜೆ 5:00 ರಿಂದ 8:00 ರ ನಡುವೆ 80% ಗುಡುಗು ಸಹಿತ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ. ತೇವಾಂಶ 68%. ಹೊರಗೆ ಹೋಗುವಾಗ ಛತ್ರಿ ತೆಗೆದುಕೊಂಡು ಹೋಗುವುದು ಸೂಕ್ತ!`;
      }
      return `${locName}ನಲ್ಲಿ ಪ್ರಸ್ತುತ ತಾಪಮಾನ ${curTemp} ಆಗಿದೆ. ಸಂಜೆ ವೇಳೆಗೆ ಮಳೆಯಾಗುವ ಮುನ್ಸೂಚನೆ ಇದೆ.`;
    }

    // 8. MALAYALAM (മലയാളം)
    if (activeLang === 'ml') {
      if (q.includes('മഴ') || q.includes('കുട')) {
        return `${locName}ൽ ഇന്ന് വൈകുന്നೇരം 5:00 നും 8:00 നും ഇടയിൽ 80% ഇടിಮಿന്നലോട് കൂടിയ മഴയ്ക്ക് സാധ്യതയുണ്ട്. ഈർപ്പം 68%. പുറത്തിറങ്ങുമ്പോൾ കുട കരുതുക!`;
      }
      return `${locName}ൽ നിലവിലെ താപനില ${curTemp} ആണ്. വൈകുന്നേരത്തോടെ മഴയ്ക്ക് സാധ്യതയുണ്ട്.`;
    }

    // 9. PUNJABI (ਪੰਜਾਬੀ)
    if (activeLang === 'pa') {
      if (q.includes('ਮੀਂਹ') || q.includes('ਛਤਰੀ')) {
        return `${locName} ਵਿੱਚ ਅੱਜ ਸ਼ਾਮ 5:00 ਤੋਂ 8:00 ਵਜੇ ਦਰਮਿਆਨ 80% ਮੀਂਹ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਨਮੀ 68% ਹੈ। ਬਾਹਰ ਜਾਂਦੇ ਸਮੇਂ ਛਤਰੀ ਜ਼ਰੂਰ ਨਾਲ ਰੱਖੋ!`;
      }
      return `${locName} ਵਿੱਚ ਅੱਜ ਮੌਸਮ ਬੱਦਲਵਾਈ ਵਾਲਾ ਰਹੇਗਾ। ਤਾਪਮਾਨ ${curTemp} ਹੈ ਅਤੇ ਸ਼ਾਮ ਨੂੰ ਮੀਂਹ ਦਾ ਅਨੁਮਾਨ ਹੈ।`;
    }

    // 10. URDU (اردو)
    if (activeLang === 'ur') {
      if (q.includes('بارش') || q.includes('چھتری')) {
        return `${locName} میں آج شام 5:00 سے 8:00 بجے کے درمیان 80 فیصد گرج چمک کے ساتھ بارش کا امکان ہے۔ نمی 68 فیصد ہے۔ باہر جاتے وقت چھتری ضرور ساتھ رکھیں!`;
      }
      return `${locName} میں آج کا موسم جزوی طور پر ابر آلود رہے گا۔ موجودہ درجہ حرارت ${curTemp} ہے اور شام کو بارش کی توقع ہے۔`;
    }

    // 11. SPANISH (Español)
    if (activeLang === 'es') {
      if (q.includes('lluvia') || q.includes('paraguas') || q.includes('llover')) {
        return `Hay un 80% de probabilidad de tormentas y lluvia esta tarde en ${locName} entre las 5:00 PM y las 8:00 PM. Humedad al 68%. ¡Te recomiendo llevar paraguas!`;
      } else if (q.includes('temperatura') || q.includes('calor')) {
        return `La temperatura actual en ${locName} es de ${curTemp} con sensación térmica de ${feelsTemp}. La máxima de hoy alcanzará ${maxTemp}.`;
      }
      return `El clima en ${locName} está parcialmente nublado con ${curTemp} y vientos de 15 km/h. Se esperan lluvias hacia el final de la tarde.`;
    }

    // 12. FRENCH (Français)
    if (activeLang === 'fr') {
      if (q.includes('pluie') || q.includes('parapluie') || q.includes('pleuvoir')) {
        return `Il y a 80 % de risques d'averses orageuses ce soir à ${locName} entre 17h00 et 20h00. Humidité à 68 %. Pensez à vous munir d'un parapluie !`;
      }
      return `À ${locName}, le ciel est actuellement partiellement nuageux avec ${curTemp}. Risque de précipitations en soirée.`;
    }

    // 13. GERMAN (Deutsch)
    if (activeLang === 'de') {
      if (q.includes('regen') || q.includes('schirm') || q.includes('regnen')) {
        return `In ${locName} besteht heute Abend zwischen 17:00 und 20:00 Uhr eine 80%ige Wahrscheinlichkeit für Regenschauer. Luftfeuchtigkeit 68%. Ein Regenschirm wird empfohlen!`;
      }
      return `Aktuell in ${locName}: ${curTemp}, teils bewölkt mit leichtem Wind aus Nordwest (15,4 km/h).`;
    }

    // 14. ITALIAN (Italiano)
    if (activeLang === 'it') {
      if (q.includes('pioggia') || q.includes('ombrello') || q.includes('piovere')) {
        return `C'è una probabilità dell'80% di rovesci a ${locName} stasera tra le 17:00 e le 20:00. Umidità al 68%. Si consiglia di portare un ombrello!`;
      }
      return `Attualmente a ${locName} ci sono ${curTemp} con cielo parzialmente nuvoloso e vento a 15 km/h.`;
    }

    // 15. PORTUGUESE (Português)
    if (activeLang === 'pt') {
      if (q.includes('chuva') || q.includes('guarda-chuva') || q.includes('chover')) {
        return `Há 80% de chance de chuva com trovoadas em ${locName} hoje entre 17h e 20h. Umidade em 68%. Recomenda-se levar um guarda-chuva!`;
      }
      return `Atualmente em ${locName}: ${curTemp}, parcialmente nublado com ventos de 15,4 km/h.`;
    }

    // 16. RUSSIAN (Русский)
    if (activeLang === 'ru') {
      if (q.includes('дождь') || q.includes('зонт') || q.includes('осадки')) {
        return `В городе ${locName} сегодня вечером с 17:00 до 20:00 ожидается 80% вероятность грозового дождя. Влажность 68%. Возьмите с собой зонт!`;
      }
      return `В ${locName} сейчас переменная облачность, температура ${curTemp}, ветер 15 км/ч. К вечеру возможен дождь.`;
    }

    // 17. CHINESE (中文)
    if (activeLang === 'zh') {
      if (q.includes('雨') || q.includes('伞')) {
        return `${locName} 今天傍晚 17:00 至 20:00 之间有 80% 的雷阵雨概率，空气湿度 68%。出行请务必携带雨伞！`;
      }
      return `${locName} 目前天气多云，气温 ${curTemp}，体感温度 ${feelsTemp}，西北风 15.4 公里/小时。`;
    }

    // 18. JAPANESE (日本語)
    if (activeLang === 'ja') {
      if (q.includes('雨') || q.includes('傘')) {
        return `${locName}では本日夕方17時から20時にかけて80%の確率で雷雨が予想されています。湿度68%。外出時は傘を持参してください！`;
      }
      return `${locName}の現在の天気は一部曇り、気温${curTemp}、北西の風15.4km/hです。夕方に降雨が予想されます。`;
    }

    // 19. KOREAN (한국어)
    if (activeLang === 'ko') {
      if (q.includes('비') || q.includes('우산')) {
        return `${locName}에서는 오늘 저녁 5시부터 8시 사이에 80%의 확률로 소나기와 뇌우가 내릴 것으로 예상됩니다. 습도 68%. 우산을 챙기세요!`;
      }
      return `현재 ${locName}은(는) 구름 조금, 기온 ${curTemp}(체감 ${feelsTemp})입니다. 저녁에 비 소식이 있습니다.`;
    }

    // 20. ARABIC (العربية)
    if (activeLang === 'ar') {
      if (q.includes('مطر') || q.includes('مظلة') || q.includes('امطار')) {
        return `هناك احتمال بنسبة 80٪ لهطول أمطار رعدية في ${locName} هذا المساء بين الساعة 5:00 و 8:00 مساءً. الرطوبة 68٪. يُنصح بحمل مظلة!`;
      }
      return `الطقس في ${locName} حالياً غائم جزئياً مع ${curTemp} ورياح بسرعة 15.4 كم/ساعة.`;
    }

    // 21. TURKISH (Türkçe)
    if (activeLang === 'tr') {
      if (q.includes('yağmur') || q.includes('şemsiye')) {
        return `${locName}'de bu akşam 17:00 ile 20:00 saatleri arasında %80 gök gürültülü sağanak yağış bekleniyor. Nem %68. Yanınıza şemsiye alınız!`;
      }
      return `${locName}'de şu an hava parçalı bulutlu, sıcaklık ${curTemp} ve rüzgar 15.4 km/s hızında esiyor.`;
    }

    // 22. DEFAULT ENGLISH
    if (q.includes('rain') || q.includes('umbrella') || q.includes('precipitation')) {
      return `There is an 80% chance of showers and thunderstorms in ${locName} this evening between 5:00 PM and 8:00 PM. Humidity is at 68% with NW winds at 15.4 km/h. Carrying an umbrella is strongly advised!`;
    } else if (q.includes('temp') || q.includes('heat') || q.includes('hot') || q.includes('cold')) {
      return `The current temperature in ${locName} is ${curTemp} with a 'Feels Like' index of ${feelsTemp}. High today will reach ${maxTemp}, and the overnight low will dip to ${minTemp}. UV index is moderate at 6.`;
    } else if (q.includes('alert') || q.includes('storm') || q.includes('warning')) {
      return `⚠️ Weather Warning: High precipitation alert is active for the ${locName} basin. Wind gusts up to 45 km/h are expected in the afternoon. Avoid unnecessary outdoor transit during peak hours.`;
    } else if (q.includes('forecast') || q.includes('week') || q.includes('tomorrow')) {
      return `7-Day Outlook for ${locName}: Rain will continue into Tuesday (90% probability, ${maxTemp}). Skies will clear by Wednesday and Thursday with sunny intervals and warm conditions.`;
    }

    return `Currently in ${locName}, conditions are Partly Cloudy at ${curTemp} with 68% humidity and gentle NW breezes at 15.4 km/h. An 80% chance of showers is forecast for the evening. Feel free to ask in ANY language about hourly radar, travel safety, or climate trends!`;
  };

  // Handle Sending a Message with Dynamic Language Recognition
  const handleSendMessage = (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent) return;

    // Detect the effective language
    const effectiveLangCode = selectedLang.code === 'auto' ? detectLanguage(messageContent) : selectedLang.code;
    const effectiveLangObj = SUPPORTED_LANGUAGES.find(l => l.code === effectiveLangCode) || SUPPORTED_LANGUAGES[0];

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: effectiveLangCode
    };

    // Update active session messages
    const updatedMessages = [...activeSession.messages, userMessage];

    // If this is the first user message, update session title
    const isFirstQuery = activeSession.messages.filter(m => m.role === 'user').length === 0;
    const newTitle = isFirstQuery 
      ? messageContent.slice(0, 32) + (messageContent.length > 32 ? '...' : '') 
      : activeSession.title;

    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          title: newTitle,
          messages: updatedMessages,
          languageCode: effectiveLangCode,
          updatedAt: Date.now()
        };
      }
      return s;
    }));

    setInput('');
    setIsTyping(true);
    setVoiceState('thinking');

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponseText = generateWeatherResponse(messageContent, effectiveLangCode);

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: effectiveLangCode
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: [...updatedMessages, aiMessage],
            updatedAt: Date.now()
          };
        }
        return s;
      }));

      setIsTyping(false);

      // Speak response aloud in matching native voice!
      if (isLiveVoiceMode || !isAudioMuted) {
        speakText(aiResponseText, effectiveLangObj.speechLang);
      } else {
        setVoiceState('idle');
      }
    }, 1100);
  };

  // Start New Chat Session
  const handleCreateNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: `${selectedLang.name} Weather Chat`,
      dateCategory: 'Today',
      languageCode: selectedLang.code,
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: selectedLang.greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language: selectedLang.code
        }
      ]
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Delete Session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert('You must keep at least one chat session.');
      return;
    }
    const filtered = sessions.filter(s => s.id !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0].id);
    }
  };

  // Copy text to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Switch Language
  const handleSelectLanguage = (lang: LanguageOption) => {
    setSelectedLang(lang);
    setLangDropdownOpen(false);

    // If active session has no user messages, update greeting to new language
    if (activeSession.messages.filter(m => m.role === 'user').length === 0) {
      setSessions(prev => prev.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            languageCode: lang.code,
            messages: [
              {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: lang.greeting,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                language: lang.code
              }
            ]
          };
        }
        return s;
      }));
    }
  };

  // Enter Live Voice Mode
  const handleEnterLiveVoiceMode = () => {
    setIsLiveVoiceMode(true);
    // Start listening right away!
    startSpeechRecognition();
  };

  // Exit Live Voice Mode
  const handleExitLiveVoiceMode = () => {
    stopSpeechRecognition();
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setVoiceState('idle');
    setIsLiveVoiceMode(false);
  };

  return (
    <div className="relative flex h-full w-full rounded-2xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR - CHAT HISTORY & LIVE VOICE TRIGGER (ChatGPT Style)       */}
      {/* ========================================================================= */}
      <div className={cn(
        "flex flex-col border-r border-border bg-muted/40 transition-all duration-300 z-30",
        sidebarOpen ? "w-80" : "w-0 overflow-hidden border-none"
      )}>
        {/* New Chat & Live Mode Header */}
        <div className="p-3.5 border-b border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCreateNewChat}
              className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* ChatGPT Live Voice Assistant Banner */}
          <button
            onClick={handleEnterLiveVoiceMode}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs">
                <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
                </span>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold tracking-wide">Live Voice Mode</div>
                <div className="text-[10px] text-white/80">Interactive 2-Way Speech</div>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
          </button>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {['Today', 'Yesterday', 'Previous 7 Days'].map((category) => {
            const categorySessions = sessions.filter(s => s.dateCategory === category);
            if (categorySessions.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {category}
                </div>
                {categorySessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const lang = SUPPORTED_LANGUAGES.find(l => l.code === session.languageCode) || SUPPORTED_LANGUAGES[0];

                  return (
                    <div
                      key={session.id}
                      onClick={() => setActiveSessionId(session.id)}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer",
                        isActive 
                          ? "bg-card border border-primary/40 shadow-xs text-primary font-semibold" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs flex-shrink-0">{lang.flag}</span>
                        <span className="truncate text-xs">{session.title}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 rounded transition-opacity"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Language Selector in Sidebar Bottom */}
        <div className="p-3 border-t border-border bg-card/50">
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <Languages className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Voice Language: {selectedLang.flag} {selectedLang.nativeName}</span>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", langDropdownOpen && "rotate-180")} />
            </button>

            {langDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-1 max-h-52 overflow-y-auto space-y-0.5">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleSelectLanguage(l)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                        selectedLang.code === l.code ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.nativeName}</span>
                        <span className="text-[10px] text-muted-foreground">({l.name})</span>
                      </div>
                      {selectedLang.code === l.code && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN CHAT AREA                                                         */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
        
        {/* Top Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/60 backdrop-blur-sm z-20">
          <div className="flex items-center gap-2.5">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Open history sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 text-primary rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground">WeatherGPT Voice AI</h2>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span>Language: {selectedLang.flag} {selectedLang.name}</span>
                  <span>• Speech Enabled</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {/* Live Voice Assistant Launch Button */}
            <button
              onClick={handleEnterLiveVoiceMode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-full text-xs font-semibold shadow-xs hover:shadow hover:scale-105 transition-all cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Voice Mode</span>
            </button>

            {/* Mute/Unmute Audio button */}
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={cn(
                "p-2 rounded-lg border transition-colors cursor-pointer",
                isAudioMuted ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-card hover:bg-muted text-muted-foreground border-border"
              )}
              title={isAudioMuted ? "Unmute Voice" : "Mute Voice"}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Shift to Map Page */}
            <button
              onClick={() => navigate('/map?locate=true')}
              className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              title="Open Interactive Map with My Location"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-muted/10">
          {activeSession.messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={message.id}
                className={cn("flex gap-3.5 max-w-3xl", isUser ? "ml-auto flex-row-reverse" : "mr-auto flex-row")}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs",
                  isUser 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
                )}>
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1.5 max-w-[85%] md:max-w-[80%]">
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-xs transition-all",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : "bg-card border border-border/80 text-foreground rounded-tl-xs"
                  )}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Actions under AI Message */}
                  {!isUser && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                      <button
                        onClick={() => {
                          const langObj = SUPPORTED_LANGUAGES.find(l => l.code === message.language) || selectedLang;
                          speakText(message.content, langObj.speechLang);
                        }}
                        className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                        title="Listen to voice readout"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Listen</span>
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[11px] text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>
                      <span>•</span>
                      <span className="text-[10px]">{message.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing / Thinking Indicator */}
          {isTyping && (
            <div className="flex gap-3.5 mr-auto">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border rounded-tl-xs shadow-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-muted-foreground ml-1">WeatherGPT is analyzing radar...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (in selected language!) */}
        {activeSession.messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-border/40 bg-card/40 flex flex-wrap gap-1.5">
            {selectedLang.suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted/80 hover:bg-primary/10 hover:text-primary border border-border text-foreground transition-all cursor-pointer text-left"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 md:p-4 border-t border-border bg-card">
          <div className="flex items-center gap-2 bg-muted/60 rounded-2xl p-1.5 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-xs">
            
            {/* Live Mic Speech-To-Text Button */}
            <button
              onClick={isSpeechRecognitionActive ? stopSpeechRecognition : startSpeechRecognition}
              className={cn(
                "p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0",
                isSpeechRecognitionActive 
                  ? "bg-red-500 text-white shadow-md animate-pulse scale-105" 
                  : "bg-card hover:bg-primary/10 text-primary border border-border shadow-xs"
              )}
              title={isSpeechRecognitionActive ? "Stop voice listening" : `Hold/Click to speak in ${selectedLang.name}`}
            >
              {isSpeechRecognitionActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isSpeechRecognitionActive ? `Listening in ${selectedLang.nativeName}...` : `Ask WeatherGPT in ${selectedLang.name}...`}
              className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-foreground placeholder:text-muted-foreground"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-primary text-primary-foreground rounded-xl disabled:opacity-40 hover:bg-primary/90 transition-all cursor-pointer shadow-xs flex-shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 px-1">
            <span>Powered by WeatherGPT 4.0 Multi-Lingual Radar Engine</span>
            <span>Microphone dictation active in {selectedLang.flag} {selectedLang.name}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CHATGPT LIVE VOICE ASSISTANT MODAL (Full Live Talk Experience)        */}
      {/* ========================================================================= */}
      {isLiveVoiceMode && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 sm:p-12 text-white animate-in fade-in duration-300">
          
          {/* Live Mode Header */}
          <div className="w-full max-w-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/10">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-base">WeatherGPT Live Talk</h3>
                <p className="text-xs text-white/70">ChatGPT Voice Assistant Mode • {selectedLang.flag} {selectedLang.name}</p>
              </div>
            </div>

            {/* Language Switcher in Live Mode */}
            <div className="flex items-center gap-2">
              <select
                value={selectedLang.code}
                onChange={(e) => {
                  const l = SUPPORTED_LANGUAGES.find(lang => lang.code === e.target.value);
                  if (l) setSelectedLang(l);
                }}
                className="bg-white/10 text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/20 outline-none text-white cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.flag} {l.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Stage: Animated Glowing Voice Orb & Waves */}
          <div className="flex flex-col items-center justify-center my-auto space-y-8 text-center max-w-xl">
            
            {/* ChatGPT-style Pulsing Orb */}
            <div className="relative flex items-center justify-center">
              {/* Outer Glow Wave */}
              <div className={cn(
                "absolute w-64 h-64 rounded-full transition-all duration-700 blur-3xl opacity-60",
                voiceState === 'listening' ? "bg-red-500 scale-125 animate-pulse" :
                voiceState === 'thinking' ? "bg-amber-400 scale-110 animate-spin" :
                voiceState === 'speaking' ? "bg-blue-500 scale-125 animate-pulse" :
                "bg-indigo-600 scale-100"
              )} />

              {/* Middle Ring */}
              <div className={cn(
                "w-48 h-48 rounded-full border border-white/30 flex items-center justify-center transition-all duration-500 shadow-2xl",
                voiceState === 'listening' ? "bg-gradient-to-tr from-red-600 to-rose-500 scale-110" :
                voiceState === 'thinking' ? "bg-gradient-to-tr from-amber-500 to-yellow-400 scale-105" :
                voiceState === 'speaking' ? "bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 scale-115" :
                "bg-gradient-to-tr from-blue-700 to-indigo-800 scale-100"
              )}>
                {/* Core Icon */}
                {voiceState === 'listening' ? (
                  <Mic className="w-16 h-16 text-white animate-bounce" />
                ) : voiceState === 'thinking' ? (
                  <RefreshCw className="w-14 h-14 text-white animate-spin" />
                ) : voiceState === 'speaking' ? (
                  <Volume2 className="w-16 h-16 text-white animate-pulse" />
                ) : (
                  <Radio className="w-14 h-14 text-white/90" />
                )}
              </div>
            </div>

            {/* Audio Waveform Bars Simulation */}
            <div className="flex items-center justify-center gap-1.5 h-12">
              {[40, 65, 90, 45, 100, 70, 85, 30, 95, 60, 80, 50, 75].map((height, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 rounded-full transition-all duration-150",
                    voiceState === 'speaking' ? "bg-sky-400 animate-pulse" :
                    voiceState === 'listening' ? "bg-red-400 animate-bounce" :
                    voiceState === 'thinking' ? "bg-amber-300 animate-pulse" :
                    "bg-white/20"
                  )}
                  style={{
                    height: voiceState === 'idle' ? '8px' : `${height}%`,
                    animationDelay: `${i * 80}ms`
                  }}
                />
              ))}
            </div>

            {/* Live Status Text & Real-Time Transcription */}
            <div className="space-y-2">
              <div className="text-xl font-bold tracking-tight">
                {voiceState === 'listening' && "Listening to you..."}
                {voiceState === 'thinking' && "WeatherGPT is analyzing..."}
                {voiceState === 'speaking' && "WeatherGPT is speaking..."}
                {voiceState === 'idle' && "Tap the microphone to speak"}
              </div>

              {/* Transcription Box */}
              <div className="min-h-12 text-sm text-white/80 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15">
                {liveTranscript ? (
                  <span className="text-amber-300 font-medium italic">"{liveTranscript}"</span>
                ) : (
                  <span className="text-white/50">Speak naturally in {selectedLang.nativeName} (e.g. "Will it rain today?")</span>
                )}
              </div>
            </div>
          </div>

          {/* Live Mode Controls Bar */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-full border border-white/20 shadow-2xl">
            {/* Mic Toggle Button */}
            <button
              onClick={isSpeechRecognitionActive ? stopSpeechRecognition : startSpeechRecognition}
              className={cn(
                "p-4 rounded-full shadow-lg transition-all cursor-pointer",
                isSpeechRecognitionActive ? "bg-red-500 text-white animate-pulse" : "bg-white text-slate-950 hover:bg-white/90"
              )}
              title={isSpeechRecognitionActive ? "Mute Microphone" : "Unmute Microphone"}
            >
              {isSpeechRecognitionActive ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Sound Output Toggle */}
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={cn(
                "p-4 rounded-full border transition-all cursor-pointer",
                isAudioMuted ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-white/20 hover:bg-white/30 text-white border-white/30"
              )}
              title={isAudioMuted ? "Unmute AI Voice" : "Mute AI Voice"}
            >
              {isAudioMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>

            {/* End Call / Close Live Voice Mode */}
            <button
              onClick={handleExitLiveVoiceMode}
              className="flex items-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg transition-all cursor-pointer"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Live Talk</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
