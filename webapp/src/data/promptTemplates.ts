// Курированные шаблоны промптов для генерации картинок
// Категории: portrait, fashion, interior, still_life, fantasy, art
// Источник: Higgsfield Community

export type TemplateCategory = 'portrait' | 'fashion' | 'interior' | 'still_life' | 'fantasy' | 'art';

export type PromptTemplate = {
  id: string;
  category: TemplateCategory;
  prompt: string;
  previewUrl: string;
  label: { ru: string; sah: string };
};

export const CATEGORIES: { id: TemplateCategory | 'all'; labelRu: string; labelSah: string }[] = [
  { id: 'all',        labelRu: 'Все',        labelSah: 'Барыта' },
  { id: 'portrait',   labelRu: 'Портреты',   labelSah: 'Портреттар' },
  { id: 'fashion',    labelRu: 'Мода',       labelSah: 'Мода' },
  { id: 'interior',   labelRu: 'Интерьер',   labelSah: 'Интерьер' },
  { id: 'still_life', labelRu: 'Натюрморт',  labelSah: 'Натюрморт' },
  { id: 'fantasy',    labelRu: 'Фэнтези',    labelSah: 'Фэнтези' },
  { id: 'art',        labelRu: 'Арт',        labelSah: 'Арт' },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // ─── Портреты ───
  {
    id: 'portrait-01',
    category: 'portrait',
    prompt: 'A close-up profile shot of a young East Asian woman showcases intricate styling against a neutral background. Her sleek black hair is decorated with ornate silver chains and adorned with metallic charms including star shapes, pearls, and medallions. A prominent chain crosses her forehead, leading to a large coin-like accessory on one side. The skin texture appears smooth and luminous, with a subtle sheen. She wears a simple silver hoop earring and a brown top, glimpsed from the front. A faint tattoo is visible on her neck. The photo, captured with a digital camera, has a soft, diffuse lighting, highlighting the metallic hair accessories. The color palette is composed of silver, black, brown, and warm skin tones, generating a minimalist, avant-garde aesthetic focusing on the interplay of textures and metallic elements.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Серебряные цепочки', sah: 'Күмүс сынньалаҥнар' },
  },
  {
    id: 'portrait-02',
    category: 'portrait',
    prompt: 'A close-up shot captures an eye of a light-skinned person, framed by bold makeup featuring silver ball studs around the eyelid. The eye is accentuated with heavy black eyeliner forming a dramatic wing, creating a bold and avant-garde look with a layering effect on the lashes. Pale blonde eyebrows, with visible individual strands, frame the top of the image, complementing the warm skin tones around the eye. The image has a shallow depth of field, focusing on the lashes and eye area with a smooth and even texture. The soft lighting creates a natural and even illumination, highlighting the contrast between the matte black eyeliner and the glossy silver accents, giving the overall image a striking and contemporary fashion-focused atmosphere.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Авангардный макияж', sah: 'Авангард макияж' },
  },
  {
    id: 'portrait-03',
    category: 'portrait',
    prompt: 'Close-up selfie of a young East Asian man shot low-angle, wearing reflective sunglasses and a fluffy brown fleece jacket with high collar, his dark hair styled in a mullet. His deadpan, introspective expression and casual pose evoke a candid feel. The background shows a gray asphalt street with the suggestion of an outdoor dining area. Shot with a compact digital camera and direct on-camera flash, with a washed, overexposed mood and digital noise. The palette is muted pastel grays and pale browns with soft earth tones, creating a casual, lo-fi editorial atmosphere.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Уличное селфи', sah: 'Уулусса селфи' },
  },
  {
    id: 'portrait-04',
    category: 'portrait',
    prompt: 'An overhead close-up shot captures the hands of an individual with light skin tone, showcasing long stiletto-shaped acrylic nails. The nails are a gradient of dusty pink, transitioning to beige tips, emphasizing an elongated and dramatic shape. The hands have visible tattoos, including intricate linework and geometric designs. Silver rings adorn fingers on both hands, adding a metallic contrast to the natural hues. The person\'s sleeves have a lace edge detail, contributing a delicate texture against the boldness of the nails. Lighting is soft and diffused, reducing shadows and lending the image a flat, almost clinical aesthetic. The color palette is predominantly neutral with beige, pink, and silver tones. The composition centers the hands against a plain, light gray backdrop, enhancing focus on the nail art and tattoos. The image is sharp with fine details on the skin and fabric textures, creating a bold and edgy atmosphere.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Стильные руки', sah: 'Стильнай илиилэр' },
  },
  {
    id: 'portrait-05',
    category: 'portrait',
    prompt: 'A straight-on, moderate close-up shot shows a young East Asian woman in her early 20s sitting on a honey-brown hardwood floor with her back rested on a creamy shelving unit. She wears a matching, fitted two-piece set in fine ivory knit, sneakers just out of frame. Her long, softly pulled-back, light brown hair is twisted to frame her face, which features soft pink blush and lips. Her left hand, with nails painted a pale neutral, holds a shiny circular silver compact mirror catching a flat highlight from window light; her right hand is raised in a subtle gesture toward her lips. On the shelving just behind her, a small lamp with a slightly warm-toned bulb casts a subtle pool of light across a wrapped book with a pink ribbon, diffused by a lampshade that produces a faint specular pop. The entire room is aglow with soft natural daylight, coming from the left, producing mild shadow edges and a faded, airy look. Dominant tones include creamy ivory, lavender-pink, and muted browns.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Нежный портрет', sah: 'Сыаһар портрет' },
  },

  // ─── Мода ───
  {
    id: 'fashion-01',
    category: 'fashion',
    prompt: 'A straight-on composite medium-to-close shot features two young model-aged women reclining outdoors before a traditional, off-white wood-paneled home in what appears to be a contemporary documentary fashion photograph. The young woman on the left—a fair-skinned Caucasian with long brown curly hair in soft loose waves—wears a pale yellow polka-dot tank top and a textured gray skirt, her relaxed posture propped slightly above her companion, with hands quietly at her sides. To her right, a young East Asian woman with matte, smooth skin and long black hair wears a pale, muted purple dress in a crisp fabric, gazing thoughtfully off-camera while supporting her head with a hand. The background is a minimal expanse of classic home siding, featuring a simple window and a flush-glazed glass door. The natural light is soft and even, with diffuse illumination and gentle specular highlights, lending a subtle, contemplative atmosphere.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Документальная мода', sah: 'Документальнай мода' },
  },
  {
    id: 'fashion-02',
    category: 'fashion',
    prompt: 'A low-angle medium shot captures a young adult Caucasian woman standing in a snowy mountainous landscape. She is wearing a textured ensemble featuring a brown cable-knit jacket over a faux fur coat, with form-fitting leggings and fluffy knee-high boots, all in matching earthy tones. A cream knitted cap and oversized sunglasses complete the look. She stands confidently, one hand on her hip, exuding a sense of fashion-forward poise. The background displays a snow-dusted mountain under a clear, vibrant blue sky. The lighting is bright, likely natural sunlight, creating sharp, crisp highlights and shadows. The scene\'s color palette includes warm browns and creams, contrasted by the cool whites and blues of the snow and sky.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Зимняя мода', sah: 'Кыһынҥы мода' },
  },
  {
    id: 'fashion-03',
    category: 'fashion',
    prompt: 'A high-angle, two-frame composite featuring a young woman with long blonde hair and fair skin, relaxed on concrete steps within an industrial stairwell. She wears a fitted khaki tank top, olive camouflage cargo shorts, and shiny black knee socks with nylon texture. In one frame she covers part of her face with her hand, while in the second she sits with a bent knee, lifts the brim of a dark cap, and her head turns slightly away. Her pose is casual and her attitude laid-back, matching the lo-fi, deadpan, early 2000s fashion editorial style. Scene is urban with geometric metal railings, concrete texture, and muted colors. Lighting is harsh direct on-camera flash, fully illuminating the stairwell, creating uniform hard shadows.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Индустриальный стиль', sah: 'Индустриальнай стиль' },
  },
  {
    id: 'fashion-04',
    category: 'fashion',
    prompt: 'Medium full shot of a skinny young white man with long blonde hair, standing slouched on a clay tennis court, holding sunglasses in his left hand. He wears a white ribbed tank top, shiny loafers with white crew socks, and oversized pale green shorts accented with mint and lilac, styled in a bored, deadpan fashion pose. The geometric white court markings on the clay offer a retro, mundane, editorial background. Lighting is harsh direct on-camera flash with a flat, edge-to-edge exposure typical of a lo-fi digicam snapshot, featuring pastel and earthy neutrals with a pastel pop for the shorts, digital grain, and a gentle flash washout in the image style.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Ретро-эдиториал', sah: 'Ретро эдиториал' },
  },
  {
    id: 'fashion-05',
    category: 'fashion',
    prompt: 'A high-angle, full-body fashion editorial photograph of a young adult South Asian woman with medium brown skin and exceptionally long, thick dark hair tumbling naturally out behind her head, lying face-down with her arms flat at her sides on a large vintage-inspired, intricately patterned rug that evokes a painterly staged backdrop: oversized ornate floral motifs and a palette of dusty blush, taupe, sage, and cream. She wears a plush blush pink faux-fur cropped jacket layered atop a shiny, ruched, delicate peach-pink slip-dress, its wavy hem trimmed with white tulle ruffles, and creamy-taupe over-the-knee cossack boots. The scene is brightly illuminated by broad, directional daylight from the right, creating sculpted light blooming on the plush pile of the jacket.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Роскошный эдиториал', sah: 'Баай эдиториал' },
  },

  // ─── Интерьер ───
  {
    id: 'interior-01',
    category: 'interior',
    prompt: 'A wide-angle interior shot of a modern, eclectic living space dominated by a soft, pastel color palette. The left foreground features a curvaceous, plush pink couch topped with a textured gray throw pillow. Mounted on the adjacent concrete wall, which displays a minimalist industrial vibe, is a calendar marked for January. Across the room, a compact white kitchen area includes a slender refrigerator with paper notes attached to its surface. The dining area features a small round table and a pink chair with a cushion bearing the phrase "LOVE THAT JOURNEY FOR ME." Overhead, a spherical paper lantern adds a warm ambient light to the otherwise naturally lit room. The floor is covered with a light gray rug, which supports a sleek, glass-topped coffee table displaying a doll and various small items. The setting exudes a playful yet cohesive aesthetic, blending utilitarian design with whimsical touches.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Пастельная гостиная', sah: 'Пастельнай холл' },
  },
  {
    id: 'interior-02',
    category: 'interior',
    prompt: 'A spacious indoor scene captures a section of a minimalist, industrial studio space with a corner setup. The primary focus is a freestanding room divider with intricate lace-patterned plastic or mesh panels and black posts, standing against a white wall. The panel\'s lace designs feature floral motifs and delicate, symmetrical detailing. To the right of the divider, a decorative ironwork piece with a diamond shape and scroll patterns leans against the wall. The floor is made of wide, unvarnished wooden planks with signs of wear and paint splatters, adding a rustic texture. The lighting is soft and diffused, likely natural, with no visible direct light sources, resulting in gentle shadowing and a neutral color palette dominated by whites, light grays, and muted wood tones. The space exudes a sparse, utilitarian, and slightly artistic atmosphere, indicative of a contemporary studio or gallery environment.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Минималистичная студия', sah: 'Минималист студия' },
  },
  {
    id: 'interior-03',
    category: 'interior',
    prompt: 'A high-angle medium shot features a modern, minimalist side table made of brushed stainless steel, showcasing a metallic texture with soft reflections. Atop the table, a mushroom-shaped lamp and an ashtray emphasize the table\'s clean, geometric design. The table holds books with visible spines, one reading "Eames," in a lower compartment. Beside it, a black leather chair with visible seams adds contrast. The setting is a simple room with smooth, matte gray flooring and pale walls. Lighting appears natural, casting gentle, diffuse shadows and producing a soft, cool ambient glow. The composition centers the table, creating a balanced image with a neutral gray color palette and metallic accents. The photograph, captured digitally, is sharp, showcasing minimal grain or noise, conveying a sleek, contemporary, and stylish atmosphere.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Дизайнерский столик', sah: 'Дизайнер остуолчук' },
  },
  {
    id: 'interior-04',
    category: 'interior',
    prompt: 'This is a high-angle shot of a young woman, likely of East Asian descent, with straight black hair. She is kneeling on a neutral gray carpeted floor, surrounded by coiled black cables. She wears a black top and cropped pants, paired with pointed nude high-heels. Her focus is on DJ equipment, including a Pioneer DJ controller, positioned amidst the cables. The setting appears to be a minimalist room with metallic silver vertical elements on the wall, contributing to an industrial appearance. The lighting is soft and diffused, creating an even illumination without harsh shadows or highlights. The color palette is primarily composed of subdued grays and blacks, with only a slight hue from the shoes. The image, likely captured digitally, exhibits a candid and contemporary atmosphere, with a focus on the interplay between the subject and her technical environment.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'DJ сетап', sah: 'DJ сетап' },
  },
  {
    id: 'interior-05',
    category: 'interior',
    prompt: 'This image shows a split view of a kitchen on the left side and a person posing on the right side. The kitchen has a green marble countertop, white walls, and natural light, creating a minimalist aesthetic. The person is wearing a yellow cardigan, dark shorts, tall socks, and brown flats while holding a black handbag. The contrast between the setups creates an interesting visual comparison.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Кухня и стиль', sah: 'Кухня уонна стиль' },
  },

  // ─── Натюрморт ───
  {
    id: 'still_life-01',
    category: 'still_life',
    prompt: 'A top-down close-up captures an intricate decorative object resting on a rough-hewn stone surface. The central feature is a spiraled seashell, possessing a lustrous pearlescent sheen, mounted on a dramatic metallic base with swirling, wave-like tendrils. These statuettes extend outward, creating an organic, tentacle-like appearance, and are rendered in a glossy silver finish, reflecting the ambient light. The stone surface beneath is mottled in various shades of gray and beige, contrasting with the slick metallic surface and the smooth luminescence of the shell. The overall ambiance of the image is one of opulence and artistic craftsmanship, with a slightly surreal and mysterious edge.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Ракушка на камне', sah: 'Таас үрдүнээҕи чыычаах' },
  },
  {
    id: 'still_life-02',
    category: 'still_life',
    prompt: 'A top-down shot captures a traditional Eastern tea setup on a wooden serving tray. On the left, a small white ceramic gaiwan contains dark tea leaves, while its lid rests beside it. Next to the gaiwan, a bowl filled with dark tea sits, its surface showing a slight reflective sheen. To the right, a half grapefruit is sliced into segments, revealing its juicy, vibrant pink interior against the pale rind. The wooden tray features evenly spaced slats, with visible tea stains adding a subtle texture to the scene. The lighting is soft, natural, and diffused, coming from a nearby window, casting mellow shadows and creating a cozy atmosphere. The image presents earthy browns and warm pinks set against the neutral wood tones. The clear-focus capture suggests a digital photograph with minimal depth, evoking a serene and contemplative mood.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Чайная церемония', sah: 'Чай церемонията' },
  },
  {
    id: 'still_life-03',
    category: 'still_life',
    prompt: 'A straight-on medium shot showcases an array of vintage items on a lace-textured fabric. Central to the arrangement is an old book titled "The Language of Flowers" with floral illustrations. Surrounding it are vintage Valentine\'s Day cards featuring images of women in early 20th-century attire. The setting also includes heart-shaped tins, small glass bottles, and a locket with a necklace. At the bottom, prominently placed, are a pair of vibrant red leather shoes with a glossy finish, worn with white socks. The color palette consists of muted earth tones with pops of red and gold. The image, likely captured with a modern digital camera, has a deep depth of field ensuring all objects are in sharp focus, creating a nostalgic and curated aesthetic.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Винтажная коллекция', sah: 'Винтаж коллекцията' },
  },
  {
    id: 'still_life-04',
    category: 'still_life',
    prompt: 'A low-angle medium shot of a corner within an indoor space, featuring numerous white candles of varying lengths, some lit, while others appear melted or intact. These candles are arranged in an irregular cluster on a conical mound of hardened, dripped wax, which extends partially up the adjoining walls. The wall surfaces are marked with soot smudges and wax drippings, contributing to a textured, messy appearance. The scene is softly illuminated by the candle flames, casting a warm glow and gentle shadows across the surfaces. Dominant colors include off-white and cream with accents of dark soot marks. The camera captures a deep focus, allowing details of the setup and environmental wear to be visible with soft ambient lighting. The image evokes a rustic, contemplative, and slightly chaotic atmosphere.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Свечи в углу', sah: 'Муочалар' },
  },
  {
    id: 'still_life-05',
    category: 'still_life',
    prompt: 'A side-profile medium shot captures a young East Asian woman in her mid-20s holding a striking bouquet wrapped in a vibrant, glossy blue material. The bouquet features a mix of delicate white flowers and speckled pink blooms with long, slender stems and swirling tendrils, arranged artistically. She wears an ivory sleeveless dress over a black turtleneck, with her straight, dark hair cascading over her shoulder. The plain, light gray background enhances the minimalistic and modern aesthetic. The lighting is soft and diffuse, highlighting the textures of the flowers and the sheen of the wrapping.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Букет в голубой обёртке', sah: 'Күөх бумааҕалаах сибэкки' },
  },

  // ─── Фэнтези ───
  {
    id: 'fantasy-01',
    category: 'fantasy',
    prompt: 'A low-angle full-body shot captures a young adult female-presenting subject, approximately in her early 20s, with extremely pale, porcelain skin and very light, platinum-blond hair—features suggesting a Northern European or albino appearance—standing statuesque on a rocky foreground. She wears sculpted metallic armor-like adornments: a reflective, contoured metal bra with hammered texture and tiny pendant chains, articulated forearm pieces and ornate metal gloves encrusted with filigree, and oversized, high-shine silver trousers that read like liquid metal or laminated vinyl, their surfaces creased with deep specular highlights and sharp fold lines; additional chains and dangling jewelry drape across her hips and torso. The setting is a brooding coastal scene with a massive, curling ocean wave frozen behind her—against a dark, almost monochrome sky. Lighting is dramatic and highly specular: strong high-key rim light from above and slightly behind creates bright highlights on the glossy metals and hair.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Воительница океана', sah: 'Океан сэриичитэ' },
  },
  {
    id: 'fantasy-02',
    category: 'fantasy',
    prompt: 'A direct, slightly high-angle snapshot captures a young East Asian woman with platinum blonde hair lying stretched across a huge green water lily pad in the middle of a reflective pond. She\'s wearing a fitted, long-sleeve cream top and a shimmering silver mini skirt with chunky, pastel yellow knee socks, totally engrossed in her open silver laptop placed in front of her, with the keyboard light flaring slightly. She\'s halfway between serene daydreaming and modern multitasking, surrounded by overlapping clusters of green lily pads with pink lotus blossoms peeking from between, and subtle watery reflections on the surface. The image, while dreamlike in its setup, is rendered with the straightforward, slightly amateur feel of old smartphone 2010s photography.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Девушка на кувшинке', sah: 'Кувшинка үрдүнээҕи кыыс' },
  },
  {
    id: 'fantasy-03',
    category: 'fantasy',
    prompt: 'A straight-on close-up captures a pair of artificial silicone hands with extended red nails, suspended from a silver horizontal bar against a plain white backdrop. The hands have a faux skin surface with visible, subtly mottled \'goosebump\' texturing, colored in pale beige tones, accented by rich reddish-brown and muted gray hues. The hands are decorated with numerous piercings, including pointed silver spikes, and each is adorned with a tattoo: on the right hand, horizontally across the middle, the word \'ethereal\' is clearly written in jet black using the Symphony Pro font, while the left hand bears the horizontally written text \'angel\' in the same typeface. The composition is centered and symmetrical, giving balanced attention to both hands and the silver bar. Shadows are minimal, and the ambient lighting is neutral and diffused. The mood is surreal and slightly uncanny, emphasizing futuristic, fashion-forward, and synthetic aesthetics.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Искусственные руки', sah: 'Оҥоһуу илиилэр' },
  },
  {
    id: 'fantasy-04',
    category: 'fantasy',
    prompt: 'A high-fashion editorial, overhead studio shot presents a statuesque young woman with very fair skin in a contemplative resting pose atop a rectangular mattress styled with rumpled off-white to cream silk linens and two large, slightly flattened pillows at the head. She is dressed in couture-inspired sculptural white satin opera gloves, sheer mesh tights, and a couture ivory turtleneck dress with laces. Above, the background is clipped to a baby blue void, creating a staged minimalist effect around the subject. The light is soft, diffuse, and overhead, causing minimal specular highlights and only gentle shadows within the fabric folds and beneath the resting figure; the model\'s skin displays visible warm subtle translucency at the limbs due to soft surface scattering, evoking an editorial yet intimate, introspective mood.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Сон в облаках', sah: 'Былыт үрдүнээҕи түүл' },
  },
  {
    id: 'fantasy-05',
    category: 'fantasy',
    prompt: 'A straightforward, eye-level shot captures a uniquely shaped cushion placed upright against a white paneled wall in a corner. The cushion is designed in the form of a stylized heart with extended, curling protrusions, reminiscent of flames or tendrils. It is crafted from a shiny, satin-like fabric in a soft pink hue, reflecting light and giving it a glossy appearance. The seams are visible, adding a slightly textured feel to the otherwise smooth material. The setting is minimal, with white walls and flooring, offering a clean, sterile backdrop that highlights the cushion\'s ornate shape and pastel coloring. The ambient lighting is bright and direct, casting soft, diffuse shadows behind and below the cushion, enhancing the texture and creating subtle highlights on the fabric.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Пылающее сердце', sah: 'Куотан сүрэх' },
  },

  // ─── Арт ───
  {
    id: 'art-01',
    category: 'art',
    prompt: 'A straight-on medium shot captures a handmade jellyfish-shaped lamp sitting on a light green tabletop, against a cluttered indoor background. The lamp features a textured blue fabric shade with intricate patterns and dangling, translucent strands resembling seaweed, embellished with colorful sequins and faux pearls. It emits a soft, cool blue glow that highlights its wavy, organic shapes. The base combines blue and green textured materials, lending a natural, oceanic aesthetic. The environment includes various small objects and decorations, creating a busy, personal workspace atmosphere. The lighting is even, with a focus on the lamp\'s illumination, setting a whimsical and creative mood.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Лампа-медуза', sah: 'Медуза лаампа' },
  },
  {
    id: 'art-02',
    category: 'art',
    prompt: 'A focus shot captures an abstract, sculptural lamp set against a neutral, dim backdrop. The lamp features a woven, textured shade in soft purple hues, organically draped over an intricate, twisted metallic stand with a glossy, dark finish. The light source from within casts faint, warm shadows through the fibers, revealing a delicate translucency. The stand forms a loose spiral at its base, and a cord extends slightly into the foreground. The surface and wall are smooth and muted, lacking detail and drawing attention to the lamp. The image\'s high contrast highlights the lamp\'s whimsical and artistic design, evoking a moody, surreal atmosphere.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Скульптурная лампа', sah: 'Скульптура лаампа' },
  },
  {
    id: 'art-03',
    category: 'art',
    prompt: 'A straight-on, angled medium shot captures a sculptural object displayed on a white pedestal against a neutral background. The object features a pink, fabric-textured component resembling folded clay or fabric, held by an intricately sculpted metallic frame with a natural, branch-like design. The frame exhibits a metallic silver hue, providing a stark contrast to the dusty rose color and soft texture of the padded element. The background is plain and softly lit, allowing full focus on the object itself. The scene is brightly illuminated with diffused, soft lighting eliminating harsh shadows, suggesting a studio environment. The overall mood is minimalist and contemporary, highlighting the artistic and textured elements of the object.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Арт-объект', sah: 'Арт объект' },
  },
  {
    id: 'art-04',
    category: 'art',
    prompt: 'A medium shot captures a slender dog walking through a snowy landscape. The dog is dressed in a striking lavender-blue, fluffy, woolen coat with a distinct collar, and wears brown and beige protective boots on its legs, contrasting the smooth texture of its short beige fur. The dog\'s head is turned to the side, revealing its alert expression and streamlined body. A brown leash extends from the dog\'s collar out of the frame, suggesting a walk in progress. The background is composed of textured, snow-covered ground with scattered footprints, and the overall color palette includes cool whites and soft lavenders. Natural outdoor lighting creates soft shadows and highlights on the fur and snow, evoking a cozy yet brisk winter atmosphere.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Стильный пёс', sah: 'Стильнай ыт' },
  },
  {
    id: 'art-05',
    category: 'art',
    prompt: 'A young white woman in her 20s, captured in a dynamic, flowing sequence of five overlapping exposure-like figures, as if caught in candid motion. She wears a striking light pink tank top with thin straps, light gray sporty cotton shorts, mint green ribbed knee socks, and glossy white ballet shoes. Her expression is deadpan, facing slightly off camera, nonchalant. The scene is shot in the corner of a minimally furnished white room, background is stark, with a slightly cramped feel. Lighting is harsh direct on-camera flash, hard flash shadows, snap-shot aesthetic with soft pastels and neutral tones, highlighting fabric textures and a lo-fi, digital 2000s fashion editorial mood.',
    previewUrl: 'https://images.higgs.ai/?w=400&q=80',
    label: { ru: 'Мультиэкспозиция', sah: 'Мультиэкспозиция' },
  },
];
