// Шаблоны промптов для генерации видео (Kling AI)
// Motion: Higgsfield CDN (36 пресетов Kling Motion Control)
// Avatar: Kling CDN (13 пресетов Avatar)
// Video: Mixkit CDN (бесплатные stock видео)

export type VideoTemplateTab = 'video' | 'motion' | 'avatar';

export type VideoCat = 'cinematic' | 'action' | 'nature' | 'surreal' | 'product' | 'social';
export type MotionCat = 'all';
export type AvatarCat = 'all';
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

// Motion и Avatar — без подкатегорий (единая галерея пресетов)
export const MOTION_TAB_CATEGORIES: CategoryDef[] = [
  { id: 'all', labelRu: 'Все движения', labelSah: 'Барыта хамсаныылар' },
];

export const AVATAR_TAB_CATEGORIES: CategoryDef[] = [
  { id: 'all', labelRu: 'Все аватары', labelSah: 'Барыта аватарлар' },
];

export type VideoPromptTemplate = {
  id: string;
  tab: VideoTemplateTab;
  category: AnyCategory;
  prompt: string;
  previewUrl: string;
  posterUrl?: string;
  isVideo?: boolean;
  label: { ru: string; sah: string };
};

// CDN helpers
const MX = (id: number, res = 360) => `https://assets.mixkit.co/videos/${id}/${id}-${res}.mp4`;
const MX_POSTER = (id: number) => `https://assets.mixkit.co/videos/${id}/${id}-thumb-360-0.jpg`;
const HF = (uuid: string) => `https://cdn.higgsfield.ai/kling_motion_control_preset/${uuid}.mp4`;
const KA = (name: string) => `https://v15-kling.klingai.com/bs2/upload-ylab-stunt-sgp/kling/digital/video/${name}.mp4?x-kcdn-pid=112372`;

