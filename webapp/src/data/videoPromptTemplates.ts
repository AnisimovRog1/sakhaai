// Курированные шаблоны промптов для генерации видео (Kling AI)
// Категории: cinematic, nature, action, fantasy, product, avatar

export type VideoTemplateCategory = 'cinematic' | 'nature' | 'action' | 'fantasy' | 'product' | 'avatar';
export type VideoTemplateTab = 'video' | 'avatar';

export type VideoPromptTemplate = {
  id: string;
  category: VideoTemplateCategory;
  tab: VideoTemplateTab;
  prompt: string;
  previewUrl: string;
  label: { ru: string; sah: string };
};

export const VIDEO_CATEGORIES: { id: VideoTemplateCategory | 'all'; labelRu: string; labelSah: string }[] = [
  { id: 'all',        labelRu: 'Все',           labelSah: 'Барыта' },
  { id: 'cinematic',  labelRu: 'Кино',          labelSah: 'Кинематография' },
  { id: 'nature',     labelRu: 'Природа',       labelSah: 'Айылҕа' },
  { id: 'action',     labelRu: 'Экшн',          labelSah: 'Экшн' },
  { id: 'fantasy',    labelRu: 'Фэнтези',       labelSah: 'Фэнтези' },
  { id: 'product',    labelRu: 'Продукт',       labelSah: 'Продукт' },
  { id: 'avatar',     labelRu: 'Аватар',        labelSah: 'Аватар' },
];

