#!/bin/bash
set -e
echo "=============================================="
echo "🚀 تحديث منصة جرعة (Dose v3.6 - Lab & Metabolism)"
echo "=============================================="

cd "."

ZIP_FILE="/root/storage/downloads/dose_v36_final.zip"
if [ ! -f "" ]; then
  ZIP_FILE="/root/Downloads/dose_v36_final.zip"
fi
if [ ! -f "" ]; then
  ZIP_FILE="/sdcard/Download/dose_v36_final.zip"
fi

if [ -f "" ]; then
  echo "📦 جاري فك ضغط التحديث النظيف من: "
  unzip -o "" -d .
fi

echo "🔄 جاري رفع التحديث إلى GitHub..."
git add -A
git commit -m "feat(v3.6): instant 1-click lab metabolism analyzer, fixed 25-OH and HOMA-IR parsing, and Vercel serverless functions" || true
git push origin main || git push origin master

echo ""
echo "=============================================="
echo "✅ تم التحديث والدفع إلى GitHub بنجاح!"
echo "🎯 يقوم Vercel الآن بنشر التحديث تلقائياً خلال 30 ثانية."
echo "افتح موقعك: https://web-dose.vercel.app"
echo "=============================================="
