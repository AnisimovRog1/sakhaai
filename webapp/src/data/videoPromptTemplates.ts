// Шаблоны промптов для генерации видео (Kling AI)
// Отдельные наборы для каждой вкладки: Video, Motion, Avatar

export type VideoTemplateTab = 'video' | 'motion' | 'avatar';

// ─── Категории по вкладкам ───

export type VideoCat = 'cinematic' | 'action' | 'nature' | 'surreal' | 'product' | 'social';
export type MotionCat = 'portrait' | 'landscape' | 'object' | 'art';
export type AvatarCat = 'business' | 'education' | 'creative' | 'lifestyle';

export type AnyCategory = VideoCat | MotionCat | AvatarCat | 'all';

export type CategoryDef = { id: AnyCategory; labelRu: string; labelSah: string };

export const VIDEO_TAB_CATEGORIES: CategoryDef[] = [
  { id: 'all',        labelRu: 'Все',         labelSah: 'Барыта' },
  { id: 'cinematic',  labelRu: 'Кино',        labelSah: 'Кино' },
  { id: 'action',     labelRu: 'Экшн',        labelSah: 'Экшн' },
  { id: 'nature',     labelRu: 'Природа',     labelSah: 'Айылҕа' },
  { id: 'surreal',    labelRu: 'Сюрреализм',  labelSah: 'Сюрреализм' },
  { id: 'product',    labelRu: 'Продукт',     labelSah: 'Продукт' },
  { id: 'social',     labelRu: 'Соцсети',     labelSah: 'Соцсети' },
];

export const MOTION_TAB_CATEGORIES: CategoryDef[] = [
  { id: 'all',        labelRu: 'Все',         labelSah: 'Барыта' },
  { id: 'portrait',   labelRu: 'Портрет',     labelSah: 'Портрет' },
  { id: 'landscape',  labelRu: 'Пейзаж',      labelSah: 'Ландшафт' },
  { id: 'object',     labelRu: 'Объект',       labelSah: 'Объект' },
  { id: 'art',        labelRu: 'Арт',          labelSah: 'Арт' },
];

export const AVATAR_TAB_CATEGORIES: CategoryDef[] = [
  { id: 'all',        labelRu: 'Все',         labelSah: 'Барыта' },
  { id: 'business',   labelRu: 'Бизнес',      labelSah: 'Бизнес' },
  { id: 'education',  labelRu: 'Обучение',    labelSah: 'Үөрэтии' },
  { id: 'creative',   labelRu: 'Креатив',     labelSah: 'Креатив' },
  { id: 'lifestyle',  labelRu: 'Лайфстайл',   labelSah: 'Олоҕу кэрэ' },
];

// ─── Тип шаблона ───

export type VideoPromptTemplate = {
  id: string;
  tab: VideoTemplateTab;
  category: AnyCategory;
  prompt: string;
  previewUrl: string;
  label: { ru: string; sah: string };
};

// ═══════════════════════════════════════════════════
// VIDEO TAB — Text-to-Video промпты
// ═══════════════════════════════════════════════════