// ═══════════════════════════════════════════════════
// VIDEO TAB — Text-to-Video (Mixkit stock видео)
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
    prompt: 'A time-lapse of a bustling city square at dusk. Camera static wide shot. Shadows lengthen, street lights turn on. People and cars flow like rivers. Vibrant transitioning light from golden to blue, urban documentary style',
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
// MOTION TAB — Higgsfield Kling Motion Control (36 пресетов)
// ═══════════════════════════════════════════════════
export const MOTION_TEMPLATES: VideoPromptTemplate[] = [
  {
    id: 'm-01', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Copy motion from this video reference and apply to your character. Kling Motion Control preserves identity while transferring movement, expression and pacing',
    previewUrl: 'https://static.higgsfield.ai/v2-fnf-web-kmc-preset.mp4',
    label: { ru: 'Motion Control демо', sah: 'Motion Control демо' },
  },
  {
    id: 'm-02', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Character performs natural walking and posing movements. AI transfers body motion to your static character while maintaining their identity',
    previewUrl: 'https://d2ol7oe51mr4n9.cloudfront.net/content_user_id/b7b19f6b-820c-49fb-81a5-358847ffbbe5.mp4',
    label: { ru: 'Ходьба и позирование', sah: 'Сылдьыы уонна позирование' },
  },
  {
    id: 'm-03', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Stylish casual walk with confident body language. Character moves naturally through the scene',
    previewUrl: HF('7c764ec1-9343-48dd-a300-8fb7b2be09a5'),
    label: { ru: 'Уверенная походка', sah: 'Итиэхтээх сылдьыы' },
  },
  {
    id: 'm-04', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Dynamic dance movements with expressive body language. Full body motion capture',
    previewUrl: HF('55f89edc-767d-49ca-aad3-6ce882b6ee72'),
    label: { ru: 'Танцевальные движения', sah: 'Тэгэлтэ хамсаныылар' },
  },
  {
    id: 'm-05', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Casual street style pose and turn. Natural body movement with fashion vibe',
    previewUrl: HF('c6295691-22c7-47ae-9a52-0922358ca984'),
    label: { ru: 'Уличный стиль', sah: 'Уулусса стиль' },
  },
  {
    id: 'm-06', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Energetic performance with hand gestures and head movements. Expressive character animation',
    previewUrl: HF('e05ab9a7-bd13-4098-9768-100d89dc53ce'),
    label: { ru: 'Энергичное выступление', sah: 'Күүстээх көрдөрүү' },
  },
  {
    id: 'm-07', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Smooth choreographed dance sequence. Professional movement quality',
    previewUrl: HF('45722083-63ea-41fb-9c41-956abf7a5f9d'),
    label: { ru: 'Хореография', sah: 'Хореография' },
  },
  {
    id: 'm-08', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Playful interaction with camera. Character shows personality through gestures and expressions',
    previewUrl: HF('f3f1068f-60f7-49d9-8256-4ed09c4d20a6'),
    label: { ru: 'Игра с камерой', sah: 'Камераны оонньуу' },
  },
  {
    id: 'm-09', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Athletic movement sequence. Running, jumping or sports action',
    previewUrl: HF('38a58318-780d-41c8-98e8-190106e54eb0'),
    label: { ru: 'Спортивное движение', sah: 'Спорт хамсаныы' },
  },
  {
    id: 'm-10', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Dramatic slow reveal. Character turns to camera with cinematic pacing',
    previewUrl: HF('b7d972dc-fa4b-4024-8158-e3ad85bfb5df'),
    label: { ru: 'Драматический поворот', sah: 'Драматическай эргиллии' },
  },
  {
    id: 'm-11', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Fashion runway walk. Model struts with professional posture and attitude',
    previewUrl: HF('d9d7ea02-fdcc-475a-a53e-d3353a8b866e'),
    label: { ru: 'Подиумная походка', sah: 'Подиум сылдьыыта' },
  },
  {
    id: 'm-12', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Freestyle dance with hip-hop elements. Urban street dance vibe',
    previewUrl: HF('c1571011-b5f8-4cd0-98d1-149be80bd21a'),
    label: { ru: 'Хип-хоп фристайл', sah: 'Хип-хоп фристайл' },
  },
  {
    id: 'm-13', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Gentle waving and greeting gesture. Friendly character introduction',
    previewUrl: HF('062dcd0d-2b81-4e82-8757-8bb1cd491581'),
    label: { ru: 'Приветственный жест', sah: 'Эҕэрдэ хамсаныы' },
  },
  {
    id: 'm-14', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Dynamic action pose sequence. Character strikes powerful poses',
    previewUrl: HF('22287793-7664-4802-b0a3-ba8c0f65f994'),
    label: { ru: 'Экшн-позы', sah: 'Экшн позалар' },
  },
  {
    id: 'm-15', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Smooth transition between standing poses. Fashion editorial movement',
    previewUrl: HF('1c1ad507-fd7e-45eb-8f20-5436d3e3f238'),
    label: { ru: 'Смена поз', sah: 'Поза уларыйыыта' },
  },
  {
    id: 'm-16', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Expressive talking with animated hand gestures. Vlog-style presentation',
    previewUrl: HF('f232909a-5eff-4515-9547-5478a7c48616'),
    label: { ru: 'Жестикуляция', sah: 'Илии хамсаныылара' },
  },
  {
    id: 'm-17', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Spinning around with flowing outfit. 360-degree character reveal',
    previewUrl: HF('1f72d445-36d9-4df6-90e2-b09c299b9de9'),
    label: { ru: 'Кружение', sah: 'Эргиллии' },
  },
  {
    id: 'm-18', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Sitting down and standing up movement. Natural everyday action',
    previewUrl: HF('1ad056fe-79aa-4347-afdc-2b4e360fbed1'),
    label: { ru: 'Сесть и встать', sah: 'Олор уонна тур' },
  },
  {
    id: 'm-19', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Martial arts or fighting stance sequence. Powerful controlled movements',
    previewUrl: HF('c079d025-9bc6-401e-8eaa-ec4057e5c304'),
    label: { ru: 'Боевая стойка', sah: 'Охсуһуу туруга' },
  },
  {
    id: 'm-20', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Yoga or stretching sequence. Calm controlled body movements',
    previewUrl: HF('75c8909f-7873-44d1-bb02-5f09317a11ad'),
    label: { ru: 'Йога и растяжка', sah: 'Йога уонна сунуу' },
  },
  {
    id: 'm-21', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Cooking or kitchen movement. Character prepares food with natural gestures',
    previewUrl: HF('aa86f373-d5c3-4a81-abe6-12b5959b8534'),
    label: { ru: 'Кулинарные движения', sah: 'Аһылык хамсаныы' },
  },
  {
    id: 'm-22', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Musical instrument playing motion. Hands and body move rhythmically',
    previewUrl: HF('b0aa5384-f5ef-4804-8d3e-393464bc342e'),
    label: { ru: 'Игра на инструменте', sah: 'Инструмент оонньуу' },
  },
  {
    id: 'm-23', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Hair flip and beauty pose. Glamorous slow-motion movement',
    previewUrl: HF('b7b1dabf-b6f7-4b6e-b57a-e49c4e49dc32'),
    label: { ru: 'Бьюти-поза', sah: 'Бьюти поза' },
  },
  {
    id: 'm-24', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'TikTok trend dance. Viral social media choreography',
    previewUrl: HF('3cbb7bc4-1cb0-4930-ae53-6ad1bf5c2ae6'),
    label: { ru: 'TikTok тренд', sah: 'TikTok тренд' },
  },
  {
    id: 'm-25', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Professional presentation gesture. Business-appropriate body language',
    previewUrl: HF('fc0bb74c-2a62-4113-99cb-f0ee05aaacf3'),
    label: { ru: 'Деловой жест', sah: 'Дьарык хамсаныыта' },
  },
  {
    id: 'm-26', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Jumping and celebration movement. Character expresses joy and excitement',
    previewUrl: HF('7508928a-5c4c-47f2-81c2-592ebbbdfff2'),
    label: { ru: 'Прыжок радости', sah: 'Үөрүү тэпсиитэ' },
  },
  {
    id: 'm-27', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Subtle head turn and smile. Minimal elegant movement for portraits',
    previewUrl: HF('950b8e26-60d5-46c6-b415-f82e717a5c4e'),
    label: { ru: 'Поворот головы', sah: 'Бас эргиллиитэ' },
  },
  {
    id: 'm-28', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Walking towards camera with confidence. Character approaches viewer directly',
    previewUrl: HF('d23fcbf7-23a6-4799-88ec-decdfb653de4'),
    label: { ru: 'Подход к камере', sah: 'Камераҕа кэлии' },
  },
  {
    id: 'm-29', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Leaning against wall and looking away. Casual relaxed pose with movement',
    previewUrl: HF('23dd378e-e15a-4bf8-9d53-f2ecd5641e9d'),
    label: { ru: 'Расслабленная поза', sah: 'Сөпкө поза' },
  },
  {
    id: 'm-30', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Blowing a kiss to camera. Flirty playful gesture animation',
    previewUrl: HF('1c4f77b2-0eb4-481a-b415-1765aaf4f866'),
    label: { ru: 'Воздушный поцелуй', sah: 'Куолай' },
  },
  {
    id: 'm-31', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Picking up an object and examining it. Natural hand interaction',
    previewUrl: HF('d0a6a5a5-0dde-4d2d-bf78-59966da9bafa'),
    label: { ru: 'Взаимодействие с объектом', sah: 'Объекнан дьарык' },
  },
  {
    id: 'm-32', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Group dance synchronization. Multiple characters moving together',
    previewUrl: HF('289b7f9f-27be-4457-b767-62e4a6aa8b71'),
    label: { ru: 'Групповой танец', sah: 'Бөлөх тэгэлтэ' },
  },
  {
    id: 'm-33', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Running in slow motion. Dramatic athletic movement with wind effect',
    previewUrl: HF('7107e003-72c2-408a-aebd-fe635f421389'),
    label: { ru: 'Бег в слоумо', sah: 'Сүүрүк слоумода' },
  },
  {
    id: 'm-34', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Outfit change transition. Character transforms look with smooth cut',
    previewUrl: HF('b9fbbad6-12ee-4b5d-8559-29b8326e5a37'),
    label: { ru: 'Смена образа', sah: 'Танас уларыйыыта' },
  },
  {
    id: 'm-35', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Camera orbit around standing character. 360-degree reveal movement',
    previewUrl: HF('459929b4-b2a9-467b-80d2-ab5939cb2654'),
    label: { ru: 'Вращение камеры', sah: 'Камера эргиллиитэ' },
  },
  {
    id: 'm-36', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Emotional reaction sequence. Character shows surprise, joy, laughter',
    previewUrl: HF('79698ca2-09eb-4d5d-b280-4c5779bf20e2'),
    label: { ru: 'Эмоциональная реакция', sah: 'Эмоция көрдөрүү' },
  },
  {
    id: 'm-37', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Looking around exploring environment. Character discovers new space',
    previewUrl: HF('98dbdabd-655f-4731-95e0-11d1dc89ae0d'),
    label: { ru: 'Осмотр вокруг', sah: 'Тугу эмэ көрүү' },
  },
  {
    id: 'm-38', tab: 'motion', category: 'all', isVideo: true,
    prompt: 'Final pose with attitude. Character strikes a powerful ending stance',
    previewUrl: HF('9f600689-986b-41e8-95cf-3e03b5d377dc'),
    label: { ru: 'Финальная поза', sah: 'Бүтэһик поза' },
  },
];

