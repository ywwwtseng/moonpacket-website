#!/usr/bin/env node

/**
 * 為所有語言的 site.json 添加/更新 errors 部分
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ERRORS_TRANSLATIONS = {
  'en-US': {
    not_found: 'Page Not Found',
    not_found_desc: 'Sorry, the page you are looking for does not exist or has been moved.',
    stale: 'Data may be outdated'
  },
  'en-GB': {
    not_found: 'Page Not Found',
    not_found_desc: 'Sorry, the page you are looking for does not exist or has been moved.',
    stale: 'Data may be outdated'
  },
  'zh-TW': {
    not_found: '頁面未找到',
    not_found_desc: '抱歉，您訪問的頁面不存在或已被移動。',
    stale: '數據可能過期'
  },
  'zh-CN': {
    not_found: '页面未找到',
    not_found_desc: '抱歉，您访问的页面不存在或已被移动。',
    stale: '数据可能过期'
  },
  'ja-JP': {
    not_found: 'ページが見つかりません',
    not_found_desc: '申し訳ございません。お探しのページは存在しないか、移動されました。',
    stale: 'データが古い可能性があります'
  },
  'ko-KR': {
    not_found: '페이지를 찾을 수 없습니다',
    not_found_desc: '죄송합니다. 찾으시는 페이지가 존재하지 않거나 이동되었습니다.',
    stale: '데이터가 오래되었을 수 있습니다'
  },
  'es-ES': {
    not_found: 'Página no encontrada',
    not_found_desc: 'Lo sentimos, la página que busca no existe o ha sido movida.',
    stale: 'Los datos pueden estar desactualizados'
  },
  'fr-FR': {
    not_found: 'Page non trouvée',
    not_found_desc: 'Désolé, la page que vous recherchez n\'existe pas ou a été déplacée.',
    stale: 'Les données peuvent être obsolètes'
  },
  'de-DE': {
    not_found: 'Seite nicht gefunden',
    not_found_desc: 'Entschuldigung, die gesuchte Seite existiert nicht oder wurde verschoben.',
    stale: 'Daten könnten veraltet sein'
  },
  'it-IT': {
    not_found: 'Pagina non trovata',
    not_found_desc: 'Spiacenti, la pagina che stai cercando non esiste o è stata spostata.',
    stale: 'I dati potrebbero essere obsoleti'
  },
  'pt-BR': {
    not_found: 'Página não encontrada',
    not_found_desc: 'Desculpe, a página que você está procurando não existe ou foi movida.',
    stale: 'Os dados podem estar desatualizados'
  },
  'pt-PT': {
    not_found: 'Página não encontrada',
    not_found_desc: 'Desculpe, a página que procura não existe ou foi movida.',
    stale: 'Os dados podem estar desatualizados'
  },
  'ru-RU': {
    not_found: 'Страница не найдена',
    not_found_desc: 'Извините, страница, которую вы ищете, не существует или была перемещена.',
    stale: 'Данные могут быть устаревшими'
  },
  'ar-SA': {
    not_found: 'الصفحة غير موجودة',
    not_found_desc: 'عذرًا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
    stale: 'قد تكون البيانات قديمة'
  },
  'hi-IN': {
    not_found: 'पृष्ठ नहीं मिला',
    not_found_desc: 'क्षमा करें, आप जिस पृष्ठ को खोज रहे हैं वह मौजूद नहीं है या स्थानांतरित कर दिया गया है।',
    stale: 'डेटा पुराना हो सकता है'
  },
  'th-TH': {
    not_found: 'ไม่พบหน้านี้',
    not_found_desc: 'ขออภัย หน้าที่คุณกำลังมองหาไม่มีอยู่หรือถูกย้ายไปแล้ว',
    stale: 'ข้อมูลอาจล้าสมัย'
  },
  'vi-VN': {
    not_found: 'Không tìm thấy trang',
    not_found_desc: 'Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.',
    stale: 'Dữ liệu có thể đã lỗi thời'
  },
  'id-ID': {
    not_found: 'Halaman tidak ditemukan',
    not_found_desc: 'Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.',
    stale: 'Data mungkin sudah usang'
  },
  'tr-TR': {
    not_found: 'Sayfa bulunamadı',
    not_found_desc: 'Üzgünüz, aradığınız sayfa mevcut değil veya taşınmış.',
    stale: 'Veriler eskimiş olabilir'
  },
  'pl-PL': {
    not_found: 'Strona nie znaleziona',
    not_found_desc: 'Przepraszamy, strona, której szukasz, nie istnieje lub została przeniesiona.',
    stale: 'Dane mogą być nieaktualne'
  },
  'nl-NL': {
    not_found: 'Pagina niet gevonden',
    not_found_desc: 'Sorry, de pagina die u zoekt bestaat niet of is verplaatst.',
    stale: 'Gegevens kunnen verouderd zijn'
  },
  'sv-SE': {
    not_found: 'Sidan hittades inte',
    not_found_desc: 'Tyvärr, sidan du letar efter finns inte eller har flyttats.',
    stale: 'Data kan vara föråldrad'
  },
  'da-DK': {
    not_found: 'Siden blev ikke fundet',
    not_found_desc: 'Beklager, siden du leder efter findes ikke eller er blevet flyttet.',
    stale: 'Data kan være forældet'
  },
  'no-NO': {
    not_found: 'Siden ble ikke funnet',
    not_found_desc: 'Beklager, siden du leter etter finnes ikke eller har blitt flyttet.',
    stale: 'Data kan være utdatert'
  },
  'fi-FI': {
    not_found: 'Sivua ei löytynyt',
    not_found_desc: 'Valitettavasti etsimääsi sivua ei ole olemassa tai se on siirretty.',
    stale: 'Tiedot voivat olla vanhentuneita'
  },
  'cs-CZ': {
    not_found: 'Stránka nenalezena',
    not_found_desc: 'Omlouváme se, stránka, kterou hledáte, neexistuje nebo byla přesunuta.',
    stale: 'Data mohou být zastaralá'
  },
  'hu-HU': {
    not_found: 'Az oldal nem található',
    not_found_desc: 'Sajnáljuk, a keresett oldal nem létezik vagy áthelyezték.',
    stale: 'Az adatok elavultak lehetnek'
  },
  'ro-RO': {
    not_found: 'Pagina nu a fost găsită',
    not_found_desc: 'Ne pare rău, pagina pe care o căutați nu există sau a fost mutată.',
    stale: 'Datele pot fi învechite'
  },
  'uk-UA': {
    not_found: 'Сторінку не знайдено',
    not_found_desc: 'Вибачте, сторінка, яку ви шукаєте, не існує або була переміщена.',
    stale: 'Дані можуть бути застарілими'
  },
  'el-GR': {
    not_found: 'Η σελίδα δεν βρέθηκε',
    not_found_desc: 'Λυπούμαστε, η σελίδα που αναζητάτε δεν υπάρχει ή έχει μετακινηθεί.',
    stale: 'Τα δεδομένα μπορεί να είναι ξεπερασμένα'
  },
  'he-IL': {
    not_found: 'הדף לא נמצא',
    not_found_desc: 'מצטערים, הדף שאתה מחפש לא קיים או הועבר.',
    stale: 'הנתונים עשויים להיות מיושנים'
  },
  'fa-IR': {
    not_found: 'صفحه پیدا نشد',
    not_found_desc: 'متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا جابجا شده است.',
    stale: 'داده‌ها ممکن است قدیمی باشند'
  },
  'ur-PK': {
    not_found: 'صفحہ نہیں ملا',
    not_found_desc: 'معذرت، آپ جو صفحہ تلاش کر رہے ہیں موجود نہیں ہے یا منتقل کر دیا گیا ہے۔',
    stale: 'ڈیٹا پرانا ہو سکتا ہے'
  },
  'bn-BD': {
    not_found: 'পেজ খুঁজে পাওয়া যায়নি',
    not_found_desc: 'দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা সরানো হয়েছে।',
    stale: 'ডেটা পুরানো হতে পারে'
  },
};

const BASE_DIR = 'src/i18n/messages';

console.log('🔧 更新所有語言的 errors 翻譯...\n');

let updated = 0;
let skipped = 0;

for (const [locale, errors] of Object.entries(ERRORS_TRANSLATIONS)) {
  const filePath = join(BASE_DIR, locale, 'site.json');
  
  if (!existsSync(filePath)) {
    console.log(`⏭️  跳過 ${locale}: 文件不存在`);
    skipped++;
    continue;
  }
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // 更新 errors 部分
    if (!data.errors) {
      data.errors = {};
    }
    
    data.errors = {
      stale: errors.stale,
      not_found: errors.not_found,
      not_found_desc: errors.not_found_desc
    };
    
    // 寫回文件，保持格式
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    
    console.log(`✓ ${locale}: 已更新`);
    updated++;
  } catch (error) {
    console.error(`✗ ${locale}: ${error.message}`);
  }
}

console.log(`\n✅ 完成！更新了 ${updated} 個語言，跳過 ${skipped} 個`);