export const VIDEO_TEMPLATES: VideoPromptTemplate[] = [
  // ─── Кино ───
  {
    id: 'v-cine-01',
    tab: 'video',
    category: 'cinematic',
    prompt: 'Shot 1: Wide shot of a moonlit rooftop garden with string lights. A young man in a denim jacket stands near the edge, gazing at the city skyline. Camera slowly dollies forward. Shot 2: Medium shot of a woman in a white sweater emerging from the stairwell. Natural moonlight, cool blue color grading, gentle night breeze, cinematic realism',
    previewUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400&q=80',
    label: { ru: 'Встреча на крыше', sah: 'Крыша үрдүнэн көрсүһүү' },
  },
  {
    id: 'v-cine-02',
    tab: 'video',
    category: 'cinematic',
    prompt: 'A sunlit coastal highway with dramatic cliffs on one side and sparkling ocean on the other, golden hour lighting with long shadows. A sleek red convertible sports car with chrome wheels. Camera tracks alongside the car at moderate speed, then gradually pulls back to reveal the expansive coastline. Cinematic 4K, shallow depth of field, vibrant color grading',
    previewUrl: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=400&q=80',
    label: { ru: 'Дорога вдоль океана', sah: 'Океан аарыгар суол' },
  },
  {
    id: 'v-cine-03',
    tab: 'video',
    category: 'cinematic',
    prompt: 'Close-up of a raindrop hitting a windowpane, blurring the city lights behind. Camera: shallow depth of field, moody amber light. Slow motion, water streams down the glass. Melancholic cinematic atmosphere, dark city at night visible through rain-soaked window, ASMR-like sound design',
    previewUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e39ac38?w=400&q=80',
    label: { ru: 'Дождь по стеклу', sah: 'Ардах чааскыга' },
  },
  {
    id: 'v-cine-04',
    tab: 'video',
    category: 'cinematic',
    prompt: 'Medium tracking shot through busy international airport arrivals. 0-4s: A young woman in a leather jacket walks briskly, scanning the crowd. 5-9s: She spots someone ahead, pace quickens. 10-13s: Close-up as her eyes light up. 14-15s: Wide shot as she drops suitcase and runs into an embrace, camera slowly orbiting. Warm skin tones, natural airport ambience',
    previewUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400&q=80',
    label: { ru: 'Встреча в аэропорту', sah: 'Аэропортка көрсүһүү' },
  },

  // ─── Экшн ───
  {
    id: 'v-act-01',
    tab: 'video',
    category: 'action',
    prompt: 'A skateboarder performs a kickflip in mid-air at a sunlit concrete skatepark. Camera: low angle shot capturing the underside of the board, motion blur trailing. Landing with impact, crowd cheering in distance. Golden hour backlighting creating silhouette effect, dynamic sports cinematography',
    previewUrl: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=400&q=80',
    label: { ru: 'Кикфлип на скейте', sah: 'Скейт кикфлип' },
  },
  {
    id: 'v-act-02',
    tab: 'video',
    category: 'action',
    prompt: 'A cheetah bursts from tall golden grass, rapid chase across the savanna, dust cloud rising behind it. Camera tracks alongside at ground level. Prey visible in distance. Slow motion capturing muscle detail and explosive acceleration. Nature documentary style, telephoto lens compression, warm African light',
    previewUrl: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=400&q=80',
    label: { ru: 'Погоня гепарда', sah: 'Гепард сүүрүүтэ' },
  },
  {
    id: 'v-act-03',
    tab: 'video',
    category: 'action',
    prompt: 'A drone races through a narrow forest path at high speed. Camera: first-person perspective, fast panning, sunlight flickering through dense trees. Leaves rustle as the drone passes. Motion blur on periphery, sharp center focus. Adrenaline-fueled FPV footage, morning mist between trees',
    previewUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80',
    label: { ru: 'Полёт дрона в лесу', sah: 'Дрон тыа иһигэр' },
  },

  // ─── Природа ───
  {
    id: 'v-nat-01',
    tab: 'video',
    category: 'nature',
    prompt: 'Northern lights aurora borealis dancing over a frozen Yakutian lake, vibrant green and purple curtains of light. Snow-covered taiga forest in background. Time-lapse smooth movement, ultra-wide angle. Stars visible, reflections on ice surface. 4K cinematic, peaceful ambient mood',
    previewUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80',
    label: { ru: 'Северное сияние', sah: 'Хаҕыс сырдыга' },
  },
  {
    id: 'v-nat-02',
    tab: 'video',
    category: 'nature',
    prompt: 'Cinematic shot of a wooden dock extending into a misty mountain lake at dawn. Camera slowly pushes in. Mist drifts across water surface. Birds emerge from treeline. 4K quality, realistic water reflections, soft morning mist, gentle lake sounds, contemplative mood, nature documentary',
    previewUrl: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&q=80',
    label: { ru: 'Туманное озеро', sah: 'Туманнаах күөл' },
  },
  {
    id: 'v-nat-03',
    tab: 'video',
    category: 'nature',
    prompt: 'Vibrant coral reef teeming with tropical fish. Camera slowly descends through crystal-clear blue water, revealing bioluminescent creatures in the deepening darkness. Floating plankton particles. Peaceful meditative mood, slow panning, natural ocean lighting, documentary realism',
    previewUrl: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400&q=80',
    label: { ru: 'Подводный мир', sah: 'Уу аннынааҕы дойду' },
  },

  // ─── Сюрреализм ───
  {
    id: 'v-sur-01',
    tab: 'video',
    category: 'surreal',
    prompt: 'A forest made of crystal trees, glowing with internal ethereal light, reflecting a purple sky. Prismatic light patterns dance on crystalline ground. Camera slowly dolly-in through the forest. Particles of light float upward. Surreal, otherworldly aesthetic, dreamlike color grading',
    previewUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    label: { ru: 'Хрустальный лес', sah: 'Хрусталь тыата' },
  },
  {
    id: 'v-sur-02',
    tab: 'video',
    category: 'surreal',
    prompt: 'A humanoid figure composed entirely of swirling smoke, eyes glowing like embers, set against a backdrop of fractured mirrors. Each mirror reflects a different reality. Camera slowly orbits the figure, smoke tendrils reaching outward. Dark, dramatic lighting, surreal art film aesthetic',
    previewUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&q=80',
    label: { ru: 'Дымная фигура', sah: 'Буруо киһи' },
  },
  {
    id: 'v-sur-03',
    tab: 'video',
    category: 'surreal',
    prompt: 'A city skyline built from floating books, their pages turning and becoming clouds drifting overhead. Watercolor painting style gradually transitioning to photorealism. Camera ascends through the book towers. Soft golden light, whimsical magical atmosphere, imaginative composition',
    previewUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80',
    label: { ru: 'Город из книг', sah: 'Кинигэ куорат' },
  },

  // ─── Продукт ───
  {
    id: 'v-prod-01',
    tab: 'video',
    category: 'product',
    prompt: 'A gourmet burger assembles in mid-air in dramatic slow-motion. Grilled patty, fresh lettuce, tomato, melting cheese, toasted bun — fly into place from different directions. Clean studio gradient background, dramatic backlighting, product photography, professional commercial quality',
    previewUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    label: { ru: 'Бургер в полёте', sah: 'Бургер көтөн' },
  },
  {
    id: 'v-prod-02',
    tab: 'video',
    category: 'product',
    prompt: 'Soft morning light fills a minimalist bathroom with white marble. Camera glides across counter toward an elegant frosted glass bottle. Embossed gold lettering visible. Hand reaches for bottle, dispenses product. Steam in background, water droplets on glass. Luxurious spa atmosphere, professional product cinematography',
    previewUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80',
    label: { ru: 'Рекламный ролик', sah: 'Реклаама' },
  },

  // ─── Соцсети ───
  {
    id: 'v-soc-01',
    tab: 'video',
    category: 'social',
    prompt: 'A coffee mug transforms into a rocket taking off against a sunrise backdrop, sparks flying, steam trail behind. Camera: rapid zoom out revealing cityscape below. Bright saturated colors, playful energy, viral short-form content style, quick dynamic transitions, satisfying loop',
    previewUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    label: { ru: 'Кофе-ракета', sah: 'Кофе ракета' },
  },
  {
    id: 'v-soc-02',
    tab: 'video',
    category: 'social',
    prompt: 'A playful robot mascot dances through a futuristic city street, holographic advertisements flashing around. Camera: dynamic tracking shot with tilt. Bright neon colors, fun energetic vibe, TikTok-ready vertical format, catchy loop animation, modern digital aesthetic',
    previewUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80',
    label: { ru: 'Танцующий робот', sah: 'Тэгэллиир робот' },
  },
];

