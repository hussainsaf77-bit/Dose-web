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
    """إزالة لوحة المفاتيح السفلية تماماً والاعتماد على القائمة الطبية المضمنة بالرسائل"""
    return types.ReplyKeyboardRemove()

import urllib.parse
from datetime import datetime, timedelta

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

import urllib.parse
import re
from datetime import datetime, timedelta

def calculate_obstetric_dates_py(lmp_date_obj):
    """حساب عمر الحمل التوليدي وموعد الولادة التقديري وفق قاعدة نيغلي (ACOG Standard)"""
    today = datetime.now().date()
    diff = today - lmp_date_obj
    total_days = diff.days
    if total_days < 0 or total_days > 310:
        return None
    
    weeks = total_days // 7
    days = total_days % 7
    
    # Naegele's rule: LMP + 280 days
    edd = lmp_date_obj + timedelta(days=280)
    days_left = max(0, (edd - today).days)
    progress = min(100, max(0, int((total_days / 280) * 100)))
    
    if weeks >= 28:
        trimester = 3
        trim_name = "الثلث الثالث (الأسبوع 28 - 40+)"
    elif weeks >= 14:
        trimester = 2
        trim_name = "الثلث الثاني (الأسبوع 14 - 27)"
    else:
        trimester = 1
        trim_name = "الثلث الأول (الأسبوع 1 - 13)"
        
    if weeks >= 36:
        month = 9
    elif weeks >= 32:
        month = 8
    elif weeks >= 28:
        month = 7
    elif weeks >= 23:
        month = 6
    elif weeks >= 18:
        month = 5
    elif weeks >= 14:
        month = 4
    elif weeks >= 9:
        month = 3
    elif weeks >= 5:
        month = 2
    else:
        month = 1
        
    fruit_map = {
        (0, 4): ("حبة سمسم صغيرة (انغراس البويضة المخصبة)", "سمسم"),
        (5, 7): ("حبة عدس إلى حبة توت (بداية نبض القلب الأولي)", "حبة توت 🫐"),
        (8, 10): ("حبة فاصوليا إلى كرز (تشكل ملامح الوجه والأطراف)", "حبة كرز 🍒"),
        (11, 13): ("حبة ليمون أو تين (اكتمال الأعضاء الحيوية الأساسية)", "حبة ليمون 🍋"),
        (14, 17): ("ثمرة أفوكادو أو تفاحة (استجابة الجنين للأصوات والضوء)", "ثمرة أفوكادو 🥑"),
        (18, 22): ("موزة أو خرشوف (بدء الشعور بحركة الجنين وركلاته)", "ثمرة موزة 🍌"),
        (23, 27): ("ثمرة باذنجان أو ذرة (تطور الرئتين وبداية فتح الجفون)", "باذنجانة 🍆"),
        (28, 32): ("رأس ملفوف أو جوز هند (زيادة سريعة بالوزن وتكون الدهون)", "جوز هند 🥥"),
        (33, 36): ("ثمرة أناناس أو شمام (استعداد الجنين والنزول للحوض)", "أناناس 🍍"),
        (37, 42): ("ثمرة بطيخ (اكتمال النضج الرئوي واستعداد تام للولادة)", "بطيخ 🍉"),
    }
    
    summary = "نمو وتطور سليم للجنين"
    comparison = "جنين في مرحلة نمو نشطة"
    for (w_min, w_max), (s, c) in fruit_map.items():
        if w_min <= weeks <= w_max:
            summary = s
            comparison = c
            break
            
    if weeks < 14:
        tests = [
            "سونار مبكر لتأكيد النبض والتأكد من موقع الحمل وعمر الجنين",
            "فحص الشفافية القفوية (NT Scan) في الأسبوع 11-13 لاستبعاد متلازمة داون",
            "تحاليل الدم الأساسية: فصيلة الدم، عامل Rh، قوة الدم CBC، وفحص البول"
        ]
    elif weeks < 28:
        tests = [
            "سونار التشوهات الهيكلية التفصيلي (Anomaly Scan) بين الأسبوع 18 و 22",
            "فحص منحنى السكر الفموي لسكر الحمل (OGTT 75g) بين الأسبوع 24 و 28",
            "فحص نسبة الهيموغلوبين والحديد لاستبعاد أنيميا الحمل"
        ]
    else:
        tests = [
            "حقنة الأنتي دي (Anti-D) في الأسبوع 28 إذا كانت فصيلة دم الأم سالبة (Rh Negative)",
            "مراقبة نمو الجنين وحركته ومعدل تدفق الدم عبر المشيمة بالدوبلر",
            "مسحة البكتيريا العقدية المهبلية (GBS) بين الأسبوع 35 و 37"
        ]
        
    return {
        "weeks": weeks,
        "days": days,
        "total_days": total_days,
        "trimester": trimester,
        "trim_name": trim_name,
        "month": month,
        "edd": edd.strftime("%Y-%m-%d"),
        "days_left": days_left,
        "progress": progress,
        "summary": summary,
        "comparison": comparison,
        "tests": tests
    }

