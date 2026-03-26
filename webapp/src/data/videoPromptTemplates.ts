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

const KV = (path: string) => `https://v15-kling.klingai.com/bs2/upload-ylab-stunt-sgp/${path}?x-kcdn-pid=112372`;
const HF = (uuid: string) => `https://cdn.higgsfield.ai/kling_motion_control_preset/${uuid}.mp4`;
const KA = (name: string) => `https://v15-kling.klingai.com/bs2/upload-ylab-stunt-sgp/kling/digital/video/${name}.mp4?x-kcdn-pid=112372`;

// ═══════════════════════════════════════════════════
// VIDEO — Реальные Kling AI видео
// ═══════════════════════════════════════════════════
export const VIDEO_TEMPLATES: VideoPromptTemplate[] = [
  // ─── Кино ───
  { id: 'v-cine-01', tab: 'video', category: 'cinematic', isVideo: true,
    previewUrl: KV('4e76d9f6-bd01-4559-b6ba-d5aaf80036cd-I5bNV4Sk5hhihqbly-mnqA-output.mp4'),
    prompt: 'Кинематографический портрет молодой девушки в вечернем платье. Камера медленно наезжает на лицо, мягкий студийный свет создаёт объём. Малая глубина резкости, тёплые тона. Выражение задумчивости сменяется лёгкой улыбкой. Фотореалистичное качество, стиль рекламного ролика, 4K',
    label: { ru: 'Кинопортрет', sah: 'Кино портрет' } },
  { id: 'v-cine-02', tab: 'video', category: 'cinematic', isVideo: true,
    previewUrl: KV('ea33868d-83d5-4819-9e05-7700e53d781e-rfNMU7JaoAH0B53XunL_DQ-output.mp4'),
    prompt: 'Мужчина в тёмном костюме идёт по пустому коридору небоскрёба. Стеклянные стены отражают ночной город. Камера следует за ним, постепенно открывая панорамный вид. Неоновые отражения, дождевые капли на стекле. Кинематографический стиль нуар, синяя и оранжевая цветокоррекция',
    label: { ru: 'Ночной город', sah: 'Түүн куорат' } },
  { id: 'v-cine-03', tab: 'video', category: 'cinematic', isVideo: true,
    previewUrl: KV('97fc5d03-db13-4829-adc9-ebe78086da1f_a1970fb3-d3fc-4a9e-b5f5-76a9d3941795-rbte3i_SSmfwfaCbGPNxZw-output.mp4'),
    prompt: 'Пара танцует медленный танец на крыше здания под звёздным небом. Гирлянды огней создают тёплое свечение. Камера медленно облетает вокруг них. Вечернее платье развевается от ветра. Романтическая кинематография, стиль «Ла-Ла Ленд», мягкий боке фон, фотореализм',
    label: { ru: 'Танец на крыше', sah: 'Ыраас үрдүгэр тэгүллүү' } },
  { id: 'v-cine-04', tab: 'video', category: 'cinematic', isVideo: true,
    previewUrl: KV('d2c0935d-bf5a-483b-9dbd-36d8381da6e1-2oBusD5WnQouZ0YQnLKJbg-output.mp4'),
    prompt: 'Сон наяву: молодая девушка парит в воздухе в светлой комнате, волосы и платье развеваются невесомо. Мягкий рассеянный свет со всех сторон, пылинки кружатся в лучах. Замедленная съёмка, сюрреалистическая атмосфера, тёплые пастельные тона, кинематографическое 4K',
    label: { ru: 'Дневной сон', sah: 'Күндүскү түүл' } },

  // ─── Экшн ───
  { id: 'v-act-01', tab: 'video', category: 'action', isVideo: true,
    previewUrl: KV('5a5e4fd6-a29e-416c-8b00-c647e0afbf6f-xqhBPM46qEuGcX_pGm7meg-output.mp4'),
    prompt: 'Танцовщица выполняет динамичную хореографию в индустриальном пространстве. Резкие движения, вращения, прыжки. Камера следит за движениями с нижнего ракурса. Контровой свет создаёт силуэт, искры летят. Энергичная музыкальная атмосфера, стиль хип-хоп клипа, замедленная съёмка в кульминации',
    label: { ru: 'Хип-хоп танец', sah: 'Хип-хоп тэгэлтэ' } },
  { id: 'v-act-02', tab: 'video', category: 'action', isVideo: true,
    previewUrl: KV('07204cb3-6bf4-421d-9783-bb6bbb193ea7-dvZC9QgKAhsDPuCoTQi0Zg-output.mp4'),
    prompt: 'Спортсменка бежит по стадиону на закате, замедленная съёмка. Мышцы напряжены, пот блестит на коже. Камера сопровождает рядом на уровне глаз. Золотой час, длинные тени на дорожке. Взрывное ускорение на финишной прямой. Реалистичная спортивная кинематография, стиль Nike рекламы',
    label: { ru: 'Спринт на закате', sah: 'Киэһээҥи спринт' } },
  { id: 'v-act-03', tab: 'video', category: 'action', isVideo: true,
    previewUrl: KV('b5462a42-3ebd-4182-a70d-f1b90b4ff639-lPcux5SAL2QJU6y8KzAL_A-output.mp4'),
    prompt: 'Паркурщик совершает серию прыжков между бетонными стенами в городском переулке. FPV-камера летит рядом. Сальто в воздухе, приземление на руки. Утренний свет пробивается сквозь щели между зданиями. Реалистичные движения, динамичная экшн-съёмка, GoPro-эстетика',
    label: { ru: 'Городской паркур', sah: 'Куорат паркур' } },

  // ─── Природа ───
  { id: 'v-nat-01', tab: 'video', category: 'nature', isVideo: true,
    previewUrl: KV('se/ai_portal_sgp_m2v_img2video_v21_std/5fec8f35-bf3c-4a55-bb2c-777ea3dd36da_wm_bwm_hbr_hres_audio.mp4'),
    prompt: 'Северное сияние танцует над замёрзшим озером в Якутии — яркие зелёные и фиолетовые волны света. Заснеженная тайга на заднем плане. Таймлапс, сверхширокий угол. Одинокая фигура человека стоит на берегу и смотрит вверх. Звёзды отражаются на льду. Кинематографическое 4K, потрескивание льда',
    label: { ru: 'Северное сияние', sah: 'Хаҕыс сырдыга' } },
  { id: 'v-nat-02', tab: 'video', category: 'nature', isVideo: true,
    previewUrl: KV('e73b9f12-1ff9-437b-9df1-2ba5414204ef-6LUBe-UR2yaaOUVQKRTt1g-output.mp4'),
    prompt: 'Девушка в лёгком платье бежит босиком по цветущему лугу на рассвете. Камера плывёт следом, ловя момент свободы. Утренняя роса на траве, солнечные блики, лёгкий туман. Замедленная съёмка волос и платья на ветру. Тёплая золотая палитра, стиль Терренса Малика',
    label: { ru: 'Рассвет в поле', sah: 'Алаас сарсыарда' } },

  // ─── Сюрреализм ───
  { id: 'v-sur-01', tab: 'video', category: 'surreal', isVideo: true,
    previewUrl: KV('5878543b-2e93-491b-a1a0-688ba4cd9bb2-n5qYicw_vfI0Qz-lw_wUhw-output.mp4'),
    prompt: 'Человек, инопланетянин и эльф стоят перед двумя кнопками. Когда выбор сделан, зрители становятся свидетелями момента потрясения. Сюрреалистическая сцена: реальность трескается как зеркало, из трещин льётся свет другого мира. Кинематографическое освещение, VFX-качество Голливуда',
    label: { ru: 'Выбор реальности', sah: 'Дьиктилик талыыта' } },
  { id: 'v-sur-02', tab: 'video', category: 'surreal', isVideo: true,
    previewUrl: KV('ff8d3073-d10a-436e-8d76-717fdce67a89-ILM6_hozdbHsu1VRmLqFjA-output.mp4'),
    prompt: 'Девушка идёт по бесконечной водной глади, где небо сливается с горизонтом — идеальное зеркальное отражение. Каждый шаг создаёт расходящиеся круги на воде. Закатные пастельные розовые и голубые тона. Камера медленно отъезжает, открывая бесконечность. Сюрреалистическая эстетика, фотореализм',
    label: { ru: 'Зеркальная вода', sah: 'Күзүңү уу' } },
  { id: 'v-sur-03', tab: 'video', category: 'surreal', isVideo: true,
    previewUrl: KV('3dc3138d-9a28-4f79-971b-3d466c5174e2-CK6G_c4rjnNihqbly-mnqA-output.mp4'),
    prompt: 'Мужчина в чёрном пальто стоит в пустыне, вокруг медленно вращаются парящие осколки зеркал. Каждый осколок отражает другую реальность — город, океан, космос. Камера поднимается вверх. Золотой закатный свет, длинные тени. Стиль Кристофера Нолана, кинематографическое 4K',
    label: { ru: 'Осколки реальности', sah: 'Дьиктилик оһуордара' } },

  // ─── Продукт ───
  { id: 'v-prod-01', tab: 'video', category: 'product', isVideo: true,
    previewUrl: KV('ai_portal/1767671326/3q3sqXCJcV/%E9%86%89%E9%85%92%E8%88%9E%E5%B1%95%E7%A4%BA10s.mp4'),
    prompt: 'Флакон духов медленно вращается на чёрном зеркальном подиуме, лепестки роз парят вокруг в замедленной съёмке. Драматичная акцентная подсветка: тёплый свет слева, холодный справа. Капли воды на стекле создают преломления. Рука модели берёт флакон. Премиальная съёмка 4K, стиль Chanel',
    label: { ru: 'Люксовый парфюм', sah: 'Люкс парфюм' } },
  { id: 'v-prod-02', tab: 'video', category: 'product', isVideo: true,
    previewUrl: KV('29155806-bbcb-4a3f-9625-bfd119d1dc53-SUCJcxe62bThPw9b760jfg-output.mp4'),
    prompt: 'Бариста наливает латте-арт — тонкая струя молока рисует лист на поверхности кофе. Макросъёмка, мягкий боке. Камера отъезжает, показывая уютное кафе с тёплым светом. Пар поднимается мягкими завитками. ASMR-эстетика, стиль рекламы кофейного бренда, реалистичные руки',
    label: { ru: 'Утренний кофе', sah: 'Сарсыардааҕы кофе' } },

  // ─── Соцсети ───
  { id: 'v-soc-01', tab: 'video', category: 'social', isVideo: true,
    previewUrl: KV('e4dac062-d862-4523-838b-4ede167c48ee-n6KFTBqIiCquvlwytW_fJQ-output.mp4'),
    prompt: 'Девушка-блогер радостно распаковывает посылку перед камерой, достаёт стильные кроссовки. Выражение восторга, показывает товар со всех сторон. Кольцевой свет, эстетика YouTube-анбоксинга. Вертикальный формат, яркие цвета, динамичные переходы, стиль вирусного TikTok-ролика',
    label: { ru: 'Анбоксинг', sah: 'Анбоксинг' } },
  { id: 'v-soc-02', tab: 'video', category: 'social', isVideo: true,
    previewUrl: KV('5127df1d-fc5d-4e4a-980a-df2a9a2bf81d-7ywTJwjDIqKs9InQRAM4Iw-output.mp4'),
    prompt: 'Молодой шеф-повар готовит блюдо: красиво раскладывает ингредиенты на тарелке, поливает соусом в замедленной съёмке. Вид сверху, затем боковой ракурс. Тёмный фон, акцентное освещение на еде. Реалистичные руки, ASMR-эстетика, стиль food-блогера, вертикальный формат',
    label: { ru: 'Фуд-контент', sah: 'Ас контент' } },
  { id: 'v-soc-03', tab: 'video', category: 'social', isVideo: true,
    previewUrl: KV('ai_portal/1769211120/tPFUg5I9Vo/6560188186094261.mp4'),
    prompt: 'Фитнес-тренер показывает упражнения в стильном спортзале. Динамичная смена ракурсов: общий план, крупный план мышц, замедленная съёмка прыжка. Энергичная атмосфера, неоновое освещение, пот на коже. Вертикальный формат для Reels/TikTok, мотивационный контент',
    label: { ru: 'Фитнес-контент', sah: 'Фитнес контент' } },
  { id: 'v-soc-04', tab: 'video', category: 'social', isVideo: true,
    previewUrl: KV('26d191af-6558-49b4-a57f-e0cb2fc92917-RK54narYhLms-e7kUYcBmA-output.mp4'),
    prompt: 'Модель позирует на улице города в стильном уличном образе. Быстрая смена поз, уверенный взгляд в камеру. Прямая вспышка создаёт модный лоу-фай эффект. Переходы между кадрами в ритм музыки. Стиль фэшн-контента для Instagram, яркие цвета, городская эстетика',
    label: { ru: 'Стритстайл', sah: 'Стритстайл' } },
];