// ═══════════════════════════════════════════════════
// MOTION TAB — Image-to-Video / анимация картинки
// ═══════════════════════════════════════════════════

export const MOTION_TEMPLATES: VideoPromptTemplate[] = [
  // ─── Портрет ───
  {
    id: 'm-port-01',
    tab: 'motion',
    category: 'portrait',
    prompt: 'The person slowly smiles and turns their head slightly to the left. A warm light fades in from that side. Hair moves gently as if caught by a soft breeze. Natural, subtle facial animation, photorealistic skin texture',
    previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    label: { ru: 'Поворот с улыбкой', sah: 'Күлүмсүрүү' },
  },
  {
    id: 'm-port-02',
    tab: 'motion',
    category: 'portrait',
    prompt: 'The woman closes her eyes, takes a deep breath, then opens them and looks directly at camera with a serene smile. Subtle wind moves her hair. Natural sunlight, realistic fabric movement, gentle breathing animation',
    previewUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    label: { ru: 'Вдох и взгляд', sah: 'Тыыныы уонна көрүү' },
  },
  {
    id: 'm-port-03',
    tab: 'motion',
    category: 'portrait',
    prompt: 'The man raises his eyebrows slightly, then gives a confident nod and a subtle smirk. Camera slowly pushes in. Professional lighting, sharp focus on eyes, natural micro-expressions, smooth animation',
    previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    label: { ru: 'Уверенный кивок', sah: 'Итиэхтээх кивок' },
  },
  {
    id: 'm-port-04',
    tab: 'motion',
    category: 'portrait',
    prompt: 'The child looks up with wide curious eyes, then breaks into a bright laugh. Head tilts back slightly. Soft window light catches the face. Warm pastel tones, innocent joyful expression, realistic child animation',
    previewUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
    label: { ru: 'Детский смех', sah: 'Оҕо күлүүтэ' },
  },

  // ─── Пейзаж ───
  {
    id: 'm-land-01',
    tab: 'motion',
    category: 'landscape',
    prompt: 'Camera slowly tracks right maintaining the composition. Clouds drift gently across the sky. Water ripples expand on the lake surface. Trees sway in light breeze. Subtle parallax movement between foreground and background layers',
    previewUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    label: { ru: 'Оживший пейзаж', sah: 'Тыыннаах ландшафт' },
  },
  {
    id: 'm-land-02',
    tab: 'motion',
    category: 'landscape',
    prompt: 'Aurora borealis slowly undulates across the sky, green and purple colors shifting. Stars twinkle. Snow on mountains catches the colored light reflections. Time-lapse cloud movement, peaceful atmosphere, natural night lighting',
    previewUrl: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=400&q=80',
    label: { ru: 'Сияние оживает', sah: 'Сырдык тыыннарар' },
  },
  {
    id: 'm-land-03',
    tab: 'motion',
    category: 'landscape',
    prompt: 'Ocean waves crash against rocky shore in rhythmic motion. Sea spray catches sunlight creating brief rainbows. Foam recedes on dark rocks. Camera static, the ocean itself provides all motion. Dramatic natural power, coastal cinematography',
    previewUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80',
    label: { ru: 'Волны у скал', sah: 'Долгуннар таас аарыгар' },
  },

  // ─── Объект ───
  {
    id: 'm-obj-01',
    tab: 'motion',
    category: 'object',
    prompt: 'The flower petals gently open and sway as if in a breeze. Dewdrops slide slowly down the petals. Background shifts from soft focus to sharp. Warm morning light gradually intensifies. Macro photography animation, delicate natural movement',
    previewUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&q=80',
    label: { ru: 'Раскрытие цветка', sah: 'Чэчик арылыыта' },
  },
  {
    id: 'm-obj-02',
    tab: 'motion',
    category: 'object',
    prompt: 'Steam rises gently from the coffee cup. Liquid surface has subtle circular ripples. Background bokeh lights softly pulse. Camera slowly pushes in. Warm cozy atmosphere, intimate macro detail, morning routine aesthetic',
    previewUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
    label: { ru: 'Чашка с паром', sah: 'Буруолаах чааскы' },
  },
  {
    id: 'm-obj-03',
    tab: 'motion',
    category: 'object',
    prompt: 'The luxury watch rotates slowly on its display stand. Light glints off the crystal face and metal bracelet at different angles. Reflections dance on the dark surface below. 360-degree smooth orbit animation, high-end product commercial',
    previewUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80',
    label: { ru: 'Вращение часов', sah: 'Чаас эргиллиитэ' },
  },

  // ─── Арт ───
  {
    id: 'm-art-01',
    tab: 'motion',
    category: 'art',
    prompt: 'The painting comes alive: brushstrokes ripple outward like water. Colors blend and shift between warm and cool tones. Figures in the artwork begin subtle breathing movements. Oil paint texture preserved, museum gallery lighting, magical realism',
    previewUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80',
    label: { ru: 'Ожившая картина', sah: 'Тыыннаах ойуу' },
  },
  {
    id: 'm-art-02',
    tab: 'motion',
    category: 'art',
    prompt: 'The manga character blinks, then gives a determined look. Wind blows through stylized hair. Speed lines appear briefly in background. Cel-shaded animation style preserved, dynamic anime energy, original art style maintained',
    previewUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80',
    label: { ru: 'Ожившее аниме', sah: 'Тыыннаах аниме' },
  },
];

