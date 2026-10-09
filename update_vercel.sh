#!/bin/bash
set -e

echo "=============================================="
echo "🩺 تحديث منصة جرعة الطبية إلى Vercel & GitHub"
echo "=============================================="

# 1. البحث عن أحدث ملف تحديث زمني في مجلد التنزيلات بالجهاز
LATEST_ZIP=$(ls -t /sdcard/Download/*dose*.zip /sdcard/Download/dose*.zip 2>/dev/null | head -n 1 || true)

if [ -z "$LATEST_ZIP" ] || [ ! -f "$LATEST_ZIP" ]; then
    echo "❌ خطأ: لم يتم العثور على أي ملف تحديث يبدأ بـ dose في /sdcard/Download/"
    echo "💡 يرجى تنزيل ملف التحديث dose_v36_final.zip أو dose_v3_release.zip أولاً."
    exit 1
fi

echo "📥 1. تم العثور على حزمة التحديث:"
echo "   📂 المسار: $LATEST_ZIP"
echo "   📊 الحجم: $(du -h "$LATEST_ZIP" | cut -f1)"

# نسخ الحزمة لبيئة العمل المحلية
cp "$LATEST_ZIP" ./dose_current_update.zip

echo "🧹 2. تنظيف ملفات البناء القديمة في assets/ لضمان التحديث الجذري..."
rm -f assets/index-*.js assets/index-*.css

echo "📦 3. فك ضغط الحزمة المحدثة بالكامل..."
unzip -o dose_current_update.zip
rm -f dose_current_update.zip

NEW_JS=$(ls assets/index-*.js 2>/dev/null | head -n 1)
echo "✅ الملف البرمجي النشط الجديد: $NEW_JS"

echo "🚀 4. تسجيل التحديث في Git والرفع إلى GitHub..."
git add -A
COMMIT_MSG="feat: complete medical CMP panel, OCR resilience and accurate decimals (v3)"
COMMIT_OUT=$(git commit -m "$COMMIT_MSG" 2>&1 || true)
echo "$COMMIT_OUT"

if echo "$COMMIT_OUT" | grep -q "nothing to commit"; then
    echo "⚠️ لم يتم اكتشاف ملفات جديدة (الملفات المستخرجة متطابقة مع الموجود)."
else
    echo "📤 جاري الدفع إلى GitHub..."
    git push origin main || git push
    echo "✅ تم الدفع إلى GitHub بنجاح!"
fi

echo "=============================================="
echo "🎯 مقياس نجاح التحديث النهائي:"
echo "1. الملف المحدث هو: $NEW_JS"
echo "2. تم الدفع إلى GitHub وتلقائياً يبدأ Vercel البناء"
echo "3. انتظر 45 ثانية، ثم افتح المتصفح في نافذة تصفح متخفي (Incognito)"
echo "   أو قم بعمل Hard Refresh لموقعك web-dose.vercel.app"
echo "=============================================="

