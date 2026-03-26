// Шаблоны промптов для генерации видео (Kling AI)
// Превью: Mixkit бесплатные видео (360p) + Unsplash изображения

export type VideoTemplateTab = 'video' | 'motion' | 'avatar';

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

export type VideoPromptTemplate = {
  id: string;
  tab: VideoTemplateTab;
  category: AnyCategory;
  prompt: string;
  previewUrl: string;      // видео mp4 (360p) или изображение
  posterUrl?: string;       // постер (jpg) — кадр из видео
  isVideo?: boolean;        // true = previewUrl это mp4
  label: { ru: string; sah: string };
};

// Mixkit CDN: бесплатные видео без водяных знаков
const MX = (id: number, res = 360) => `https://assets.mixkit.co/videos/${id}/${id}-${res}.mp4`;
const MX_POSTER = (id: number) => `https://assets.mixkit.co/videos/${id}/${id}-thumb-360-0.jpg`;

// ═══════════════════════════════════════════════════
// VIDEO TAB — Text-to-Video
// ═══════════════════════════════════════════════════
export const VIDEO_TEMPLATES: VideoPromptTemplate[] = [
  // ─── Кино ───
  {
    id: 'v-cine-01', tab: 'video', category: 'cinematic', isVideo: true,
    prompt: 'Shot 1: Wide shot of a moonlit rooftop garden with string lights. A young man in a denim jacket stands near the edge, gazing at the city skyline. Camera slowly dollies forward. Shot 2: Medium shot of a woman in a white sweater emerging from the stairwell. Natural moonlight, cool blue color grading, cinematic realism',
    previewUrl: MX(9808524, 360), posterUrl: MX_POSTER(9808524),
    label: { ru: 'Кинематографическая сцена', sah: 'Кино сцена' },
  },
  {
    id: 'v-cine-02', tab: 'video', category: 'cinematic', isVideo: true,
    prompt: 'A sunlit coastal highway with dramatic cliffs and sparkling ocean, golden hour lighting with long shadows. A sleek red convertible drives at moderate speed. Camera tracks alongside, then pulls back to reveal the expansive coastline. Cinematic 4K, shallow depth of field, vibrant color grading',
    previewUrl: MX(4034, 360), posterUrl: MX_POSTER(4034),
    label: { ru: 'Дорога вдоль океана', sah: 'Океан аарыгар суол' },
  },
  {
    id: 'v-cine-03', tab: 'video', category: 'cinematic', isVideo: true,
    prompt: 'Close-up of raindrops hitting a windowpane, blurring city lights behind. Shallow depth of field, moody amber light. Slow motion water streams down glass. Melancholic cinematic atmosphere, dark city at night, ASMR-like sound design',
    previewUrl: MX(9582, 360), posterUrl: MX_POSTER(9582),
    label: { ru: 'Дождь по стеклу', sah: 'Ардах чааскыга' },
  },
  {
    id: 'v-cine-04', tab: 'video', category: 'cinematic', isVideo: true,
    prompt: 'A time-lapse of a bustling city square at dusk. Camera static wide shot. Shadows lengthen, street lights turn on one by one. People and cars flow like rivers. Vibrant transitioning light from golden to blue, urban documentary style',
    previewUrl: MX(4075, 360), posterUrl: MX_POSTER(4075),
    label: { ru: 'Таймлапс города', sah: 'Куорат таймлапс' },
  },

  // ─── Экшн ───
  {
    id: 'v-act-01', tab: 'video', category: 'action', isVideo: true,
    prompt: 'A skateboarder performs a kickflip in mid-air at a sunlit concrete skatepark. Camera: low angle shot, motion blur trailing the board. Landing with impact. Golden hour backlighting creating silhouette effect, dynamic sports cinematography',
    previewUrl: MX(5961, 360), posterUrl: MX_POSTER(5961),
    label: { ru: 'Экстремальный спорт', sah: 'Экстрим спорт' },
  },
  {
    id: 'v-act-02', tab: 'video', category: 'action', isVideo: true,
    prompt: 'A drone races through a narrow forest path at high speed. First-person perspective, fast panning, sunlight flickering through dense trees. Leaves rustle as it passes. Motion blur on periphery, sharp center focus. FPV footage, morning mist',
    previewUrl: MX(41576, 360), posterUrl: MX_POSTER(41576),
    label: { ru: 'FPV полёт в лесу', sah: 'Тыа иһигэр көтүү' },
  },
  {
    id: 'v-act-03', tab: 'video', category: 'action', isVideo: true,
    prompt: 'A cheetah bursts from tall golden grass, rapid chase across the savanna, dust cloud rising behind. Camera tracks alongside at ground level. Slow motion capturing explosive acceleration. Nature documentary, telephoto compression, warm African light',
    previewUrl: MX(40985, 360), posterUrl: MX_POSTER(40985),
    label: { ru: 'Дикая природа в движении', sah: 'Хамсаныылаах айылҕа' },
  },

  // ─── Природа ───
  {
    id: 'v-nat-01', tab: 'video', category: 'nature', isVideo: true,
    prompt: 'Northern lights aurora borealis dancing over a frozen lake, vibrant green and purple curtains of light. Snow-covered taiga forest in background. Time-lapse smooth movement, ultra-wide angle. Stars visible, reflections on ice. 4K cinematic, peaceful mood',
    previewUrl: MX(4038, 360), posterUrl: MX_POSTER(4038),
    label: { ru: 'Северное сияние', sah: 'Хаҕыс сырдыга' },
  },
  {
    id: 'v-nat-02', tab: 'video', category: 'nature', isVideo: true,
    prompt: 'Cinematic shot of a wooden dock extending into a misty mountain lake at dawn. Camera slowly pushes in. Mist drifts across water. Birds emerge from treeline. Realistic water reflections, gentle lake sounds, contemplative mood, nature documentary',
    previewUrl: MX(2213, 360), posterUrl: MX_POSTER(2213),
    label: { ru: 'Туманное озеро', sah: 'Туманнаах күөл' },
  },
  {
    id: 'v-nat-03', tab: 'video', category: 'nature', isVideo: true,
    prompt: 'Aurora borealis time-lapse over snowy mountains. Green and purple lights undulate across starry sky. Smooth camera pan revealing full mountain range. Snow reflects colored light. Cinematic wide shot, peaceful nocturnal atmosphere',
    previewUrl: MX(4040, 360), posterUrl: MX_POSTER(4040),
    label: { ru: 'Аврора над горами', sah: 'Хайалар үрдүгэр аврора' },
  },

  // ─── Сюрреализм ───
  {
    id: 'v-sur-01', tab: 'video', category: 'surreal', isVideo: true,
    prompt: 'A forest made of crystal trees, glowing with internal ethereal light, reflecting a purple sky. Prismatic light patterns dance on crystalline ground. Camera slowly dolly-in. Particles of light float upward. Surreal, otherworldly, dreamlike color grading',
    previewUrl: MX(14555, 360), posterUrl: MX_POSTER(14555),
    label: { ru: 'Хрустальный лес', sah: 'Хрусталь тыата' },
  },
  {
    id: 'v-sur-02', tab: 'video', category: 'surreal', isVideo: true,
    prompt: 'A humanoid figure composed of swirling smoke, eyes glowing like embers, set against fractured mirrors. Each mirror reflects a different reality. Camera slowly orbits, smoke tendrils reaching outward. Dark dramatic lighting, surreal art film aesthetic',
    previewUrl: MX(4036, 360), posterUrl: MX_POSTER(4036),
    label: { ru: 'Сюрреалистичная сцена', sah: 'Сюрреализм сцена' },
  },

  // ─── Продукт ───
  {
    id: 'v-prod-01', tab: 'video', category: 'product', isVideo: true,
    prompt: 'A gourmet burger assembles in mid-air in dramatic slow-motion. Grilled patty, fresh lettuce, tomato, melting cheese, toasted bun fly into place. Clean studio gradient background, dramatic backlighting, product photography, professional commercial',
    previewUrl: MX(50417, 360), posterUrl: MX_POSTER(50417),
    label: { ru: 'Продуктовый ролик', sah: 'Продукт реклаама' },
  },
  {
    id: 'v-prod-02', tab: 'video', category: 'product', isVideo: true,
    prompt: 'A platinum luxury watch rotates slowly on a black velvet stand. Close-up macro showing intricate dial details, glinting gold accents. Slow 360-degree orbit. High-end product photography, dramatic accent lighting, 4K premium quality',
    previewUrl: MX(50423, 360), posterUrl: MX_POSTER(50423),
    label: { ru: 'Люксовый товар', sah: 'Люкс продукт' },
  },

  // ─── Соцсети ───
  {
    id: 'v-soc-01', tab: 'video', category: 'social', isVideo: true,
    prompt: 'A coffee mug transforms into a rocket taking off against a sunrise backdrop, sparks flying. Camera rapid zoom out revealing cityscape. Bright saturated colors, playful energy, viral short-form style, quick transitions, satisfying loop',
    previewUrl: MX(6102, 360), posterUrl: MX_POSTER(6102),
    label: { ru: 'Вирусный ролик', sah: 'Вирус видео' },
  },
  {
    id: 'v-soc-02', tab: 'video', category: 'social', isVideo: true,
    prompt: 'A playful robot mascot dances through a futuristic city street, holographic advertisements flashing. Dynamic tracking shot. Bright neon colors, fun energetic vibe, TikTok vertical format, catchy loop animation, modern digital aesthetic',
    previewUrl: MX(235, 360), posterUrl: MX_POSTER(235),
    label: { ru: 'Контент для соцсетей', sah: 'Соцсеть контент' },
  },
];

