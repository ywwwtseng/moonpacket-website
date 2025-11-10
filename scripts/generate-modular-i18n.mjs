#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const LANG_DIR = 'src/i18n/messages';

// 读取所有语言目录
const languages = readdirSync(LANG_DIR).filter(dir => 
  dir !== 'zh-TW' && dir !== 'en-US' && !dir.startsWith('.')
);

console.log(`🔄 为 ${languages.length} 个语言生成模块化 i18n 文件...`);

// 为每个语言创建模块化文件
for (const lang of languages) {
  const langDir = join(LANG_DIR, lang);
  const commonFile = join(langDir, 'common.json');
  
  if (!existsSync(commonFile)) {
    console.log(`⚠️  跳过 ${lang}：没有 common.json`);
    continue;
  }
  
  try {
    const common = JSON.parse(readFileSync(commonFile, 'utf8'));
    
    // 创建 site.json
    const site = {
      title: common.title || 'moonpacket - Red Packet Bot for Telegram',
      description: common.description || 'Telegram TON、meme、USDT 搶紅包｜提供給 meme 幣專案方、Telegram 群主，最佳拉新、提升活躍的紅包機器人。',
      nav: common.nav || { claim: '領紅包', send: '發紅包' },
      hero: common.hero || {
        title: 'moonpacket，起飛到月球！',
        lead: 'Telegram TON、meme、USDT 搶紅包｜提供給 meme 幣專案方、Telegram 群主，最佳拉新、提升活躍的紅包機器人。',
        cta_primary: '啟動moonpacket',
        cta_secondary: '如何接入'
      },
      features: common.features || {
        title: '核心功能',
        items: [
          { title: '多幣種支援', description: '支援 USDT、TON、SOL、ETH 等主流幣種' },
          { title: '智能分配', description: 'AI 智能分配紅包，提升用戶參與度' },
          { title: '群組管理', description: '支援多群組管理，統一後台操作' }
        ]
      },
      sections: common.sections || { waterfall_title: '紅包瀑布流' },
      footer: common.footer || {
        rights: '© 2025 moonpacket. 版權所有。',
        privacy: '隱私權',
        terms: '使用條款',
        social: {
          telegram_group: 'Telegram 群組',
          telegram_channel: 'Telegram 頻道',
          x: 'X',
          youtube: 'YouTube'
        }
      },
      a11y: common.a11y || {
        skip_to_main: '跳至主要內容',
        language_menu: '開啟語言選單',
        language: '語言'
      },
      metrics: common.metrics || { title: '代幣與統計' },
      errors: common.errors || {
        not_found: '頁面不存在',
        not_found_desc: '抱歉，您訪問的頁面不存在。',
        stale: '數據可能過期'
      }
    };
    
    // 创建 claim.json
    const claim = {
      title: common.claim?.title || '關於領紅包',
      faq: common.claim?.faq || {
        section_1: '1) 開始與資格',
        q1: '如何註冊？',
        a1: '使用啟動我們的機器人（機器人鏈接）就自動完成體驗註冊。',
        q2: '需要什麼資格？',
        a2: '只需要在支持的群組中，並且機器人已經加入該群組。',
        section_2: '2) 領取流程',
        q3: '如何領取紅包？',
        a3: '在群組中看到紅包消息時，點擊「領取」按鈕即可。',
        q4: '領取有限制嗎？',
        a4: '每個紅包每人只能領取一次，先到先得。',
        section_3: '3) 常見問題',
        q5: '為什麼領取失敗？',
        a5: '可能是網絡問題、餘額不足或紅包已被領完。',
        q6: '如何查看領取記錄？',
        a6: '可以在機器人私聊中查看您的領取歷史記錄。'
      }
    };
    
    // 创建 send.json
    const send = {
      title: common.send?.title || '發紅包',
      hero: common.send?.hero || {
        api_demo_label: 'API 演示',
        title: '如何發送紅包',
        lead: '通過簡單的 API 調用，即可在群組中發送紅包',
        points: ['支援多種幣種', '智能分配算法', '實時統計數據'],
        note: '需要先註冊並獲得 API 密鑰'
      },
      faq: common.send?.faq || {
        section_1: '1) 開始與設定',
        q1: '如何獲得 API 密鑰？',
        a1: '註冊後在後台管理頁面可以生成 API 密鑰。',
        q2: '支援哪些幣種？',
        a2: '目前支援 USDT、TON、SOL、ETH 等主流幣種。',
        section_2: '2) 發送流程',
        q3: '如何發送紅包？',
        a3: '調用 API 接口，指定群組、金額、數量等參數。',
        q4: '可以自定義分配方式嗎？',
        a4: '支援隨機分配和平均分配兩種模式。',
        section_3: '3) 技術問題',
        q5: 'API 調用頻率有限制嗎？',
        a5: '每個 API 密鑰每分鐘最多 60 次調用。',
        q6: '如何處理錯誤？',
        a6: 'API 會返回詳細的錯誤碼和錯誤信息。'
      }
    };
    
    // 创建 privacy.json
    const privacy = {
      title: common.privacy?.title || 'Moonpacket 隱私權條款（Privacy Policy）',
      version: common.privacy?.version || 'v1.0.0',
      updated_date: common.privacy?.updated_date || '2025-10-07',
      owner: common.privacy?.owner || 'moonpacket',
      sections: common.privacy?.sections || {
        intro: '簡介',
        definitions: '定義',
        data_collection: '資料收集',
        data_usage: '資料使用',
        data_sharing: '資料分享',
        data_security: '資料安全',
        user_rights: '用戶權利',
        cookies: 'Cookies',
        third_party: '第三方服務',
        changes: '條款變更',
        contact: '聯絡我們'
      }
    };
    
    // 创建 terms.json
    const terms = {
      title: common.terms?.title || 'Moonpacket 使用者條款（Terms of Service）',
      version: common.terms?.version || 'v1.0.0',
      updated_date: common.terms?.updated_date || '2025-10-07',
      owner: common.terms?.owner || 'moonpacket',
      sections: common.terms?.sections || {
        scope: '適用範圍與契約成立',
        definitions: '定義',
        service_description: '服務說明',
        user_obligations: '用戶義務',
        prohibited_activities: '禁止行為',
        intellectual_property: '智慧財產權',
        liability: '責任限制',
        termination: '終止條款',
        governing_law: '準據法',
        dispute_resolution: '爭議解決',
        changes: '條款變更',
        contact: '聯絡我們'
      }
    };
    
    // 创建 waterfall.json
    const waterfall = {
      sent_from: common.waterfall?.sent_from || '發送群：',
      claimed: common.waterfall?.claimed || '領取',
      total: common.waterfall?.total || '總額',
      progress: common.waterfall?.progress || '已領取'
    };
    
    // 写入文件
    writeFileSync(join(langDir, 'site.json'), JSON.stringify(site, null, 2));
    writeFileSync(join(langDir, 'claim.json'), JSON.stringify(claim, null, 2));
    writeFileSync(join(langDir, 'send.json'), JSON.stringify(send, null, 2));
    writeFileSync(join(langDir, 'privacy.json'), JSON.stringify(privacy, null, 2));
    writeFileSync(join(langDir, 'terms.json'), JSON.stringify(terms, null, 2));
    writeFileSync(join(langDir, 'waterfall.json'), JSON.stringify(waterfall, null, 2));
    
    console.log(`✅ ${lang} 模块化文件已生成`);
    
  } catch (error) {
    console.error(`❌ ${lang} 生成失败:`, error.message);
  }
}

console.log('🎉 所有语言的模块化 i18n 文件生成完成！');