// ═══════════════════════════════════════════════════
// AVATAR TAB — говорящая голова / lip-sync
// ═══════════════════════════════════════════════════

export const AVATAR_TEMPLATES: VideoPromptTemplate[] = [
  // ─── Бизнес ───
  {
    id: 'a-biz-01',
    tab: 'avatar',
    category: 'business',
    prompt: 'A confident female business coach. Subtle hand gestures to emphasize key points, occasional smiles, direct eye contact. Professional steady tone, medium pace. Clean modern office background',
    previewUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    label: { ru: 'Бизнес-тренер', sah: 'Бизнес тренер' },
  },
  {
    id: 'a-biz-02',
    tab: 'avatar',
    category: 'business',
    prompt: 'A professional corporate spokesperson with polished appearance. Confident posture, controlled gestures, minimal head movement. Clear enunciation at measured pace. Corporate office background, authoritative composed tone',
    previewUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    label: { ru: 'Корпоративный спикер', sah: 'Корпоратив спикер' },
  },
  {
    id: 'a-biz-03',
    tab: 'avatar',
    category: 'business',
    prompt: 'A distinguished male news anchor with neutral professional expression. Subtle head nods for emphasis, steady composure. Locked-off camera, slow clear speech delivery. Formal tone, professional broadcast lighting, photorealistic',
    previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    label: { ru: 'Ведущий новостей', sah: 'Сонуннар ыһааччы' },
  },

  // ─── Обучение ───
  {
    id: 'a-edu-01',
    tab: 'avatar',
    category: 'education',
    prompt: 'A patient encouraging teacher with gentle demeanor. Thoughtful pauses after complex information, subtle nods when transitioning topics, warm smiles. Clear articulation, conversational pace, approachable tone. Soft natural classroom lighting',
    previewUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&q=80',
    label: { ru: 'Учитель', sah: 'Учуутал' },
  },
  {
    id: 'a-edu-02',
    tab: 'avatar',
    category: 'education',
    prompt: 'A professional physician with calm reassuring presence. Steady thoughtful expression, deliberate hand gestures explaining medical concepts. Clear precise articulation. Clinical setting with soft professional lighting, empathetic confident demeanor',
    previewUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
    label: { ru: 'Врач-консультант', sah: 'Врач-консультант' },
  },
  {
    id: 'a-edu-03',
    tab: 'avatar',
    category: 'education',
    prompt: 'A tech expert explaining complex topics simply. Occasional hand gestures drawing concepts in the air, enthusiastic nodding, raised eyebrows for emphasis. Modern minimalist background with subtle tech elements, clear measured speech',
    previewUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
    label: { ru: 'IT-эксперт', sah: 'IT-эксперт' },
  },

  // ─── Креатив ───
  {
    id: 'a-cre-01',
    tab: 'avatar',
    category: 'creative',
    prompt: 'An energetic young vlogger with casual confidence. Frequent hand gestures, expressive facial reactions, head movements for emphasis. Fast-paced conversational speech, friendly excited tone. Bright modern room background, ring light catchlights in eyes',
    previewUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
    label: { ru: 'Видеоблогер', sah: 'Видеоблогер' },
  },
  {
    id: 'a-cre-02',
    tab: 'avatar',
    category: 'creative',
    prompt: 'An expressive cartoon character avatar with exaggerated facial animations. Wide smiles, animated eyebrow raises, light head tilts, playful gestures. Fast-paced energetic delivery, enthusiastic tone. Bright colorful background, constant engaging movement',
    previewUrl: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400&q=80',
    label: { ru: 'Мультяшный ведущий', sah: 'Мульт ыһааччы' },
  },
  {
    id: 'a-cre-03',
    tab: 'avatar',
    category: 'creative',
    prompt: 'A dramatic storyteller with theatrical expressions. Builds suspense with pauses, uses wide eyes for surprise moments, whispers for tension. Dramatic lighting with shadows, intimate close-up framing, captivating narrative delivery',
    previewUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    label: { ru: 'Рассказчик историй', sah: 'Олоңхоһут' },
  },

  // ─── Лайфстайл ───
  {
    id: 'a-life-01',
    tab: 'avatar',
    category: 'lifestyle',
    prompt: 'A calm serene wellness coach with peaceful demeanor. Gentle hand movements suggesting relaxation. Soft expressions, subtle smiles, slow measured speech. Warm soft-lit background, create sense of tranquility and wellbeing throughout',
    previewUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    label: { ru: 'Тренер по здоровью', sah: 'Доруобуйа тренера' },
  },
  {
    id: 'a-life-02',
    tab: 'avatar',
    category: 'lifestyle',
    prompt: 'A friendly fitness instructor with high energy. Big encouraging smile, motivational nods, clapping gestures. Upbeat dynamic speech, gym or outdoor background. Maintain positive supportive tone, natural athletic appearance',
    previewUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    label: { ru: 'Фитнес-тренер', sah: 'Фитнес тренер' },
  },
  {
    id: 'a-life-03',
    tab: 'avatar',
    category: 'lifestyle',
    prompt: 'Present with Japanese business etiquette: respectful nodding, minimal dramatic expressions, subtle gestures. Calm measured delivery, polite formal tone. Clean minimalist background, soft even lighting, cultural authenticity preserved',
    previewUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    label: { ru: 'Восточный стиль', sah: 'Илин стиль' },
  },
];

// ─── Объединённый массив для удобства ───
export const ALL_VIDEO_TEMPLATES = [...VIDEO_TEMPLATES, ...MOTION_TEMPLATES, ...AVATAR_TEMPLATES];