// ═══════════════════════════════════════════════════
// MOTION TAB — Image-to-Video / анимация картинки
// ═══════════════════════════════════════════════════
export const MOTION_TEMPLATES: VideoPromptTemplate[] = [
  // ─── Портрет ───
  {
    id: 'm-port-01', tab: 'motion', category: 'portrait', isVideo: true,
    prompt: 'The person slowly smiles and turns their head slightly to the left. A warm light fades in from that side. Hair moves gently as if caught by a soft breeze. Natural, subtle facial animation, photorealistic skin texture',
    previewUrl: MX(33431, 360), posterUrl: MX_POSTER(33431),
    label: { ru: 'Поворот с улыбкой', sah: 'Күлүмсүрүү' },
  },
  {
    id: 'm-port-02', tab: 'motion', category: 'portrait', isVideo: true,
    prompt: 'The woman closes her eyes, takes a deep breath, then opens them and looks directly at camera with a serene smile. Subtle wind moves her hair. Natural sunlight, realistic fabric movement, gentle breathing animation',
    previewUrl: MX(1535, 360), posterUrl: MX_POSTER(1535),
    label: { ru: 'Вдох и взгляд', sah: 'Тыыныы уонна көрүү' },
  },
  {
    id: 'm-port-03', tab: 'motion', category: 'portrait', isVideo: true,
    prompt: 'The man raises his eyebrows slightly, then gives a confident nod and subtle smirk. Camera slowly pushes in. Professional lighting, sharp focus on eyes, natural micro-expressions, smooth animation',
    previewUrl: MX(4756, 360), posterUrl: MX_POSTER(4756),
    label: { ru: 'Уверенный кивок', sah: 'Итиэхтээх кивок' },
  },
  {
    id: 'm-port-04', tab: 'motion', category: 'portrait', isVideo: true,
    prompt: 'The child looks up with wide curious eyes, then breaks into a bright laugh. Head tilts back slightly. Soft window light catches the face. Warm pastel tones, innocent joyful expression, realistic child animation',
    previewUrl: MX(4825, 360), posterUrl: MX_POSTER(4825),
    label: { ru: 'Детский смех', sah: 'Оҕо күлүүтэ' },
  },

  // ─── Пейзаж ───
  {
    id: 'm-land-01', tab: 'motion', category: 'landscape', isVideo: true,
    prompt: 'Camera slowly tracks right. Clouds drift gently across the sky. Water ripples expand on the lake. Trees sway in light breeze. Subtle parallax between foreground and background layers',
    previewUrl: MX(4038, 360), posterUrl: MX_POSTER(4038),
    label: { ru: 'Оживший пейзаж', sah: 'Тыыннаах ландшафт' },
  },
  {
    id: 'm-land-02', tab: 'motion', category: 'landscape', isVideo: true,
    prompt: 'Aurora borealis slowly undulates across the sky, green and purple colors shifting. Stars twinkle. Snow on mountains catches colored light reflections. Time-lapse cloud movement, peaceful atmosphere',
    previewUrl: MX(4040, 360), posterUrl: MX_POSTER(4040),
    label: { ru: 'Сияние оживает', sah: 'Сырдык тыыннарар' },
  },
  {
    id: 'm-land-03', tab: 'motion', category: 'landscape', isVideo: true,
    prompt: 'Ocean waves crash against rocky shore in rhythmic motion. Sea spray catches sunlight creating brief rainbows. Foam recedes on dark rocks. Camera static, ocean provides all motion. Dramatic coastal cinematography',
    previewUrl: MX(2213, 360), posterUrl: MX_POSTER(2213),
    label: { ru: 'Волны у скал', sah: 'Долгуннар таас аарыгар' },
  },

  // ─── Объект ───
  {
    id: 'm-obj-01', tab: 'motion', category: 'object', isVideo: true,
    prompt: 'The flower petals gently open and sway as if in a breeze. Dewdrops slide slowly down petals. Background shifts from soft to sharp focus. Warm morning light gradually intensifies. Macro photography, delicate natural movement',
    previewUrl: MX(50406, 360), posterUrl: MX_POSTER(50406),
    label: { ru: 'Раскрытие цветка', sah: 'Чэчик арылыыта' },
  },
  {
    id: 'm-obj-02', tab: 'motion', category: 'object', isVideo: true,
    prompt: 'Steam rises gently from the coffee cup. Liquid surface has subtle circular ripples. Background bokeh softly pulses. Camera slowly pushes in. Warm cozy atmosphere, intimate macro detail, morning routine',
    previewUrl: MX(50421, 360), posterUrl: MX_POSTER(50421),
    label: { ru: 'Чашка с паром', sah: 'Буруолаах чааскы' },
  },
  {
    id: 'm-obj-03', tab: 'motion', category: 'object', isVideo: true,
    prompt: 'The luxury watch rotates slowly on display stand. Light glints off crystal face and metal bracelet. Reflections dance on dark surface below. 360-degree smooth orbit, high-end product commercial',
    previewUrl: MX(50423, 360), posterUrl: MX_POSTER(50423),
    label: { ru: 'Вращение продукта', sah: 'Продукт эргиллиитэ' },
  },

  // ─── Арт ───
  {
    id: 'm-art-01', tab: 'motion', category: 'art', isVideo: true,
    prompt: 'The painting comes alive: brushstrokes ripple outward like water. Colors blend and shift between warm and cool tones. Figures begin subtle breathing movements. Oil paint texture preserved, museum lighting, magical realism',
    previewUrl: MX(4036, 360), posterUrl: MX_POSTER(4036),
    label: { ru: 'Ожившая картина', sah: 'Тыыннаах ойуу' },
  },
  {
    id: 'm-art-02', tab: 'motion', category: 'art', isVideo: true,
    prompt: 'The anime character blinks, then gives a determined look. Wind blows through stylized hair. Speed lines appear briefly. Cel-shaded animation style preserved, dynamic anime energy, original art maintained',
    previewUrl: MX(14555, 360), posterUrl: MX_POSTER(14555),
    label: { ru: 'Ожившее аниме', sah: 'Тыыннаах аниме' },
  },
];

