#!/usr/bin/env node
/**
 * Save Yandex reviews extracted via Playwright MCP to kan-data/yandex-reviews-extracted.json
 * Reads from agent-tools output file, cleans data, writes JSON.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "kan-data");
const OUT_PATH = join(OUT_DIR, "yandex-reviews-extracted.json");

const SOURCE_URL =
  "https://yandex.uz/maps/org/220794203261/reviews/?ll=69.323081%2C41.324594&z=16";

// Reviews data extracted via browser_evaluate (from MCP output)
const RAW_REVIEWS = [
  {
    authorName: "Анна Иванова",
    date: "",
    content:
      "Проходила лечение у Ольги Вениаминовны и осталась всем очень довольна. Врач всё объясняла спокойно и понятно. Лечение проходило аккуратно и максимально без боли, чувствовалось внимательное отношение к пациенту, уверенность к своей работе и…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: "2",
    images: [],
  },
  {
    authorName: "Мехри Гулямова",
    date: "",
    content:
      "Была на сложном удалении зубов мудрости у Мансура Анваровича и осталась в полном восторге! Врач – настоящий профессионал: провёл процедуру быстро, аккуратно и максимально безболезненно. Ранее очень боялась таких манипуляций, но благодаря его уверенности,…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: "1",
    images: [
      "https://avatars.mds.yandex.net/get-altay/13220791/2a0000019523557c6ad331577bf360bdb19c/S",
      "https://avatars.mds.yandex.net/get-altay/14920824/2a00000195235593efc9ed10e91cf4d61e3d/S",
    ],
  },
  {
    authorName: "Дарья Китаева",
    date: "",
    content:
      "Хочу сказать огромное спасибо врачу-стоматологу-хирургу Мансуру Анваровичу за его профессионализм и внимательный подход! Очень боялась удаления зуба мудрости, особенно после того, как услышала, что случай непростой. Но доктор настолько бережно провел всю процедуру,…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: "1",
    images: [],
  },
  {
    authorName: "SHAKHNOZA PARDAEVA",
    date: "",
    content:
      "Чисто и приятная клиника! Есть личное парковка это большой плюс! В Ресепшене работают красивые вежливые девушки! Во время ожидания предлагают кофе или чай на ваш вкус! Доктора профессионалы своего дела! Оборудование последних поколений! Мы лечим зубы дочери и установили брекеты, очень рады что выбрали именно эту клинику!!!",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [
      "https://avatars.mds.yandex.net/get-altay/14675673/2a00000196636e27bc8e2c07cb062525cf82/S",
    ],
  },
  {
    authorName: "Адель Рязапова",
    date: "",
    content:
      "Была на приёме у Хусана Данияровича, лечила кариес. Всё прошло отлично!  С самого начала ощущалась забота и внимание к деталям. Врач подробно объяснил, что именно будет делать, показывал каждую стадию лечения, что сразу сняло волнение…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Русланн Барабановв",
    date: "",
    content:
      "Отличная клиника !!! Моему малышу 5 лет удалили зубик на высшем уровне ) малыш счастлив без капризов без истерик пришел и ушел довольный ))) \nБольшое спасибо врачу Мансур Аскаров ))) лучший хирург ))",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [
      "https://avatars.mds.yandex.net/get-altay/12820607/2a00000192e86a0b4d094e55072226187e26/S",
    ],
  },
  {
    authorName: "Адель Рязапова",
    date: "",
    content:
      "Хочу выразить благодарность врачу Азизе Хайитовне за профессионально проведённую гигиеническую чистку.\nВсё прошло максимально комфортно — бережно, аккуратно, с вниманием к деталям. Азиза Хайитовна подробно и понятно объяснила каждый…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: "1",
    images: [],
  },
  {
    authorName: "Анна Есикова",
    date: "",
    content:
      "На мой взгляд топ стоматология Ташкента. Высокий уровень сервиса, передовое оборудование,  персонал, который любит свое дело и конечно эстетика",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Abed F.",
    date: "",
    content:
      "Хочу поделиться своим положительным опытом посещения клиники Kan dental. Мне повезло попасть на прием к отличному терапевту- Хусану Данияровичу. С первых минут общения врач создал атмосферу доверия, внимательно выслушал мои жалобы и объяснил все возможные…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Diana RM",
    date: "",
    content:
      "Профессионалы своего дела , работают даже с тяжёлыми случаями, с индивидуальным подходом к каждому пациенту, приходите если хотите уверенность в результате",
    rating: "5.0",
    clinicAnswer: null,
    likes: "1",
    images: [
      "https://avatars.mds.yandex.net/get-altay/16465668/2a0000019ae9709f03abe5c215db8dd20674/S",
    ],
  },
  {
    authorName: "Азиза Анварова",
    date: "",
    content:
      "Хочу выразить огромную благодарность врачу-терапевту Хусану Донияровичу из этой клинике за профессионализм и качественное лечение! Доктор очень подробно обследовал и объяснил все этапы лечения, был внимателен к деталям. Процедура прошла безболезненно…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Нара Исламова",
    date: "",
    content:
      "любимая стоматология, только здесь справляюсь с паническим страхом стоматологии, очень бережное отношение и супер вежливые врачи и ординаторы",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [
      "https://avatars.mds.yandex.net/get-altay/15037708/2a000001957af15ec6284d621b94ec7f2be4/S",
      "https://avatars.mds.yandex.net/get-altay/15288852/2a000001957af1964af4aa2b6e39445b7acf/S",
      "https://avatars.mds.yandex.net/get-altay/15366886/2a000001957af1f07a3190aa0e4e6a4d888c/S",
    ],
  },
  {
    authorName: "Екатерина Еремеева",
    date: "",
    content:
      "Прохожу ортодонтическое лечение у Станислава Александровича. Внимательный к деталям врач. В клинике также работают прекрасные специалисты: гигиенисты Асель Турахановна и Азиза Хайитовна,  стоматолог-терапевт Екатерина Александровна, хирург Мансур…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: "1",
    images: [],
  },
  {
    authorName: "Dinora Badalova",
    date: "",
    content:
      "Огромное СПАСИБО Зухре Джалаловне за ее профессиональный подход к своему делу\nКаждый прием проходит только  в удовольствие\nНачала лечения после консультации и тщательной диагностики,…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: "1",
    images: [],
  },
  {
    authorName: null,
    date: "",
    content:
      "Прохожу ортодонтическое лечение у Анастасии Радиковной, хочу отметить ее большой профессионализм, вежливость, мобильность и оперативность. Всегда интересуется на следующий день  как моё состояние после приема. Мое лечение находится на стадии начала, но…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Алина Екимченко",
    date: "",
    content:
      "Стоматология на высшем уровне!! Были сегодня на приёме у Аскарова Мансура, с 2х месячным малышом (обращались по поводу подрезания уздечки языка). Врач очень внимательный, обходительный и профессионал своего дела👌К нему как-то обращалась моя мама и тоже…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: "1",
    images: [],
  },
  {
    authorName: "Ольга Тян",
    date: "",
    content:
      "Огромное спасибо Асель Турахановне и Захро за качественную и безболезненную чистку зубов,  все объяснили четко и грамотно, просто восхищенна! Благодарю 🫠 Рекомендасьон 💯",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Татьяна пейчева",
    date: "",
    content:
      "Удаляла ретенированную восьмёрку у врача хирурга Мансура Анваровича, очень боялась перед процедурой, но врач успокаивал весь прием, давал передышки, делал все аккуратно, узнавал о моем самочувствии, удалил все аккуратно и восстановление прошло за пару…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: "1",
    images: [],
  },
  {
    authorName: "Нилюфар Мамарасулова",
    date: "",
    content:
      "В Кан дентал обращалась для удаления зуба мудрости. Удалял хирург Мансур Анварович сделал все быстро и четко. Отверствие после удаление зажило быстро и без проблемно . Спасибо.",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Yana K.",
    date: "",
    content:
      "Много лет обслуживаюсь в клинике, всегда на высшем уровне: качественное лечение, профессионализм специалистов, чистота, стерильность, сервис👍\nРекомендую",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Антонина Пак",
    date: "",
    content:
      "Хочу выразить огромную благодарность хирургу Мансуру Анваровичу!😊удаление зуба мудрости прошло безболезненно, быстро и без отека👍🏻",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Ivan Svirid",
    date: "",
    content:
      "Это лучшая стоматологическая клиника в моей жизни. Столько же я натерпелся с разными ковыряльщиками...(( \nА тут мне сделали все четко - идеально! Отзыв пишу спустя почти год - все стоит четко, не беспокоит. Спасибо вам большое, ребят",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Давид Сагитов",
    date: "",
    content:
      "Лечение под седации, действительно помогает, побороть страх лечения, всю жизнь боялся ходить к стоматологам. а тут все прошло на вышем уровне, не чего не почувствовал. Рекомендую 10 из 10",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Адина Утегенова",
    date: "",
    content:
      "Хотелось бы поблагодарить Асель Турахановну наша зубная фея за белоснежную чистку без истерик и слез моей дочери. Благодаря ей моя дочь ходит к зубному без страха. Рекомендую всем родителям посетить эту клинику с детьми.",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Зарина Мамадризаева",
    date: "",
    content:
      "Лечилась у терапевта Хусана Донияровича. Лечение проходило комфортно и безболезненно☺️ Врач был внимательным и заботливым. Результатом очень довольна.",
    rating: "5.0",
    clinicAnswer: null,
    likes: "1",
    images: [],
  },
  {
    authorName: "Хусан Мамадияров(Основа)",
    date: "",
    content:
      "Профессионал своего дела, хирург Мансур Анварович удалял зуб мудрости безболезненно и быстро. Заживление прошло отлично и никакого отека😊",
    rating: "5.0",
    clinicAnswer: null,
    likes: "1",
    images: [],
  },
  {
    authorName: "Азиза А",
    date: "",
    content:
      "Очень хорошая клиника , грамотные врачи , заботливый персонал  везде чисто и уютно. На консультации все подробно объяснили, рассказали. Лечение прошла теперь могу смело улыбаться. И я начала больше внимание уделять своим зубам. Спасибо всем сотрудникам Кан дентал…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Nozima Adxamova",
    date: "",
    content:
      "Врач Анастасия Радиковна за 3-4 месяцев создала мне великолепную улыбку, вы классная док, спасибо. \nКоманда супер профессионалов",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Мухаммад Максудов",
    date: "",
    content:
      "Отличное место. Уровень обслуживания и профессионализм врачей, на моё мнение, на первом месте в Узбекистане. Стоят своих денег. Лечился у доктора Мансура, советую всем",
    rating: "5.0",
    clinicAnswer: null,
    likes: "1",
    images: [],
  },
  {
    authorName: "Мария Незабудкова",
    date: "",
    content:
      "Дорогой дневник, я влюбилась. Во всё, что происходит в этой клинике - врачей, администраторов, медсестёр, в качественное обслуживание, лечение и сервис.",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Азиза И.",
    date: "",
    content:
      "Настоящие профессионалы, подробная консультация, все подобно объясняют, удобный график работы,\nМаксимально безболезненное лечение.\nЕсть скидки при лечении семьёй.\nОчень довольна",
    rating: "5.0",
    clinicAnswer: null,
    likes: "1",
    images: [],
  },
  {
    authorName: "Doctor",
    date: "",
    content:
      "Тут точно решат любые проблемы с зубами! Этим специалистам можно доверять!",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Louisa Angelina Mir",
    date: "",
    content:
      "Сервис хороший, услуги широкие,врачи профессионалы, но цены завышенные очень",
    rating: "4.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "В Арутюнян",
    date: "",
    content:
      "Классная клиника) Все на высшем уровне: и лечение, и администрация. Приемы правда долго длятся, но оно того стоит, рекомендую всем👍🏼",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Андрей Богатов",
    date: "",
    content:
      "Отличная стоматологическая клиника, прекрасная техническая база, все врачи высокой квалификации, очень хороший сервис.",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Kamron Abdukarimov",
    date: "",
    content:
      "К сожалению не был в качестве клиента, так как детский педиатр был в отпуске, но были в зале одидания и увидели некоторые комнаты, очень хорошая стамотологическая клиника, одна из лучших в стране",
    rating: "4.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Акерке Д.",
    date: "",
    content:
      "Удалила ретинированную восьмёрку у хирурга Мансура Анваровича , все прошло замечательно и не какого оттёка 😁",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Moldir Raimbekova",
    date: "",
    content:
      "Довольна процедурой в данной клинике. Сервис на высшем уровне. Рекомендую 👍🏻👍🏻👍🏻",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Анастасия Ким",
    date: "",
    content:
      "Прекрасная атмосфера, дружный коллектив и отличный сервис",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Милана Павлиди",
    date: "",
    content: "супер клиника!",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Zulfiya USMANOVA",
    date: "",
    content:
      "Сервиз на высоком уровне, расценки выше среднего, такого нет даже в Европе👍🏻",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Татьяна К.",
    date: "",
    content: "Все супер 🫶🏻",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Dildora Qurbonova",
    date: "",
    content:
      "Я хочу искренне поблагодарить хирурга-стоматолога Мансура Анваровича. Спасибо вам за исключительную заботу и мастерство в лечении моих зубов. Ваш опыт и деликатный подход сделали то, что могло бы стать стрессовым опытом, по-настоящему комфортным. Я глубоко…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
  {
    authorName: "Айгуля Ходжамкулова",
    date: "",
    content:
      "Худаям чистый и упорядоченный клиника. Инструменталь тоже чистый. Рекомендую киламан!!! Руководство по работе с клиентами и ассистентами гап ЮК! Джудаям любезно предоставлено . Профессиональный любовник дараджада . В поликлинике прибыли…Ещё",
    rating: "5.0",
    clinicAnswer: null,
    likes: null,
    images: [],
  },
];

function cleanContent(s) {
  if (!s) return s;
  return s.replace(/\s*…Ещё\s*$/i, "").trim();
}

const reviews = RAW_REVIEWS.map((r, i) => {
  const content = cleanContent(r.content);
  let authorName = r.authorName;
  if (!authorName && content.includes("Анастасии Радиковной")) {
    authorName = "Ин-Сун Диана Т.";
  }
  if (!authorName) authorName = "Аноним";
  return {
    authorName,
    date: r.date || null,
    content,
    rating: r.rating ? parseFloat(r.rating) : null,
    clinicAnswer: r.clinicAnswer,
    likes: r.likes,
    images: r.images?.filter(Boolean) || [],
    sourceUrl: SOURCE_URL,
  };
});

const output = {
  fetchedAt: new Date().toISOString(),
  source: "yandex",
  sourceUrl: SOURCE_URL,
  extractedVia: "Playwright MCP browser_evaluate",
  reviewCount: reviews.length,
  reviews,
};

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}
writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), "utf8");
console.log(`Written: ${OUT_PATH}`);
console.log(`Reviews: ${reviews.length}`);