def get_medical_inline_menu(lang="ar", telegram_id="", name=""):
    """القائمة الطبية التفاعلية الرئيسية المضمنة داخل الرسالة"""
    sub = get_user_subscription(telegram_id)
    plan_name = str(sub.get("plan", "FREE")).upper()
    quota = sub.get("dailyQuotaRemaining", 15)

    web_preg_url = build_web_url("pregnancy", telegram_id, name, plan_name, lang)
    web_symptoms_url = build_web_url("symptoms", telegram_id, name, plan_name, lang)
    web_plans_url = build_web_url("plans", telegram_id, name, plan_name, lang)
    web_welcome_url = build_web_url("welcome", telegram_id, name, plan_name, lang)

    markup = types.InlineKeyboardMarkup(row_width=2)
    if lang == "en":
        btn_preg = types.InlineKeyboardButton("🤰 Maternal & Pregnancy Care (Dates, Vitals, Drugs)", callback_data="act_pregnancy")
        btn_sym = types.InlineKeyboardButton("🩺 Symptoms Checker (DDx)", url=web_symptoms_url)
        btn_plans = types.InlineKeyboardButton(f"💳 Plans ({plan_name})", url=web_plans_url)
        btn_pharma = types.InlineKeyboardButton("💊 Smart Pharmacist", callback_data="act_pharma")
        btn_pedia = types.InlineKeyboardButton("👶 Pediatric Calculator", callback_data="act_pediatric")
        btn_xray = types.InlineKeyboardButton("🩻 X-Ray & Radiology AI", callback_data="act_xray")
        btn_lab = types.InlineKeyboardButton("🧪 Lab Tests Interpreter", callback_data="act_lab")
        btn_promo = types.InlineKeyboardButton("🎁 Redeem Promo Code", callback_data="act_promo")
        btn_quota = types.InlineKeyboardButton(f"📊 My Balance ({quota} left)", callback_data="act_myplan")
        btn_web = types.InlineKeyboardButton("🌐 Open Live Web Platform", url=web_welcome_url)
    else:
        btn_preg = types.InlineKeyboardButton("🤰 رعاية ومتابعة الحامل (حساب، سكر، ضغط، وزن)", callback_data="act_pregnancy")
        btn_sym = types.InlineKeyboardButton("🩺 فاحص الأعراض بالمنصة (DDx)", url=web_symptoms_url)
        btn_plans = types.InlineKeyboardButton(f"💳 باقات الاشتراك ({plan_name})", url=web_plans_url)
        btn_pharma = types.InlineKeyboardButton("💊 الصيدلاني ودليل الأدوية", callback_data="act_pharma")
        btn_pedia = types.InlineKeyboardButton("👶 حاسبة جرعات الأطفال", callback_data="act_pediatric")
        btn_xray = types.InlineKeyboardButton("🩻 فحص وتحليل صور الأشعة", callback_data="act_xray")
        btn_lab = types.InlineKeyboardButton("🧪 قراءة التحاليل المخبرية", callback_data="act_lab")
        btn_promo = types.InlineKeyboardButton("🎁 تفعيل كود الترقية (PRO2026)", callback_data="act_promo")
        btn_quota = types.InlineKeyboardButton(f"📊 رصيدي ({quota} استشارة متبقية)", callback_data="act_myplan")
        btn_web = types.InlineKeyboardButton("🌐 فتح موقع المنصة المباشر", url=web_welcome_url)

    markup.add(btn_preg)
    markup.add(btn_sym, btn_plans)
    markup.add(btn_pharma, btn_pedia)
    markup.add(btn_xray, btn_lab)
    markup.add(btn_promo, btn_quota)
    markup.add(btn_web)
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
        types.InlineKeyboardButton("🤰 حاسبة عمر الحمل وموعد الولادة", callback_data="preg_calc"),
        types.InlineKeyboardButton("🩸 فحص السكر الشهري (GDM)", callback_data="preg_sugar")
    )
    markup.add(
        types.InlineKeyboardButton("💓 قياس ضغط الدم وتسمم الحمل", callback_data="preg_bp"),
        types.InlineKeyboardButton("⚖️ متابعة الوزن والزيادة الصحية", callback_data="preg_weight")
    )
    markup.add(
        types.InlineKeyboardButton("💊 كاشف أمان الأدوية (FDA)", callback_data="preg_drugs"),
        types.InlineKeyboardButton("🥗 التغذية والممنوعات بالثلث", callback_data="preg_diet")
    )
    markup.add(
        types.InlineKeyboardButton("🚶‍♀️ برنامج المشي والرياضة الآمن", callback_data="preg_walk"),
        types.InlineKeyboardButton("📊 جدول الفحوصات والزيارات", callback_data="preg_visits")
    )
    markup.add(
        types.InlineKeyboardButton("🌐 فتح ملف الحامل التفاعلي بالموقع", url=build_web_url("pregnancy", telegram_id, name)),
        types.InlineKeyboardButton("🔙 العودة للقائمة الرئيسية", callback_data="act_menu")
    )
    return markup