export const VIDEO_PROMPT_TEMPLATES: VideoPromptTemplate[] = [
  // ─── Кино / Cinematic ───
  {
    id: 'cine-01',
    category: 'cinematic',
    tab: 'video',
    prompt: 'A woman in an emerald green coat walks through a tree-lined urban park at golden hour, autumn leaves on the path. Smooth tracking shot from the side, natural afternoon light creating soft shadows, cinematic color grading, shallow depth of field',
    previewUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    label: { ru: 'Прогулка в парке', sah: 'Паркка сылдьыы' },
  },
  {
    id: 'cine-02',
    category: 'cinematic',
    tab: 'video',
    prompt: 'Cinematic establishing shot of a snow-covered mountain valley. Camera pans slowly to the right, revealing massive cliffs, frozen waterfall, and ancient monastery on a rocky outcrop. Golden hour backlighting, 4K quality, award-winning cinematography',
    previewUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
    label: { ru: 'Горная панорама', sah: 'Хайа панорамата' },
  },
  {
    id: 'cine-03',
    category: 'cinematic',
    tab: 'video',
    prompt: 'Bride and groom in elegant formal wear embracing on a candlelit dance floor. Slow dolly-in from wide shot to intimate close-up. Warm golden candlelight, romantic atmosphere, camera synchronized to slow dance rhythm, shallow depth of field',
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
    label: { ru: 'Первый танец', sah: 'Бастакы тэгэлтэ' },
  },
  {
    id: 'cine-04',
    category: 'cinematic',
    tab: 'video',
    prompt: 'A ceramic latte mug on a wooden table in a cozy coffee shop. Close-up macro shot of steam rising from hot beverage. Barista hands gently place the mug down. Warm ambient café lighting, bokeh background, intimate documentary style',
    previewUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    label: { ru: 'Утро в кофейне', sah: 'Сарсыарда кофейняҕа' },
  },
  {
    id: 'cine-05',
    category: 'cinematic',
    tab: 'video',
    prompt: 'A sprawling cyberpunk megacity at night, neon signs illuminating rain-soaked streets. Flying vehicles weave through towering skyscrapers. Camera pans across the cityscape showing holographic advertisements. Dark moody aesthetic with neon pink and cyan lighting, cinematic noir atmosphere',
    previewUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&q=80',
    label: { ru: 'Киберпанк город', sah: 'Киберпанк куорат' },
  },

  // ─── Природа / Nature ───
  {
    id: 'nature-01',
    category: 'nature',
    tab: 'video',
    prompt: 'A deer walking through a misty forest at dawn, moving left to right across frame. Cinematic tracking shot from behind at steady pace, soft morning light filtering through dense trees, shallow depth of field, nature documentary aesthetic',
    previewUrl: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=400&q=80',
    label: { ru: 'Олень в тумане', sah: 'Таба туманнаах тыаҕа' },
  },
  {
    id: 'nature-02',
    category: 'nature',
    tab: 'video',
    prompt: 'Vibrant coral reef teeming with exotic tropical fish. Camera slowly descends through clear blue water, revealing bioluminescent creatures glowing in the deepening darkness. Soft particle effects of floating plankton, peaceful meditative mood, documentary realism',
    previewUrl: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400&q=80',
    label: { ru: 'Подводный мир', sah: 'Уу аннынааҕы дойду' },
  },
  {
    id: 'nature-03',
    category: 'nature',
    tab: 'video',
    prompt: 'Northern lights aurora borealis dancing over a frozen Yakutian lake, vibrant green and purple sky, snow-covered taiga forest in background. Time-lapse style smooth movement, ultra-wide angle, long exposure photography feel, 4K cinematic',
    previewUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80',
    label: { ru: 'Северное сияние', sah: 'Хаҕыс сырдыга' },
  },
  {
    id: 'nature-04',
    category: 'nature',
    tab: 'video',
    prompt: 'A majestic wild horse galloping through a green meadow in summer. Dynamic low-angle tracking shot, golden hour sunlight, mountains in background, slow motion capturing mane and tail movement, wildlife cinematography, freedom and power',
    previewUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80',
    label: { ru: 'Дикая лошадь', sah: 'Сылгы' },
  },

  // ─── Экшн / Action ───
  {
    id: 'action-01',
    category: 'action',
    tab: 'video',
    prompt: 'A parkour athlete in dark athletic wear launches across rooftops in urban setting. Low angle handheld tracking shot with intentional camera shake, motion blur. Fast-paced adrenaline-fueled cinematic action, clear subject focus, dramatic sky background',
    previewUrl: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=400&q=80',
    label: { ru: 'Паркур на крышах', sah: 'Крыша үрдүнэн' },
  },
  {
    id: 'action-02',
    category: 'action',
    tab: 'video',
    prompt: 'Professional mountain biker descends a rocky trail at speed. Camera follows from behind-left angle with slight motion blur. Pine forests and distant mountain peaks visible. Afternoon sun creating dramatic shadows, action sports aesthetic, energetic movement',
    previewUrl: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=400&q=80',
    label: { ru: 'Горный байк', sah: 'Хайа велосипед' },
  },
  {
    id: 'action-03',
    category: 'action',
    tab: 'video',
    prompt: 'A surfer riding a massive turquoise wave at sunset. Slow motion water droplets catching golden light, dramatic side angle, ocean spray creating rainbow effects. Cinematic sports photography, powerful natural force, breathtaking composition',
    previewUrl: 'https://images.unsplash.com/photo-1502680390548-bdbac40551d0?w=400&q=80',
    label: { ru: 'Сёрфинг на волне', sah: 'Долгунна сёрфинг' },
  },

  // ─── Фэнтези / Fantasy ───
  {
    id: 'fantasy-01',
    category: 'fantasy',
    tab: 'video',
    prompt: 'A powerful shaman with glowing antlers standing in a mystical frozen forest, spirit animals surrounding him. Ethereal blue and purple light, northern mythology. Camera slowly orbits around the shaman, particles of light floating upward, epic fantasy cinematic',
    previewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    label: { ru: 'Шаман Севера', sah: 'Хотугу ойуун' },
  },
  {
    id: 'fantasy-02',
    category: 'fantasy',
    tab: 'video',
    prompt: 'A magical forest composed entirely of crystal trees, each glowing with ethereal internal light. Trees refract purple and blue sky creating prismatic light patterns on crystalline ground. Slow dolly-in through the forest, surreal otherworldly aesthetic',
    previewUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    label: { ru: 'Хрустальный лес', sah: 'Хрусталь тыата' },
  },
  {
    id: 'fantasy-03',
    category: 'fantasy',
    tab: 'video',
    prompt: 'An ancient dragon resting on a mountain peak, scales shimmering with iridescent colors, wings spread wide. Volcanic landscape below, dramatic storm clouds. Camera rises slowly revealing the full scale, cinematic epic fantasy, 4K detail',
    previewUrl: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=400&q=80',
    label: { ru: 'Дракон на вершине', sah: 'Луо хайа төбөтүгэр' },
  },

  // ─── Продукт / Product ───
  {
    id: 'product-01',
    category: 'product',
    tab: 'video',
    prompt: 'A gourmet burger assembles in mid-air in dramatic slow-motion. Individual ingredients — grilled patty, fresh lettuce, tomato, melting cheese, toasted bun — fly into place from different directions. Clean studio gradient background, dramatic backlighting, product photography',
    previewUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    label: { ru: 'Бургер в полёте', sah: 'Бургер көтөн' },
  },
  {
    id: 'product-02',
    category: 'product',
    tab: 'video',
    prompt: 'A platinum luxury chronograph watch rotates slowly on a black velvet display stand. Close-up macro showing intricate dial details, glinting gold accents, sapphire crystal reflecting studio lighting. Slow 360-degree orbit, high-end product photography, 4K premium quality',
    previewUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80',
    label: { ru: 'Люксовые часы', sah: 'Люкс чаас' },
  },
  {
    id: 'product-03',
    category: 'product',
    tab: 'video',
    prompt: 'A sleek smartphone floats against a white backdrop. Screen displays a vibrant app interface. Phone lifts smoothly upward, feature text boxes appear beside it. Yellow call-to-action button animates at bottom. Corporate commercial style, clean, modern, high contrast',
    previewUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=80',
    label: { ru: 'Презентация приложения', sah: 'Приложение презентацията' },
  },
  {
    id: 'product-04',
    category: 'product',
    tab: 'video',
    prompt: 'A perfume bottle emerges from swirling golden mist on a marble surface. Dramatic rim lighting highlights the crystal-cut glass and amber liquid inside. Camera slowly pushes in, light refractions dance across the surface. Luxury brand commercial aesthetic, elegant and refined',
    previewUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80',
    label: { ru: 'Рекламный ролик духов', sah: 'Парфюм реклаамата' },
  },

  // ─── Аватар / Avatar ───
  {
    id: 'avatar-01',
    category: 'avatar',
    tab: 'avatar',
    prompt: 'A confident female business coach with warm professional demeanor. Subtle hand gestures to emphasize key points, occasional smiles, direct eye contact. Medium close-up framing, steady professional tone, clean office background',
    previewUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    label: { ru: 'Бизнес-тренер', sah: 'Бизнес тренер' },
  },
  {
    id: 'avatar-02',
    category: 'avatar',
    tab: 'avatar',
    prompt: 'A calm serene wellness coach with peaceful demeanor. Gentle hand movements suggesting relaxation. Soft facial expressions, subtle smiles, slow measured speech. Warm color-graded background with soft lighting, create sense of tranquility',
    previewUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    label: { ru: 'Тренер по здоровью', sah: 'Доруобуйа тренера' },
  },
  {
    id: 'avatar-03',
    category: 'avatar',
    tab: 'avatar',
    prompt: 'An energetic young vlogger with casual confidence and relatable personality. Frequent hand gestures, expressive facial reactions, head movements for emphasis. Fast-paced conversational speech, friendly tone, bright modern background',
    previewUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
    label: { ru: 'Видеоблогер', sah: 'Видеоблогер' },
  },
  {
    id: 'avatar-04',
    category: 'avatar',
    tab: 'avatar',
    prompt: 'A distinguished male news anchor with neutral professional expression. Occasional subtle head nods for emphasis, steady composure. Locked-off camera framing, slow and clear speech delivery. Formal tone, professional broadcast lighting, photorealistic',
    previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    label: { ru: 'Ведущий новостей', sah: 'Сонуннар ыһааччы' },
  },
  {
    id: 'avatar-05',
    category: 'avatar',
    tab: 'avatar',
    prompt: 'A patient encouraging teacher with gentle demeanor. Thoughtful pauses after complex information, subtle nods when transitioning topics, warm smiles. Clear articulation, conversational pace, approachable tone, soft natural classroom lighting',
    previewUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&q=80',
    label: { ru: 'Учитель', sah: 'Учуутал' },
  },
  {
    id: 'avatar-06',
    category: 'avatar',
    tab: 'avatar',
    prompt: 'A professional physician with calm reassuring presence. Steady thoughtful expression, deliberate hand gestures explaining concepts. Clear precise articulation, professional tone. Medium close-up in clinical setting with soft professional lighting, empathetic demeanor',
    previewUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
    label: { ru: 'Врач-консультант', sah: 'Врач-консультант' },
  },
];