// ═══════════════════════════════════════════════════
// AVATAR TAB — Kling Avatar Presets (13 персонажей)
// ═══════════════════════════════════════════════════
export const AVATAR_TEMPLATES: VideoPromptTemplate[] = [
  {
    id: 'a-01', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Sophie — professional female presenter. Clear speech, warm smile, confident eye contact. Perfect for business presentations and product demos',
    previewUrl: KA('Sophie'),
    label: { ru: 'Sophie — презентер', sah: 'Sophie — ыһааччы' },
  },
  {
    id: 'a-02', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Amy — friendly young woman. Casual conversational style, natural gestures. Great for social media content and vlogs',
    previewUrl: KA('Amy'),
    label: { ru: 'Amy — блогер', sah: 'Amy — блогер' },
  },
  {
    id: 'a-03', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Isabella — elegant beauty influencer. Makeup tutorial style, close-up framing, soft lighting. Perfect for beauty and fashion content',
    previewUrl: KA('Isabella'),
    label: { ru: 'Isabella — бьюти', sah: 'Isabella — бьюти' },
  },
  {
    id: 'a-04', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Lia — energetic young creator. Dynamic expressions, fast-paced speech, engaging personality. Ideal for educational and entertainment content',
    previewUrl: KA('Lia'),
    label: { ru: 'Lia — креатор', sah: 'Lia — креатор' },
  },
  {
    id: 'a-05', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Luis — confident male spokesperson. Professional demeanor, clear articulation, authoritative tone. Best for corporate and news-style content',
    previewUrl: KA('Luis'),
    label: { ru: 'Luis — спикер', sah: 'Luis — спикер' },
  },
  {
    id: 'a-06', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Ashley — warm lifestyle coach. Calm presence, encouraging gestures, approachable style. Great for wellness and coaching content',
    previewUrl: KA('Ashley'),
    label: { ru: 'Ashley — лайфстайл', sah: 'Ashley — лайфстайл' },
  },
  {
    id: 'a-07', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Freya — creative storyteller. Expressive face, theatrical delivery, captivating narrative style. Perfect for storytelling and brand content',
    previewUrl: KA('Freya'),
    label: { ru: 'Freya — рассказчик', sah: 'Freya — кэпсээччи' },
  },
  {
    id: 'a-08', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Noah — casual male creator. Relaxed friendly vibe, natural speech, relatable personality. Ideal for tech reviews and tutorials',
    previewUrl: KA('Noah'),
    label: { ru: 'Noah — тех-обзорщик', sah: 'Noah — тех-обзорщик' },
  },
  {
    id: 'a-09', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Petra — professional news anchor. Neutral expression, steady composure, formal tone. Broadcast journalism aesthetic',
    previewUrl: KA('Petra'),
    label: { ru: 'Petra — ведущая', sah: 'Petra — ыһааччы' },
  },
  {
    id: 'a-10', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Joon — modern male influencer. Trendy style, engaging expressions, youthful energy. Perfect for Gen-Z content and social media',
    previewUrl: KA('Joon'),
    label: { ru: 'Joon — инфлюенсер', sah: 'Joon — инфлюенсер' },
  },
  {
    id: 'a-11', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Charlie — warm male teacher. Patient demeanor, clear explanations, encouraging nods. Great for educational content',
    previewUrl: KA('Charlie'),
    label: { ru: 'Charlie — учитель', sah: 'Charlie — учуутал' },
  },
  {
    id: 'a-12', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Raj — tech-savvy professional. Confident delivery, knowledgeable tone, modern background. Ideal for tech and business presentations',
    previewUrl: KA('Raj'),
    label: { ru: 'Raj — IT-эксперт', sah: 'Raj — IT-эксперт' },
  },
  {
    id: 'a-13', tab: 'avatar', category: 'all', isVideo: true,
    prompt: 'Fun Characters — animated 2D/3D cartoon characters. Playful exaggerated movements, bright colorful style. Perfect for kids content and entertainment',
    previewUrl: 'https://v15-kling.klingai.com/bs2/upload-ylab-stunt-sgp/Fun_Characters.mp4?x-kcdn-pid=112372',
    label: { ru: 'Мультяшные персонажи', sah: 'Мульт персонажтар' },
  },
];

export const ALL_VIDEO_TEMPLATES = [...VIDEO_TEMPLATES, ...MOTION_TEMPLATES, ...AVATAR_TEMPLATES];
