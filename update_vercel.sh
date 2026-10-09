#!/bin/bash
set -e

echo "=============================================="
echo "🩺 تحديث منصة جرعة الطبية إلى Vercel & GitHub"
echo "=============================================="

DOWNLOAD_URL="https://ais-pre-od4aemezdgaeup2ncw76si-295455119343.europe-west2.run.app/dose_vercel_update.zip"

echo "📥 1. جاري جلب أحدث حزمة تحديث مباشرة..."
# محاولة التحميل المباشر أولاً لضمان الحصول على آخر كود دون الاعتماد على كاش الجهاز
if curl -fSL --connect-timeout 10 -o dose_vercel_update.zip "$DOWNLOAD_URL"; then
    echo "✅ تم تحميل أحدث حزمة مباشرة بنجاح."
else
    echo "⚠️ تعذر التحميل المباشر، جاري البحث في التنزيلات بالجهاز..."
    # ابحث عن أحدث ملف تم تنزيله حتى لو كان باسم (1) أو (2)
    LATEST_DOWNLOAD=$(ls -t /sdcard/Download/dose_vercel_update*.zip 2>/dev/null | head -n 1 || true)
    if [ -n "$LATEST_DOWNLOAD" ] && [ -f "$LATEST_DOWNLOAD" ]; then
        echo "✅ تم العثور على أحدث ملف في التنزيلات: $LATEST_DOWNLOAD"
        cp "$LATEST_DOWNLOAD" ./dose_vercel_update.zip
    else
        echo "❌ لم يتم العثور على حزمة التحديث."
        exit 1
    fi
fi

echo "📦 2. جاري فك ضغط الملفات المحدثة في مستودعك..."
unzip -o dose_vercel_update.zip
rm -f dose_vercel_update.zip

echo "🚀 3. جاري حفظ التغييرات والرفع إلى GitHub..."
git add -A
COMMIT_OUTPUT=$(git commit -m "feat: complete accurate clinical lab engine and decimals" 2>&1 || true)
echo "$COMMIT_OUTPUT"

if echo "$COMMIT_OUTPUT" | grep -q "nothing to commit"; then
    echo "ℹ️ لا توجد تغييرات جديدة، المستودع محدث بالفعل لأحدث نسخة!"
else
    echo "📤 جاري الدفع إلى GitHub..."
    git push origin main || git push
fi

echo "=============================================="
echo "🎯 قياس نجاح العملية:"
echo "1. تحقق من ظهور index-C7HJUL9f.js في الملفات المفكوكة"
echo "2. تم الدفع إلى GitHub بنجاح"
echo "3. استغرق 30-60 ثانية ليقوم Vercel بالنشر التلقائي"
echo "=============================================="

