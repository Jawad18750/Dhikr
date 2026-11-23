/**
 * Our reciters' names for pages in other scripts: Latin (English, French, German,
 * Spanish, Turkish, Indonesian, Malay), Cyrillic (Russian) and Bengali. Arabic, Urdu
 * and Persian read the catalogue's own Arabic name. By moshaf slug; a reciter missing
 * here keeps his Arabic name everywhere.
 */
type Names = { latn: string; cyrl: string; beng: string };

const NAMES: Record<string, Names> = {
  ali_alyounse: { latn: 'Ali Al-Younsi', cyrl: 'Али аль-Юнси', beng: 'আলী আল-ইউনুসী' },
  moaad_benhamed: { latn: 'Moaad Ben Hamed', cyrl: 'Муаз бен Хамид', beng: 'মুয়াজ বিন হামিদ' },
  ahmed_algriw: { latn: 'Ahmed Ahmed Al-Griw', cyrl: 'Ахмед Ахмед аль-Гриу', beng: 'আহমাদ আহমাদ আল-গারিউ' },
  taha_alfahd: { latn: 'Taha Al-Fahd', cyrl: 'Таха аль-Фахд', beng: 'ত্বহা আল-ফাহাদ' },
  ibrahim_kishidan: { latn: 'Ibrahim Kishidan', cyrl: 'Ибрахим Кишидан', beng: 'ইবরাহীম কিশিদান' },
  walid_alnaehi: { latn: 'Walid Al-Naehi', cyrl: 'Валид ан-Наихи', beng: 'ওয়ালিদ আন-নায়েহী' },
  ahmed_alqulaib: { latn: 'Ahmed Abdullah Al-Qulaib', cyrl: 'Ахмед Абдуллах аль-Кулейб', beng: 'আহমাদ আবদুল্লাহ আল-কুলাইব' },
  bilal_ben_mahmoud: { latn: 'Bilal Ben Mahmoud', cyrl: 'Билял бен Махмуд', beng: 'বিলাল বিন মাহমুদ' },
  mustafa_alfarjani: { latn: 'Mustafa Al-Farjani', cyrl: 'Мустафа аль-Фарджани', beng: 'মুস্তফা আল-ফারজানী' },
  abdulhamid_algriw: { latn: 'Abdulhamid Al-Griw', cyrl: 'Абдульхамид аль-Гриу', beng: 'আবদুল হামিদ আল-গারিউ' },
  ahmed_saleh_rajab: { latn: 'Ahmed Saleh Rajab', cyrl: 'Ахмед Салих Раджаб', beng: 'আহমাদ সালেহ রজব' },
  mustafa_mtawa: { latn: 'Mustafa Mtawa', cyrl: 'Мустафа Матауа', beng: 'মুস্তফা মুতাওয়া' },
  ahmed_hussein_alalam: { latn: 'Ahmed Al-Hadi Al-Alam', cyrl: 'Ахмед аль-Хади аль-Алям', beng: 'আহমাদ আল-হাদী আল-আলম' },
  khaled_alturki: { latn: 'Khaled Al-Turki', cyrl: 'Халид ат-Турки', beng: 'খালিদ আত-তুর্কী' },
  mohamed_fadil: { latn: 'Mohamed Fadil', cyrl: 'Мухаммад Фадиль', beng: 'মুহাম্মাদ ফাদিল' },
  mohamed_khalil_alzarouq: { latn: 'Mohamed Khalil Al-Zarouq', cyrl: 'Мухаммад Халиль аз-Зарук', beng: 'মুহাম্মাদ খলিল আয-যারুক' },
  ahmed_almajidi: { latn: 'Ahmed Al-Majidi', cyrl: 'Ахмед аль-Маджиди', beng: 'আহমাদ আল-মাজিদী' },
  mohamed_saleh_kitti: { latn: 'Mohamed Saleh Kitti', cyrl: 'Мухаммад Салих Китти', beng: 'মুহাম্মাদ সালেহ কিত্তি' },
  mohamed_alsharif_hwail: {
    latn: 'Mohamed Al-Sharif Hwail & Faraj Al-Saiti',
    cyrl: 'Мухаммад аш-Шариф Хувейль и Фарадж ас-Саити',
    beng: 'মুহাম্মাদ আশ-শরীফ হুওয়াইল ও ফারাজ আস-সাইতী',
  },
  mohamed_aldarouqi: { latn: 'Mohamed Mahmoud Al-Darouqi', cyrl: 'Мухаммад Махмуд ад-Друки', beng: 'মুহাম্মাদ মাহমুদ আদ-দারুকী' },
  nooreddine_almeslati_v2: { latn: 'Nooreddine Al-Meslati', cyrl: 'Нуруддин аль-Мислати', beng: 'নূরুদ্দীন আল-মিসলাতী' },
  mohamed_alhudairi: { latn: 'Mohamed Al-Hudairi', cyrl: 'Мухаммад аль-Худейри', beng: 'মুহাম্মাদ আল-হুদাইরী' },
  issam_alrubai: { latn: 'Issam Al-Rubai', cyrl: 'Исам ар-Рубаи', beng: 'ইসাম আর-রুবাঈ' },
  ibrahim_shehata_almaghribi: { latn: 'Ibrahim Shehata Al-Maghribi', cyrl: 'Ибрахим Шехата аль-Магриби', beng: 'ইবরাহীম শেহাতা আল-মাগরিবী' },
  abdulaziz_alwarghami: { latn: 'Abdulaziz Al-Warghami', cyrl: 'Абдульазиз аль-Варгами', beng: 'আবদুল আজিজ আল-ওয়ারগামী' },
  ahmed_shahin_qaloon: { latn: 'Ahmed Shahin', cyrl: 'Ахмед Шахин', beng: 'আহমাদ শাহীন' },
  abdulsalam_alabidi: { latn: 'Abdulsalam Al-Abidi', cyrl: 'Абдуссалям аль-Абиди', beng: 'আবদুস সালাম আল-আবিদী' },
  hudhaifa_alfitouri: { latn: 'Hudhaifa Al-Fitouri', cyrl: 'Хузейфа аль-Фитури', beng: 'হুযাইফা আল-ফিতুরী' },
  abdulrahman_benhamed: { latn: 'Abdulrahman Ben Hamed', cyrl: 'Абдуррахман бен Хамид', beng: 'আবদুর রহমান বিন হামিদ' },
  naji_atiya_bensalman: { latn: 'Naji Atiya Ben Salman', cyrl: 'Наджи Атыйя бен Сальман', beng: 'নাজি আতিয়া বিন সালমান' },
  salah_albaji: { latn: 'Salah Al-Baji', cyrl: 'Салах аль-Баджи', beng: 'সালাহ আল-বাজী' },
  abdulbaset_dabbaj: { latn: 'Abdulbaset Dabbaj', cyrl: 'Абдульбасит Даббадж', beng: 'আবদুল বাসিত দাব্বাজ' },
  khalifa_bitro: { latn: 'Khalifa Bitro', cyrl: 'Халифа Битру', beng: 'খলিফা বিতরু' },
  abubakr_ali: { latn: 'Abubakr Ali', cyrl: 'Абу Бакр Али', beng: 'আবু বকর আলী' },
  saber_abdulhakam: { latn: 'Saber Abdulhakam', cyrl: 'Сабир Абдульхакам', beng: 'সাবির আবদুল হাকাম' },
  arafat_aljumaii: { latn: 'Arafat Al-Jumaii', cyrl: 'Арафат аль-Джумаи', beng: 'আরাফাত আল-জুমাঈ' },
  shaya_altamimi: { latn: 'Shaya Al-Tamimi', cyrl: 'Шаи ат-Тамими', beng: 'শায়ে আত-তামিমী' },
};

const SCRIPT: Record<string, keyof Names | null> = {
  ar: null,
  ur: null,
  fa: null,
  ru: 'cyrl',
  bn: 'beng',
};

/** The reciter's name as a reader of `locale` writes it. */
export function reciterName(slug: string, arabic: string, locale: string): string {
  const script = locale in SCRIPT ? SCRIPT[locale] : 'latn';
  if (!script) return arabic;
  return NAMES[slug]?.[script] ?? arabic;
}