// ═══════════════════════════════════════════════════
// AVATAR TAB — говорящая голова / lip-sync
// (Аватары используют фото-превью — загружается фото лица)
// ═══════════════════════════════════════════════════
export const AVATAR_TEMPLATES: VideoPromptTemplate[] = [
  // ─── Бизнес ───
  {
    id: 'a-biz-01', tab: 'avatar', category: 'business', isVideo: true,
    prompt: 'A confident female business coach. Subtle hand gestures to emphasize key points, occasional smiles, direct eye contact. Professional steady tone, medium pace. Clean modern office background',
    previewUrl: MX(40761, 360), posterUrl: MX_POSTER(40761),
    label: { ru: 'Бизнес-тренер', sah: 'Бизнес тренер' },
  },
  {
    id: 'a-biz-02', tab: 'avatar', category: 'business',
    prompt: 'A professional corporate spokesperson with polished appearance. Confident posture, controlled gestures, minimal head movement. Clear enunciation, measured pace. Corporate office background, authoritative composed tone',
    previewUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    label: { ru: 'Корпоративный спикер', sah: 'Корпоратив спикер' },
  },
  {
    id: 'a-biz-03', tab: 'avatar', category: 'business',
    prompt: 'A distinguished male news anchor with neutral professional expression. Subtle head nods for emphasis, steady composure. Locked-off camera, slow clear speech. Formal tone, professional broadcast lighting, photorealistic',
    previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    label: { ru: 'Ведущий новостей', sah: 'Сонуннар ыһааччы' },
  },

  // ─── Обучение ───
  {
    id: 'a-edu-01', tab: 'avatar', category: 'education',
    prompt: 'A patient encouraging teacher with gentle demeanor. Thoughtful pauses after complex information, subtle nods when transitioning topics, warm smiles. Clear articulation, conversational pace. Soft natural classroom lighting',
    previewUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&q=80',
    label: { ru: 'Учитель', sah: 'Учуутал' },
  },
  {
    id: 'a-edu-02', tab: 'avatar', category: 'education',
    prompt: 'A professional physician with calm reassuring presence. Steady thoughtful expression, deliberate hand gestures explaining medical concepts. Clear precise articulation. Clinical setting, soft professional lighting, empathetic confident demeanor',
    previewUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
    label: { ru: 'Врач-консультант', sah: 'Врач-консультант' },
  },
  {
    id: 'a-edu-03', tab: 'avatar', category: 'education',
    prompt: 'A tech expert explaining complex topics simply. Occasional hand gestures drawing concepts in the air, enthusiastic nodding, raised eyebrows for emphasis. Modern minimalist background, clear measured speech',
    previewUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
    label: { ru: 'IT-эксперт', sah: 'IT-эксперт' },
  },

  // ─── Креатив ───
  {
    id: 'a-cre-01', tab: 'avatar', category: 'creative',
    prompt: 'An energetic young vlogger with casual confidence. Frequent hand gestures, expressive facial reactions, head movements for emphasis. Fast-paced conversational speech, friendly tone. Bright modern room, ring light catchlights',
    previewUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
    label: { ru: 'Видеоблогер', sah: 'Видеоблогер' },
  },
  {
    id: 'a-cre-02', tab: 'avatar', category: 'creative',
    prompt: 'An expressive cartoon character avatar with exaggerated facial animations. Wide smiles, animated eyebrow raises, playful gestures. Energetic delivery, enthusiastic tone. Bright colorful background, constant engaging movement',
    previewUrl: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400&q=80',
    label: { ru: 'Мультяшный ведущий', sah: 'Мульт ыһааччы' },
  },
  {
    id: 'a-cre-03', tab: 'avatar', category: 'creative',
    prompt: 'A dramatic storyteller with theatrical expressions. Builds suspense with pauses, wide eyes for surprise, whispers for tension. Dramatic lighting with shadows, intimate close-up framing, captivating narrative delivery',
    previewUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    label: { ru: 'Рассказчик историй', sah: 'Олоңхоһут' },
  },

  // ─── Лайфстайл ───
  {
    id: 'a-life-01', tab: 'avatar', category: 'lifestyle',
    prompt: 'A calm serene wellness coach with peaceful demeanor. Gentle hand movements suggesting relaxation. Soft expressions, subtle smiles, slow measured speech. Warm soft-lit background, sense of tranquility',
    previewUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    label: { ru: 'Тренер по здоровью', sah: 'Доруобуйа тренера' },
  },
  {
    id: 'a-life-02', tab: 'avatar', category: 'lifestyle',
    prompt: 'A friendly fitness instructor with high energy. Big encouraging smile, motivational nods, clapping gestures. Upbeat dynamic speech, gym or outdoor background. Positive supportive tone',
    previewUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    label: { ru: 'Фитнес-тренер', sah: 'Фитнес тренер' },
  },
  {
    id: 'a-life-03', tab: 'avatar', category: 'lifestyle',
    prompt: 'Present with Japanese business etiquette: respectful nodding, minimal dramatic expressions, subtle gestures. Calm measured delivery, polite formal tone. Clean minimalist background, cultural authenticity',
    previewUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    label: { ru: 'Восточный стиль', sah: 'Илин стиль' },
  },
];

export const ALL_VIDEO_TEMPLATES = [...VIDEO_TEMPLATES, ...MOTION_TEMPLATES, ...AVATAR_TEMPLATES];
