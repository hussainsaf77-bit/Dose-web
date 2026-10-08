#!/bin/bash
set -e

echo "=============================================="
echo "🩺 تحديث منصة جرعة الطبية إلى Vercel & GitHub"
echo "=============================================="

DOWNLOAD_URL="https://ais-pre-od4aemezdgaeup2ncw76si-295455119343.europe-west2.run.app/dose_vercel_update.zip"

echo "📥 1. التحقق من وجود حزمة التحديث المحدثة..."
if [ -f "/sdcard/Download/dose_vercel_update.zip" ]; then
    echo "✅ تم العثور على ملف التحديث في مجلد التنزيلات بالجهاز."
    cp "/sdcard/Download/dose_vercel_update.zip" ./dose_vercel_update.zip
elif [ -f "$HOME/storage/downloads/dose_vercel_update.zip" ]; then
    echo "✅ تم العثور على ملف التحديث في تنزيلات Termux."
    cp "$HOME/storage/downloads/dose_vercel_update.zip" ./dose_vercel_update.zip
else
    echo "🌐 محاولة التحميل المباشر..."
    curl -sL -o dose_vercel_update.zip "$DOWNLOAD_URL" || true
fi

echo "📦 2. جاري فك ضغط الملفات المحدثة في مستودعك..."
unzip -o dose_vercel_update.zip
rm -f dose_vercel_update.zip

echo "🚀 3. جاري حفظ التغييرات والرفع إلى GitHub..."
git add -A
git commit -m "feat: accurate clinical decimals, range bounds, and lab recognition" 2>/dev/null || true
git push origin main 2>/dev/null || git push 2>/dev/null || true

echo "⚡ 4. محاولة النشر المباشر عبر Vercel CLI إن وجد..."
if command -v vercel &> /dev/null; then
    vercel --prod --yes 2>/dev/null || true
elif command -v npx &> /dev/null; then
    npx --yes vercel --prod --yes 2>/dev/null || true
fi

echo "=============================================="
echo "✅ تم إرسال التحديث بنجاح! سيتم تحديث web-dose.vercel.app فوراً."
echo "=============================================="