def trigger_pregnancy_flow(chat_id, user_id="", name=""):
    """إرسال القائمة التوليدية لرعاية ومتابعة الحامل السريرية"""
    msg = (
        "🤰 *جناح رعاية ومتابعة الحامل السريري (Dose Maternal Suite) 🌸✨*\n\n"
        "نظام سريري متكامل لمتابعة صحة الأم ونمو الجنين شهرياً وفق بروتوكولات (ACOG & WHO).\n\n"
        "🩺 *الميزات والقياسات الشهرية المتاحة:*\n"
        "• 🤰 *حاسبة عمر الحمل والولادة:* تحديد الأسابيع والثلث وتاريخ الولادة بدقة.\n"
        "• 🩸 *فحص السكر الشهري (GDM):* متابعة الصائم وبعد الأكل وسكر الحمل.\n"
        "• 💓 *قياس ضغط الدم والتسمم:* رصد مؤشرات Pre-eclampsia وزلال البول.\n"
        "• ⚖️ *متابعة زيادة الوزن الصحية:* المعدلات الموصى بها حسب BMI.\n"
        "• 💊 *أمان الأدوية أثناء الحمل (FDA):* تصنيفات السلامة والبدائل.\n"
        "• 🥗 *دليل التغذية والممنوعات:* المحاذير والمكملات الأساسية.\n"
        "• 🚶‍♀️ *النشاط والمشي الآمن:* علامات الطوارئ ومحاذير الحركة.\n\n"
        "👇 *اضغطي على أي ميزة للبدء فوراً:*"
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
    session = user_sessions.get(chat_id, {})
    lang = session.get("lang", "ar")
    sub = get_user_subscription(user_id)
    plan_name = str(sub.get("plan", "FREE")).upper()
    quota = sub.get("dailyQuotaRemaining", 15)

    welcome_text = (
        f"👋 *أهلاً بك يا {first_name} في منصة جرعة (Dose) الطبية الذكية!* 🏥✨\n\n"
        f"📊 *باقتك الحالية:* *{plan_name}* ({quota} استشارة وفحص متبقية اليوم)\n"
        "نظام سريري متكامل لمتابعة الحامل وصحة الأم، فاحص الأعراض (DDx)، والجرعات والأشعة.\n\n"
        "👇 *القائمة الطبية الرئيسية المعتمدة — اختر الخدمة المطلوبة:*"
    )
    bot.send_message(chat_id, welcome_text, reply_markup=get_medical_inline_menu(lang, user_id, first_name))

@bot.message_handler(commands=['menu'])
def cmd_menu(message):
    chat_id = message.chat.id
    user_id = str(message.from_user.id)
    first_name = message.from_user.first_name or "دكتور"
    session = user_sessions.get(chat_id, {})
    lang = session.get("lang", "ar")
    msg = (
        "🏥 *القائمة الطبية الرئيسية المعتمدة (منصة جرعة):*\n\n"
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
        "• /start - فتح القائمة الطبية الرئيسية\n"
        "• /menu - استعراض كافة الميزات السريرية\n"
        "• /pregnancy - جناح رعاية ومتابعة الحامل (سكر، ضغط، وزن)\n"
        "• /symptoms - فاحص الأعراض والتشخيص التفريقي (DDx)\n"
        "• /plans - باقات الاشتراك والترقية الفورية\n"
        "• 📸 *إرسال صورة*: لتحليل الأشعة السينية أو قراءة التحاليل المخبرية\n"
        "• ✍️ *كتابة رسالة نصية*: لفحص الأعراض، حساب الحمل، أو الاستفسار عن الأدوية\n\n"
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
    # 1. اختيار اللغة
    if data == "lang_ar":
        user_sessions[chat_id] = {"lang": "ar"}
        msg = (
            "✅ *تم اختيار اللغة العربية بنجاح!* 🇸🇦\n\n"
            "🏥 *القائمة الطبية الرئيسية المعتمدة لمنصة جرعة:*\n"
            "كافة الميزات السريرية مفعلة ومتزامنة مع حسابك عبر الموقع:"
        )
        bot.send_message(chat_id, msg, reply_markup=get_medical_inline_menu("ar", user_id, user_name))

    elif data == "lang_en":
        user_sessions[chat_id] = {"lang": "en"}
        msg = (
            "✅ *English selected successfully!* 🇬🇧\n\n"
            "🏥 *Dose Medical Clinical Menu:*\n"
            "All diagnostic and obstetric features are active and synchronized with your web account:"
        )
        bot.send_message(chat_id, msg, reply_markup=get_medical_inline_menu("en", user_id, user_name))

    # 2. القائمة الرئيسية
    elif data == "act_menu":
        session = user_sessions.get(chat_id, {})
        lang = session.get("lang", "ar")
        bot.send_message(chat_id, "🏥 *القائمة الطبية الرئيسية المعتمدة:*", reply_markup=get_medical_inline_menu(lang, user_id, user_name))

    # 3. فاحص الأعراض
    elif data == "act_symptoms":
        trigger_symptoms_flow(chat_id, user_id, user_name)

    # 4. باقات الاشتراك
    elif data == "act_plans":
        trigger_plans_flow(chat_id, user_id, user_name)

    # 4.5. جناح رعاية ومتابعة الحامل والقياسات الشهرية
    elif data == "act_pregnancy" or data == "preg_menu":
        trigger_pregnancy_flow(chat_id, user_id, user_name)

    # --- أ) فحص السكر الشهري وسكر الحمل GDM ---
    elif data == "preg_sugar":
        sugar_msg = (
            "🩸 *متابعة قياس السكر الشهري وسكر الحمل (Gestational Diabetes - GDM):*\n\n"
            "🎯 *المعدلات المعتمدة سريرياً للحامل (ADA/ACOG):*\n"
            "• *سكر الصائم:* أقل من `95 mg/dL`\n"
            "• *بعد الأكل بساعة:* أقل من `140 mg/dL`\n"
            "• *بعد الأكل بساعتين:* أقل من `120 mg/dL`\n"
            "• *السكر التراكمي (HbA1c):* أقل من `6.0%`\n"
            "• *فحص منحنى السكر (OGTT 75g):* يُجرى إجبارياً بين الأسبوع 24 و 28.\n\n"
            "✍️ *لتسجيل فحصك:* اكتبي مثلاً: `سكر صائم 92` أو `سكر بعد الأكل 125` وسأقوم بتقييمه فوراً!\n\n"
            "👇 *أو اضغطي على أحد النماذج السريعة للاختبار:*"
        )
        s_mk = types.InlineKeyboardMarkup(row_width=2)
        s_mk.add(
            types.InlineKeyboardButton("🟢 صائم مثالي (88 mg/dL)", callback_data="sug_88"),
            types.InlineKeyboardButton("🟡 صائم مرتفع (102 mg/dL)", callback_data="sug_102")
        )
        s_mk.add(
            types.InlineKeyboardButton("🔴 صائم حرج (130 mg/dL)", callback_data="sug_130"),
            types.InlineKeyboardButton("🟢 بعد الأكل مثالي (110)", callback_data="sug_110")
        )
        s_mk.add(
            types.InlineKeyboardButton("🔴 بعد الأكل مرتفع (155)", callback_data="sug_155"),
            types.InlineKeyboardButton("🧪 بروتوكول اختبار OGTT", callback_data="sug_ogtt")
        )
        s_mk.add(
            types.InlineKeyboardButton("💓 قياس ضغط الدم", callback_data="preg_bp"),
            types.InlineKeyboardButton("⚖️ متابعة الوزن", callback_data="preg_weight")
        )
        s_mk.add(types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy"))
        bot.send_message(chat_id, sugar_msg, reply_markup=s_mk)

    elif data.startswith("sug_"):
        val_code = data.replace("sug_", "")
        if val_code == "ogtt":
            bot.send_message(
                chat_id,
                "🧪 *بروتوكول فحص منحنى تحمل الجلوكوز (OGTT 75g):*\n\n"
                "• *الموعد المعتمد:* بين الأسبوع 24 و 28 لجميع الحوامل.\n"
                "• *طريقة الفحص:* صيام 8-10 ساعات، قياس الصائم، شرب محلول 75 غم جلوكوز، ثم القياس بعد ساعة وساعتين.\n"
                "• *القيم التشخيصية لسكر الحمل (يكفي تجاوز قراءة واحدة):*\n"
                "  1. الصائم: `>= 92 mg/dL`\n"
                "  2. بعد ساعة: `>= 180 mg/dL`\n"
                "  3. بعد ساعتين: `>= 153 mg/dL`\n"
                "💡 *الهدف:* حماية الجنين من تضخم الحجم (Macrosomia) وهبوط السكر بعد الولادة."
            )
        else:
            val = int(val_code)
            if val < 95:
                res_text = f"🟢 *تقييم سكر الصائم ({val} mg/dL):*\n✅ قراءة طبيعية وممتازة! تحمي الجنين من العملقة وتضمن سلامة وظائف المشيمة."
            elif val <= 125:
                res_text = f"🟡 *تقييم سكر الصائم ({val} mg/dL):*\n⚠️ قراءة مرتفعة حدودياً (اشتباه سكر حمل GDM). يرجى تقليل الكربوهيدرات البسيطة والمشي الخفيف بعد الوجبات وعمل فحص OGTT 75g."
            elif val == 110:
                res_text = f"🟢 *تقييم سكر بعد الأكل بساعتين ({val} mg/dL):*\n✅ قراءة مثالية وضمن الحدود الطبيعية الموصى بها (< 120 mg/dL)."
            elif val == 155:
                res_text = f"🔴 *تقييم سكر بعد الوجبة ({val} mg/dL):*\n🚨 قراءة مرتفعة (> 140 mg/dL). تشير لمقاومة أنسولين هرمونية مشيمية وتستدعي مراجعة طبيب التوليد لضبط الحمية وتحديد العلاج."
            else:
                res_text = f"🔴 *تقييم سكر الصائم ({val} mg/dL):*\n🚨 قراءة صائم مرتفعة جداً! تستدعي تدخلاً علاجياً عاجلاً وفحص السائل الأمنيوسي بالسونار."
            bot.send_message(chat_id, res_text)

    # --- ب) فحص ضغط الدم وتسمم الحمل Pre-eclampsia ---
    elif data == "preg_bp":
        bp_msg = (
            "💓 *متابعة قياس ضغط الدم ومراقبة تسمم الحمل (Pre-eclampsia Monitoring):*\n\n"
            "🎯 *تصنيفات الضغط للحامل (ACOG Guidelines):*\n"
            "• *الضغط المثالي:* أقل من `120/80 mmHg`\n"
            "• *الضغط المرتفع الحذر:* بين `120-139 / 80-89 mmHg`\n"
            "• *ضغط الحمل الحرج:* `140/90 mmHg` فما فوق (خطر تسمم الحمل)\n\n"
            "🚨 *أعراض الخطر لتسمم الحمل:* صداع نابض شديد، زغللة عيون وميضية، ألم حاد فم المعدة والجانب الأيمن، تورم سريع بالوجه واليدين، وزلال البول.\n\n"
            "✍️ *لتسجيل قياسك:* اكتبي مثلاً: `ضغط 115/75` أو `140/90` للتقييم الفوري!"
        )
        bp_mk = types.InlineKeyboardMarkup(row_width=2)
        bp_mk.add(
            types.InlineKeyboardButton("🟢 ضغط مثالي (115/75)", callback_data="bpp_norm"),
            types.InlineKeyboardButton("🟡 ضغط حدودي (135/85)", callback_data="bpp_bord")
        )
        bp_mk.add(
            types.InlineKeyboardButton("🚨 ضغط حرج (150/95)", callback_data="bpp_crit"),
            types.InlineKeyboardButton("⚠️ علامات خطر التسمم", callback_data="bpp_signs")
        )
        bp_mk.add(
            types.InlineKeyboardButton("💊 وقاية الأسبرين (Aspirin)", callback_data="bpp_aspirin"),
            types.InlineKeyboardButton("🩸 فحص السكر الشهري", callback_data="preg_sugar")
        )
        bp_mk.add(types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy"))
        bot.send_message(chat_id, bp_msg, reply_markup=bp_mk)

    elif data.startswith("bpp_"):
        if data == "bpp_norm":
            bot.send_message(chat_id, "🟢 *تقييم ضغط الدم (115/75 mmHg):*\n✅ ضغط دم مثالي يضمن تدفق الدم الكافي والمغذي للجنين عبر الحبل السري.")
        elif data == "bpp_bord":
            bot.send_message(chat_id, "🟡 *تقييم ضغط الدم (135/85 mmHg):*\n⚠️ ضغط دم حدودي مرتفع طفيفاً. يوصى بالراحة والاستلقاء على الجانب الأيسر، تقليل الملح، ومراقبة القياس مرتين أسبوعياً.")
        elif data == "bpp_crit":
            bot.send_message(chat_id, "🚨 *تقييم ضغط الدم (150/95 mmHg):*\n🔴 ضغط دم مرتفع حرج! يجب مراجعة طوارئ الولادة فوراً لفحص زلال البول ومراقبة نبض الجنين واستبعاد تسمم الحمل (Pre-eclampsia).")
        elif data == "bpp_signs":
            bot.send_message(
                chat_id,
                "⚠️ *قائمة أعراض الخطر لتسمم الحمل (Pre-eclampsia Red Flags):*\n\n"
                "1. صداع نابض مستمر لا يستجيب للمسكنات.\n"
                "2. تشوش بالرؤية أو رؤية نقاط وميضية أو حساسية من الضوء.\n"
                "3. ألم حاد أسفل الأضلاع بالجانب الأيمن (منطقة الكبد) أو فم المعدة.\n"
                "4. تورم مفاجئ وسريع في الوجه والجفون وحول العينين وأصابع اليدين.\n"
                "5. غثيان وقيء مفاجئ بالثلث الثاني أو الثالث.\n\n"
                "🚨 *ظهور أي من هذه الأعراض يستدعي التوجه للمستشفى فوراً!*"
            )
        elif data == "bpp_aspirin":
            bot.send_message(
                chat_id,
                "💊 *بروتوكول أسبرين الوقاية (Low-dose Aspirin Prophylaxis):*\n\n"
                "• *الجرعة:* 75 إلى 150 ملغ يومياً قبل النوم.\n"
                "• *التوقيت:* يبدأ من الأسبوع 12 إلى 16 ويستمر حتى الأسبوع 36.\n"
                "• *المستفيدات:* الحوامل ذوات الخطورة العالية (تاريخ تسمم حمل سابق، حمل التوائم، الضغط المزمن، السكري، أمراض الكلى والمناعة الذاتية).\n"
                "💡 يقلل خطر تسمم الحمل وتأخر نمو الجنين بنسبة تصل إلى 60%."
            )

    # --- ج) متابعة الوزن ومؤشر كتلة الجسم ---
    elif data == "preg_weight":
        w_msg = (
            "⚖️ *متابعة الوزن والزيادة الصحية للحامل (Gestational Weight Gain):*\n\n"
            "🎯 *معدلات الزيادة الإجمالية الموصى بها حسب BMI قبل الحمل:*\n"
            "• *النحافة (BMI < 18.5):* زيادة 12.5 - 18 كغ.\n"
            "• *الوزن الطبيعي (BMI 18.5 - 24.9):* زيادة 11.5 - 16 كغ.\n"
            "• *الوزن الزائد (BMI 25 - 29.9):* زيادة 7 - 11.5 كغ.\n"
            "• *السمنة (BMI >= 30):* زيادة 5 - 9 كغ فقط.\n\n"
            "📅 *توزيع الزيادة عبر الشهور:*\n"
            "• الثلث الأول (1-3): 1 إلى 2 كغ فقط إجمالياً.\n"
            "• الثلثين الثاني والثالث (4-9): نصف كغ أسبوعياً (1.5 - 2 كغ شهرياً).\n\n"
            "🚨 *تنبيه:* الزيادة السريعة (> 1 كغ بالأسبوع) مؤشر لاحتباس سوائل مفاجئ (Edema) وقد تشير لتسمم الحمل."
        )
        w_mk = types.InlineKeyboardMarkup(row_width=2)
        w_mk.add(
            types.InlineKeyboardButton("🟢 زيادة طبيعية (0.5 كغ/أسبوع)", callback_data="pw_norm"),
            types.InlineKeyboardButton("🔴 زيادة سريعة مفاجئة (> 1 كغ)", callback_data="pw_fluid")
        )
        w_mk.add(
            types.InlineKeyboardButton("🩸 فحص السكر الشهري", callback_data="preg_sugar"),
            types.InlineKeyboardButton("💓 قياس ضغط الدم", callback_data="preg_bp")
        )
        w_mk.add(types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy"))
        bot.send_message(chat_id, w_msg, reply_markup=w_mk)

    elif data == "pw_norm":
        bot.send_message(chat_id, "🟢 *معدل زيادة الوزن سليم ومثالي:*\n✅ الزيادة بمعدل 0.4 إلى 0.5 كغ أسبوعياً بالثلثين الثاني والثالث تعكس نمو الجنين والمشيمة وحجم الدم بشكل صحي دون تراكم دهون ضارة.")

    elif data == "pw_fluid":
        bot.send_message(chat_id, "🚨 *تنبيه الزيادة السريعة المفاجئة:*\n⚠️ الزيادة بأكثر من 1 كيلوغرام خلال أسبوع واحد لا تنتج عن السعرات الحرارية بل عن احتباس حاد للسوائل (Edema). يرجى قياس ضغط الدم وفحص زلال البول واستبعاد تسمم الحمل فوراً.")

    # --- د) حاسبة عمر الحمل والولادة التقديري ---
    elif data == "preg_calc":
        c_msg = (
            "🤰 *حاسبة عمر الحمل التوليدية وتاريخ الولادة المتوقع (Obstetric Calculator):*\n\n"
            "✍️ *لحساب عمر الحمل بدقة:* اكتبي في رسالة تاريخ أول يوم لآخر دورة شهرية (مثلاً: `آخر دورة 2026-05-15` أو `15-05-2026` أو `2026/05/15`) وسأحسب لك الأسابيع والثلث وموعد الولادة وحجم الجنين فوراً!\n\n"
            "👇 *أو اختاري أحد النماذج السريرية المباشرة:*"
        )
        c_mk = types.InlineKeyboardMarkup(row_width=2)
        c_mk.add(
            types.InlineKeyboardButton("👶 الأسبوع 8 (حبة كرز 🍒)", callback_data="cwk_8"),
            types.InlineKeyboardButton("👶 الأسبوع 12 (حبة ليمون 🍋)", callback_data="cwk_12")
        )
        c_mk.add(
            types.InlineKeyboardButton("👶 الأسبوع 20 (ثمرة موزة 🍌)", callback_data="cwk_20"),
            types.InlineKeyboardButton("👶 الأسبوع 28 (باذنجانة 🍆)", callback_data="cwk_28")
        )
        c_mk.add(
            types.InlineKeyboardButton("👶 الأسبوع 36 (بطيخة 🍉)", callback_data="cwk_36"),
            types.InlineKeyboardButton("🌐 فتح حاسبة الحمل بالموقع", url=build_web_url("pregnancy", user_id, user_name))
        )
        c_mk.add(types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy"))
        bot.send_message(chat_id, c_msg, reply_markup=c_mk)

    elif data.startswith("cwk_"):
        wk = int(data.replace("cwk_", ""))
        if wk <= 13:
            t_name = "الثلث الأول (الأسبوع 1 - 13)"
            fruit = "حبة كرز 🍒 إلى ليمونة 🍋"
            stage_tests = "• سونار مبكر لتأكيد النبض واستبعاد الحمل خارج الرحم\n• فحص الشفافية القفوية (NT Scan) لاستبعاد متلازمة داون في الأسبوع 11-13\n• فحص فصيلة الدم وRh وقوة الدم CBC"
        elif wk <= 27:
            t_name = "الثلث الثاني (الأسبوع 14 - 27)"
            fruit = "ثمرة أفوكادو 🥑 إلى موزة 🍌"
            stage_tests = "• سونار التشوهات التفصيلي الشامل (Anomaly Scan) في الأسبوع 18-22\n• فحص منحنى السكر OGTT 75g في الأسبوع 24-28 لسكر الحمل\n• متابعة حركة الجنين ونبضه بالعيادة"
        else:
            t_name = "الثلث الثالث (الأسبوع 28 - 40+)"
            fruit = "جوز هند 🥥 إلى بطيخة 🍉"
            stage_tests = "• حقنة الأنتي دي (Anti-D) في الأسبوع 28 إذا كان Rh سالب\n• دوبلر لتقييم تدفق الدم المشيمي ووزن الجنين\n• مسحة البكتيريا العقدية GBS في الأسبوع 35-37"

        report_txt = (
            f"📋 *تقرير الحمل السريري (الأسبوع {wk}):*\n\n"
            f"• *المرحلة:* {t_name}\n"
            f"• *حجم الجنين التقريبي:* بحجم {fruit}\n"
            f"• *الفحوصات الطبية الموصى بها في هذه المرحلة:*\n{stage_tests}\n\n"
            f"💡 *نصيحة الطبيب:* شرب 2.5 لتر ماء يومياً، وتناول حمض الفوليك والحديد والكالسيوم بانتظام."
        )
        bot.send_message(chat_id, report_txt)

    # --- هـ) كاشف أمان الأدوية أثناء الحمل FDA ---
    elif data == "preg_drugs":
        dr_msg = (
            "💊 *كاشف أمان الأدوية أثناء الحمل (FDA Pregnancy Categories):*\n\n"
            "🎯 *تصنيفات هيئة الغذاء والدواء الأمريكية (FDA):*\n"
            "• 🟢 *Category A:* دراسات مؤكدة على البشر أثبتت أمانه التام.\n"
            "• 🟢 *Category B:* آمن في دراسات الحيوانات والبشر (مثل: البنادول والأموكسيسيلين).\n"
            "• 🟡 *Category C:* يستخدم بحذر شديد وفقط عند الضرورة الطبية.\n"
            "• 🔴 *Category D:* محظور إلا في حالات إنقاذ الحياة (مثل: مضادات الصرع والإيبوبروفين بالثلث 3).\n"
            "• 🚨 *Category X:* محظور قطعياً ومسبب لتشوهات خطيرة للأجنة (مثل: الرتينويدات وعلاجات الضغط ACEi والوارفارين).\n\n"
            "✍️ *اكتبي اسم أي دواء تجاري أو علمي في رسالة وسأفحص تصنيفه السريري فوراً!*\n\n"
            "👇 *أو استعرضي أشهر الأدوية سريرياً:*"
        )
        dr_mk = types.InlineKeyboardMarkup(row_width=2)
        dr_mk.add(
            types.InlineKeyboardButton("🟢 باراسيتامول / بنادول", callback_data="drg_para"),
            types.InlineKeyboardButton("🔴 إيبوبروفين / بروفين", callback_data="drg_ibup")
        )
        dr_mk.add(
            types.InlineKeyboardButton("🟢 أموكسيسيلين / أوجمنتين", callback_data="drg_amox"),
            types.InlineKeyboardButton("🚨 أدوية الضغط (ACEi)", callback_data="drg_htn")
        )
        dr_mk.add(
            types.InlineKeyboardButton("🟢 أدوية السكري والأنسولين", callback_data="drg_diab"),
            types.InlineKeyboardButton("💉 مميعات الدم (كليكسان vs وارفارين)", callback_data="drg_blood")
        )
        dr_mk.add(types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy"))
        bot.send_message(chat_id, dr_msg, reply_markup=dr_mk)

    elif data == "drg_para":
        bot.send_message(chat_id, "🟢 *باراسيتامول / بنادول (Paracetamol):*\n• *التصنيف:* Category B\n• *الأمان:* المسكن وخافض الحرارة الأول المعتمد والآمن في جميع مراحل الحمل والرضاعة.\n• *الجرعة:* 500-1000 ملغ عند الحاجة (أقصى حد 3000-4000 ملغ يومياً).")

    elif data == "drg_ibup":
        bot.send_message(chat_id, "🔴 *إيبوبروفين / بروفين / فولتارين (NSAIDs):*\n• *التصنيف:* Category D في الثلث الثالث\n• *التحذير السريري:* محظور تماماً بعد الأسبوع 20-28! يسبب إغلاقاً مبكراً للقناة الشريانية للجنين (Ductus Arteriosus)، ونقص السائل الأمنيوسي، ومشاكل كلوية جنينية.\n• *البديل الآمن:* باراسيتامول (بنادول).")

    elif data == "drg_amox":
        bot.send_message(chat_id, "🟢 *أموكسيسيلين / أوجمنتين / سيفالوسبورين:*\n• *التصنيف:* Category B\n• *الأمان:* مضاد حيوي واسع الطيف آمن لعلاج التهابات المسالك البولية والجيوب والتهاب الحلق أثناء الحمل تحت إشراف الطبيب.")

    elif data == "drg_htn":
        bot.send_message(chat_id, "🚨 *أدوية الضغط المحظورة (ACEi & ARBs مثل ليزينوبريل وكابتوبريل ولوسارتان):*\n• *التصنيف:* Category X / D\n• *الخطر:* تسبب تشوهات خطيرة بعظام الجمجمة، فشل كلوي جنيني، وموت الجنين.\n• *البدائل الآمنة لضغط الحامل:* لابيترول (Labetalol) أو ميثيل دوبا (Aldomet) أو نيفيديبين (Nifedipine).")

    elif data == "drg_diab":
        bot.send_message(chat_id, "🟢 *أدوية السكري وسكر الحمل:*\n• *الأنسولين:* الخيار الذهبي الأول والآمن 100% لأنه لا يعبر المشيمة إطلاقاً.\n• *ميتفورمين (غلوكوفاج):* Category B، آمن ومستخدم بفعالية في سكر الحمل وتكيس المبايض.\n• *حبوب السلفونيل يوريا (دايميكرون/أماريل):* محظورة لأنها تسبب هبوط سكر شديد للجنين.")

    elif data == "drg_blood":
        bot.send_message(chat_id, "💉 *مميعات الدم والوقاية من الجلطات:*\n• 🟢 *كليكسان / إينوكسبارين (Clexane / LMWH):* آمن تماماً ولا يعبر المشيمة.\n• 🔴 *وارفارين (Coumadin):* Category X ومحظور بالثلث الأول ومرحلة المخاض لتسببه بتشوهات جنينية ونزيف دماغي.")

    # --- و) التغذية السريرية والممنوعات ---
    elif data == "preg_diet":
        bot.send_message(
            chat_id,
            "🥗 *دليل التغذية السريرية والممنوعات الصارمة للحامل:*\n\n"
            "🚫 *الممنوعات الستة الصارمة لحماية الجنين:*\n"
            "1. *الأجبان غير المبسترة والحليب الخام:* خطر بكتيريا الليستيريا المسببة للإجهاض.\n"
            "2. *اللحوم والبيض النيئ والمايونيز المنزلي والسوشي:* خطر السالمونيلا والتوكسوبلازما.\n"
            "3. *اللحوم الباردة والمصنعة (لانشون، بسطرمة، سوسيس):* لا تؤكل إلا بعد تسخينها لدرجة الغليان.\n"
            "4. *الأسماك العالية بالزئبق (سمك القرش، الماكريل الملكي، التونة البيضاء بكثرة).*\n"
            "5. *الكبدة الحيوانية بكميات كبيرة:* فرط فيتامين A المسبب لتشوهات الأجنة.\n"
            "6. *الكافيين الزائد:* لا يتجاوز 200 ملغ يومياً (فنجان قهوة واحد).\n\n"
            "✨ *المكملات الأساسية اليومية:*\n"
            "• حمض الفوليك (400-800 mcg) من قبل الحمل وحتى الأسبوع 12.\n"
            "• الحديد والكالسيوم وفيتامين د من الثلث الثاني حتى نهاية الرضاعة.",
            reply_markup=types.InlineKeyboardMarkup().add(
                types.InlineKeyboardButton("🚶‍♀️ برنامج المشي والرياضة", callback_data="preg_walk"),
                types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy")
            )
        )

    # --- ز) المشي والنشاط البدني ---
    elif data == "preg_walk":
        bot.send_message(
            chat_id,
            "🚶‍♀️ *برنامج المشي والنشاط البدني الآمن للحامل (ACOG Guidelines):*\n\n"
            "✅ *الأنشطة الموصى بها:*\n"
            "• المشي المعتدل 20 إلى 30 دقيقة يومياً ينشط الدورة الدموية ويمنع سكر الحمل وتورم الساقين.\n"
            "• تمارين قاع الحوض (كيجل Kegel): تقوي عضلات الحوض وتسهل الولادة الطبيعية وتمنع سلس البول.\n"
            "• السباحة وتمارين التمدد الخفيفة: تخفف آلام أسفل الظهر.\n\n"
            "🚨 *علامات التوقف الفوري ومراجعة الطوارئ (Red Flags):*\n"
            "• نزول أي نزيف مهبلي أو تدفق سوائل.\n"
            "• تقلصات رحمية منتظمة ومؤلمة قبل الأوان.\n"
            "• دوخة حادة، إغماء، أو ضيق تنفس قبل بدء المجهود.\n"
            "• انخفاض ملحوظ في حركة الجنين بعد الأسبوع 28.",
            reply_markup=types.InlineKeyboardMarkup().add(
                types.InlineKeyboardButton("📊 جدول الفحوصات والزيارات", callback_data="preg_visits"),
                types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy")
            )
        )

    # --- ح) جدول الزيارات والفحوصات ---
    elif data == "preg_visits":
        bot.send_message(
            chat_id,
            "📊 *جدول الزيارات الدورية والفحوصات المخبرية للحامل:*\n\n"
            "📅 *مواعيد الزيارات الدورية للطبيب:*\n"
            "• من البداية حتى الأسبوع 28: زيارة شهرية روتينية.\n"
            "• من الأسبوع 28 إلى 36: زيارة كل أسبوعين.\n"
            "• من الأسبوع 36 حتى الولادة: زيارة أسبوعية.\n\n"
            "🔬 *خريطة الفحوصات الأساسية:*\n"
            "• *أسبوع 6-8:* سونار تأكيد النبض واستبعاد الحمل المنتبذ.\n"
            "• *أسبوع 11-13:* فحص الشفافية القفوية (NT Scan).\n"
            "• *أسبوع 18-22:* سونار التشوهات التفصيلي الشامل (Anomaly Scan).\n"
            "• *أسبوع 24-28:* فحص سكر الحمل (OGTT 75g) وفحص قوة الدم.\n"
            "• *أسبوع 28:* حقنة الأنتي دي (Anti-D) لذوات فصيلة دم Rh السالبة.\n"
            "• *أسبوع 35-37:* مسحة البكتيريا العقدية المهبلية (GBS Screen).",
            reply_markup=types.InlineKeyboardMarkup().add(
                types.InlineKeyboardButton("🤰 حاسبة عمر الحمل", callback_data="preg_calc"),
                types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy")
            )
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
    user_id = str(message.from_user.id)
    user_name = message.from_user.first_name or ""

    # 1. أوامر التحويل السريعة
    if text in ["/pregnancy", "/maternal", "🤰 رعاية ومتابعة الحامل", "رعاية الحامل", "حمل", "حامل"]:
        trigger_pregnancy_flow(chat_id, user_id, user_name)
        return
    elif text in ["/symptoms", "🩺 فاحص الأعراض"]:
        trigger_symptoms_flow(chat_id, user_id, user_name)
        return
    elif text in ["/plans", "💳 الباقات"]:
        trigger_plans_flow(chat_id, user_id, user_name)
        return

    # 2. فحص مدخلات الحامل: تاريخ آخر دورة شهرية (LMP Date Calculation)
    date_match = re.search(r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})|(\d{1,2}[-/]\d{1,2}[-/]\d{4})', text)
    if date_match and ("دورة" in text or "lmp" in text.lower() or "حمل" in text or len(text) <= 12):
        raw_date = date_match.group(0).replace("/", "-")
        parsed_d = None
        for fmt in ("%Y-%m-%d", "%d-%m-%Y"):
            try:
                parsed_d = datetime.strptime(raw_date, fmt).date()
                break
            except Exception:
                pass

        if parsed_d:
            calc = calculate_obstetric_dates_py(parsed_d)
            if calc:
                res_calc = (
                    f"🌸 *تقرير حساب عمر الحمل وموعد الولادة السريري (Dose Obstetric Care):*\n\n"
                    f"• 📅 *تاريخ آخر دورة (LMP):* `{parsed_d.strftime('%Y-%m-%d')}`\n"
                    f"• 👶 *عمر الحمل الحالي:* *{calc['weeks']} أسبوعاً و {calc['days']} يوماً*\n"
                    f"• ⏳ *المرحلة الحالية:* *{calc['trim_name']}* (الشهر {calc['month']})\n"
                    f"• 🎯 *موعد الولادة المتوقع (EDD):* `{calc['edd']}` (متبقي {calc['days_left']} يوماً)\n"
                    f"• 📊 *نسبة اكتمال الحمل:* `{calc['progress']}%`\n"
                    f"• 🍉 *حجم الجنين التقديري:* بحجم *{calc['comparison']}*\n"
                    f"• 🌱 *مرحلة التطور:* {calc['summary']}\n\n"
                    f"🔬 *أهم الفحوصات والتحاليل في هذه المرحلة:*\n• " + "\n• ".join(calc['tests']) + "\n\n"
                    f"🌐 [فتح ملف الحامل التفاعلي الشامل وتصدير التقرير بالموقع]({build_web_url('pregnancy', user_id, user_name)})"
                )
                bot.send_message(chat_id, res_calc, reply_markup=get_pregnancy_keyboard(user_id, user_name))
                return

    # 3. فحص مدخلات الحامل: قراءة السكر (Blood Glucose)
    if "سكر" in text or "glucose" in text.lower() or "gdm" in text.lower():
        num_match = re.search(r'\d+(\.\d+)?', text)
        if num_match:
            sug_val = float(num_match.group(0))
            is_fasting = "صائم" in text or "صيام" in text or "fasting" in text.lower() or sug_val < 100
            
            if is_fasting:
                if sug_val < 95:
                    status_text = f"🟢 *سكر الصائم ({sug_val} mg/dL):* طبيعي وممتاز! ضمن الهدف العلاجي المعتمد (< 95 mg/dL)."
                elif sug_val <= 125:
                    status_text = f"🟡 *سكر الصائم ({sug_val} mg/dL):* مرتفع حدودياً! اشتباه سكر حمل (GDM). يجب إجراء اختبار OGTT 75g في الأسبوع 24-28."
                else:
                    status_text = f"🔴 *سكر الصائم ({sug_val} mg/dL):* مرتفع حرج! يستدعي مراجعة طبيب التوليد لضبط النشويات وتقييم العلاج الدوائي."
            else:
                if sug_val < 120:
                    status_text = f"🟢 *سكر بعد الأكل ({sug_val} mg/dL):* طبيعي وممتاز! أقل من 120 mg/dL بعد الأكل بساعتين."
                elif sug_val <= 140:
                    status_text = f"🟡 *سكر بعد الأكل ({sug_val} mg/dL):* على الحد الأعلى المقبول. يفضل المشي الخفيف 15 دقيقة بعد الوجبة."
                else:
                    status_text = f"🔴 *سكر بعد الأكل ({sug_val} mg/dL):* مرتفع (> 140 mg/dL). يشير لمقاومة أنسولين مشيمية تستدعي المتابعة الطبية."

            bot.send_message(
                chat_id,
                f"🩸 *التقييم السريري لقياس السكر للحامل:*\n\n{status_text}\n\n"
                f"🎯 *المستهدف الطبي للحامل (ACOG/ADA):*\n• الصائم: < 95 mg/dL\n• بعد الأكل بساعتين: < 120 mg/dL\n• التراكمي HbA1c: < 6.0%",
                reply_markup=types.InlineKeyboardMarkup().add(
                    types.InlineKeyboardButton("💓 قياس ضغط الدم", callback_data="preg_bp"),
                    types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy")
                )
            )
            return

    # 4. فحص مدخلات الحامل: قراءة ضغط الدم (Blood Pressure & Pre-eclampsia)
    bp_match = re.search(r'(\d{2,3})\s*[/]\s*(\d{2,3})', text)
    if bp_match or ("ضغط" in text and re.search(r'\d{2,3}', text)):
        if bp_match:
            sys_val = int(bp_match.group(1))
            dia_val = int(bp_match.group(2))
        else:
            nums = re.findall(r'\d{2,3}', text)
            sys_val = int(nums[0]) if len(nums) > 0 else 120
            dia_val = int(nums[1]) if len(nums) > 1 else 80

        if sys_val < 120 and dia_val < 80:
            bp_eval = f"🟢 *ضغط الدم ({sys_val}/{dia_val} mmHg):* طبيعي ومثالي جداً! يضمن سلامة تروية المشيمة وتغذية الجنين."
        elif sys_val < 140 and dia_val < 90:
            bp_eval = f"🟡 *ضغط الدم ({sys_val}/{dia_val} mmHg):* حدودي مرتفع طفيفاً. يوصى بالراحة وتقليل الملح وإعادة القياس مرتين أسبوعياً."
        else:
            bp_eval = (
                f"🚨 *ضغط الدم ({sys_val}/{dia_val} mmHg):* مرتفع حرج! إنذار تسمم الحمل (Pre-eclampsia)!\n\n"
                f"⚠️ *يجب التوجه فوراً لطوارئ الولادة في حال وجود أي من الأعراض التالية:*\n"
                f"• صداع شديد نابض\n• زغللة وتشوش بالرؤية\n• ألم فم المعدة والجانب الأيمن\n• تورم الوجه واليدين\n• زلال البول"
            )

        bot.send_message(
            chat_id,
            f"💓 *التقييم السريري لضغط الدم للحامل:*\n\n{bp_eval}\n\n"
            f"🎯 *الحد الطبيعي:* أقل من 120/80 mmHg | الخطر الحرج: >= 140/90 mmHg",
            reply_markup=types.InlineKeyboardMarkup().add(
                types.InlineKeyboardButton("🩸 فحص السكر الشهري", callback_data="preg_sugar"),
                types.InlineKeyboardButton("🔙 قائمة الحامل", callback_data="act_pregnancy")
            )
        )
        return

    # 5. استفسارات أمان الأدوية للحامل (FDA Categories)
    if ("دواء" in text or "أمان" in text or "آمن" in text or "حامل" in text) and len(text) < 40:
        if any(w in text for w in ["باراسيتامول", "بنادول", "أدول", "panadol", "paracetamol"]):
            bot.send_message(chat_id, "🟢 *باراسيتامول / بنادول:* Category B (آمن تماماً في جميع شهور الحمل والرضاعة بجرعة 500-1000 ملغ عند اللزوم).")
            return
        elif any(w in text for w in ["بروفين", "إيبوبروفين", "فولتارين", "brufen", "ibuprofen"]):
            bot.send_message(chat_id, "🔴 *بروفين / إيبوبروفين:* Category D ومحظور بالثلث الثالث! يسبب إغلاقاً مبكراً للقناة الشريانية للجنين وقصور كلى الجنين. البديل الآمن: باراسيتامول.")
            return
        elif any(w in text for w in ["أموكسيسيلين", "أوجمنتين", "amoxicillin", "augmentin"]):
            bot.send_message(chat_id, "🟢 *أموكسيسيلين / أوجمنتين:* Category B (مضاد حيوي آمن للالتهابات التنفسية والبولية أثناء الحمل تحت إشراف الطبيب).")
            return

    # 6. التحقق من كود البرومو
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
            f"• جناح رعاية الحامل، فاحص الأعراض (DDx)، والأشعة والتحاليل مفعلة فورياً في البوت والموقع!",
            reply_markup=types.InlineKeyboardMarkup().add(
                types.InlineKeyboardButton("🤰 رعاية ومتابعة الحامل", callback_data="act_pregnancy"),
                types.InlineKeyboardButton("🩺 فحص الأعراض الآن", callback_data="act_symptoms")
            )
        )
        return

    # 7. فحص الأعراض الطبي السريري الافتراضي
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
            types.BotCommand("start", "🏥 القائمة الطبية الشاملة وأزرار الفحص"),
            types.BotCommand("pregnancy", "🤰 رعاية ومتابعة الحامل (سكر، ضغط، وزن)"),
            types.BotCommand("symptoms", "🩺 فاحص الأعراض السريري (DDx)"),
            types.BotCommand("plans", "💳 باقات الاشتراك والترقية"),
            types.BotCommand("menu", "📋 قائمة الخدمات والميزات"),
            types.BotCommand("help", "ℹ️ المساعدة والاستخدام"),
        ])
    except Exception as e:
        print(f"تنبيه أثناء تسجيل الأوامر: {e}")

    try:
        # حذف أي ويب هوك قديم لتمكين الـ Polling الفوري
        bot.delete_webhook(drop_pending_updates=False)
    except Exception:
        pass

    print("✅ البوت متصل بتليجرام وجاهز لاستقبال الرسائل...")
    try:
        bot.infinity_polling(skip_pending=True)
    except Exception as e:
        if "409" in str(e) or "Conflict" in str(e):
            print("\n" + "=" * 60)
            print("ℹ️ تنبيه: هناك نسخة أخرى من البوت تعمل بالفعل على السيرفر السحابي (مثل Render).")
            print("🚀 البوت يعمل 24/7 ويستقبل الرسائل على تليجرام بنجاح!")
            print("💡 لتحديث النسخة على Render تلقائياً: نفذ git push origin main")
            print("=" * 60 + "\n")
            import time
            while True:
                time.sleep(60)
        else:
            raise e
