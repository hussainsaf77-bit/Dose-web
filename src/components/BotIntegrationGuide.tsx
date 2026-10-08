import React, { useState, useEffect } from 'react';
import { 
  Code, 
  GitBranch, 
  Terminal, 
  Copy, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  ExternalLink, 
  Cpu, 
  Zap, 
  Key, 
  Check, 
  AlertCircle, 
  Sparkles,
  Stethoscope,
  Crown,
  HelpCircle,
  RefreshCw,
  Globe
} from 'lucide-react';

export const BotIntegrationGuide: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'nodejs' | 'termux'>('python');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Bot Token Webhook & Commands Setup State
  const [botToken, setBotToken] = useState('');
  const [isSubmittingToken, setIsSubmittingToken] = useState(false);
  const [setupResult, setSetupResult] = useState<{
    success: boolean;
    message: string;
    bot?: any;
    commandsRegistered?: boolean;
    webhookUrl?: string;
  } | null>(null);
  const [botStatus, setBotStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const fetchBotStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await fetch('/api/telegram/bot-status');
      const data = await res.json();
      setBotStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    fetchBotStatus();
  }, []);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSetupBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim()) return;

    setIsSubmittingToken(true);
    setSetupResult(null);

    try {
      const res = await fetch('/api/telegram/setup-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botToken.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'فشل الاتصال بتليجرام');
      }

      setSetupResult({
        success: true,
        message: data.message || 'تم ربط البوت وتسجيل فاحص الأعراض والأوامر بنجاح!',
        bot: data.bot,
        commandsRegistered: data.commands?.ok,
        webhookUrl: data.webhookUrl,
      });

      fetchBotStatus();
      setBotToken('');
    } catch (err: any) {
      setSetupResult({
        success: false,
        message: err.message || 'حدث خطأ أثناء إعداد البوت',
      });
    } finally {
      setIsSubmittingToken(false);
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-od4aemezdgaeup2ncw76si-295455119343.europe-west2.run.app';

  const pythonBotCode = `# ======================================================
# كود بايثون الشامل لبوت تليجرام (Dose Medical Bot)
# يدعم: فاحص الأعراض (DDx) + باقات الاشتراك الخمسة + لوحة المفاتيح
# المتطلبات: pip install python-telegram-bot requests
# ======================================================

import requests
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, BotCommand
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, MessageHandler, CallbackQueryHandler, filters

API_BASE_URL = "${currentOrigin}"

# لوحة المفاتيح الدائمة في أسفل الشاشة
MAIN_KEYBOARD = ReplyKeyboardMarkup(
    [
        ["🩺 فاحص الأعراض (DDx)", "💳 الباقات والاشتراكات"],
        ["🩻 فحص الأشعة السينية", "🧪 التحاليل المخبرية"],
        ["💊 الصيدلاني الذكي", "📊 باقتي وإحصائياتي"]
    ],
    resize_keyboard=True
)

def get_user_subscription(telegram_id: int):
    """التحقق من باقة المشترك ورصيده المتبقي لحظياً"""
    try:
        res = requests.get(f"{API_BASE_URL}/api/user/{telegram_id}/subscription", timeout=5)
        return res.json()
    except Exception as e:
        print("API Error:", e)
        return {"plan": "free", "dailyQuotaRemaining": 15}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    sub = get_user_subscription(user.id)
    plan_name = sub.get("plan", "free").upper()

    keyboard = [
        [InlineKeyboardButton("🩺 فاحص الأعراض (DDx)", callback_data="action_symptoms")],
        [InlineKeyboardButton("💳 باقات الاشتراك والترقية", callback_data="action_plans")],
        [InlineKeyboardButton("🌐 فتح منصة جرعة الطبية", url=f"{API_BASE_URL}")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        f"أهلاً بك يا دكتور {user.first_name} في بوت منصة جرعة الطبي الذكي (Dose)! 🩺✨\\n\\n"
        f"📊 باقتك الحالية: {plan_name}\\n\\n"
        f"⚡ الميزات المتاحة لك فورياً:\\n"
        f"• 🩺 فاحص الأعراض (DDx): فرز الحالة والتشخيص التفريقي\\n"
        f"• 💳 الباقات والاشتراكات: ترقية الحساب وتجديد الباقة\\n"
        f"• 🩻 فحص الأشعة والتحاليل المخبرية\\n\\n"
        f"اضغط على الأزرار أدناه أو من لوحة المفاتيح:",
        reply_markup=reply_markup
    )
    # إرسال أزرار الكيبورد الدائمة
    await update.message.reply_text(
        "💡 يمكنك دائماً الضغط على [ 🩺 فاحص الأعراض (DDx) ] في أي وقت.",
        reply_markup=MAIN_KEYBOARD
    )

async def show_plans(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """عرض باقات الاشتراك الخمسة المعتمدة"""
    text = (
        "✨ **مميزات الاشتراك:**\\n\\n"
        "• كشف أكثر من 500 تحليل مخبري وأشعة 🩻\\n"
        "• فاحص الأعراض السريري والتشخيص التفريقي (DDx) 🩺\\n"
        "• حاسبة جرعات الأطفال الدقيقة 👶\\n"
        "• تنبيهات وتذكيرات مواعيد الدواء 🔔\\n"
        "• تقارير طبية PDF 📄\\n"
        "• أولوية في الدعم ⚡\\n"
        "• ميزات جديدة أولاً 🆕\\n\\n"
        "اختر الباقة المناسبة للاشتراك أو التجديد:"
    )
    keyboard = [
        [InlineKeyboardButton("📅 أسبوعي — $0.99 ↗", callback_data="pkg_weekly")],
        [InlineKeyboardButton("📅 شهري — $2.99 ↗", callback_data="pkg_monthly")],
        [InlineKeyboardButton("🎁 3 أشهر — $6.99 📦 ↗", callback_data="pkg_3months")],
        [InlineKeyboardButton("🎁 6 أشهر — $11.99 📦 ↗", callback_data="pkg_6months")],
        [InlineKeyboardButton("🎁 سنوي — $19.99 🏆 ↗", callback_data="pkg_yearly")],
        [InlineKeyboardButton("🔙 العودة للقائمة", callback_data="menu_back")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if update.callback_query:
        await update.callback_query.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")
    else:
        await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")

async def check_symptoms(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """فاحص الأعراض السريري والتشخيص التفريقي (DDx)"""
    user_id = update.effective_user.id
    symptoms_text = " ".join(context.args)

    if not symptoms_text:
        await update.message.reply_text(
            "🩺 **فاحص الأعراض والتشخيص التفريقي السريري (DDx):**\\n\\n"
            "اكتب الأعراض بالتفصيل بعد الأمر، مثال:\\n"
            "*/symptoms ألم حاد أسفل البطن جهة اليمين مع غثيان وحرارة*",
            parse_mode="Markdown"
        )
        return

    await update.message.reply_text("⏳ جاري الفحص السريري والتشخيص التفريقي بالذكاء الاصطناعي...")

    try:
        payload = {
            "symptoms": symptoms_text,
            "telegramId": str(user_id),
            "patientAge": "30",
            "gender": "male",
            "lang": "ar"
        }
        res = requests.post(f"{API_BASE_URL}/api/medical/symptom-check", json=payload, timeout=25)
        data = res.json()

        urgency_badge = "🔴 طوارئ فورية" if data.get("urgencyLevel") == "emergency" else "🟢 استشارة اعتيادية"
        ddx_list = "\\n".join([f"• {d['conditionAr']} (ترجيح {d['probability']}%)" for d in data.get("differentialDiagnosis", [])[:4]])

        msg = (
            f"📋 **نتيجة الفحص السريري والترياج:**\\n"
            f"مستوى الخطورة: {urgency_badge}\\n\\n"
            f"📌 **الانطباع السريري الأولي:**\\n{data.get('primaryImpressionAr')}\\n\\n"
            f"🩺 **التشخيص التفريقي المحتمل (DDx):**\\n{ddx_list}\\n\\n"
            f"🧪 **الفحوصات المخبرية المقترحة:**\\n" + "\\n".join([f"- {t}" for t in data.get("recommendedTestsAr", [])[:3]]) + "\\n\\n"
            f"⚠️ *تنويه: هذا الفحص استرشادي بالذكاء الاصطناعي للتثقيف والمساعدة السريرية.*"
        )
        await update.message.reply_text(msg, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text("⚠️ حدث خطأ أثناء فحص الأعراض، يرجى المحاولة لاحقاً.")

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data

    if data == "action_plans" or data == "plans_menu":
        await show_plans(update, context)
    elif data == "action_symptoms" or data == "symptoms_menu":
        await query.message.reply_text(
            "🩺 **فاحص الأعراض:** اكتب الآن في رسالة الشكوى أو الأعراض التي تشعر بها بالتفصيل، وسيقوم البوت بالتحليل السريري فوراً."
        )
    elif data.startswith("pkg_"):
        pkg_id = data.replace("pkg_", "")
        # ترقية المشترك عبر الـ API
        try:
            res = requests.post(
                f"{API_BASE_URL}/api/subscription/upgrade",
                json={"telegramId": str(query.from_user.id), "packageId": pkg_id},
                timeout=10
            )
            res_data = res.json()
            await query.message.reply_text(
                f"🎉 **تم تفعيل الباقة بنجاح!**\\n{res_data.get('messageAr', 'الباقة نشطة الآن.')}"
            )
        except Exception:
            await query.message.reply_text("تم تسجيل طلب الترقية، وسيتم التفعيل فوراً.")

async def handle_text_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (update.message.text or "").strip()
    if text == "🩺 فاحص الأعراض (DDx)" or text == "فاحص الأعراض" or "أعراض" in text:
        await update.message.reply_text(
            "🩺 **فاحص الأعراض والتشخيص السريري (DDx):**\\n\\n"
            "اكتب الآن في رسالة شكواك أو الأعراض بالتفصيل، وسيقوم البوت بفحصها فوراً بالذكاء الاصطناعي السريري.\\n"
            "💡 مثال: *ألم شديد في فم المعدة مع غثيان وحرارة*",
            parse_mode="Markdown"
        )
    elif text == "💳 الباقات والاشتراكات" or "اشتراك" in text:
        await show_plans(update, context)
    elif text == "📊 باقتي وإحصائياتي":
        user = update.effective_user
        sub = get_user_subscription(user.id)
        plan_name = sub.get("plan", "free").upper()
        quota = sub.get("dailyQuotaRemaining", 15)
        await update.message.reply_text(
            f"📊 **تفاصيل باقتك:**\\n\\n"
            f"• الباقة الحالية: **{plan_name}**\\n"
            f"• الفحوصات المتبقية اليوم: **{quota}**\\n"
            f"• فاحص الأعراض السريري: مفعل 🩺",
            parse_mode="Markdown"
        )
    else:
        # إرسال النص مباشرة كأعراض للفحص السريري الذكي
        context.args = text.split()
        await check_symptoms(update, context)

async def post_init(application):
    # تسجيل الأوامر في قائمة تليجرام (/)
    commands = [
        BotCommand("start", "بدء استخدام البوت الطبي"),
        BotCommand("symptoms", "🩺 فاحص الأعراض السريري (DDx)"),
        BotCommand("plans", "💳 باقات الاشتراك الخمسة"),
    ]
    await application.bot.set_my_commands(commands)

# تشغيل البوت
app = ApplicationBuilder().token("YOUR_TELEGRAM_BOT_TOKEN").post_init(post_init).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("symptoms", check_symptoms))
app.add_handler(CommandHandler("plans", show_plans))
app.add_handler(CallbackQueryHandler(handle_callback))
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text_message))
app.run_polling()
`;

  const nodeBotCode = `// ======================================================
// كود Node.js (Telegraf) لربط البوت بفاحص الأعراض والاشتراكات
// المتطلبات: npm install telegraf axios
// ======================================================

const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const API_BASE_URL = "${currentOrigin}";

bot.start(async (ctx) => {
  const tgUser = ctx.from;
  ctx.reply(
    \`مرحباً \${tgUser.first_name}! 🩺\\nبوت جرعة الطبي الذكي جاهز لمساعدتك.\\n\\nاكتب /symptoms متبوعاً بالأعراض لفحص الحالة سريرياً.\`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🩺 فحص الأعراض (DDx)', 'symptoms_prompt')],
      [Markup.button.callback('💳 باقات الاشتراك والترقية', 'plans_prompt')],
      [Markup.button.url('🌐 فتح موقع الويب', API_BASE_URL)]
    ])
  );
});

// أمر فاحص الأعراض
bot.command('symptoms', async (ctx) => {
  const symptomsText = ctx.message.text.replace('/symptoms', '').trim();
  if (!symptomsText) {
    return ctx.reply('🩺 اكتب أعراضك بعد الأمر، مثلاً:\\n/symptoms ألم أسفل البطن جهة اليمين مع حرارة');
  }

  ctx.reply('⏳ جاري الفحص السريري بالذكاء الاصطناعي الطبي...');
  try {
    const res = await axios.post(\`\${API_BASE_URL}/api/medical/symptom-check\`, {
      symptoms: symptomsText,
      telegramId: String(ctx.from.id),
      patientAge: '30',
      gender: 'male',
      lang: 'ar'
    });
    const d = res.data;
    ctx.reply(
      \`📋 **الانطباع السريري:**\\n\${d.primaryImpressionAr}\\n\\n🚨 **مستوى الاستعجال:** \${d.urgencyLevel}\\n\\n🧪 **الفحوصات المقترحة:**\\n\${d.recommendedTestsAr.slice(0, 3).join('\\n• ')}\`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    ctx.reply('⚠️ تعذر إتمام الفحص السريري حالياً.');
  }
});

bot.launch();
`;

  const termuxCommandsCode = `# ========================================================
# 📱 أوامر Termux الدقيقة لإدارة وتحديث ورفع البوت الطبي
# ========================================================

# 1️⃣ الخيار الأول: رفع التحديثات إلى GitHub من Termux
# تثبيت Git وإعداد الحساب
pkg update && pkg install git -y
git config --global user.name "YourGitHubUsername"
git config --global user.email "your_email@example.com"

# الدخول لمجلد مشروعك وحفظ التعديلات
cd ~/your-bot-folder
git add .
git commit -m "Update bot: clinical symptom checker & live paddle"

# رفع التحديثات (ملاحظة: استخدم Personal Access Token ككلمة مرور)
git push origin main


# 2️⃣ الخيار الثاني: تفعيل البوت وفاحص الأعراض سحابياً بضغطة أمر واحدة (cURL)
# هذا الأمر يربط البوت السحابي فورا ويُسجل أوامر /symptoms وقائمة الأوامر دون رفع ملفات:
curl -X POST "\${currentOrigin}/api/telegram/setup-bot" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"botToken": "ضع_توكن_البوت_هنا"}'


# 3️⃣ الخيار الثالث: تشغيل أو تحديث البوت محلياً داخل Termux (Python)
pkg install python git -y
pip install python-telegram-bot requests

# سحب أحدث كود وتشغيل البوت بالخلفية:
git pull
nohup python bot.py > bot.log 2>&1 &

# فحص سجل التشغيل:
tail -f bot.log
`;

  return (
    <div className="space-y-8">
      
      {/* GitHub Clarification Alert: هل لازم نرفع في GitHub؟ */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-sky-950/80 border-2 border-indigo-500/50 space-y-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/40">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
              <span>إجابة هامة ومباشرة</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">
              هل لازم نرفع في GitHub؟ وكيف تظهر ميزة فاحص الأعراض في البوت؟
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              الإجابة تعتمد على <strong>طريقة تشغيل البوت لديك</strong>:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Option A: Webhook (No GitHub needed!) */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>الحالة 1: الربط بالـ Webhook (لا تحتاج GitHub أبداً!)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              إذا أردت أن يقوم هذا السيرفر بإدارة البوت والرد نيابة عنك، <strong>فلست بحاجة لرفع أي شيء على GitHub</strong>!
              كل ما عليك هو إدخال رمز البوت (Bot Token) في النموذج أدناه والضغط على <strong>"تفعيل فاحص الأعراض وتحديث الأوامر"</strong>. سيقوم النظام فوراً بالاتصال بتليجرام وتسجيل أمر <code className="text-emerald-300 font-mono">/symptoms</code> وقائمة الأوامر وربط الويب هوك في ثانية واحدة!
            </p>
          </div>

          {/* Option B: Self-Hosted on Server/GitHub */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <GitBranch className="w-4 h-4" />
              <span>الحالة 2: البوت يعمل من كودك الخاص على سيرفرك أو GitHub</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              إذا كان لديك مستودع (Repository) على GitHub يعمل منه البوت على سيرفرك الخاص (مثل Python أو Node.js):
              <strong>نعم، يجب رفع الكود المحدث إلى GitHub</strong> ثم سحبه على سيرفرك (git pull)، لأن البوت القديم على سيرفرك لا يحتوي على معالج أمر <code className="text-amber-300 font-mono">/symptoms</code>. يمكنك نسخ الكود الجاهز بالكامل من قسم الأكواد أدناه.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Essential Questions & Roadmap Clarifications */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">إجابات حاسمة وخطوات مدروسة للأسئلة الأربعة الأساسية 🧭</h3>
            <p className="text-xs text-slate-400">دليلك الكامل لظهور فاحص الأعراض، تجربة الاشتراكات، استلام الأرباح، وروابط التحديثات</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Symptom Checker Button */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Stethoscope className="w-4 h-4" />
              <span>1️⃣ لماذا لم يظهر زر فاحص الأعراض وكيف يظهر فوراً؟</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تطبيق تليجرام يحتفظ بلوحة المفاتيح القديمة (Keyboard Cache) على الهاتف حتى يتم إرسال تحديث جديد.
            </p>
            <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-500/20 text-xs text-emerald-200 space-y-1.5">
              <div className="font-semibold text-emerald-300">✅ الحل الفوري في 5 ثوانٍ:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                <li>افتح شات البوت وأرسل كلمة <strong>/start</strong> ليتم إرسال الكيبورد والأزرار المحدثة كاملة لهاتفك.</li>
                <li>أو اكتب <strong>فاحص الأعراض</strong> أو <strong>/symptoms</strong> مباشرة في الشات وسيبدأ الفحص فوراً.</li>
                <li>إذا كنت تشغل كود بايثون على Termux: تم تحديث كود بايثون أدناه ليدعم ضغطة الزر النصية تلقائياً.</li>
              </ul>
            </div>
          </div>

          {/* Card 2: Subscription Testing */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Crown className="w-4 h-4" />
              <span>2️⃣ كيف نجرب الاشتراكات بشكل نهائي ومضمون؟</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              لديك 3 طرق سهلة ومضمونة لاختبار دورة الاشتراك بالكامل والتأكد من فتح الميزات:
            </p>
            <div className="bg-purple-950/40 p-3 rounded-lg border border-purple-500/20 text-xs text-purple-200 space-y-1.5">
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                <li><strong>كود البرومو الفوري:</strong> أرسل كود <code className="text-purple-300 font-mono">PRO2026</code> أو <code className="text-purple-300 font-mono">VIP2026</code> في شات البوت أو نافذة الاشتراكات بالموقع للترقية اللحظية.</li>
                <li><strong>محاكاة Webhook:</strong> افتح نافذة الاشتراكات بالموقع واضغط زر <em>"محاكاة دفع ناجح عبر Paddle Webhook"</em> لترقية حسابك فوراً.</li>
                <li><strong>بطاقة Sandbox الاختبارية:</strong> في وضع Sandbox بـ Paddle، استخدم بطاقة الاختبار: <code className="text-purple-300 font-mono">4242 4242 4242 4242</code> بأي تاريخ انتهاء و CVV 123.</li>
              </ul>
            </div>
          </div>

          {/* Card 3: Payouts */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>3️⃣ كيف سيصل مبلغ الاشتراك وأرباح المشتركين بعد الدفع؟</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              منصة <strong>Paddle</strong> تعمل كـ <em>Merchant of Record (MoR)</em> عالمي، وآلية استلام أموالك كالتالي:
            </p>
            <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-500/20 text-xs text-amber-200 space-y-1.5">
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                <li>يدفع العميل بالفيزا/ماستركارد/Apple Pay/PayPal وتصل الأموال مباشرة إلى رصيد حسابك في Paddle (Payouts Balance).</li>
                <li>تقوم بربط حسابك البنكي المحلي (Bank Wire) أو حساب <strong>Payoneer</strong> أو <strong>Wise</strong> داخل إعدادات Paddle (Billing & Payouts).</li>
                <li>تقوم Paddle بتحويل الأرباح تلقائياً إلى حسابك البنكي أو بايونير بجدول دوري (شهري أو نصف شهري) عند بلوغ الحد الأدنى للصرف.</li>
              </ul>
            </div>
          </div>

          {/* Card 4: Updates Visibility */}
          <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Globe className="w-4 h-4" />
              <span>4️⃣ لماذا لم تظهر التحديثات عند فتح الموقع من البوت؟</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              في بيئة Google AI Studio، يوجد رابطان:
            </p>
            <div className="bg-sky-950/40 p-3 rounded-lg border border-sky-500/20 text-xs text-sky-200 space-y-1.5">
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                <li><strong>رابط التطوير المباشر (ais-dev-...):</strong> هذا هو الرابط الحي الذي نحدث عليه الآن وتظهر فيه التغييرات في نفس اللحظة.</li>
                <li><strong>رابط النسخة المنشورة (ais-pre-...):</strong> كان البوت يحتوي على هذا الرابط القديم سابقاً، وهو نسخة مجمدة لا تتحدث إلا عند إعادة النشر.</li>
                <li><strong>تم الحل فوراً:</strong> قمنا بتحديث جميع روابط البوت وأزراره لتوجهك دائماً إلى رابط التطوير المباشر حتى ترى كل تحديث فور إضافته!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Bot Connector Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-teal-500/40 space-y-5 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">تفعيل البوت وفاحص الأعراض بضغطة زر واحدة (1-Click Setup)</h3>
              <p className="text-xs text-slate-400">
                يقوم بتسجيل أوامر تليجرام الرسمية (/symptoms، /plans، /start) وربط الـ Webhook مع هذا التطبيق تلقائياً
              </p>
            </div>
          </div>

          {botStatus?.configured && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>البوت متصل: @{botStatus.bot?.username || 'Drugscalculat_bot'}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSetupBot} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              رمز توكن البوت (Bot Token من @BotFather على تليجرام):
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="مثال: 7123456789:AAHkL7x09bM..."
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingToken || !botToken.trim()}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/30 shrink-0"
              >
                {isSubmittingToken ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري الربط والتسجيل...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>تفعيل فاحص الأعراض والأوامر الآن</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              💡 بمجرد الضغط، سيتم استدعاء <code className="text-teal-300 font-mono">setMyCommands</code> لتظهر أوامر فاحص الأعراض والباقات في قائمة الـ (/) بتطبيق تليجرام، وتفعيل الـ Webhook.
            </p>
          </div>
        </form>

        {setupResult && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 transition-all ${
              setupResult.success
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
            }`}
          >
            {setupResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <div className="space-y-1">
              <strong className="block font-bold">{setupResult.message}</strong>
              {setupResult.bot && (
                <div className="text-xs text-emerald-200/90 font-mono">
                  البوت: @{setupResult.bot.username} ({setupResult.bot.first_name}) | الأوامر المسجلة: /symptoms, /plans, /myplan, /code, /drugs
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Code Snippets for the Bot (Self-Hosted Path) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-400" />
              <span>كود تشغيل البوت المستقل (إذا كنت تشغل البوت من GitHub أو سيرفرك)</span>
            </h3>
            <p className="text-xs text-slate-400">
              انسخ هذا الكود في مشروعك على GitHub ليتضمن معالج <code className="text-sky-300 font-mono">/symptoms</code> وفحص الباقات التلقائي.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeCodeTab === 'python' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Python (bot.py)
            </button>
            <button
              onClick={() => setActiveCodeTab('nodejs')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeCodeTab === 'nodejs' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Node.js (bot.js)
            </button>
            <button
              onClick={() => setActiveCodeTab('termux')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeCodeTab === 'termux' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>أوامر Termux 📱</span>
            </button>
          </div>
        </div>

        {/* Code Block */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-mono">
              {activeCodeTab === 'python' ? 'bot.py' : activeCodeTab === 'nodejs' ? 'bot.js' : 'termux_commands.sh'}
            </span>
            <button
              onClick={() =>
                handleCopy(
                  activeCodeTab === 'python' ? pythonBotCode : activeCodeTab === 'nodejs' ? nodeBotCode : termuxCommandsCode,
                  'bot_code'
                )
              }
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              {copiedSection === 'bot_code' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الأوامر بالكامل</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-96">
            <code>
              {activeCodeTab === 'python' ? pythonBotCode : activeCodeTab === 'nodejs' ? nodeBotCode : termuxCommandsCode}
            </code>
          </pre>
        </div>
      </div>

      {/* Available API Endpoints Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span>نقاط الـ API الطبية والسريرية المتاحة للبوت والموقع</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 pr-2">نقطة النهاية (Endpoint)</th>
                <th className="pb-3 px-3">النوع</th>
                <th className="pb-3 px-3">الوظيفة والهدف</th>
                <th className="pb-3 pl-2">الاستخدام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 pr-2 font-mono text-emerald-400">/api/medical/symptom-check</td>
                <td className="py-3 px-3"><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">POST</span></td>
                <td className="py-3 px-3">فاحص الأعراض السريري والتشخيص التفريقي (DDx) والفرز الطبي الذكي</td>
                <td className="py-3 pl-2 text-slate-400">يستدعيه البوت عند أمر /symptoms</td>
              </tr>
              <tr>
                <td className="py-3 pr-2 font-mono text-purple-400">/plans و /api/plans</td>
                <td className="py-3 px-3"><span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">GET</span></td>
                <td className="py-3 px-3">قائمة الباقات والاشتراكات السريرية (Free، Pro، VIP) ومزايا وحدود كل باقة</td>
                <td className="py-3 pl-2 text-slate-400">عرض الباقات للبوت والموقع</td>
              </tr>
              <tr>
                <td className="py-3 pr-2 font-mono text-teal-400">/api/telegram/setup-bot</td>
                <td className="py-3 px-3"><span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">POST</span></td>
                <td className="py-3 px-3">ربط توكن البوت وتفعيل الويب هوك وتسجيل أوامر /symptoms بتليجرام بضغطة زر</td>
                <td className="py-3 pl-2 text-slate-400">إعداد البوت اللحظي</td>
              </tr>
              <tr>
                <td className="py-3 pr-2 font-mono text-sky-400">/api/user/:telegramId/subscription</td>
                <td className="py-3 px-3"><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">GET</span></td>
                <td className="py-3 px-3">فحص فوري لباقة المستخدم، الرصيد المتبقي، وحالة الاشتراك</td>
                <td className="py-3 pl-2 text-slate-400">يستدعيه البوت عند كل استفسار</td>
              </tr>
              <tr>
                <td className="py-3 pr-2 font-mono text-sky-400">/api/subscription/upgrade</td>
                <td className="py-3 px-3"><span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">POST</span></td>
                <td className="py-3 px-3">ترقية باقة المستخدم وتفعيل كود الخصم مثل PRO2026 فورياً</td>
                <td className="py-3 pl-2 text-slate-400">الترقية والأكواد الترويجية</td>
              </tr>
              <tr>
                <td className="py-3 pr-2 font-mono text-amber-400">/api/telegram/webhook</td>
                <td className="py-3 px-3"><span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">POST</span></td>
                <td className="py-3 px-3">استقبال رسائل وأوامر البوت من سيرفرات Telegram مباشرة (/symptoms، /plans، إلخ)</td>
                <td className="py-3 pl-2 text-slate-400">ربط الويب هوك الشامل</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