// ═══════════════════════════════════════════════════
// MOTION — Higgsfield Kling Motion Control (36 пресетов)
// ═══════════════════════════════════════════════════
export const MOTION_TEMPLATES: VideoPromptTemplate[] = [
  { id: 'm-01', tab: 'motion', category: 'all', isVideo: true,
    previewUrl: 'https://static.higgsfield.ai/v2-fnf-web-kmc-preset.mp4',
    prompt: 'Скопируйте движение из этого видео и перенесите на вашего персонажа. Motion Control сохраняет внешность персонажа, перенося движения, мимику и ритм',
    label: { ru: 'Демо Motion Control', sah: 'Motion Control демо' } },
  { id: 'm-02', tab: 'motion', category: 'all', isVideo: true,
    previewUrl: 'https://d2ol7oe51mr4n9.cloudfront.net/content_user_id/b7b19f6b-820c-49fb-81a5-358847ffbbe5.mp4',
    prompt: 'Персонаж естественно ходит и позирует. ИИ переносит движения тела на вашего статичного персонажа, сохраняя его внешность',
    label: { ru: 'Ходьба и позирование', sah: 'Сылдьыы уонна позирование' } },
  { id: 'm-03', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('7c764ec1-9343-48dd-a300-8fb7b2be09a5'),
    prompt: 'Стильная непринуждённая походка с уверенным языком тела. Персонаж естественно двигается по сцене',
    label: { ru: 'Уверенная походка', sah: 'Итиэхтээх сылдьыы' } },
  { id: 'm-04', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('55f89edc-767d-49ca-aad3-6ce882b6ee72'),
    prompt: 'Динамичные танцевальные движения с выразительным языком тела. Захват движений всего тела',
    label: { ru: 'Танцевальные движения', sah: 'Тэгэлтэ хамсаныылар' } },
{ id: 'm-06', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('e05ab9a7-bd13-4098-9768-100d89dc53ce'),
    prompt: 'Энергичное выступление с жестами рук и движениями головы. Выразительная анимация персонажа',
    label: { ru: 'Энергичное выступление', sah: 'Күүстээх көрдөрүү' } },
  { id: 'm-07', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('45722083-63ea-41fb-9c41-956abf7a5f9d'),
    prompt: 'Плавная поставленная танцевальная последовательность. Профессиональное качество движений',
    label: { ru: 'Хореография', sah: 'Хореография' } },
  { id: 'm-08', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('f3f1068f-60f7-49d9-8256-4ed09c4d20a6'),
    prompt: 'Игривое взаимодействие с камерой. Персонаж раскрывает характер через жесты и мимику',
    label: { ru: 'Игра с камерой', sah: 'Камераны оонньуу' } },
  { id: 'm-09', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('38a58318-780d-41c8-98e8-190106e54eb0'),
    prompt: 'Спортивная последовательность движений. Бег, прыжки или динамичные действия',
    label: { ru: 'Спортивное движение', sah: 'Спорт хамсаныы' } },
  { id: 'm-10', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('b7d972dc-fa4b-4024-8158-e3ad85bfb5df'),
    prompt: 'Драматичный медленный разворот. Персонаж оборачивается к камере в кинематографическом ритме',
    label: { ru: 'Драматический поворот', sah: 'Драматическай эргиллии' } },
  { id: 'm-11', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('d9d7ea02-fdcc-475a-a53e-d3353a8b866e'),
    prompt: 'Подиумная походка модели. Профессиональная осанка и уверенная подача',
    label: { ru: 'Подиумная походка', sah: 'Подиум сылдьыыта' } },
  { id: 'm-12', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('c1571011-b5f8-4cd0-98d1-149be80bd21a'),
    prompt: 'Танец в стиле фристайл с элементами хип-хопа. Городская уличная энергетика',
    label: { ru: 'Хип-хоп фристайл', sah: 'Хип-хоп фристайл' } },
  { id: 'm-13', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('062dcd0d-2b81-4e82-8757-8bb1cd491581'),
    prompt: 'Мягкий взмах рукой и приветственный жест. Дружелюбное знакомство с персонажем',
    label: { ru: 'Приветственный жест', sah: 'Эҕэрдэ хамсаныы' } },
  { id: 'm-14', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('22287793-7664-4802-b0a3-ba8c0f65f994'),
    prompt: 'Динамичная серия экшн-поз. Персонаж принимает мощные стойки',
    label: { ru: 'Экшн-позы', sah: 'Экшн позалар' } },
  { id: 'm-15', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('1c1ad507-fd7e-45eb-8f20-5436d3e3f238'),
    prompt: 'Плавная смена поз стоя. Движение в стиле модного фоторедактора',
    label: { ru: 'Смена поз', sah: 'Поза уларыйыыта' } },
  { id: 'm-16', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('f232909a-5eff-4515-9547-5478a7c48616'),
    prompt: 'Выразительный рассказ с активной жестикуляцией. Подача в стиле влога',
    label: { ru: 'Жестикуляция', sah: 'Илии хамсаныылара' } },
  { id: 'm-17', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('1f72d445-36d9-4df6-90e2-b09c299b9de9'),
    prompt: 'Вращение вокруг себя в развевающемся наряде. Раскрытие персонажа на 360 градусов',
    label: { ru: 'Кружение', sah: 'Эргиллии' } },
  { id: 'm-18', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('1ad056fe-79aa-4347-afdc-2b4e360fbed1'),
    prompt: 'Движение «сесть и встать». Естественное повседневное действие',
    label: { ru: 'Сесть и встать', sah: 'Олор уонна тур' } },
  { id: 'm-19', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('c079d025-9bc6-401e-8eaa-ec4057e5c304'),
    prompt: 'Боевые стойки или последовательность приёмов единоборств. Мощные контролируемые движения',
    label: { ru: 'Боевая стойка', sah: 'Охсуһуу туруга' } },
  { id: 'm-20', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('75c8909f-7873-44d1-bb02-5f09317a11ad'),
    prompt: 'Последовательность поз йоги или растяжки. Спокойные контролируемые движения тела',
    label: { ru: 'Йога и растяжка', sah: 'Йога уонна сунуу' } },
  { id: 'm-21', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('aa86f373-d5c3-4a81-abe6-12b5959b8534'),
    prompt: 'Кулинарные движения на кухне. Персонаж готовит еду с естественными жестами',
    label: { ru: 'Кулинарные движения', sah: 'Аһылык хамсаныы' } },
  { id: 'm-22', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('b0aa5384-f5ef-4804-8d3e-393464bc342e'),
    prompt: 'Игра на музыкальном инструменте. Руки и тело двигаются в ритме',
    label: { ru: 'Игра на инструменте', sah: 'Инструмент оонньуу' } },
  { id: 'm-23', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('b7b1dabf-b6f7-4b6e-b57a-e49c4e49dc32'),
    prompt: 'Взмах волосами и бьюти-поза. Гламурное движение в замедленной съёмке',
    label: { ru: 'Бьюти-поза', sah: 'Бьюти поза' } },
  { id: 'm-24', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('3cbb7bc4-1cb0-4930-ae53-6ad1bf5c2ae6'),
    prompt: 'Танец из популярного тренда TikTok. Вирусная хореография для соцсетей',
    label: { ru: 'TikTok тренд', sah: 'TikTok тренд' } },
  { id: 'm-25', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('fc0bb74c-2a62-4113-99cb-f0ee05aaacf3'),
    prompt: 'Профессиональные деловые жесты. Язык тела, подходящий для бизнеса',
    label: { ru: 'Деловой жест', sah: 'Дьарык хамсаныыта' } },
  { id: 'm-26', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('7508928a-5c4c-47f2-81c2-592ebbbdfff2'),
    prompt: 'Прыжок и ликование. Персонаж выражает радость и восторг',
    label: { ru: 'Прыжок радости', sah: 'Үөрүү тэпсиитэ' } },
  { id: 'm-27', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('950b8e26-60d5-46c6-b415-f82e717a5c4e'),
    prompt: 'Лёгкий поворот головы и улыбка. Минимальное элегантное движение для портретов',
    label: { ru: 'Поворот головы', sah: 'Бас эргиллиитэ' } },
  { id: 'm-28', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('d23fcbf7-23a6-4799-88ec-decdfb653de4'),
    prompt: 'Уверенная ходьба на камеру. Персонаж приближается к зрителю',
    label: { ru: 'Подход к камере', sah: 'Камераҕа кэлии' } },
  { id: 'm-29', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('23dd378e-e15a-4bf8-9d53-f2ecd5641e9d'),
    prompt: 'Опирается на стену и отводит взгляд. Расслабленная повседневная поза с движением',
    label: { ru: 'Расслабленная поза', sah: 'Сөпкө поза' } },
  { id: 'm-30', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('1c4f77b2-0eb4-481a-b415-1765aaf4f866'),
    prompt: 'Воздушный поцелуй в камеру. Кокетливый игривый жест',
    label: { ru: 'Воздушный поцелуй', sah: 'Куолай' } },
  { id: 'm-31', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('d0a6a5a5-0dde-4d2d-bf78-59966da9bafa'),
    prompt: 'Берёт предмет и рассматривает его. Естественное взаимодействие рук',
    label: { ru: 'Взаимодействие с объектом', sah: 'Объекнан дьарык' } },
  { id: 'm-32', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('289b7f9f-27be-4457-b767-62e4a6aa8b71'),
    prompt: 'Синхронный групповой танец. Несколько персонажей двигаются вместе',
    label: { ru: 'Групповой танец', sah: 'Бөлөх тэгэлтэ' } },
  { id: 'm-33', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('7107e003-72c2-408a-aebd-fe635f421389'),
    prompt: 'Бег в замедленной съёмке. Драматичное атлетическое движение с эффектом ветра',
    label: { ru: 'Бег в слоумо', sah: 'Сүүрүк слоумода' } },
  { id: 'm-34', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('b9fbbad6-12ee-4b5d-8559-29b8326e5a37'),
    prompt: 'Переход смены образа. Персонаж меняет стиль через плавный монтажный переход',
    label: { ru: 'Смена образа', sah: 'Танас уларыйыыта' } },
  { id: 'm-35', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('459929b4-b2a9-467b-80d2-ab5939cb2654'),
    prompt: 'Облёт камеры вокруг стоящего персонажа. Раскрытие на 360 градусов',
    label: { ru: 'Вращение камеры', sah: 'Камера эргиллиитэ' } },
  { id: 'm-36', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('79698ca2-09eb-4d5d-b280-4c5779bf20e2'),
    prompt: 'Последовательность эмоциональных реакций. Персонаж выражает удивление, радость, смех',
    label: { ru: 'Эмоциональная реакция', sah: 'Эмоция көрдөрүү' } },
  { id: 'm-37', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('98dbdabd-655f-4731-95e0-11d1dc89ae0d'),
    prompt: 'Персонаж оглядывается, изучая окружение. Обнаружение нового пространства',
    label: { ru: 'Осмотр вокруг', sah: 'Тугу эмэ көрүү' } },
  { id: 'm-38', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('9f600689-986b-41e8-95cf-3e03b5d377dc'),
    prompt: 'Финальная поза с характером. Персонаж принимает мощную завершающую стойку',
    label: { ru: 'Финальная поза', sah: 'Бүтэһик поза' } },
];

