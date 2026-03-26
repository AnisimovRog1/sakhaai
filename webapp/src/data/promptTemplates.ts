// Курированные шаблоны промптов для генерации картинок
// Категории: portrait, nature, fantasy, anime, architecture, abstract

export type TemplateCategory = 'portrait' | 'nature' | 'fantasy' | 'anime' | 'architecture' | 'abstract';

export type PromptTemplate = {
  id: string;
  category: TemplateCategory;
  prompt: string;
  previewUrl: string;
  label: { ru: string; sah: string };
};

export const CATEGORIES: { id: TemplateCategory | 'all'; labelRu: string; labelSah: string }[] = [
  { id: 'all',          labelRu: 'Все',          labelSah: 'Барыта' },
  { id: 'portrait',     labelRu: 'Портреты',     labelSah: 'Портреттар' },
  { id: 'nature',       labelRu: 'Природа',      labelSah: 'Айылҕа' },
  { id: 'fantasy',      labelRu: 'Фэнтези',      labelSah: 'Фэнтези' },
  { id: 'anime',        labelRu: 'Аниме',        labelSah: 'Аниме' },
  { id: 'architecture', labelRu: 'Архитектура',  labelSah: 'Архитектура' },
  { id: 'abstract',     labelRu: 'Абстракция',   labelSah: 'Абстракция' },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // ─── Портреты ───
  {
    id: 'portrait-01',
    category: 'portrait',
    prompt: 'A cinematic portrait of a young woman with flowing dark hair, wearing a traditional Yakut silver necklace, soft golden hour lighting, shallow depth of field, warm tones, professional photography',
    previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    label: { ru: 'Якутский портрет', sah: 'Саха портрета' },
  },
  {
    id: 'portrait-02',
    category: 'portrait',
    prompt: 'Studio portrait of an elderly man with wise eyes and deep wrinkles, dramatic Rembrandt lighting, dark background, hyperrealistic, 8K detail, cinematic color grading',
    previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    label: { ru: 'Мудрый старец', sah: 'Кырдьаҕас ойуун' },
  },
  {
    id: 'portrait-03',
    category: 'portrait',
    prompt: 'Fashion editorial portrait of a model in a stylized outfit, standing against a textured urban wall, oversized accessories, bohemian style, natural daylight, muted warm tones',
    previewUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
    label: { ru: 'Уличная мода', sah: 'Уулусса мода' },
  },
  {
    id: 'portrait-04',
    category: 'portrait',
    prompt: 'A confident businesswoman in a modern office, wearing a tailored suit, power pose, clean background with glass reflections, corporate photography style, sharp focus',
    previewUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    label: { ru: 'Деловой портрет', sah: 'Дьарык портрета' },
  },
  {
    id: 'portrait-05',
    category: 'portrait',
    prompt: 'Close-up portrait of a child with bright curious eyes, soft natural light from a window, gentle bokeh background, warm pastel colors, innocent expression, tender photography',
    previewUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
    label: { ru: 'Детский портрет', sah: 'Оҕо портрета' },
  },

  // ─── Природа ───
  {
    id: 'nature-01',
    category: 'nature',
    prompt: 'Northern lights aurora borealis over a frozen Yakutian lake, vibrant green and purple sky, snow-covered taiga forest in background, long exposure photography, ultra-wide angle, 4K',
    previewUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80',
    label: { ru: 'Северное сияние', sah: 'Хаҕыс сырдыга' },
  },
  {
    id: 'nature-02',
    category: 'nature',
    prompt: 'Lena Pillars rock formations along the Lena River in Yakutia, dramatic sunset lighting, orange and gold sky reflected in calm water, aerial drone perspective, national park landscape',
    previewUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    label: { ru: 'Ленские столбы', sah: 'Өлүөнэ туруук таастара' },
  },
  {
    id: 'nature-03',
    category: 'nature',
    prompt: 'Dense Siberian taiga forest in winter, snow-heavy pine trees, soft morning mist, sun rays filtering through branches, peaceful atmosphere, pristine untouched wilderness, landscape photography',
    previewUrl: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=400&q=80',
    label: { ru: 'Зимняя тайга', sah: 'Кыһынҥы тайҕа' },
  },
  {
    id: 'nature-04',
    category: 'nature',
    prompt: 'A majestic wild horse running through a green meadow in summer, dynamic motion blur, golden hour sunlight, mountains in background, freedom and power, wildlife photography',
    previewUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80',
    label: { ru: 'Дикая лошадь', sah: 'Сылгы' },
  },
  {
    id: 'nature-05',
    category: 'nature',
    prompt: 'Cherry blossom trees in full bloom along a quiet path, soft pink petals falling, dreamy spring atmosphere, pastel colors, Japanese garden aesthetic, tranquil and serene mood',
    previewUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&q=80',
    label: { ru: 'Цветение сакуры', sah: 'Сакура сэбирдэхтэрэ' },
  },

  // ─── Фэнтези ───
  {
    id: 'fantasy-01',
    category: 'fantasy',
    prompt: 'A powerful shaman with glowing antlers standing in a mystical frozen forest, spirit animals surrounding him, ethereal blue and purple light, northern mythology, epic fantasy art, highly detailed',
    previewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    label: { ru: 'Шаман Севера', sah: 'Хотугу ойуун' },
  },
  {
    id: 'fantasy-02',
    category: 'fantasy',
    prompt: 'A floating castle above the clouds at sunset, massive stone towers with glowing windows, waterfalls cascading into the void, flying birds, epic scale, concept art style, 4K wallpaper',
    previewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    label: { ru: 'Летающий замок', sah: 'Көтөр куоска' },
  },
  {
    id: 'fantasy-03',
    category: 'fantasy',
    prompt: 'An ancient dragon resting on a mountain peak, scales shimmering with iridescent colors, wings spread wide, volcanic landscape below, dramatic storm clouds, digital art, cinematic composition',
    previewUrl: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=400&q=80',
    label: { ru: 'Дракон', sah: 'Луо' },
  },
  {
    id: 'fantasy-04',
    category: 'fantasy',
    prompt: 'A mystical underwater city with bioluminescent coral buildings, merfolk swimming between crystal towers, deep ocean blue and glowing cyan, volumetric light rays from above, fantasy concept art',
    previewUrl: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=400&q=80',
    label: { ru: 'Подводный город', sah: 'Уу аннынааҕы куорат' },
  },
  {
    id: 'fantasy-05',
    category: 'fantasy',
    prompt: 'A warrior princess in ornate silver armor standing before a frozen throne, her breath visible in the cold air, ice crown with embedded gems, epic fantasy scene, dramatic lighting, 8K',
    previewUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
    label: { ru: 'Ледяная принцесса', sah: 'Муус хотун' },
  },

  // ─── Аниме ───
  {
    id: 'anime-01',
    category: 'anime',
    prompt: 'Anime girl with long white hair and blue eyes, wearing a school uniform, cherry blossom petals flying, soft pink sky, Studio Ghibli style, warm and nostalgic atmosphere, detailed illustration',
    previewUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80',
    label: { ru: 'Школьница аниме', sah: 'Аниме оскуолаҕа' },
  },
  {
    id: 'anime-02',
    category: 'anime',
    prompt: 'A lone samurai standing on a cliff at sunset, katana drawn, wind blowing through his hair, dramatic clouds, anime art style, vibrant orange and purple sky, detailed cel shading',
    previewUrl: 'https://images.unsplash.com/photo-1611457194403-d3f8c5514c13?w=400&q=80',
    label: { ru: 'Самурай', sah: 'Самурай' },
  },
  {
    id: 'anime-03',
    category: 'anime',
    prompt: 'Cute anime cat girl (neko) with cat ears and tail, wearing a cozy oversized sweater, sitting by a window on a rainy day, holding a cup of tea, warm indoor lighting, kawaii style, detailed',
    previewUrl: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400&q=80',
    label: { ru: 'Кошка-девочка', sah: 'Куоска кыыс' },
  },
  {
    id: 'anime-04',
    category: 'anime',
    prompt: 'Epic anime battle scene, two warriors clashing swords mid-air, energy explosions, speed lines, dramatic perspective from below, vibrant neon colors, shonen anime style, dynamic composition',
    previewUrl: 'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&q=80',
    label: { ru: 'Эпичная битва', sah: 'Улуу сэрии' },
  },
  {
    id: 'anime-05',
    category: 'anime',
    prompt: 'A magical girl transformation scene, swirling ribbons of light, sparkling stars, pastel gradient background, elegant pose, flowing magical dress forming around her, Sailor Moon aesthetic',
    previewUrl: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=400&q=80',
    label: { ru: 'Волшебница', sah: 'Абааһы кыыс' },
  },

  // ─── Архитектура ───
  {
    id: 'arch-01',
    category: 'architecture',
    prompt: 'Futuristic eco-city with vertical gardens on every building, solar panels integrated into glass facades, drone highways between towers, blue sky, clean energy aesthetic, architectural visualization',
    previewUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80',
    label: { ru: 'Город будущего', sah: 'Кэлэр кэмнээҕи куорат' },
  },
  {
    id: 'arch-02',
    category: 'architecture',
    prompt: 'Traditional Yakut balagan (winter house) with smoke rising from chimney, surrounded by snow-covered larch trees, warm golden light from windows, cozy winter evening, architectural photography',
    previewUrl: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=400&q=80',
    label: { ru: 'Якутский балаган', sah: 'Саха балаҕана' },
  },
  {
    id: 'arch-03',
    category: 'architecture',
    prompt: 'Abandoned gothic cathedral overgrown with ivy and wildflowers, broken stained glass windows with light streaming through, moss-covered stone pillars, atmospheric and hauntingly beautiful',
    previewUrl: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400&q=80',
    label: { ru: 'Готический собор', sah: 'Готика чиэппэрэ' },
  },
  {
    id: 'arch-04',
    category: 'architecture',
    prompt: 'Minimalist Japanese zen house with sliding paper doors, rock garden with raked sand patterns, bamboo fence, single bonsai tree, morning mist, tranquil composition, architectural photography',
    previewUrl: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400&q=80',
    label: { ru: 'Японский дом', sah: 'Дьоппуон дьиэтэ' },
  },

  // ─── Абстракция ───
  {
    id: 'abstract-01',
    category: 'abstract',
    prompt: 'Abstract fluid art with swirling violet, cyan, and gold colors, marble texture, metallic accents, luxurious and hypnotic pattern, 4K wallpaper, generative art style',
    previewUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80',
    label: { ru: 'Флюид арт', sah: 'Флюид арт' },
  },
  {
    id: 'abstract-02',
    category: 'abstract',
    prompt: 'Geometric abstract composition with overlapping translucent shapes, neon gradient colors from purple to teal, minimalist design, clean lines, modern digital art, 4K',
    previewUrl: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400&q=80',
    label: { ru: 'Геометрия', sah: 'Геометрия' },
  },
  {
    id: 'abstract-03',
    category: 'abstract',
    prompt: 'Cosmic nebula abstract art, deep space colors with swirling gas clouds, stars being born, vivid purple orange and blue, fractal patterns, ultra detailed, astrophotography inspired',
    previewUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80',
    label: { ru: 'Космическая туманность', sah: 'Космос туманноста' },
  },
  {
    id: 'abstract-04',
    category: 'abstract',
    prompt: 'Surreal melting clock landscape inspired by Salvador Dali, desert with impossible geometry, dreamlike atmosphere, soft shadows, warm golden light, oil painting texture, surrealism',
    previewUrl: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=400&q=80',
    label: { ru: 'Сюрреализм', sah: 'Сюрреализм' },
  },
];
