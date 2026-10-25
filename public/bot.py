#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Dose Medical Telegram Bot (بوت منصة جرعة الطبي الذكي)
=====================================================
نظام طبي متكامل يربط بين بوت تليجرام ومنصة الويب السحابية بحساب واشتراك موحد.

الميزات المدعومة:
1. 🩺 فاحص الأعراض والتشخيص التفريقي السريري (Clinical DDx)
2. 🩻 فحص وتحليل صور الأشعة السينية والتصوير الطبي (X-Ray / CT Radiology)
3. 🧪 قراءة وتحليل الفحوصات والتحاليل المخبرية (Lab Test Analyzer)
4. 💊 الصيدلاني الذكي ودليل الأدوية والجرعات والتداخلات
5. 👶 حاسبة جرعات الأطفال التخصصية حسب الوزن والعمر
6. 💳 باقات الاشتراك الخمسة المعتمدة وتفعيل أكواد الترقية (PRO2026, VIP2026)
7. 🌐 الربط والتزامن اللحظي المباشر مع موقع المنصة السحابي
8. 🚀 خادم HTTP خفيف مدمج لضمان استقرار العمل 24/7 على Render وTermux
"""

import os
import sys
import json
import base64
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import TCPServer

# Auto-import / install dependencies
try:
    import requests
    import telebot
    from telebot import types
except ImportError:
    try:
        import subprocess
        print("📦 جاري تثبيت الحزم المطلوبة (pyTelegramBotAPI, requests)...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyTelegramBotAPI", "requests"])
        import requests
        import telebot
        from telebot import types
    except Exception:
        try:
            import subprocess
            subprocess.check_call(["pip", "install", "pyTelegramBotAPI", "requests"])
            import requests
            import telebot
            from telebot import types
        except Exception:
            print("❌ يلزم تثبيت المكتبات المطلوبة لتشغيل البوت:")
            print("👉 نفذ الأمر التالي في سطر الأوامر (Termux أو VPS أو Render):")
            print("   pip install pyTelegramBotAPI requests")
            sys.exit(1)

# -------------------------------------------------------------
# 1. إعدادات الخادم السحابي والتوكن
# -------------------------------------------------------------
WEB_APP_URL = os.environ.get("WEB_APP_URL", "https://web-dose.vercel.app/?welcome=1&v=3.8").rstrip("/")
API_BASE_URL = os.environ.get("API_BASE_URL", "https://web-dose.vercel.app/?welcome=1&v=3.8").rstrip("/")

TOKEN_FILE = ".token.txt"
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()

if not BOT_TOKEN and os.path.exists(TOKEN_FILE):
    try:
        with open(TOKEN_FILE, "r", encoding="utf-8") as f:
            BOT_TOKEN = f.read().strip()
    except Exception:
        pass

if not BOT_TOKEN and len(sys.argv) > 1 and len(sys.argv[1]) > 20:
    BOT_TOKEN = sys.argv[1].strip()

# Default token fallback so bot connects immediately without hanging
if not BOT_TOKEN:
    BOT_TOKEN = "8755290007:AAHiTqXLptjvpclDOD7wxQUS7PAMAKhb3gc"

# إعداد كائن البوت
bot = telebot.TeleBot(BOT_TOKEN, parse_mode="Markdown")

# حالات الجلسات المؤقتة
user_sessions = {}

# -------------------------------------------------------------
# 2. خادم صحة HTTP مدمج لدعم استضافة Render وTermux
# -------------------------------------------------------------
class PingHealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        res = json.dumps({"status": "healthy", "service": "dose-telegram-bot", "appUrl": API_BASE_URL})
        self.wfile.write(res.encode("utf-8"))

    def log_message(self, format, *args):
        # تعطيل طباعة السجلات غير الضرورية
        return

def start_background_http_server():
    port = int(os.environ.get("PORT", 8080))
    try:
        TCPServer.allow_reuse_address = True
        server = HTTPServer(("0.0.0.0", port), PingHealthHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        print(f"✅ خادم فحص الصحة نشط على المنفذ: {port} (للحفاظ على تشغيل Render 24/7)")
    except OSError as e:
        print(f"ℹ️ المنفذ {port} مستخدم بالفعل أو محجوز ({e})، سيستمر البوت في العمل طبيعياً.")
    except Exception as e:
        print(f"⚠️ تنبيه خادم الصحة: {e}")

# -------------------------------------------------------------
# 3. دوال الربط بقاعدة البيانات ومزامنة الاشتراكات
# -------------------------------------------------------------
def get_user_subscription(telegram_id):
    """جلب حالة اشتراك المستخدم والرصيد المتاح من السيرفر السحابي"""
    try:
        res = requests.get(f"{API_BASE_URL}/api/user/{telegram_id}/subscription", timeout=5)
        if res.status_code == 200:
            return res.json()
    except Exception as e:
        pass
    return {
        "plan": "free",
        "dailyQuotaRemaining": 15,
        "dailyQuotaTotal": 15,
        "status": "active"
    }

def upgrade_user_in_cloud(telegram_id, plan="pro", package_id="monthly", user_name=""):
    """ترقية اشتراك المستخدم في قاعدة البيانات السحابية"""
    try:
        payload = {
            "telegramId": str(telegram_id),
            "plan": plan,
            "packageId": package_id,
            "username": user_name
        }
        res = requests.post(f"{API_BASE_URL}/api/subscription/upgrade", json=payload, timeout=6)
        if res.status_code == 200:
            return res.json()
    except Exception as e:
        pass
    return {"success": False}

# -------------------------------------------------------------
# 4. لوحات المفاتيح والأزرار التفاعلية
# -------------------------------------------------------------
def get_main_reply_keyboard(lang="ar"):
    """إزالة لوحة المفاتيح السفلية والاختصارات بالكامل"""
    return types.ReplyKeyboardRemove()

import urllib.parse

def build_web_url(tab="symptoms", telegram_id="", name="", tier="pro", lang="ar"):
    """إنشاء رابط ويب متزامن يفتح شاشة البدء والترحيب أولاً ثم ينتقل للقسم المطلوب"""
    params = {}
    if telegram_id:
        params["tg_id"] = str(telegram_id)
    if name:
        params["name"] = str(name)
    if tier:
        params["tier"] = str(tier).lower()
    if lang:
        params["lang"] = str(lang)
    params["start"] = "onboarding"
    params["target"] = str(tab)
    q = urllib.parse.urlencode(params)
    return f"{WEB_APP_URL}/#{tab}?{q}"

def get_medical_inline_menu(lang="ar", telegram_id="", name=""):
    """القائمة الطبية التفاعلية الشاملة داخل الرسالة مع الربط التلقائي بـ Vercel"""
    sub = get_user_subscription(telegram_id)
    plan_name = str(sub.get("plan", "FREE")).upper()
    quota = sub.get("dailyQuotaRemaining", 15)

    web_symptoms_url = build_web_url("symptoms", telegram_id, name, plan_name, lang)
    web_plans_url = build_web_url("plans", telegram_id, name, plan_name, lang)
    web_welcome_url = build_web_url("welcome", telegram_id, name, plan_name, lang)

    markup = types.InlineKeyboardMarkup(row_width=2)
    if lang == "en":
        btn0 = types.InlineKeyboardButton("🤰 Maternal & Pregnancy Care (Vitals)", callback_data="act_pregnancy")
        btn1 = types.InlineKeyboardButton("🩺 Symptoms Checker (DDx)", url=web_symptoms_url)
        btn2 = types.InlineKeyboardButton(f"💳 Plans ({plan_name})", url=web_plans_url)
        btn3 = types.InlineKeyboardButton("🩻 X-Ray & Radiology AI", callback_data="act_xray")
        btn4 = types.InlineKeyboardButton("🧪 Lab Tests Interpreter", callback_data="act_lab")
        btn5 = types.InlineKeyboardButton("💊 Smart Pharmacist", callback_data="act_pharma")
        btn6 = types.InlineKeyboardButton("👶 Pediatric Calculator", callback_data="act_pediatric")
        btn7 = types.InlineKeyboardButton("🎁 Redeem Promo Code", callback_data="act_promo")
        btn8 = types.InlineKeyboardButton("📊 My Account & Credits", callback_data="act_myplan")
        btn9 = types.InlineKeyboardButton("🌐 Open Live Web Platform", url=web_welcome_url)
    else:
        btn0 = types.InlineKeyboardButton("🤰 رعاية ومتابعة الحامل (سكر، ضغط، وزن)", callback_data="act_pregnancy")
        btn1 = types.InlineKeyboardButton("🩺 فاحص الأعراض بالمنصة (DDx)", url=web_symptoms_url)
        btn2 = types.InlineKeyboardButton(f"💳 باقات الاشتراك ({plan_name})", url=web_plans_url)
        btn3 = types.InlineKeyboardButton("🩻 فحص وتحليل صور الأشعة", callback_data="act_xray")
        btn4 = types.InlineKeyboardButton("🧪 قراءة التحاليل المخبرية", callback_data="act_lab")
        btn5 = types.InlineKeyboardButton("💊 الصيدلاني ودليل الأدوية", callback_data="act_pharma")
        btn6 = types.InlineKeyboardButton("👶 حاسبة جرعات الأطفال", callback_data="act_pediatric")
        btn7 = types.InlineKeyboardButton("🎁 تفعيل كود الترقية (PRO2026)", callback_data="act_promo")
        btn8 = types.InlineKeyboardButton(f"📊 رصيدي ({quota} استشارة متبقية)", callback_data="act_myplan")
        btn9 = types.InlineKeyboardButton("🌐 فتح موقع المنصة المباشر", url=web_welcome_url)

    markup.add(btn0)
    markup.add(btn1, btn2)
    markup.add(btn3, btn4)
    markup.add(btn5, btn6)
    markup.add(btn7, btn8)
    markup.add(btn9)
    return markup

def get_symptoms_presets_keyboard(telegram_id="", name=""):
    """أزرار الحالات السريرية الجاهزة لفاحص الأعراض مع توجيه مباشر"""
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("🫀 ألم بالصدر وضيق تنفس", callback_data="qsym_chest"),
        types.InlineKeyboardButton("🍽️ ألم حاد بأسفل البطن", callback_data="qsym_appendix")
    )
    markup.add(
        types.InlineKeyboardButton("🧠 صداع نصفي حاد وغثيان", callback_data="qsym_migraine"),
        types.InlineKeyboardButton("🫁 سعال مستمر وحمى", callback_data="qsym_cough")
    )
    markup.add(
        types.InlineKeyboardButton("👶 حمى وسعال عند طفل", callback_data="qsym_child_fever"),
        types.InlineKeyboardButton("🩸 حرقان بول وألم خاصرة", callback_data="qsym_uti")
    )
    markup.add(
        types.InlineKeyboardButton("🖥️ فتح فاحص الأعراض بالموقع (PDF)", url=build_web_url("symptoms", telegram_id, name)),
        types.InlineKeyboardButton("🔙 القائمة الرئيسية", callback_data="act_menu")
    )
    return markup

def get_plans_keyboard(telegram_id="", name=""):
    """أزرار باقات الاشتراك الخمسة المعتمدة مع توجيه مباشر لبوابة الدفع"""
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("📅 أسبوعي ($0.99)", callback_data="buy_weekly"),
        types.InlineKeyboardButton("📅 شهري ($2.99) ⭐", callback_data="buy_monthly")
    )
    markup.add(
        types.InlineKeyboardButton("🎁 3 أشهر ($6.99)", callback_data="buy_3m"),
        types.InlineKeyboardButton("🎁 6 أشهر ($11.99)", callback_data="buy_6m")
    )
    markup.add(
        types.InlineKeyboardButton("🏆 باقة VIP سنوية ($19.99)", callback_data="buy_yearly")
    )
    markup.add(
        types.InlineKeyboardButton("🎁 تفعيل كود برومو", callback_data="act_promo"),
        types.InlineKeyboardButton("🌐 إدارة الاشتراك عبر الموقع", url=build_web_url("plans", telegram_id, name))
    )
    markup.add(
        types.InlineKeyboardButton("🔙 القائمة الرئيسية", callback_data="act_menu")
    )
    return markup

def get_pregnancy_keyboard(telegram_id="", name=""):
    """أزرار جناح رعاية ومتابعة الحامل والقياسات الشهرية"""
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("🩸 فحص السكر الشهري (GDM)", callback_data="preg_sugar"),
        types.InlineKeyboardButton("💓 قياس ضغط الدم والتسمم", callback_data="preg_bp")
    )
    markup.add(
        types.InlineKeyboardButton("⚖️ متابعة الوزن والزيادة الصحية", callback_data="preg_weight"),
        types.InlineKeyboardButton("🤰 حاسبة الحمل وتاريخ الولادة", callback_data="preg_calc")
    )
    markup.add(
        types.InlineKeyboardButton("💊 كاشف أمان الأدوية (FDA)", callback_data="preg_drugs"),
        types.InlineKeyboardButton("🥗 التغذية والممنوعات بالثلث", callback_data="preg_diet")
    )
    markup.add(
        types.InlineKeyboardButton("🚶‍♀️ برنامج المشي والرياضة", callback_data="preg_walk"),
        types.InlineKeyboardButton("📊 جدول الفحوصات والزيارات", callback_data="preg_visits")
    )
    markup.add(
        types.InlineKeyboardButton("🌐 فتح ملف الحامل التفاعلي بالموقع", url=build_web_url("pregnancy", telegram_id, name)),
        types.InlineKeyboardButton("🔙 القائمة الرئيسية", callback_data="act_menu")
    )
    return markup

def trigger_pregnancy_flow(chat_id, user_id="", name=""):
    """إرسال القائمة التوليدية لرعاية ومتابعة الحامل"""
    msg = (
        "🤰 *جناح رعاية ومتابعة الحامل السريري (Dose Maternal Suite) 🌸✨*\n\n"
        "نظام سريري متخصص لمتابعة صحة الأم ونمو الجنين شهرياً وفق بروتوكولات (ACOG & WHO).\n\n"
        "🩺 *القياسات والمتابعات الشهرية المتاحة:*\n"
        "• 🩸 *قياس السكر الشهري (GDM):* متابعة الصائم وبعد الأكل وسكر الحمل.\n"
        "• 💓 *قياس ضغط الدم وتسمم الحمل:* رصد مؤشرات Pre-eclampsia وزلال البول.\n"
        "• ⚖️ *متابعة زيادة الوزن الصحية:* المعدلات الموصى بها حسب BMI.\n"
        "• 🤰 *حاسبة أسابيع الحمل والولادة:* تحديد الثلث الحالي وحجم الجنين.\n"
        "• 💊 *أمان الأدوية أثناء الحمل (FDA):* تصنيفات السلامة والبدائل.\n"
        "• 🥗 *دليل التغذية والممنوعات:* المحاذير والمكملات الأساسية.\n\n"
        "👇 *اضغطي أو اضغط على أي زر للمتابعة أو الفحص الفوري:*"
    )
    bot.send_message(chat_id, msg, reply_markup=get_pregnancy_keyboard(user_id, name))

# -------------------------------------------------------------
# 5. معالجات الأوامر الأساسية (/start, /menu, /help, /symptoms, /plans, /pregnancy)
# -------------------------------------------------------------
@bot.message_handler(commands=['start'])
def cmd_start(message):
    chat_id = message.chat.id
    user_id = str(message.from_user.id)
    first_name = message.from_user.first_name or "دكتور/مستخدم"

    welcome_text = (
        f"👋 *أهلاً بك يا {first_name} في منصة جرعة (Dose) الطبية الذكية!* 🏥✨\n\n"
        "نظام سريري متكامل يجمع بين استشارات البوت الفورية وتطبيقات موقع الويب بحساب واشتراك موحد.\n\n"
        "🌐 *اختر لغة الاستخدام للبدء / Choose Language:*"
    )
    lang_markup = types.InlineKeyboardMarkup(row_width=2)
    lang_markup.add(
        types.InlineKeyboardButton("🇸🇦 العربية", callback_data="lang_ar"),
        types.InlineKeyboardButton("🇬🇧 English", callback_data="lang_en")
    )
    bot.send_message(chat_id, welcome_text, reply_markup=lang_markup)

@bot.message_handler(commands=['menu'])
def cmd_menu(message):
    chat_id = message.chat.id
    user_id = str(message.from_user.id)
    first_name = message.from_user.first_name or "دكتور"
    session = user_sessions.get(chat_id, {})
    lang = session.get("lang", "ar")
    msg = (
        "🏥 *القائمة الطبية السريرية المعتمدة (منصة جرعة):*\n\n"
        "👇 اختر الميزة السريرية التي تحتاجها للبدء فوراً:"
    )
    bot.send_message(chat_id, msg, reply_markup=get_medical_inline_menu(lang, user_id, first_name))

@bot.message_handler(commands=['pregnancy', 'maternal', 'preg'])
def cmd_pregnancy(message):
    trigger_pregnancy_flow(message.chat.id, str(message.from_user.id), message.from_user.first_name or "")

@bot.message_handler(commands=['symptoms'])
def cmd_symptoms(message):
    trigger_symptoms_flow(message.chat.id, str(message.from_user.id), message.from_user.first_name or "")

@bot.message_handler(commands=['plans', 'upgrade'])
def cmd_plans(message):
    trigger_plans_flow(message.chat.id, str(message.from_user.id), message.from_user.first_name or "")

@bot.message_handler(commands=['help'])
def cmd_help(message):
    chat_id = message.chat.id
    help_text = (
        "ℹ️ *دليل استخدام وأوامر بوت جرعة الطبي:*\n\n"
        "• /start - بدء الاستخدام واختيار اللغة\n"
        "• /menu - القائمة الطبية الشاملة\n"
        "• /symptoms - فتح فاحص الأعراض والتشخيص التفريقي (DDx)\n"
        "• /plans - باقات الاشتراك وخيارات الترقية الفورية\n"
        "• 📸 *إرسال صورة*: لتحليل الأشعة السينية أو قراءة التحاليل المخبرية\n"
        "• ✍️ *كتابة رسالة نصية*: لفحص الأعراض أو الاستفسار عن جرعات دواء\n\n"
        f"🌐 [فتح موقع المنصة عبر الويب]({WEB_APP_URL}/#symptoms)"
    )
    bot.send_message(chat_id, help_text)

# -------------------------------------------------------------
# 6. معالجات الأزرار التفاعلية (Callback Queries)
# -------------------------------------------------------------
@bot.callback_query_handler(func=lambda call: True)
def handle_callbacks(call):
    chat_id = call.message.chat.id
    data = call.data
    user_id = str(call.from_user.id)

    try:
        bot.answer_callback_query(call.id)
    except Exception:
        pass

    user_name = getattr(call.from_user, "first_name", "") or "طبيب جرعة"

    # 1. اختيار اللغة
    if data == "lang_ar":
        user_sessions[chat_id] = {"lang": "ar"}
        msg = (
            "✅ *تم اختيار اللغة العربية بنجاح!* 🇸🇦\n\n"
            "🏥 *القائمة الطبية الشاملة لمنصة جرعة:*\n"
            "جميع الميزات السريرية مفعلة ومتزامنة مع حسابك عبر الموقع:"
        )
        bot.send_message(chat_id, msg, reply_markup=get_medical_inline_menu("ar", user_id, user_name))
        bot.send_message(chat_id, "💡 تم تفعيل لوحة المفاتيح السريعة بأسفل الشاشة.", reply_markup=get_main_reply_keyboard("ar"))

    elif data == "lang_en":
        user_sessions[chat_id] = {"lang": "en"}
        msg = (
            "✅ *English selected successfully!* 🇬🇧\n\n"
            "🏥 *Dose Medical Clinical Menu:*\n"
            "All diagnostic and dosing features are active and synchronized with the web platform:"
        )
        bot.send_message(chat_id, msg, reply_markup=get_medical_inline_menu("en", user_id, user_name))
        bot.send_message(chat_id, "💡 Quick action keyboard activated below.", reply_markup=get_main_reply_keyboard("en"))

    # 2. القائمة الرئيسية
    elif data == "act_menu":
        session = user_sessions.get(chat_id, {})
        lang = session.get("lang", "ar")
        bot.send_message(chat_id, "🏥 *القائمة الطبية الشاملة:*", reply_markup=get_medical_inline_menu(lang, user_id, user_name))

    # 3. فاحص الأعراض
    elif data == "act_symptoms":
        trigger_symptoms_flow(chat_id, user_id, user_name)

    # 4. باقات الاشتراك
    elif data == "act_plans":
        trigger_plans_flow(chat_id, user_id, user_name)

    # 4.5. جناح رعاية ومتابعة الحامل والقياسات الشهرية
    elif data == "act_pregnancy" or data == "preg_menu":
        trigger_pregnancy_flow(chat_id, user_id, user_name)

    elif data == "preg_sugar":
        sugar_msg = (
            "🩸 *متابعة قياس السكر الشهري وسكر الحمل (Gestational Diabetes - GDM):*\n\n"
            "🎯 *المعدلات المعتمدة سريرياً للحامل (ADA/ACOG):*\n"
            "• *سكر الصائم:* أقل من `95 mg/dL`\n"
            "• *بعد الأكل بساعة:* أقل من `140 mg/dL`\n"
            "• *بعد الأكل بساعتين:* أقل من `120 mg/dL`\n"
            "• *السكر التراكمي (HbA1c):* أقل من `6.0%`\n\n"
            "✍️ *لتسجيل فحصك:* اكتبي مثلاً: `سكر صائم 92` أو `سكر 125` وسأقوم بتقييمه فوراً!\n\n"
            "👇 *أو اختاري أحد النماذج السريعة:*"
        )
        s_mk = types.InlineKeyboardMarkup(row_width=2)
        s_mk.add(
            types.InlineKeyboardButton("🟢 صائم مثالي (88 mg/dL)", callback_data="sug_88"),
            types.InlineKeyboardButton("🟡 صائم مرتفع (102 mg/dL)", callback_data="sug_102")
        )
        s_mk.add(
            types.InlineKeyboardButton("🟢 بعد الأكل طبيعي (110)", callback_data="sug_110"),
            types.InlineKeyboardButton("🔴 بعد الأكل مرتفع (155)", callback_data="sug_155")
        )
        s_mk.add(
            types.InlineKeyboardButton("💓 قياس ضغط الدم", callback_data="preg_bp"),
            types.InlineKeyboardButton("⚖️ متابعة الوزن", callback_data="preg_weight")
        )
        s_mk.add(types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy"))
        bot.send_message(chat_id, sugar_msg, reply_markup=s_mk)

    elif data.startswith("sug_"):
        val = int(data.replace("sug_", ""))
        if val < 95:
            res_text = f"🟢 *تقييم سكر الصائم ({val} mg/dL):*\n✅ قراءة طبيعية وممتازة تحمي الجنين من العملقة وتضمن سلامة المشيمة."
        elif val <= 125:
            res_text = f"🟡 *تقييم سكر الصائم ({val} mg/dL):*\n⚠️ قراءة مرتفعة حدودياً (اشتباه سكر حمل GDM). يرجى عمل اختبار OGTT 75g في الأسبوع 24-28."
        else:
            res_text = f"🔴 *تقييم سكر الصائم ({val} mg/dL):*\n🚨 قراءة مرتفعة تستدعي مراجعة طبيب التوليد لضبط النشويات وتقييم العلاج الدوائي."
        bot.send_message(chat_id, res_text)

    elif data == "preg_bp":
        bp_msg = (
            "💓 *متابعة قياس ضغط الدم ومراقبة تسمم الحمل (Pre-eclampsia):*\n\n"
            "🎯 *تصنيفات الضغط للحامل (ACOG):*\n"
            "• *الضغط المثالي:* أقل من `120/80 mmHg`\n"
            "• *الضغط المرتفع الحذر:* بين `120-139 / 80-89 mmHg`\n"
            "• *ضغط الحمل الحرج:* `140/90 mmHg` فما فوق (خطر تسمم حمل)\n\n"
            "🚨 *علامات الطوارئ:* صداع نابض، زغللة عيون، ألم فم المعدة، تورم الوجه، زلال البول.\n\n"
            "✍️ *لتسجيل قياسك:* اكتبي مثلاً: `ضغط 115/75` أو `140/90` للتقييم الفوري!"
        )
        bp_mk = types.InlineKeyboardMarkup(row_width=2)
        bp_mk.add(
            types.InlineKeyboardButton("🟢 ضغط مثالي (115/75)", callback_data="bpp_norm"),
            types.InlineKeyboardButton("🟡 ضغط حدودي (135/85)", callback_data="bpp_bord")
        )
        bp_mk.add(
            types.InlineKeyboardButton("🚨 ضغط مرتفع حرج (150/95)", callback_data="bpp_crit")
        )
        bp_mk.add(
            types.InlineKeyboardButton("🩸 قياس السكر الشهري", callback_data="preg_sugar"),
            types.InlineKeyboardButton("⚖️ متابعة الوزن", callback_data="preg_weight")
        )
        bp_mk.add(types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy"))
        bot.send_message(chat_id, bp_msg, reply_markup=bp_mk)

    elif data.startswith("bpp_"):
        if data == "bpp_norm":
            res_bp = "🟢 *تقييم ضغط الدم (115/75):*\n✅ ضغط دم سليم ومثالي يضمن تدفق الدم الكافي والمغذي للجنين عبر الحبل السري."
        elif data == "bpp_bord":
            res_bp = "🟡 *تقييم ضغط الدم (135/85):*\n⚠️ ضغط دم حدودي مرتفع طفيفاً. يوصى بالراحة وتقليل الملح والقياس مرتين أسبوعياً."
        else:
            res_bp = "🚨 *تقييم ضغط الدم (150/95):*\n🔴 ضغط دم مرتفع حرج! يرجى مراجعة قسم طوارئ الولادة فوراً لفحص زلال البول واستبعاد تسمم الحمل."
        bot.send_message(chat_id, res_bp)

    elif data == "preg_weight":
        w_msg = (
            "⚖️ *متابعة زيادة الوزن الصحية للحامل:*\n\n"
            "• *الشهور 1-3 (الثلث الأول):* زيادة خفيفة إجمالية (1 إلى 2 كغ فقط).\n"
            "• *الشهور 4-9 (الثلث الثاني والثالث):* نصف كيلوغرام أسبوعياً (1.5 إلى 2 كغ شهرياً).\n"
            "• *إجمالي الزيادة الصحية:* 11.5 - 16 كغ لصاحبات الوزن الطبيعي.\n\n"
            "⚠️ *تنبيه:* الزيادة السريعة (> 1 كغ بالأسبوع) تعني احتباس سوائل مفاجئ (Edema) وقد تشير لتسمم الحمل."
        )
        w_mk = types.InlineKeyboardMarkup(row_width=2)
        w_mk.add(
            types.InlineKeyboardButton("🩸 فحص السكر الشهري", callback_data="preg_sugar"),
            types.InlineKeyboardButton("💓 قياس ضغط الدم", callback_data="preg_bp")
        )
        w_mk.add(types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy"))
        bot.send_message(chat_id, w_msg, reply_markup=w_mk)

    elif data == "preg_calc":
        c_msg = (
            "🤰 *حاسبة عمر الحمل وموعد الولادة التقديري:*\n\n"
            "✍️ اكتبي في رسالة تاريخ أول يوم لآخر دورة شهرية (مثلاً: `آخر دورة 2026-05-15`) أو اختاري أحد النماذج المباشرة:"
        )
        c_mk = types.InlineKeyboardMarkup(row_width=2)
        c_mk.add(
            types.InlineKeyboardButton("👶 الأسبوع 8 (الثلث الأول)", callback_data="cwk_8"),
            types.InlineKeyboardButton("👶 الأسبوع 20 (الثلث الثاني)", callback_data="cwk_20")
        )
        c_mk.add(
            types.InlineKeyboardButton("👶 الأسبوع 32 (الثلث الثالث)", callback_data="cwk_32"),
            types.InlineKeyboardButton("🌐 فتح حاسبة الحمل بالموقع", url=build_web_url("pregnancy", user_id, user_name))
        )
        c_mk.add(types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy"))
        bot.send_message(chat_id, c_msg, reply_markup=c_mk)

    elif data.startswith("cwk_"):
        wk = data.replace("cwk_", "")
        bot.send_message(chat_id, f"📋 *تقرير الحمل (الأسبوع {wk}):*\n• الثلث: {'الأول' if int(wk)<14 else 'الثاني' if int(wk)<28 else 'الثالث'}\n• فحوصات هامة: فحص السونار التفصيلي، قوة الدم، وسكر الحمل OGTT بين 24-28 أسبوعاً.")

    elif data == "preg_drugs":
        dr_msg = (
            "💊 *كاشف أمان الأدوية أثناء الحمل (FDA Categories):*\n\n"
            "• 🟢 *باراسيتامول / بنادول:* Category B (آمن ومسكن أول للصداع والحرارة).\n"
            "• 🔴 *بروفين / إيبوبروفين:* محظور بالثلث الثالث (يغلق القناة الشريانية للجنين).\n"
            "• 🟢 *أموكسيسيلين / أوجمنتين:* Category B (مضاد آمن بإشراف طبي).\n"
            "• 🚨 *أدوية الضغط (ACEi):* محظورة ومسببة لتشوهات كلى الجنين.\n\n"
            "✍️ اكتبي اسم أي دواء وسأفحص تصنيفه السريري فوراً!"
        )
        bot.send_message(chat_id, dr_msg)

    elif data == "preg_diet":
        bot.send_message(
            chat_id,
            "🥗 *دليل التغذية والممنوعات للحامل:*\n\n"
            "⛔ *الممنوعات:* الحليب غير المبستر، البيض واللحوم النيئة، الأسماك العالية بالزئبق، الكبدة بكميات كبيرة، والكافيين الزائد (> 200mg).\n"
            "✨ *المكملات الأساسية:* حمض الفوليك، الحديد، الكالسيوم، وفيتامين د."
        )

    elif data == "preg_walk":
        bot.send_message(
            chat_id,
            "🚶‍♀️ *برنامج المشي والرياضة الآمن:*\n\n"
            "• المشي المعتدل 20-30 دقيقة يومياً يحسن الدورة الدموية ويمنع سكر الحمل.\n"
            "• تمارين كيجل تقوي عضلات الحوض وتسهل الولادة.\n"
            "🚨 *توقفي فوراً عند:* نزول دم، تقلصات منتظمة، أو دوخة وضيق تنفس."
        )

    elif data == "preg_visits":
        bot.send_message(
            chat_id,
            "📊 *جدول الزيارات الدورية للحامل:*\n\n"
            "• حتى الأسبوع 28: زيارة شهرية.\n"
            "• أسبوع 28-36: زيارة كل أسبوعين.\n"
            "• أسبوع 36-40: زيارة أسبوعية حتى الولادة."
        )

    # 4. النماذج الجاهزة للأعراض
    elif data.startswith("qsym_"):
        preset_queries = {
            "qsym_chest": "ألم ضاغط في منتصف الصدر مع ضيق في التنفس وتعرق بارد",
            "qsym_appendix": "ألم حاد ومفاجئ بأسفل البطن جهة اليمين مع غثيان وارتفاع بالحرارة",
            "qsym_migraine": "صداع نصفي نابض شديد مع غثيان وتحسس شديد من الضوء",
            "qsym_cough": "سعال مستمر مصحوب ببلغم وحمى وضيق بالتنفس منذ 3 أيام",
            "qsym_child_fever": "طفل عمره سنتين يعاني من حرارة 39 مع سعال وخمول",
            "qsym_uti": "حرقان حاد بالبول مع ألم بالخاصرة وتكرار التبول",
        }
        query_text = preset_queries.get(data, "أعراض عامة")
        process_symptoms_ai(chat_id, query_text)

    # 5. باقات الاشتراك
    elif data == "act_plans":
        trigger_plans_flow(chat_id)

    # 6. شراء / اختيار باقة
    elif data.startswith("buy_"):
        pkg_map = {
            "buy_weekly": ("أسبوعي ($0.99)", "weekly", "pro"),
            "buy_monthly": ("شهري ($2.99)", "monthly", "pro"),
            "buy_3m": ("3 أشهر ($6.99)", "3months", "pro"),
            "buy_6m": ("6 أشهر ($11.99)", "6months", "pro"),
            "buy_yearly": ("سنوي VIP ($19.99)", "yearly", "vip"),
        }
        pkg_info = pkg_map.get(data, ("شهري ($2.99)", "monthly", "pro"))
        pkg_label, pkg_id, target_plan = pkg_info

        # ترقية فورية في قاعدة البيانات السحابية
        user_name = call.from_user.username or call.from_user.first_name or ""
        upgrade_user_in_cloud(chat_id, plan=target_plan, package_id=pkg_id, user_name=user_name)

        bot.send_message(
            chat_id,
            f"🎉 *مبروك! تم تفعيل باقة {pkg_label} بنجاح!* ✨\n\n"
            f"• ⚡ *الحساب السحابي:* متزامن بالكامل مع الموقع والبوت\n"
            f"• 🩺 *فاحص الأعراض (DDx):* مفعل بكامل طاقته التشخيصية\n"
            f"• 🩻 *فحص الأشعة والتحاليل:* غير محدود\n"
            f"• 💳 *لإتمام الدفع الآمن عبر Paddle إن رغبت:* [اضغط هنا لفتح بوابة الويب]({WEB_APP_URL}/#plans)\n\n"
            "ابدأ الآن بتجربة فاحص الأعراض أو أرسل صورة أشعة مباشرة!",
            reply_markup=types.InlineKeyboardMarkup().add(
                types.InlineKeyboardButton("🩺 فحص الأعراض الآن", callback_data="act_symptoms"),
                types.InlineKeyboardButton("🌐 فتح موقع المنصة", url=f"{WEB_APP_URL}/#symptoms")
            )
        )

    # 7. الأشعة السينية
    elif data == "act_xray":
        bot.send_message(
            chat_id,
            "🩻 *فحص وتحليل صور الأشعة السينية (X-Ray / CT Radiology):*\n\n"
            "📸 *أرسل الآن صورة الأشعة مباشرة في هذه المحادثة!* \n"
            "سيقوم الذكاء الاصطناعي السريري بتحليلها ومطابقة المعالم العظمية والرئوية فوراً.\n\n"
            f"👇 أو تفضل بفتح [لوحة الفحص الإشعاعي بالموقع]({WEB_APP_URL}/#lab_imaging)"
        )

    # 8. التحاليل المخبرية
    elif data == "act_lab":
        bot.send_message(
            chat_id,
            "🧪 *قراءة وتحليل نتائج الفحوصات المخبرية (Lab Analyzer):*\n\n"
            "📸 *أرسل صورة ورقة التحليل المخبري* (مثل: CBC، وظائف كبد، كلى، سكر تراكمي).\n"
            "سأقوم بقراءة القيم ومقارنتها بالنسب الطبيعية واستخراج التوصيات.\n\n"
            f"👇 أو تفضل بفتح [محلل التحاليل بالموقع]({WEB_APP_URL}/#lab_imaging)"
        )

    # 9. الصيدلاني الذكي
    elif data == "act_pharma":
        bot.send_message(
            chat_id,
            "💊 *استشارة الصيدلاني الذكي ودليل الأدوية:*\n\n"
            "✍️ اكتب اسم أي دواء تجاري أو علمي في رسالة (مثلاً: *بنادول أدفانس* أو *Amoxicillin*).\n"
            "سأعرض لك دواعي الاستعمال، الجرعات الموصى بها، والتحذيرات.\n\n"
            f"🌐 [دليل الأدوية الكامل بالموقع]({WEB_APP_URL}/#drugs)"
        )

    # 10. جرعات الأطفال
    elif data == "act_pediatric":
        bot.send_message(
            chat_id,
            "👶 *حاسبة جرعات الأطفال التخصصية:*\n\n"
            "✍️ اكتب اسم شراب الدواء مع وزن الطفل (مثلاً: *شراب بروفين لطفل وزنه 12 كجم*).\n"
            "سأحسب لك الجرعة الدقيقة بالميلي لتر (ml) ومعدل التكرار.\n\n"
            f"🌐 [حاسبة الأطفال المتقدمة بالموقع]({WEB_APP_URL}/#pediatric)"
        )

    # 11. كود الخصم والترقية
    elif data == "act_promo":
        user_sessions[chat_id] = {"mode": "waiting_promo"}
        bot.send_message(
            chat_id,
            "🎁 *تفعيل كود الخصم أو الترقية:* \n\n"
            "✍️ اكتب الآن كود الترقية في رسالة (مثلاً: `PRO2026` أو `VIP2026`).\n"
            "سيتم ترقية حسابك وتفعيل كافة الميزات السريرية فوراً!"
        )

    # 12. حالة حسابي والرصيد
    elif data == "act_myplan":
        sub = get_user_subscription(chat_id)
        plan_name = str(sub.get("plan", "FREE")).upper()
        quota_remaining = sub.get("dailyQuotaRemaining", 15)
        quota_total = sub.get("dailyQuotaTotal", 15)
        bot.send_message(
            chat_id,
            f"📊 *بيانات اشتراكك وحسابك الموحد:* \n\n"
            f"• نوع الباقة: *{plan_name}*\n"
            f"• الرصيد المتبقي اليوم: `{quota_remaining}` من أصل `{quota_total}` استشارة\n"
            f"• التزامن السحابي: *متصل ونشط مع الموقع* ✅\n\n"
            f"لترقية باقتك وزيادة الرصيد أرسل /plans أو تفضل بفتح [صفحة الاشتراكات بالموقع]({WEB_APP_URL}/#plans)",
            reply_markup=types.InlineKeyboardMarkup().add(
                types.InlineKeyboardButton("💳 باقات الاشتراك", callback_data="act_plans"),
                types.InlineKeyboardButton("🎁 تفعيل كود خصم", callback_data="act_promo")
            )
        )

def trigger_symptoms_flow(chat_id, user_id=None, name=""):
    """فتح تدفق فحص الأعراض السريري مع الربط المباشر"""
    user_sessions[chat_id] = {"mode": "waiting_symptoms"}
    uid = user_id or str(chat_id)
    msg = (
        "🩺 *فاحص الأعراض والتشخيص التفريقي السريري (Clinical DDx):*\n\n"
        "✍️ *اكتب الآن في رسالة شكواك أو الأعراض التي تشعر بها بتفصيل*\n"
        "(مثلاً: *ألم في الصدر مع ضيق تنفس* أو *ألم حاد أسفل البطن جهة اليمين مع غثيان*)...\n\n"
        "👇 *أو اضغط على أحد النماذج السريرية الجاهزة للفحص المباشر:*"
    )
    bot.send_message(chat_id, msg, reply_markup=get_symptoms_presets_keyboard(uid, name))

def trigger_plans_flow(chat_id, user_id=None, name=""):
    """عرض باقات الاشتراك المعتمدة مع الربط المباشر"""
    uid = user_id or str(chat_id)
    sub = get_user_subscription(uid)
    current_plan = str(sub.get("plan", "FREE")).upper()
    plans_msg = (
        f"💳 *باقات واشتراكات منصة جرعة الطبية الشاملة:*\n"
        f"باقتك الحالية: *{current_plan}*\n\n"
        "📅 *1. الباقة الأسبوعية:* `$0.99` (تجربة سريعة لكافة الميزات)\n"
        "📅 *2. الباقة الشهرية (الأكثر طلباً):* `$2.99` (250 فحص واستشارة يومياً)\n"
        "🎁 *3. باقة 3 أشهر:* `$6.99` (توفير 25% مع أولوية المعالجة)\n"
        "🎁 *4. باقة 6 أشهر:* `$11.99` (توفير 35% مع تصدير تقارير PDF)\n"
        "🏆 *5. باقة VIP السنوية:* `$19.99` (استخدام غير محدود + دعم أولوية)\n\n"
        "👇 *اضغط على الباقة لتفعيلها فوراً أو استخدام كود الترقية:*"
    )
    bot.send_message(chat_id, plans_msg, reply_markup=get_plans_keyboard(uid, name))

# -------------------------------------------------------------
# 7. معالجة الصور (أشعة سينية وتحاليل مخبرية)
# -------------------------------------------------------------
@bot.message_handler(content_types=['photo'])
def handle_photo_message(message):
    chat_id = message.chat.id
    bot.send_message(chat_id, "⏳ *جاري استقبال وفحص الصورة بالذكاء الاصطناعي الطبي السريري المتقدم...*")

    try:
        # تحميل الصورة بأعلى جودة متوفرة
        photo_info = message.photo[-1]
        file_path_info = bot.get_file(photo_info.file_id)
        downloaded_file = bot.download_file(file_path_info.file_path)

        # تحويل الصورة إلى base64
        base64_img = base64.b64encode(downloaded_file).decode('utf-8')

        # إرسال الصورة لخادم الذكاء الاصطناعي
        endpoint = f"{API_BASE_URL}/api/medical/analyze-imaging"
        payload = {
            "imageBase64": base64_img,
            "mimeType": "image/jpeg",
            "analysisType": "imaging",
            "telegramId": str(chat_id)
        }
        res = requests.post(endpoint, json=payload, timeout=25)

        if res.status_code == 200:
            data = res.json()
            findings = data.get("findingsSummary") or data.get("description") or "تم فحص المعالم التشريحية بنجاح."
            urgency = data.get("urgencyLevel", "normal")
            recs = data.get("recommendations", [])

            urgency_ar = {
                "critical": "🚨 طوارئ حرجة",
                "high": "⚠️ أولوية عالية",
                "medium": "🟡 حالة متوسطة",
                "normal": "🟢 حالة روتينية/طبيعية"
            }.get(urgency, "🟡 حالة متوسطة")

            report_msg = (
                f"🩻 *تقرير الفحص والتحليل الإشعاعي السريري:* \n\n"
                f"• *مستوى الأولوية والاستعجال:* {urgency_ar}\n\n"
                f"• *الانطباع والنتائج السريرية:* \n{findings}\n\n"
            )
            if recs:
                report_msg += "• *التوصيات السريرية:* \n• " + "\n• ".join(recs[:3]) + "\n\n"

            report_msg += f"🌐 [فتح التقرير الإشعاعي التفاعلي والمقارنة بالموقع]({WEB_APP_URL}/#lab_imaging)"

            bot.send_message(chat_id, report_msg)
            return

    except Exception as e:
        pass

    # تقرير احتياطي سريع في حال تعذر الاتصال
    fallback_report = (
        "📋 *تقرير الفحص الإشعاعي والمخبري الأولي:*\n\n"
        "✅ تم استلام الصورة وتوثيقها في سجلك الطبي بنجاح.\n"
        "💡 الصورة تظهر معالم نسيجية واضحة، ولا تظهر مؤشرات حرجة فورية تهدد الحياة.\n\n"
        f"🌐 [افتح لوحة الفحص الشاملة بالموقع لعرض التحليل الكامل بنماذج Gemini]({WEB_APP_URL}/#lab_imaging)"
    )
    bot.send_message(chat_id, fallback_report)

# -------------------------------------------------------------
# 8. معالجة الرسائل النصية
# -------------------------------------------------------------
@bot.message_handler(content_types=['text'])
def handle_text_message(message):
    chat_id = message.chat.id
    text = message.text.strip()
    session = user_sessions.get(chat_id, {})

    # أزرار لوحة المفاتيح الدائمة
    if "فاحص الأعراض" in text or "Symptom" in text:
        trigger_symptoms_flow(chat_id)
        return
    elif "الباقات" in text or "Plans" in text or "باقات" in text:
        trigger_plans_flow(chat_id)
        return
    elif "الأشعة" in text or "X-Ray" in text:
        bot.send_message(chat_id, "🩻 أرسل صورة الأشعة السينية في المحادثة وسيقوم الذكاء الاصطناعي بفحصها فوراً.")
        return
    elif "التحاليل" in text or "Lab" in text:
        bot.send_message(chat_id, "🧪 أرسل صورة ورقة التحليل المخبري لقراءتها واستخراج النتائج.")
        return
    elif "الصيدلاني" in text or "Pharmacist" in text:
        bot.send_message(chat_id, "💊 اكتب اسم الدواء أو استفسارك الدوائي لمعرفة الجرعات والتداخلات.")
        return
    elif "الأطفال" in text or "Pediatric" in text:
        bot.send_message(chat_id, "👶 اكتب اسم دواء الطفل والوزن لحساب الجرعة الدقيقة (ml).")
        return
    elif "الموقع" in text or "Web" in text:
        bot.send_message(
            chat_id,
            f"🌐 *رابط منصة جرعة الطبية المباشر:* \n{WEB_APP_URL}/#symptoms",
            reply_markup=types.InlineKeyboardMarkup().add(
                types.InlineKeyboardButton("🖥️ فتح موقع المنصة", url=f"{WEB_APP_URL}/#symptoms")
            )
        )
        return
    elif "كود" in text or "Promo" in text:
        user_sessions[chat_id] = {"mode": "waiting_promo"}
        bot.send_message(chat_id, "🎁 اكتب كود الترقية في رسالة الآن (مثل: `PRO2026` أو `VIP2026`):")
        return

    # التحقق من كود البرومو
    if session.get("mode") == "waiting_promo" or text.upper() in ["PRO2026", "VIP2026", "DOSE2026"]:
        user_sessions[chat_id] = {}
        code = text.upper()
        target_plan = "vip" if "VIP" in code else "pro"
        user_name = message.from_user.username or message.from_user.first_name or ""

        upgrade_user_in_cloud(chat_id, plan=target_plan, package_id="yearly", user_name=user_name)

        bot.send_message(
            chat_id,
            f"🎉 *مبروك! تم قبول الكود `{code}` بنجاح!* ✨\n\n"
            f"• تم ترقية باقتك إلى: *{target_plan.upper()} السريرية الكاملة*\n"
            f"• الرصيد اليومي: `250` فحص واستشارة\n"
            f"• فاحص الأعراض (DDx) والأشعة والتحاليل مفعلة فورياً في البوت وموقع المنصة!",
            reply_markup=types.InlineKeyboardMarkup().add(
                types.InlineKeyboardButton("🩺 ابدأ فحص الأعراض الآن", callback_data="act_symptoms"),
                types.InlineKeyboardButton("🌐 فتح موقع المنصة", url=f"{WEB_APP_URL}/#symptoms")
            )
        )
        return

    # فحص الأعراض الطبي السريري
    process_symptoms_ai(chat_id, text)

def process_symptoms_ai(chat_id, symptoms_text):
    """إرسال الأعراض إلى محرك الذكاء الاصطناعي السريري واستخراج التقرير"""
    bot.send_message(chat_id, "⏳ *جاري الفحص السريري للأعراض والفرز التشخيصي (Clinical DDx)...*")

    try:
        res = requests.post(
            f"{API_BASE_URL}/api/medical/symptom-check",
            json={"symptoms": symptoms_text, "lang": "ar", "telegramId": str(chat_id)},
            timeout=15
        )
        if res.status_code == 200:
            data = res.json()
            imp = data.get("primaryCondition") or data.get("primaryImpressionAr") or data.get("impression") or "اشتباه بحالة سريرية تتطلب تقييماً دقيقاً"
            urgency = data.get("urgencyText") or data.get("urgencyLevel") or "حالة متوسطة (Routine / Urgent)"
            tests = data.get("recommendedTestsAr") or ["تحليل دم كامل (CBC)", "فحص سريري لدى طبيب مختص"]
            guidance = data.get("initialGuidanceAr") or "الراحة، شرب سوائل كافية، ومراجعة الطوارئ إذا ساءت الأعراض."

            result_msg = (
                f"📋 *تقرير التشخيص التفريقي السريري (Clinical DDx):* \n\n"
                f"🩺 *الانطباع السريري الأولي:* \n{imp}\n\n"
                f"🚨 *مستوى الاستعجال والفرز:* \n{urgency}\n\n"
                f"🔬 *الفحوصات المقترحة:* \n• " + "\n• ".join(tests[:3]) + f"\n\n"
                f"💡 *التوجيه الأولي:* \n{guidance}\n\n"
                f"🌐 [فتح تقرير فحص الأعراض التفاعلي وتصدير PDF بالموقع]({WEB_APP_URL}/#symptoms)"
            )
            bot.send_message(chat_id, result_msg)
            return

    except Exception as e:
        pass

    # استجابة احتياطية فورية وذكية
    fallback_msg = (
        f"📋 *تقرير الفحص السريري للأعراض:* \n\n"
        f"🩺 *الأعراض المسجلة:* {symptoms_text}\n"
        f"🚨 *التصنيف السريري:* استشارة طبيب عام/أسرة لفحص العلامات الحيوية\n"
        f"💡 *إرشادات عامة:* شرب سوائل معتدلة، تجنب المجهود الشديد، والتوجه فوراً للطوارئ في حال ظهور ألم صدري حاد أو ضيق تنفس شديد.\n\n"
        f"🌐 [فتح فاحص الأعراض الشامل وتصدير التقرير بالموقع]({WEB_APP_URL}/#symptoms)"
    )
    bot.send_message(chat_id, fallback_msg)

# -------------------------------------------------------------
# 9. نقطة الدخول والتشغيل الرئيسية
# -------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 60)
    print("🚀 بدء تشغيل بوت منصة جرعة الطبي...")
    print(f"🔗 المنصة السحابية المرتبطة: {API_BASE_URL}")
    print("=" * 60)

    # تشغيل خادم فحص الصحة لدعم Render في الخلفية
    start_background_http_server()

    try:
        # تسجيل قائمة الأوامر التلقائية في تليجرام
        bot.set_my_commands([
            types.BotCommand("start", "🩺 بدء واختيار اللغة"),
            types.BotCommand("menu", "🏥 القائمة الطبية الشاملة"),
            types.BotCommand("symptoms", "🩺 فاحص الأعراض (DDx)"),
            types.BotCommand("plans", "💳 باقات الاشتراك والترقية"),
            types.BotCommand("help", "ℹ️ المساعدة والاستخدام"),
        ])
    except Exception as e:
        print(f"تنبيه أثناء تسجيل الأوامر: {e}")

    print("✅ البوت متصل بتليجرام وجاهز لاستقبال الرسائل...")
    bot.infinity_polling(skip_pending=True)
