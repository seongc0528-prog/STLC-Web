/**
 * 위임목사 이력 — `src/assets/docs/류성춘 목사 이력서.docx`(2025-05-13) 기준.
 *
 * 사이트에 한/영 전환 기능이 아직 없어서, 지금은 ko를 본문으로 en을 보조로 함께 띄운다.
 * 나중에 토글이 생기면 같은 데이터에서 한쪽만 고르면 된다.
 *
 * 기관명은 한국어 표기가 분명한 곳만 한글로 옮기고, 해외 기관은 원문을 유지했다.
 */

export type BiText = { ko: string; en: string }

export type CareerEntry = {
  /** 표시용 연도/기간. 원문에 없으면 생략 */
  period?: string
  ko: string
  en: string
  /** 부연 설명 (학위, 재직 기간 등) */
  note?: BiText
}

export const SENIOR_PASTOR = {
  name: { ko: '류성춘', en: 'Seong Choon Lew' } satisfies BiText,
  /** 영문 경칭 — 목사이자 신학박사 */
  honorific: 'Rev. Dr.',
  position: { ko: '위임목사', en: 'Senior Pastor' } satisfies BiText,

  /**
   * 인사말 — **목사님 확인 전 초안**.
   * 지난 설교 67편에서 반복되는 주제(은혜 → 감사 → 나눔 → 섬김 → 공동체)를 추려
   * 교회 표어 "나눔과 섬김과 좋은 만남"을 축으로 엮었다. 문단별 출처는 다음과 같다.
   *
   * 2문단 은혜 — "내게 주신 주님의 그 은혜"(고전 15:9-11), "은혜를 알고 살아가는 삶"
   * 3문단 교회 — "하나님이 교회를 세우신 목적"(대하 7:11-18) / 예배 성구는 요 4:24
   * 4문단 감사·섬김 — "선교하는 마음, 감사하는 삶"(시 136), "섬김의 삶을 사는 사람들"(갈 6:2-5)
   * 5문단 공동체 — "우리가 간직해야 할 교회의 모습"(갈 1:6-8)
   * 6문단 사명 — "그리스도의 향기인 성도"(고후 2:12-17), "우리는 세상의 소금과 빛"(마 5:13-14)
   */
  greeting: {
    ko: [
      '시드니 주님의 교회를 찾아주신 여러분을 주님의 이름으로 환영합니다.',
      '사도 바울은 자신을 가리켜 "나의 나 된 것은 하나님의 은혜로 된 것"이라고 고백했습니다. 저 역시 지난 세월을 돌아보면 제가 이룬 것은 하나도 없고 오직 받은 은혜뿐이었습니다. 우리는 잘나서 이 자리에 모인 사람들이 아니라, 은혜로 부름받아 모인 사람들입니다.',
      '교회는 건물이 아닙니다. 예배와 기도와 응답을 통해 하나님을 만나는 자리가 교회입니다. 하나님은 예배하는 자를 찾으시며, 예배하는 자는 영과 진리로 예배할지니라고 하셨습니다. 주일마다 이곳에서 드리는 예배가 여러분의 한 주간을 붙드는 힘이 되기를 바랍니다.',
      '받은 은혜를 아는 사람은 감사하게 됩니다. 행복의 크기는 소유의 크기가 아니라 감사의 크기에 달려 있습니다. 그리고 감사하는 사람은 나누게 되고, 나누는 사람은 섬기게 됩니다. 서로의 짐을 져 주며 남의 기쁨이 되어 주는 것, 그것이 우리가 배운 섬김입니다.',
      '우리 교회에는 이민의 연수도, 살아온 배경도, 세대도 다른 이들이 함께 모여 있습니다. 그 차이를 넘어서게 하는 힘은 오직 복음의 능력뿐입니다. 나눔과 섬김이 있는 곳에 좋은 만남이 있고, 좋은 만남이 있는 곳에서 교회가 비로소 교회다워집니다.',
      '우리가 사는 호주는 세속의 물결이 거센 땅입니다. 그러나 바로 그렇기 때문에 우리에게 맡겨진 사명이 분명합니다. 세상의 냄새를 그리스도의 향기로 바꾸는 것, 세상의 소금과 빛으로 사는 것입니다.',
      '처음 오신 분도, 오래 이곳을 지켜온 분도 편안히 오십시오. 문은 언제나 열려 있습니다. 여러분의 삶에 하나님의 크신 은혜가 함께하시기를 축복합니다.',
    ],
    en: [
      "Welcome, in the name of our Lord, to Sydney The Lord's Church.",
      'The apostle Paul confessed, "By the grace of God I am what I am." Looking back on my own years, I find nothing I achieved — only grace I received. We are not gathered here because we are worthy, but because grace has called us.',
      'A church is not a building. It is where we meet God through worship, through prayer, and through His answers. God seeks those who worship Him, and those who worship must worship in spirit and in truth. May the worship we offer here each Lord’s Day carry you through the week.',
      "Those who know the grace they have received become thankful. The size of our happiness depends not on the size of what we own but on the size of our gratitude. And the thankful learn to share, and those who share learn to serve. Carrying one another's burdens, becoming a joy to someone else — that is the service we have been taught.",
      'In our congregation are people of different generations, different backgrounds, and different lengths of years in this country. What carries us across those differences is nothing but the power of the gospel. Where there is sharing and service there are good meetings, and where there are good meetings the church becomes truly the church.',
      'Australia is a land where secular currents run strong. But that is precisely why our calling here is clear: to turn the odour of the world into the fragrance of Christ, to live as the salt and light of the earth.',
      'Whether this is your first visit or you have kept watch here for many years, come and be at ease. The door is always open. May the great grace of God be with you.',
    ],
  },

  education: [
    {
      period: '1977',
      ko: '부산장신대학교',
      en: 'Busan Jangshin University',
      note: { ko: '신학사 (B.Th. 우등)', en: 'B.Th. (Honours)' },
    },
    {
      period: '1981',
      ko: 'Seoul Presbyterian Theological College & Seminary',
      en: 'Seoul Presbyterian Theological College & Seminary',
      note: { ko: '목회학석사 동등 과정', en: 'Equiv. M.Div' },
    },
    {
      period: '1999',
      ko: 'United Theological College, Sydney College of Divinity',
      en: 'United Theological College, Sydney College of Divinity',
      note: { ko: '신학사 (B.Th.)', en: 'B.Th.' },
    },
    {
      period: '2000',
      ko: 'United Theological College, Sydney College of Divinity',
      en: 'United Theological College, Sydney College of Divinity',
      note: { ko: '신학석사 (M.Th.)', en: 'M.Th.' },
    },
    {
      period: '2004',
      ko: 'San Francisco Theological Seminary (미국)',
      en: 'San Francisco Theological Seminary, U.S.A.',
      note: { ko: '목회학박사 (D.Min.)', en: 'D.Min.' },
    },
    {
      period: '2014',
      ko: '명지대학교 대학원',
      en: 'Myongji University, Seoul',
      note: { ko: '문학박사 — 사학 (Ph.D. in History)', en: 'Ph.D. in History' },
    },
    {
      ko: 'Wycliffe University (미국)',
      en: 'Wycliffe University, U.S.A.',
      note: { ko: '신학박사 (D.D.)', en: 'D.D.' },
    },
  ] satisfies CareerEntry[],

  ministry: [
    {
      period: '1983',
      ko: '대한예수교장로회 목사 안수',
      en: 'Ordained as a minister in The Presbyterian Church of Korea',
    },
    {
      period: '14년',
      ko: '서울 성심교회 담임목사 (대한민국)',
      en: 'Seoul Sungshim Presbyterian Church, Korea — Senior Pastor',
    },
    {
      period: '4년',
      ko: '시드니한인연합교회 담임목사 (호주)',
      en: 'Sydney Korean Uniting Church, Australia — Senior Pastor',
    },
    {
      period: '16년',
      ko: '시드니 주님의 교회 담임목사 (호주)',
      en: "Sydney The Lord's Church, Australia — Senior Pastor",
    },
  ] satisfies CareerEntry[],

  /** 이력서의 목회 사역 설명 */
  ministryScope: {
    ko: '설교와 성경 교육, 기도회 인도, 성도 훈련과 상담, 심방과 목회적 돌봄, 각종 회의 주재, 교회 대표로서의 노회·총회 참석, 손님 접대',
    en: 'Preaching, teaching the Bible, leading prayer, training church members, counselling, pastoral care, presiding over meetings, attending council meetings as a representative of the church, visiting members to give comfort, and serving guests of the church',
  } satisfies BiText,

  teaching: [
    {
      period: '1981–1982',
      ko: '서울 승의여자고등학교 — 기독교 윤리 및 성경',
      en: "Seungeui Girls' High School, Seoul — Christian Ethics & Bible",
    },
    {
      period: '2001–2005',
      ko: '명지대학교 강사 — 역사와 문화, 문명',
      en: 'Myongji University, Seoul — Lecturer in History, Culture and Civilisation',
    },
    {
      // 이력서 안에서 "2012–2022(10년)"과 "2012.3–2018.9"로 엇갈린다.
      // 확인 전까지는 보수적으로 짧은 쪽을 쓴다.
      period: '2012–2018',
      ko: 'Alphacrucis College (호주) 강사 — 교회사, 삼위일체론, 공공신학, 기독론, 신학과 대중문화, 오늘의 성경 해석, 목회 상담 등',
      en: 'Alphacrucis College, Australia — Lecturer in Church History, Trinity, Public Theology, Christology, Theology and Popular Culture, Interpreting Scripture Today, Pastoral Care and Counselling',
    },
    {
      period: '2023–현재',
      ko: 'KamKor 성경대학 (캄보디아) — 집중 과정',
      en: 'KamKor Biblical College, Cambodia — Intensive course',
    },
  ] satisfies CareerEntry[],

  theses: [
    {
      ko: '한국적 사고 형태 속에서 기독교를 어떻게 제시할 것인가 (영문, B.Th.)',
      en: 'How Christianity can be presented in the Korean thought-forms? (English, B.Th.)',
    },
    {
      // 'neo-authenticism'은 일반적으로 통용되는 용어가 아니지만, 논문 제목이므로
      // 원문 그대로 둔다. 한글 줄에서도 임의로 옮기지 않는다.
      ko: '쇠렌 키르케고르의 실존주의와 칼 바르트의 neo-authenticism 비교 연구 (국문, M.Div.)',
      en: "A comparative study between Soren Kierkegaard's existentialism and Karl Barth's neo-authenticism (Korean, M.Div)",
    },
    {
      ko: '한국적 상황에서의 복음 선교를 위한 기독교 복음의 토착화 (영문, M.Th.)',
      en: 'The indigenisation of the Christian Gospel for evangelical mission in the Korean context (English, M.Th.)',
    },
    {
      ko: '한국 기독교 절기의 문화화 — 성탄절, 부활절, 추수감사절 (영문, D.Min.)',
      en: 'Inculturation of Christian festivals in Korea: Christmas, Easter, Thanksgiving (English, D.Min)',
    },
    {
      ko: '호주 한인 이민교회와 한인 사회 공동체의 성장 비교 연구 (국문, Ph.D.)',
      en: 'A comparative study of the growth between Korean migrant churches and the Korean social community in Australia (Korean, Ph.D)',
    },
  ] satisfies CareerEntry[],

  articles: [
    {
      ko: '호주 백호주의 정책에 대한 역사적 연구 (국문)',
      en: 'A historical study of the White Australia policy (Korean)',
    },
    {
      ko: '호주 다문화주의의 이해 (국문)',
      en: 'The understanding of multiculturalism in Australia (Korean)',
    },
    {
      ko: '호주 한인 이민교회에 관한 역사적 연구 (국문)',
      en: 'A historical study of Korean migrant churches in Australia (Korean)',
    },
  ] satisfies CareerEntry[],
} as const
