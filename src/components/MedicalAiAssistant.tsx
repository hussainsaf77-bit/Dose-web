import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Copy, Check, RotateCcw, AlertTriangle, MessageSquare, ShieldCheck } from 'lucide-react';
import { SubscriptionTier } from '../types';
import { getApiUrl } from '../utils/apiConfig';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface MedicalAiAssistantProps {
  userTier?: SubscriptionTier;
  telegramId?: string;
  onUpgradeClick?: () => void;
  creditsRemaining?: number;
}

export const MedicalAiAssistant: React.FC<MedicalAiAssistantProps> = ({
  userTier = 'free',
  telegramId = '1001',
  onUpgradeClick,
  creditsRemaining = 15
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'مرحباً بك في **مساعد الطبيب والصيدلاني السريري الذكي (جرعة — Dose AI Assistant)** 🩺🔬\n\nأنا جاهز لمساعدتك في المهام السريرية والأكاديمية التالية:\n1. 📝 **تلخيص المقالات الطبية والأبحاث والمحاضرات:** الصق أي نص أو دراسة طبية وسألخصها لك في نقاط سريرية مركزة.\n2. 💊 **الاستشارات الدوائية والجرعات المتقدمة:** تعديل الجرعات لمرضى الكلى والكبد وكبار السن.\n3. 🩺 **التشخيص السريري المقارن وخطط العلاج:** تقييم الحالات المعقدة وصياغة ملخصات الحالات.\n\nكيف يمكنني مساعدتك الآن؟',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    '📝 تلخيص مقال طبي أو محاضرة سريعة في نقاط عملية',
    '💊 مقارنة إكلينيكية بين أملوديبين وفالسارتان في ضغط الدم',
    '🩺 خطة علاجية لمريض سكري نوع 2 يعاني من قصور كلوي طفيف',
    '👶 حساب جرعة معلق أوجمنتين لطفل وزنه 15 كجم لالتهاب الحلق',
    '⚠️ هل يتعارض أومبيرازول مع كلوبيدوغريل (بلافيكس)؟'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || inputVal).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          telegramId,
          patient_context: 'المستخدم يبحث عبر واجهة جرعة المتصلة بالبوت'
        })
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'عذراً، لم أتمكن من الحصول على استجابة فورية. يرجى المحاولة بعد لحظات.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ast_${Date.now()}`,
          sender: 'assistant',
          text: 'حدث خطأ في الاتصال بالخادم. يرجى التأكد من اتصالك والمحاولة مجدداً.',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="medical-ai-assistant-container" className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold mb-1">
              <Bot className="w-4 h-4" />
              <span>مساعد الطبيب والصيدلاني السريري (Doctor & Pharmacist AI)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">استشارات سريرية وتلخيص المقالات والمحاضرات</h2>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">
              مدعوم بنماذج Gemini الطبية للإجابة الدوائية، تلخيص الأبحاث والمحاضرات الأكاديمية وصياغة الخطط العلاجية.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700/60 text-left">
              <span className="text-[10px] text-slate-400 block">رصيد الاستشارات اليومي:</span>
              <span className="text-xs font-bold text-teal-300">
                {userTier === 'vip' ? 'غير محدود (VIP)' : `${creditsRemaining} متبقية اليوم`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[560px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  isMe ? 'bg-teal-600' : 'bg-slate-800 text-teal-400 border border-slate-700'
                }`}>
                  {isMe ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-1.5 ${
                  isMe
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap font-sans">
                    {m.text}
                  </div>

                  <div className={`flex items-center justify-between pt-1 text-[10px] ${isMe ? 'text-teal-200' : 'text-slate-500'}`}>
                    <span>{m.timestamp}</span>
                    {!isMe && (
                      <button
                        onClick={() => copyText(m.id, m.text)}
                        className="hover:text-teal-400 transition-colors flex items-center gap-1"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ الإجابة</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-teal-400 border border-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span>الصيدلاني الذكي يبحث في المراجع الطبية المعتمدة...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[11px] text-slate-500 whitespace-nowrap">مقترحات:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="medical-ai-chat-input"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="اكتب سؤالك الدوائي هنا (مثال: هل يمكن تناول البروفين مع البنادول؟)..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />

            <button
              id="btn-send-medical-chat"
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/30 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">إرسال</span>
            </button>
          </form>

          <div className="text-[10px] text-slate-500 mt-2 text-center flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500/80" />
            <span>إخلاء مسؤولية: المعلومات للأغراض الإرشادية فقط ولا تغني عن استشارة الطبيب المعالج أو الصيدلاني المباشر.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