// ═══════════════════════════════════════════════════
// AVATAR — Kling Avatar Presets (13 персонажей)
// ═══════════════════════════════════════════════════
export const AVATAR_TEMPLATES: VideoPromptTemplate[] = [
  { id: 'a-01', tab: 'avatar', category: 'all', isVideo: true, previewUrl: KA('Sophie'),
    prompt: 'Sophie — профессиональная женщина-ведущая. Чёткая речь, тёплая улыбка, уверенный зрительный контакт. Идеальна для бизнес-презентаций и демонстрации продуктов',
    label: { ru: 'Sophie — презентер', sah: 'Sophie — ыһааччы' } },
  { id: 'a-02', tab: 'avatar', category: 'all', isVideo: true, previewUrl: KA('Amy'),
    prompt: 'Amy — дружелюбная молодая девушка. Непринуждённый разговорный стиль, естественные жесты. Отлично подходит для контента в соцсетях и влогов',
    label: { ru: 'Amy — блогер', sah: 'Amy — блогер' } },
  { id: 'a-03', tab: 'avatar', category: 'all', isVideo: true, previewUrl: KA('Isabella'),
    prompt: 'Isabella — элегантная бьюти-инфлюенсер. Стиль обучающего ролика по макияжу, крупный план, мягкое освещение. Идеальна для бьюти- и фэшн-контента',
    label: { ru: 'Isabella — бьюти', sah: 'Isabella — бьюти' } },
  { id: 'a-04', tab: 'avatar', category: 'all', isVideo: true, previewUrl: KA('Lia'),
    prompt: 'Lia — энергичный молодой автор контента. Динамичная мимика, быстрый темп речи, вовлекающая подача. Идеальна для образовательного и развлекательного контента',
    label: { ru: 'Lia — креатор', sah: 'Lia — креатор' } },
  { id: 'a-05', tab: 'avatar', category: 'all', isVideo: true, previewUrl: KA('Luis'),
    prompt: 'Luis — уверенный мужчина-спикер. Профессиональная манера, чёткая дикция, авторитетный тон. Лучше всего для корпоративного и новостного контента',
    label: { ru: 'Luis — спикер', sah: 'Luis — спикер' } },
  { id: 'a-06', tab: 'avatar', category: 'all', isVideo: true, previewUrl: KA('Ashley'),
    prompt: 'Ashley — тёплый коуч по образу жизни. Спокойная подача, поддерживающие жесты, дружелюбный стиль. Отлично для оздоровительного контента и коучинга',
    label: { ru: 'Ashley — лайфстайл', sah: 'Ashley — лайфстайл' } },
  { id: 'a-07', tab: 'avatar', category: 'all', isVideo: true, previewUrl: KA('Freya'),
    prompt: 'Freya — творческий рассказчик. Выразительное лицо, театральная подача, захватывающий стиль повествования. Идеальна для сторителлинга и брендового контента',
    label: { ru: 'Freya — рассказчик', sah: 'Freya — кэпсээччи' } },
  { id: 'a-08', tab: 'avatar', category: 'all', isVideo: true, previewUrl: KA('Noah'),
    prompt: 'Noah — непринуждённый мужчина-автор. Расслабленная дружелюбная подача, естественная речь, понятная личность. Идеален для обзоров техники и обучающих видео',
    label: { ru: 'Noah — обзорщик', sah: 'Noah — обзорщик' } },
  { id: 'a-09', tab: 'avatar', category: 'all', isVideo: true, previewUrl: KA('Petra'),
    prompt: 'Petra — профессиональная ведущая новостей. Нейтральное выражение лица, ровная манера, формальный тон. Эстетика телевизионной журналистики',
    label: { ru: 'Petra — ведущая', sah: 'Petra — ыһааччы' } },
  { id: 'a-10', tab: 'avatar', category: 'all', isVideo: true, previewUrl: KA('Joon'),
    prompt: 'Joon — современный мужчина-инфлюенсер. Модный стиль, вовлекающая мимика, молодёжная энергия. Идеален для контента поколения Z и соцсетей',
    label: { ru: 'Joon — инфлюенсер', sah: 'Joon — инфлюенсер' } },
  { id: 'a-11', tab: 'avatar', category: 'all', isVideo: true, previewUrl: KA('Charlie'),
    prompt: 'Charlie — доброжелательный мужчина-учитель. Терпеливая манера, понятные объяснения, одобрительные кивки. Отлично для образовательного контента',
    label: { ru: 'Charlie — учитель', sah: 'Charlie — учуутал' } },
  { id: 'a-12', tab: 'avatar', category: 'all', isVideo: true, previewUrl: KA('Raj'),
    prompt: 'Raj — технически подкованный профессионал. Уверенная подача, компетентный тон, современный фон. Идеален для IT-презентаций и деловых выступлений',
    label: { ru: 'Raj — IT-эксперт', sah: 'Raj — IT-эксперт' } },
  { id: 'a-13', tab: 'avatar', category: 'all', isVideo: true,
    previewUrl: 'https://v15-kling.klingai.com/bs2/upload-ylab-stunt-sgp/Fun_Characters.mp4?x-kcdn-pid=112372',
    prompt: 'Мультяшные персонажи — анимированные 2D/3D герои. Игривые утрированные движения, яркий красочный стиль. Идеальны для детского контента и развлечений',
    label: { ru: 'Мультяшные персонажи', sah: 'Мульт персонажтар' } },
];

export const ALL_VIDEO_TEMPLATES = [...VIDEO_TEMPLATES, ...MOTION_TEMPLATES, ...AVATAR_TEMPLATES];
