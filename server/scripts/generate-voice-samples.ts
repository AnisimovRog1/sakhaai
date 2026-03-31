// Одноразовый скрипт: генерирует аудио-сэмплы всех голосов через fal.ai TTS
// Запуск: npx ts-node scripts/generate-voice-samples.ts

import 'dotenv/config';
import { fal } from '@fal-ai/client';
import * as fs from 'fs';
import * as path from 'path';

fal.config({ credentials: process.env.FAL_KEY! });

const SAMPLE_TEXT = 'Привет! Мой голос звучит так, могу озвучить любой текст для вашего видео';

const VOICES = [
  { name: 'David',       voiceId: 'oversea_male1' },
  { name: 'James',       voiceId: 'uk_boy1' },
  { name: 'Arthur',      voiceId: 'uk_man2' },
  { name: 'George',      voiceId: 'uk_oldman3' },
  { name: 'Marcus',      voiceId: 'reader_en_m-v1' },
  { name: 'Sophia',      voiceId: 'commercial_lady_en_f-v1' },
  { name: 'Vindi',       voiceId: 'genshin_vindi2' },
  { name: 'Klee',        voiceId: 'genshin_klee2' },
  { name: 'Kirara',      voiceId: 'genshin_kirara' },
  { name: 'Kaiya',       voiceId: 'ai_kaiya' },
  { name: 'Titan',       voiceId: 'AOT' },
  { name: 'Peppa',       voiceId: 'PeppaPig_platform' },
  { name: 'Luna',        voiceId: 'chat1_female_new-3' },
  { name: 'Mia',         voiceId: 'chat_0407_5-1' },
  { name: 'Lily',        voiceId: 'girlfriend_1_speech02' },
  { name: 'Rose',        voiceId: 'girlfriend_2_speech02' },
  { name: 'Amy',         voiceId: 'girlfriend_4_speech02' },
  { name: 'Chloe',       voiceId: 'cartoon-girl-01' },
  { name: 'Sophie',      voiceId: 'chengshu_jiejie' },
  { name: 'Grace',       voiceId: 'you_pingjing' },
  { name: 'Nana',        voiceId: 'heainainai_speech02' },
  { name: 'Sweetie',     voiceId: 'tianmeixuemei-v1' },
  { name: 'Baby',        voiceId: 'mengwa-v1' },
  { name: 'Alex',        voiceId: 'ai_chenjiahao_712' },
  { name: 'Leo',         voiceId: 'cartoon-boy-07' },
  { name: 'Max',         voiceId: 'tiyuxi_xuedi' },
  { name: 'Ryan',        voiceId: 'tiexin_nanyou' },
  { name: 'Oliver',      voiceId: 'ai_shatang' },
  { name: 'Henry',       voiceId: 'ai_huangzhong_712' },
  { name: 'Victor',      voiceId: 'ai_huangyaoshi_712' },
  { name: 'Walter',      voiceId: 'ai_laoguowang_712' },
  { name: 'Bass',        voiceId: 'diyinnansang_DB_CN_M_04-v2' },
  { name: 'Narrator',    voiceId: 'yizhipiannan-v1' },
  { name: 'Reporter',    voiceId: 'guanxiaofang-v2' },
  { name: 'Villain',     voiceId: 'daopianyansang-v1' },
  { name: 'Storyteller', voiceId: 'calm_story1' },
  { name: 'Student',     voiceId: 'zhinen_xuesheng' },
  { name: 'Anchor',      voiceId: 'zhuxi_speech02' },
  { name: 'Granny',      voiceId: 'laopopo_speech02' },
  { name: 'Northeast',   voiceId: 'dongbeilaotie_speech02' },
  { name: 'Chongqing',   voiceId: 'chongqingxiaohuo_speech02' },
  { name: 'Sichuan',     voiceId: 'chuanmeizi_speech02' },
  { name: 'Cantonese',   voiceId: 'chaoshandashu_speech02' },
  { name: 'Taiwan',      voiceId: 'ai_taiwan_man2_speech02' },
  { name: 'Shopkeeper',  voiceId: 'xianzhanggui_speech02' },
  { name: 'Tianjin',     voiceId: 'tianjinjiejie_speech02' },
];

const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'voice-samples.json');

async function generateSample(voice: { name: string; voiceId: string }): Promise<string | null> {
  try {
    const result = await fal.subscribe('fal-ai/kling-video/v1/tts', {
      input: {
        text: SAMPLE_TEXT,
        voice_id: voice.voiceId as any,
        voice_speed: 1.0,
      },
      timeout: 120_000,
    });
    const data = result.data as any;
    const audioUrl = data.audio?.url;
    if (!audioUrl) {
      console.error(`  ✗ ${voice.name} (${voice.voiceId}) — пустой URL`);
      return null;
    }
    console.log(`  ✓ ${voice.name} (${voice.voiceId})`);
    return audioUrl;
  } catch (e: any) {
    console.error(`  ✗ ${voice.name} (${voice.voiceId}) — ${e.message}`);
    return null;
  }
}

async function main() {
  if (!process.env.FAL_KEY) {
    console.error('FAL_KEY не задан! Запусти: FAL_KEY=... npx ts-node scripts/generate-voice-samples.ts');
    process.exit(1);
  }

  console.log(`Генерация сэмплов для ${VOICES.length} голосов...\n`);

  const samples: Record<string, string> = {};
  let success = 0;
  let failed = 0;

  // Генерируем по 5 параллельно чтобы не перегружать API
  for (let i = 0; i < VOICES.length; i += 5) {
    const batch = VOICES.slice(i, i + 5);
    const results = await Promise.all(batch.map(v => generateSample(v)));
    batch.forEach((voice, idx) => {
      if (results[idx]) {
        samples[voice.voiceId] = results[idx]!;
        success++;
      } else {
        failed++;
      }
    });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(samples, null, 2));
  console.log(`\nГотово! ${success} успешно, ${failed} ошибок`);
  console.log(`Сохранено: ${OUTPUT_PATH}`);
}

main();
