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

const MX = (id: number, res = 360) => `https://assets.mixkit.co/videos/${id}/${id}-${res}.mp4`;
const MX_POSTER = (id: number) => `https://assets.mixkit.co/videos/${id}/${id}-thumb-360-0.jpg`;
const HF = (uuid: string) => `https://cdn.higgsfield.ai/kling_motion_control_preset/${uuid}.mp4`;
const KA = (name: string) => `https://v15-kling.klingai.com/bs2/upload-ylab-stunt-sgp/kling/digital/video/${name}.mp4?x-kcdn-pid=112372`;

// ═══════════════════════════════════════════════════
// VIDEO — Текст в видео
// ═══════════════════════════════════════════════════
export const VIDEO_TEMPLATES: VideoPromptTemplate[] = [
  { id: 'v-cine-01', tab: 'video', category: 'cinematic', isVideo: true, previewUrl: MX(9808524, 360), posterUrl: MX_POSTER(9808524),
    prompt: 'Кадр 1: Общий план — сад на крыше, залитый лунным светом, с гирляндами огней. Молодой человек в джинсовой куртке стоит у края и смотрит на городской горизонт. Камера медленно наезжает. Кадр 2: Средний план — девушка в белом свитере выходит из лестничной двери. Естественный лунный свет, холодная синяя цветокоррекция, кинематографический реализм',
    label: { ru: 'Кинематографическая сцена', sah: 'Кино сцена' } },
  { id: 'v-cine-02', tab: 'video', category: 'cinematic', isVideo: true, previewUrl: MX(4034, 360), posterUrl: MX_POSTER(4034),
    prompt: 'Солнечная прибрежная трасса с крутыми скалами по одну сторону и сверкающим океаном по другую. Золотой час, длинные тени. Элегантный красный кабриолет едет на умеренной скорости. Камера сопровождает автомобиль, затем постепенно отъезжает, открывая широкую береговую линию. Кинематографическое 4K, малая глубина резкости, насыщенная цветокоррекция',
    label: { ru: 'Дорога вдоль океана', sah: 'Океан аарыгар суол' } },
  { id: 'v-cine-03', tab: 'video', category: 'cinematic', isVideo: true, previewUrl: MX(9582, 360), posterUrl: MX_POSTER(9582),
    prompt: 'Крупный план капель дождя, бьющих по оконному стеклу, за которым размыты городские огни. Малая глубина резкости, приглушённый янтарный свет. Замедленная съёмка: потоки воды стекают по стеклу. Меланхоличная кинематографическая атмосфера, ночной город, звуковой дизайн в стиле ASMR',
    label: { ru: 'Дождь по стеклу', sah: 'Ардах чааскыга' } },
  { id: 'v-cine-04', tab: 'video', category: 'cinematic', isVideo: true, previewUrl: MX(4075, 360), posterUrl: MX_POSTER(4075),
    prompt: 'Таймлапс оживлённой городской площади в сумерках. Статичный широкий кадр. Тени удлиняются, уличные фонари загораются один за другим. Люди и машины текут как реки. Насыщенный переход света от золотого к синему, стиль городской документалистики',
    label: { ru: 'Таймлапс города', sah: 'Куорат таймлапс' } },

  { id: 'v-act-01', tab: 'video', category: 'action', isVideo: true, previewUrl: MX(5961, 360), posterUrl: MX_POSTER(5961),
    prompt: 'Скейтбордист выполняет кикфлип в воздухе на залитом солнцем бетонном скейтпарке. Камера: низкий ракурс, шлейф размытия движения за доской. Приземление с ударом. Золотой час, контровой свет создаёт эффект силуэта, динамичная спортивная кинематография',
    label: { ru: 'Экстремальный спорт', sah: 'Экстрим спорт' } },
  { id: 'v-act-02', tab: 'video', category: 'action', isVideo: true, previewUrl: MX(41576, 360), posterUrl: MX_POSTER(41576),
    prompt: 'Дрон мчится по узкой лесной тропе на высокой скорости. Вид от первого лица, быстрое панорамирование, солнечный свет мерцает сквозь густые деревья. Листья шуршат при пролёте. Размытие по краям, резкий центр. FPV-съёмка, утренний туман между деревьями',
    label: { ru: 'FPV полёт в лесу', sah: 'Тыа иһигэр көтүү' } },
  { id: 'v-act-03', tab: 'video', category: 'action', isVideo: true, previewUrl: MX(40985, 360), posterUrl: MX_POSTER(40985),
    prompt: 'Гепард вырывается из высокой золотистой травы, стремительная погоня по саванне, за ним поднимается облако пыли. Камера на уровне земли сопровождает рядом. Замедленная съёмка фиксирует взрывное ускорение. Стиль документалистики о природе, сжатие телеобъектива, тёплый африканский свет',
    label: { ru: 'Дикая природа в движении', sah: 'Хамсаныылаах айылҕа' } },

  { id: 'v-nat-01', tab: 'video', category: 'nature', isVideo: true, previewUrl: MX(4038, 360), posterUrl: MX_POSTER(4038),
    prompt: 'Северное сияние танцует над замёрзшим озером — яркие зелёные и фиолетовые полотна света. На заднем плане заснеженная тайга. Таймлапс с плавным движением, сверхширокоугольный объектив. Видны звёзды, отражения на льду. Кинематографическое 4K, умиротворённое настроение',
    label: { ru: 'Северное сияние', sah: 'Хаҕыс сырдыга' } },
  { id: 'v-nat-02', tab: 'video', category: 'nature', isVideo: true, previewUrl: MX(2213, 360), posterUrl: MX_POSTER(2213),
    prompt: 'Кинематографический кадр: деревянный причал уходит в туманное горное озеро на рассвете. Камера медленно наезжает. Туман плывёт по воде. Птицы вылетают из-за деревьев. Реалистичные отражения, тихие звуки озера, созерцательное настроение, стиль документалистики о природе',
    label: { ru: 'Туманное озеро', sah: 'Туманнаах күөл' } },
  { id: 'v-nat-03', tab: 'video', category: 'nature', isVideo: true, previewUrl: MX(4040, 360), posterUrl: MX_POSTER(4040),
    prompt: 'Таймлапс северного сияния над заснеженными горами. Зелёные и фиолетовые огни волнообразно движутся по звёздному небу. Плавная панорама, открывающая весь горный хребет. Снег отражает цветной свет. Кинематографический широкий план, умиротворённая ночная атмосфера',
    label: { ru: 'Аврора над горами', sah: 'Хайалар үрдүгэр аврора' } },

  { id: 'v-sur-01', tab: 'video', category: 'surreal', isVideo: true, previewUrl: MX(14555, 360), posterUrl: MX_POSTER(14555),
    prompt: 'Лес из хрустальных деревьев, светящихся изнутри неземным светом, отражающих фиолетовое небо. Призматические световые узоры танцуют на кристаллической земле. Камера медленно наезжает вглубь леса. Частицы света поднимаются вверх. Сюрреалистическая, потусторонняя эстетика, цветокоррекция как во сне',
    label: { ru: 'Хрустальный лес', sah: 'Хрусталь тыата' } },
  { id: 'v-sur-02', tab: 'video', category: 'surreal', isVideo: true, previewUrl: MX(4036, 360), posterUrl: MX_POSTER(4036),
    prompt: 'Фигура человека, состоящая из клубящегося дыма, глаза светятся как угли, на фоне разбитых зеркал. Каждое зеркало отражает другую реальность. Камера медленно облетает вокруг, дымные щупальца тянутся наружу. Тёмное драматичное освещение, сюрреалистическая эстетика арт-кино',
    label: { ru: 'Сюрреалистичная сцена', sah: 'Сюрреализм сцена' } },

  { id: 'v-prod-01', tab: 'video', category: 'product', isVideo: true, previewUrl: MX(50417, 360), posterUrl: MX_POSTER(50417),
    prompt: 'Изысканный бургер собирается в воздухе в эффектной замедленной съёмке. Жареная котлета, свежий салат, помидор, плавящийся сыр, поджаренная булочка — влетают на место с разных сторон. Чистый студийный градиентный фон, эффектная контровая подсветка, предметная фотография, профессиональная коммерческая съёмка',
    label: { ru: 'Продуктовый ролик', sah: 'Продукт реклаама' } },
  { id: 'v-prod-02', tab: 'video', category: 'product', isVideo: true, previewUrl: MX(50423, 360), posterUrl: MX_POSTER(50423),
    prompt: 'Платиновые люксовые часы-хронограф медленно вращаются на чёрной бархатной подставке. Макросъёмка: детали циферблата, блики золотых акцентов. Плавный оборот на 360 градусов. Премиальная предметная фотография, драматичная акцентная подсветка, качество 4K',
    label: { ru: 'Люксовый товар', sah: 'Люкс продукт' } },

  { id: 'v-soc-01', tab: 'video', category: 'social', isVideo: true, previewUrl: MX(6102, 360), posterUrl: MX_POSTER(6102),
    prompt: 'Кофейная кружка превращается в ракету и взлетает на фоне рассвета, летят искры. Камера: резкий отъезд, открывается городской пейзаж. Яркие насыщенные цвета, игривая энергия, стиль вирусного короткого видео, быстрые переходы, залипательный цикл',
    label: { ru: 'Вирусный ролик', sah: 'Вирус видео' } },
  { id: 'v-soc-02', tab: 'video', category: 'social', isVideo: true, previewUrl: MX(235, 360), posterUrl: MX_POSTER(235),
    prompt: 'Забавный робот-маскот танцует по футуристической городской улице, вокруг мигают голографические рекламы. Динамичная следящая съёмка. Яркие неоновые цвета, весёлая энергичная атмосфера, вертикальный формат для TikTok, зацикленная анимация, современная цифровая эстетика',
    label: { ru: 'Контент для соцсетей', sah: 'Соцсеть контент' } },
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
  { id: 'm-05', tab: 'motion', category: 'all', isVideo: true, previewUrl: HF('c6295691-22c7-47ae-9a52-0922358ca984'),
    prompt: 'Повседневная уличная поза с поворотом. Естественное движение тела в модном стиле',
    label: { ru: 'Уличный стиль', sah: 'Уулусса стиль' } },
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
