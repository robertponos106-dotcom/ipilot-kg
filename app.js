/* IPilot KG — интерфейс приложения. Расчёты в rules.js, база знаний в kb.js. */
(function () {
  'use strict';
  var R = window.IPRules, KB = window.IPKB;
  var STORE_KEY = 'ipilot.state.v1';
  var IS_STANDALONE = !window.claude; // открыт с нашего сервера, а не внутри claude.ai

  /* ================= Переводы ================= */
  var T = {
    ru: {
      tab_home: 'Главная', tab_revenue: 'Выручка', tab_report: 'Отчёт', tab_assistant: 'Помощник',
      hello: 'Салам, {name}', demo_badge: 'Пример',
      demo_banner: 'Это пример: магазин одежды Айгуль. Создайте свой профиль — это займёт минуту.',
      demo_cta: 'Создать свой',
      tax_for: 'Единый налог за {period}', tax_sofar: 'период ещё идёт — сумма на сегодня',
      rate_rev: 'ставка {rate} · выручка {rev}',
      days: 'дн.', due_report: 'Сдать отчёт STI-091 и оплатить', due_by: 'до {date}', overdue: 'срок прошёл',
      open_draft: 'Открыть черновик отчёта', add_revenue: 'Записать выручку', ask_ai: 'Спросить ИИ',
      upcoming: 'Ближайшие сроки', all: 'Все напоминания',
      cal_add: 'Добавить в Google Календарь', ics_add: 'Скачать в календарь телефона (.ics)', ics_all: 'Все сроки в календарь (.ics)',
      not_required: 'не нужно',
      dl_report: 'Отчёт STI-091 и оплата налога', dl_end: 'Единая налоговая декларация', dl_patent: 'Оплата патента',
      dl_report_d: 'За {period}', dl_tax: 'Налог: {tax}', dl_sofar: 'Пока набралось: {tax}',
      act_trade: 'Торговля', act_production: 'Производство, IT, туризм', act_services: 'Услуги', act_catering: 'Общепит', act_other: 'Другое',
      reg_single: 'Единый налог', reg_patent: 'Патент',
      cat_small: 'Малый бизнес', cat_medium: 'Средний бизнес', cat_large: 'Крупный бизнес', cyc_quarter: 'Отчёт раз в квартал', cyc_month: 'Отчёт каждый месяц',
      end_no: 'ЕНД не нужна', end_yes: 'ЕНД до 1 мая',
      unsupported_title: 'Этот случай мы пока не считаем', call116: 'Консультация ГНС: 116',
      patent_title: 'Патент: оплата в месяц', patent_sub: 'годовая сумма {annual} / 12 · отчёт не нужен', patent_due: 'Оплатить патент',
      rev_title: 'Выручка', cash: 'Наличные', noncash: 'Безнал', total: 'Всего',
      rev_add_title: 'Записать выручку', amount: 'Сумма, сом', date: 'Дата', save: 'Записать',
      ai_input_label: 'Или напишите как есть — ИИ разберёт', ai_input_ph: 'продал на 15 тыс, из них 5 тыс переводом',
      ai_parse: 'Разобрать', parse_found: 'Проверьте и добавьте:', add: 'Добавить', cancel: 'Отмена',
      history: 'Записи за {period}', no_entries: 'За этот период записей нет.', by_week: 'Выручка по неделям',
      deleted: 'Запись удалена', added: 'Выручка записана',
      parse_fail: 'Не нашёл сумму. Напишите, например: «продал на 12 000».', bad_amount: 'Введите сумму больше нуля',
      report_title: 'Черновик отчёта', period: 'Период',
      period_running: 'Период ещё идёт. Значения изменятся, пока вы записываете выручку.',
      disclaimer: 'Это черновик для проверки. Отчёт отправляете вы сами в кабинете налогоплательщика.',
      form_name: 'Отчёт по единому налогу', sec1: 'Раздел I. О налогоплательщике', sec2: 'Раздел II. Расчёт единого налога',
      c001: 'Вид отчёта', v001: 'Первоначальный', c102: 'ИНН', c103: 'ФИО', c104: 'Налоговый орган', auto: 'заполнит кабинет',
      c115: 'Контактный телефон', v115: 'ваш номер', c201: 'Начало периода', c202: 'Конец периода',
      cell_base: 'Выручка за период', cell_rate: 'Ставка, %', cell_tax: 'Сумма налога',
      cell_base_cash: 'Выручка наличными', cell_rate_cash: 'Ставка (наличные), %', cell_tax_cash: 'Налог с наличных',
      cell_base_noncash: 'Выручка безналом', cell_rate_noncash: 'Ставка (безнал), %', cell_tax_noncash: 'Налог с безнала',
      cell_row_total: 'Итого по строке', cell_total_base: 'Итого налогооблагаемая база', cell_total_tax: 'Общая сумма единого налога',
      rest: 'Остальные строки формы заполнять не нужно ({n})', rest_hide: 'Скрыть',
      formula: 'Как посчитано', sources: 'Источники',
      steps_title: 'Как подать в кабинете',
      step1: 'Откройте cabinet.salyk.kg и войдите.',
      step2: 'Раздел «Е-отчёты» → форма STI-091 → период {period}.',
      step3: 'Отметьте «Первоначальный» и перенесите значения из жёлтых ячеек.',
      step4: 'Нажмите проверку, сохраните и отправьте.',
      step5: 'Проверьте статус отчёта и оплатите {tax} до {date}.',
      ai_explain: 'ИИ: объясни мой отчёт по шагам', ai_explain_title: 'Объяснение ИИ',
      confirm: 'Я проверил данные и сам отправлю отчёт', confirmed: 'Отмечено: данные проверены',
      copy_all: 'Скопировать значения', copied: 'Скопировано', stop: 'Стоп', thinking: 'Думаю…',
      report_patent: 'На патенте отчёт по единому налогу не сдаётся. Достаточно оплачивать патент до 1 числа каждого месяца.',
      assistant_title: 'ИИ-помощник', assistant_sub: 'Отвечает по документам ГНС и знает ваш профиль. Считает не ИИ, а проверенный модуль.',
      q1: 'Нужно ли мне сдавать ЕНД?', q2: 'Почему у меня такая ставка?', q3: 'Что будет, если пропущу срок?', q4: 'Как подать отчёт в кабинете?',
      chat_ph: 'Спросите про налоги…', send: 'Отправить',
      chat_hello: 'Салам! Я IPilot. Спросите про ваш налог, сроки или отчёт — отвечу по документам ГНС.',
      ai_off: 'ИИ здесь недоступен. Расчёты, черновик отчёта и сроки работают без него.',
      ai_err: 'Не получилось получить ответ. Попробуйте ещё раз.', ai_denied: 'Доступ к ИИ не разрешён в этом окне.',
      ai_rate: 'Слишком много запросов. Подождите минуту и попробуйте снова.',
      ai_mode_claude: 'ИИ подключён', ai_mode_server: 'ИИ подключён через сервер IPilot',
      profile_title: 'Профиль ИП', name: 'Имя', shop: 'Бизнес', regime: 'Режим', activity: 'Вид деятельности',
      revenue12: 'Выручка за 12 месяцев, сом', city: 'Город', bishkek: 'Бишкек', osh: 'Ош', other_city: 'Другой', patent_place: 'Где торгуете', analysis: 'Что это значит для вас',
      reminders: 'Напоминания', reminders_sub: 'Добавьте сроки в календарь телефона — он напомнит за 5 дней и за 1 день.',
      edit_profile: 'Пройти опрос заново', load_demo: 'Показать пример', reset_data: 'Удалить мои данные',
      reset_confirm: 'Нажмите ещё раз, чтобы удалить профиль и всю выручку.', reset_done: 'Данные удалены',
      rules_ver: 'Правила обновлены {v}. Ставки по данным sti.gov.kg. Если сомневаетесь, позвоните в ГНС: 116.',
      saved: 'Сохранено', save_profile: 'Сохранить профиль',
      flags: 'Особенности', tf_import: 'Ввожу или вывожу товар за границу', tf_distr: 'Я дистрибьютор',
      tf_pharma: 'Продаю лекарства, медизделия или ГСМ', tf_zone: 'Работаю на Дордое, Мадине или Туратали',
      onb_welcome_title: 'Посчитаем ваш налог за минуту',
      onb_welcome_text: 'Шесть коротких вопросов. Ответы хранятся только на этом устройстве.',
      start: 'Начать', next: 'Дальше', back: 'Назад', done: 'Готово',
      onb_name_title: 'Как к вам обращаться?', onb_shop_ph: 'Например: магазин одежды',
      onb_regime_title: 'Как вы платите налог?',
      reg_single_d: 'Отчёт раз в квартал или месяц, процент от выручки', reg_patent_d: 'Фиксированная сумма каждый месяц',
      reg_unknown: 'Не знаю', reg_unknown_d: 'Пока считаем как единый налог. Режим можно посмотреть на sti.gov.kg → «Информация по ИНН».',
      onb_activity_title: 'Чем вы занимаетесь?',
      act_trade_d: 'Магазин, место на рынке, продажа товаров', act_production_d: 'Производство товаров, разработка ПО, туроператоры',
      act_services_d: 'Ремонт, салон, перевозки и другие услуги', act_catering_d: 'Кафе, столовая, фастфуд', act_other_d: 'Швейное, ювелирка, стройка, сауна…',
      onb_trade_title: 'Уточним про торговлю', onb_trade_text: 'Отметьте, если это про вас. От этого зависит ставка.',
      onb_patent_title: 'Где вы торгуете?',
      pp_stall: 'Лоток, прилавок, палатка на рынке', pp_container: 'Контейнер или павильон на рынке', pp_shop30: 'Магазин до 30 м² не на рынке',
      onb_rev_title: 'Сколько выручки за последние 12 месяцев?', onb_rev_hint: 'Можно примерно. От этого зависит ставка.',
      onb_result_title: 'Вот что получилось', your_rate: 'Ваша ставка', report_every: 'Отчёт', every_quarter: 'раз в квартал', every_month: 'каждый месяц',
      next_deadline: 'Ближайший срок', cells_lbl: 'Ячейки STI-091:',
      cycle_title: 'Цикл отчёта и оплаты',
      cycle_month: 'Каждый месяц', cycle_quarter: 'Раз в квартал',
      cycle_hint: 'Выберите, как вы сдаёте отчёт и платите налог. Отсчёт дней и напоминания подстроятся под цикл.',
      onb_cycle_title: 'Как часто вы сдаёте отчёт и платите налог?', onb_cycle_text: 'Можно поменять в любой момент на главной.',
      cyc_month_d: 'Срок — до 20 числа следующего месяца', cyc_quarter_d: 'Срок — до 20 числа месяца после квартала',
      cycle_set: 'Цикл: {c}', rate_card_title: 'Ставка и цикл оплаты',
      legal_rate: 'По таблице ГНС для вашего вида деятельности: {r}', legal_rate_none: 'Для вашего вида деятельности в приложении нет табличной ставки — укажите свою.',
      custom_on: 'Указать свою ставку', custom_cash: 'Своя ставка, % (наличные)', custom_noncash: 'Своя ставка, % (безнал)', custom_single: 'Своя ставка, %',
      custom_sub: 'Например, если у вас льгота или ставка изменилась. Налог, черновик отчёта и напоминания пересчитаются по вашей ставке.',
      save_rate: 'Сохранить ставку', chip_custom: 'Своя ставка {r}', bad_rate: 'Ставка должна быть от 0 до 100%', set_rate: 'Указать ставку'
    },
    ky: {
      tab_home: 'Башкы бет', tab_revenue: 'Киреше', tab_report: 'Отчёт', tab_assistant: 'Жардамчы',
      hello: 'Салам, {name}', demo_badge: 'Мисал',
      demo_banner: 'Бул мисал: Айгүлдүн кийим дүкөнү. Өз профилиңизди түзүңүз — бир мүнөт гана кетет.',
      demo_cta: 'Өзүмдүкүн түзүү',
      tax_for: '{period}: бирдиктүү салык', tax_sofar: 'мезгил али бүтө элек — бүгүнкү сумма',
      rate_rev: 'ставка {rate} · киреше {rev}',
      days: 'күн', due_report: 'STI-091 отчётун тапшырып, төлөө', due_by: '{date} чейин', overdue: 'мөөнөтү өттү',
      open_draft: 'Отчёттун долбоорун ачуу', add_revenue: 'Кирешени жазуу', ask_ai: 'ИИден суроо',
      upcoming: 'Жакынкы мөөнөттөр', all: 'Бардык эскертүүлөр',
      cal_add: 'Google Календарга кошуу', ics_add: 'Телефондун календарына жүктөө (.ics)', ics_all: 'Бардык мөөнөттөрдү календарга (.ics)',
      not_required: 'кереги жок',
      dl_report: 'STI-091 отчёту жана салык төлөө', dl_end: 'Бирдиктүү салык декларациясы', dl_patent: 'Патентти төлөө',
      dl_report_d: '{period} үчүн', dl_tax: 'Салык: {tax}', dl_sofar: 'Азырынча: {tax}',
      act_trade: 'Соода', act_production: 'Өндүрүш, IT, туризм', act_services: 'Кызмат көрсөтүү', act_catering: 'Коомдук тамактануу', act_other: 'Башка',
      reg_single: 'Бирдиктүү салык', reg_patent: 'Патент',
      cat_small: 'Чакан бизнес', cat_medium: 'Орто бизнес', cat_large: 'Ири бизнес', cyc_quarter: 'Отчёт чейрегине бир жолу', cyc_month: 'Отчёт ай сайын',
      end_no: 'БСД кереги жок', end_yes: 'БСД 1-майга чейин',
      unsupported_title: 'Бул учурду азырынча эсептебейбиз', call116: 'МСКнын кеңеши: 116',
      patent_title: 'Патент: айлык төлөм', patent_sub: 'жылдык сумма {annual} / 12 · отчёт кереги жок', patent_due: 'Патентти төлөө',
      rev_title: 'Киреше', cash: 'Накталай', noncash: 'Накталай эмес', total: 'Бардыгы',
      rev_add_title: 'Кирешени жазуу', amount: 'Сумма, сом', date: 'Күнү', save: 'Жазуу',
      ai_input_label: 'Же жөн эле жазыңыз — ИИ түшүнөт', ai_input_ph: '15 миңге саттым, анын 5 миңи которуу менен',
      ai_parse: 'Талдоо', parse_found: 'Текшерип, кошуңуз:', add: 'Кошуу', cancel: 'Жокко чыгаруу',
      history: '{period}: жазуулар', no_entries: 'Бул мезгилде жазуу жок.', by_week: 'Жумалар боюнча киреше',
      deleted: 'Жазуу өчүрүлдү', added: 'Киреше жазылды',
      parse_fail: 'Сумманы таппадым. Мисалы: «12 000ге саттым» деп жазыңыз.', bad_amount: 'Нөлдөн чоң сумма жазыңыз',
      report_title: 'Отчёттун долбоору', period: 'Мезгил',
      period_running: 'Мезгил али бүтө элек. Киреше жазган сайын маанилер өзгөрөт.',
      disclaimer: 'Бул текшерүү үчүн долбоор. Отчётту салык төлөөчүнүн кабинетинде өзүңүз жөнөтөсүз.',
      form_name: 'Бирдиктүү салык боюнча отчёт', sec1: 'I бөлүм. Салык төлөөчү жөнүндө', sec2: 'II бөлүм. Бирдиктүү салыкты эсептөө',
      c001: 'Отчёттун түрү', v001: 'Баштапкы', c102: 'ИСН', c103: 'Аты-жөнү', c104: 'Салык органы', auto: 'кабинет өзү толтурат',
      c115: 'Байланыш телефону', v115: 'номериңиз', c201: 'Мезгилдин башы', c202: 'Мезгилдин аягы',
      cell_base: 'Мезгилдеги киреше', cell_rate: 'Ставка, %', cell_tax: 'Салыктын суммасы',
      cell_base_cash: 'Накталай киреше', cell_rate_cash: 'Ставка (накталай), %', cell_tax_cash: 'Накталайдан салык',
      cell_base_noncash: 'Накталай эмес киреше', cell_rate_noncash: 'Ставка (накталай эмес), %', cell_tax_noncash: 'Накталай эместен салык',
      cell_row_total: 'Сап боюнча жыйынтык', cell_total_base: 'Салык салынуучу базанын жыйынтыгы', cell_total_tax: 'Бирдиктүү салыктын жалпы суммасы',
      rest: 'Форманын калган саптарын толтуруунун кереги жок ({n})', rest_hide: 'Жашыруу',
      formula: 'Кантип эсептелди', sources: 'Булактар',
      steps_title: 'Кабинетте кантип тапшыруу керек',
      step1: 'cabinet.salyk.kg сайтын ачып, кириңиз.',
      step2: '«Е-отчёттор» бөлүмү → STI-091 формасы → {period} мезгили.',
      step3: '«Баштапкы» деп белгилеп, сары уячалардагы маанилерди көчүрүңүз.',
      step4: 'Текшерүүнү басып, сактап, жөнөтүңүз.',
      step5: 'Отчёттун статусун текшерип, {tax} суммасын {date} чейин төлөңүз.',
      ai_explain: 'ИИ: отчётумду кадам-кадамы менен түшүндүр', ai_explain_title: 'ИИнин түшүндүрмөсү',
      confirm: 'Маалыматтарды текшердим, отчётту өзүм жөнөтөм', confirmed: 'Белгиленди: маалыматтар текшерилди',
      copy_all: 'Маанилерди көчүрүү', copied: 'Көчүрүлдү', stop: 'Токтотуу', thinking: 'Ойлонуп жатам…',
      report_patent: 'Патент менен бирдиктүү салык боюнча отчёт тапшырылбайт. Патентти ар бир айдын 1-күнүнө чейин төлөө жетиштүү.',
      assistant_title: 'ИИ-жардамчы', assistant_sub: 'МСКнын документтери боюнча жооп берет жана профилиңизди билет. Эсептөөнү ИИ эмес, текшерилген модуль жасайт.',
      q1: 'Мага БСД тапшыруу керекпи?', q2: 'Эмне үчүн менин ставкам ушундай?', q3: 'Мөөнөттү өткөрүп жиберсем эмне болот?', q4: 'Кабинетте отчётту кантип тапшырам?',
      chat_ph: 'Салыктар жөнүндө сураңыз…', send: 'Жөнөтүү',
      chat_hello: 'Салам! Мен IPilot. Салыгыңыз, мөөнөттөр же отчёт жөнүндө сураңыз — МСКнын документтери боюнча жооп берем.',
      ai_off: 'ИИ бул жерде жеткиликсиз. Эсептөөлөр, отчёттун долбоору жана мөөнөттөр ансыз деле иштейт.',
      ai_err: 'Жооп алуу мүмкүн болбоду. Кайра аракет кылыңыз.', ai_denied: 'Бул терезеде ИИге уруксат берилген эмес.',
      ai_rate: 'Суроолор өтө көп. Бир мүнөт күтүп, кайра аракет кылыңыз.',
      ai_mode_claude: 'ИИ туташкан', ai_mode_server: 'ИИ IPilot серверы аркылуу туташкан',
      profile_title: 'Жеке ишкердин профили', name: 'Аты', shop: 'Бизнес', regime: 'Режим', activity: 'Ишмердүүлүк түрү',
      revenue12: '12 айдагы киреше, сом', city: 'Шаар', bishkek: 'Бишкек', osh: 'Ош', other_city: 'Башка', patent_place: 'Кайда соода кыласыз', analysis: 'Бул сиз үчүн эмнени билдирет',
      reminders: 'Эскертүүлөр', reminders_sub: 'Мөөнөттөрдү телефондун календарына кошуңуз — 5 күн жана 1 күн мурун эскертет.',
      edit_profile: 'Сурамжылоодон кайра өтүү', load_demo: 'Мисалды көрсөтүү', reset_data: 'Маалыматтарымды өчүрүү',
      reset_confirm: 'Профилди жана бардык кирешени өчүрүү үчүн дагы бир жолу басыңыз.', reset_done: 'Маалыматтар өчүрүлдү',
      rules_ver: 'Эрежелер {v} жаңыртылды. Ставкалар sti.gov.kg маалыматы боюнча. Шектенсеңиз, МСКга чалыңыз: 116.',
      saved: 'Сакталды', save_profile: 'Профилди сактоо',
      flags: 'Өзгөчөлүктөр', tf_import: 'Товарды чет өлкөдөн алып келем же чыгарам', tf_distr: 'Мен дистрибьютормун',
      tf_pharma: 'Дары-дармек, медициналык буюмдарды же КММ сатам', tf_zone: 'Дордойдо, Мадинада же Тураталыда иштейм',
      onb_welcome_title: 'Салыгыңызды бир мүнөттө эсептейли',
      onb_welcome_text: 'Алты кыска суроо. Жооптор ушул түзмөктө гана сакталат.',
      start: 'Баштоо', next: 'Кийинки', back: 'Артка', done: 'Даяр',
      onb_name_title: 'Сизге кантип кайрылалы?', onb_shop_ph: 'Мисалы: кийим дүкөнү',
      onb_regime_title: 'Салыкты кантип төлөйсүз?',
      reg_single_d: 'Чейрегине же айына бир отчёт, кирешеден пайыз', reg_patent_d: 'Ай сайын белгиленген сумма',
      reg_unknown: 'Билбейм', reg_unknown_d: 'Азырынча бирдиктүү салык катары эсептейбиз. Режимди sti.gov.kg → «ИСН боюнча маалымат» бөлүмүнөн көрсө болот.',
      onb_activity_title: 'Эмне иш менен алектенесиз?',
      act_trade_d: 'Дүкөн, базардагы орун, товар сатуу', act_production_d: 'Товар өндүрүү, программа иштеп чыгуу, туроператорлор',
      act_services_d: 'Оңдоо, салон, ташуу жана башка кызматтар', act_catering_d: 'Кафе, ашкана, фастфуд', act_other_d: 'Тигүү, зергерчилик, курулуш, сауна…',
      onb_trade_title: 'Соода жөнүндө тактайлы', onb_trade_text: 'Сизге тиешелүү болсо, белгилеңиз. Ставка ушуга жараша болот.',
      onb_patent_title: 'Кайда соода кыласыз?',
      pp_stall: 'Базардагы лоток, текче, чатыр', pp_container: 'Базардагы контейнер же павильон', pp_shop30: 'Базардан тышкары 30 м² чейинки дүкөн',
      onb_rev_title: 'Акыркы 12 айда канча киреше болду?', onb_rev_hint: 'Болжолдуу болсо да болот. Ставка ушуга жараша болот.',
      onb_result_title: 'Мына эмне чыкты', your_rate: 'Сиздин ставка', report_every: 'Отчёт', every_quarter: 'чейрегине бир жолу', every_month: 'ай сайын',
      next_deadline: 'Жакынкы мөөнөт', cells_lbl: 'STI-091 уячалары:',
      cycle_title: 'Отчёт жана төлөм мезгили',
      cycle_month: 'Ай сайын', cycle_quarter: 'Чейрегине бир жолу',
      cycle_hint: 'Отчётту кантип тапшырып, салыкты кантип төлөрүңүздү тандаңыз. Күндөрдү эсептөө жана эскертүүлөр мезгилге ылайыкташат.',
      onb_cycle_title: 'Отчётту канчалык тез-тез тапшырып, салык төлөйсүз?', onb_cycle_text: 'Башкы бетте каалаган убакта өзгөртсө болот.',
      cyc_month_d: 'Мөөнөтү — кийинки айдын 20-күнүнө чейин', cyc_quarter_d: 'Мөөнөтү — чейректен кийинки айдын 20-күнүнө чейин',
      cycle_set: 'Мезгил: {c}', rate_card_title: 'Ставка жана төлөм мезгили',
      legal_rate: 'Ишмердүүлүгүңүз үчүн МСКнын таблицасы боюнча: {r}', legal_rate_none: 'Ишмердүүлүгүңүз үчүн тиркемеде таблицалык ставка жок — өзүңүздүкүн көрсөтүңүз.',
      custom_on: 'Өз ставкамды көрсөтүү', custom_cash: 'Өз ставкаңыз, % (накталай)', custom_noncash: 'Өз ставкаңыз, % (накталай эмес)', custom_single: 'Өз ставкаңыз, %',
      custom_sub: 'Мисалы, жеңилдигиңиз болсо же ставка өзгөрсө. Салык, отчёттун долбоору жана эскертүүлөр сиздин ставка боюнча кайра эсептелет.',
      save_rate: 'Ставканы сактоо', chip_custom: 'Өз ставка {r}', bad_rate: 'Ставка 0дөн 100%га чейин болушу керек', set_rate: 'Ставканы көрсөтүү'
    }
  };
  // Тексты из rules.js на кыргызском
  var RULE_KY = {
    'ИП на патенте освобождены от ЕНД.': 'Патенттеги жеке ишкерлер БСДдан бошотулган.',
    'Патент не применяют при импорте/экспорте и дистрибьюторам. Нужен единый налог или общий режим.': 'Импорт/экспорт жана дистрибьюторлор үчүн патент колдонулбайт. Бирдиктүү салык же жалпы режим керек.',
    'В зоне торговли с особым режимом (Дордой, Мадина, Туратали) действует отдельный налог. Мы его пока не считаем.': 'Өзгөчө режимдеги соода зонасында (Дордой, Мадина, Туратали) өзүнчө салык бар. Аны азырынча эсептебейбиз.',
    'Для такой выручки этот вид патента не подходит. Уточните в ГНС: 116.': 'Мындай киреше үчүн патенттин бул түрү туура келбейт. МСКдан тактаңыз: 116.',
    'Ставка 5% для общепита в Бишкеке и Оше взята из закона от 06.08.2026 (economist.kg). На странице ГНС её пока нет. Уточните в 116.': 'Бишкек менен Оштогу коомдук тамактануу үчүн 5% ставкасы 06.08.2026-жылдагы мыйзамдан алынды (economist.kg). МСКнын баракчасында ал азырынча жок. 116дан тактаңыз.',
    'Этот вид деятельности (швейное, ювелирка, стройка, сауна и др.) мы пока не считаем. Укажите свою ставку в профиле или уточните в ГНС: 116.': 'Бул ишмердүүлүктү (тигүү, зергерчилик, курулуш, сауна ж.б.) азырынча эсептебейбиз. Профилде өз ставкаңызды көрсөтүңүз же МСКдан тактаңыз: 116.',
    'Ваш вид деятельности не входит в таблицу приложения: налог считаем по вашей ставке в строке «Остальные виды деятельности». Проверьте строку формы в кабинете.': 'Ишмердүүлүгүңүз тиркеменин таблицасында жок: салыкты «Калган ишмердүүлүктөр» сабында сиздин ставка боюнча эсептейбиз. Форманын сабын кабинеттен текшериңиз.',
    'Вы выбрали отчёт и оплату каждый месяц, а по выручке за 12 месяцев положено раз в квартал. Уточните в ГНС: 116.': 'Сиз отчёт жана төлөмдү ай сайын тандадыңыз, бирок 12 айдагы киреше боюнча чейрегине бир жолу тиешелүү. МСКдан тактаңыз: 116.',
    'Вы выбрали отчёт и оплату раз в квартал, а по выручке за 12 месяцев положено каждый месяц. Уточните в ГНС: 116.': 'Сиз отчёт жана төлөмдү чейрегине бир жолу тандадыңыз, бирок 12 айдагы киреше боюнча ай сайын тиешелүү. МСКдан тактаңыз: 116.',
    'Ставка 0% (ч. 8 ст. 423) применена, потому что вы подтвердили все условия. В отчёте укажите ставку 0 в своей строке.': '0% ставкасы (423-берененин 8-бөлүгү) колдонулду, анткени бардык шарттарды ырастадыңыз. Отчётто өз сабыңызда 0 ставкасын көрсөтүңүз.',
    'ЕНД за год нужно сдать до 1 мая следующего года.': 'Жылдык БСДны кийинки жылдын 1-майына чейин тапшыруу керек.',
    'Выручка больше 8 млн сом: вы средний или крупный бизнес, отчёт и оплата каждый месяц.': 'Киреше 8 млн сомдон ашык: сиз орто же ири бизнессиз, отчёт жана төлөм ай сайын.'
  };
  var KY_MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  var ROMAN = ['I', 'II', 'III', 'IV'];

  function t(key, vars) {
    var s = (T[state.lang] && T[state.lang][key]) || T.ru[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function ruleText(s) {
    if (state.lang !== 'ky' || !s) return s;
    if (RULE_KY[s]) return RULE_KY[s];
    var m = s.match(/^ИП на едином налоге по ставке (.+) освобождены от ЕНД\.$/);
    if (m) return 'Бирдиктүү салыкты ' + m[1] + ' ставкасы менен төлөгөн жеке ишкерлер БСДдан бошотулган.';
    m = s.match(/^Своя ставка: (.+?)\.(?: По таблице ГНС для вашего вида деятельности: (.+?)\.)? Если не уверены, уточните в ГНС: 116\.$/);
    if (m) {
      var kyR = function (x) { return x.replace(/ наличными/g, ' накталай').replace(/ безналом/g, ' накталай эмес'); };
      return 'Өз ставкаңыз: ' + kyR(m[1]) + '.' + (m[2] ? ' Ишмердүүлүгүңүз үчүн МСКнын таблицасы боюнча: ' + kyR(m[2]) + '.' : '') + ' Шектенсеңиз, МСКдан тактаңыз: 116.';
    }
    return s;
  }
  function periodLabel(per) {
    if (state.lang !== 'ky') return R.periodLabel(per);
    if (per.kind === 'month') return KY_MONTHS[per.index] + ' ' + per.year;
    return per.year + '-ж. ' + ROMAN[per.index] + ' чейрек';
  }
  function dateLabel(d) {
    if (typeof d === 'string') d = R.parseISO(d);
    if (state.lang === 'ky') return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
    return R.dateLabel(d);
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var money = R.fmtMoney, rate = R.fmtRate;

  /* ================= Состояние и хранилище ================= */
  var state = { lang: 'ru', profile: null, entries: [], demo: true, confirmed: {}, view: 'home', reportOffset: null,
    chat: [], onb: null, parsed: null, restOpen: false, resetArmed: false, aiExplain: null };

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && s.profile) { state.lang = s.lang || 'ru'; state.profile = s.profile; state.entries = s.entries || []; state.demo = !!s.demo; state.confirmed = s.confirmed || {}; return; }
        if (s && s.lang) state.lang = s.lang;
      }
    } catch (e) { /* хранилище недоступно — работаем в памяти */ }
    loadDemo();
  }
  function persist() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ lang: state.lang, profile: state.profile, entries: state.entries, demo: state.demo, confirmed: state.confirmed })); } catch (e) { /* ignore */ }
  }

  /* ---------- Пример: магазин одежды ---------- */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t2 = Math.imul(a ^ a >>> 15, 1 | a); t2 = t2 + Math.imul(t2 ^ t2 >>> 7, 61 | t2) ^ t2; return ((t2 ^ t2 >>> 14) >>> 0) / 4294967296; }; }
  function loadDemo() {
    var today = new Date();
    state.profile = { name: 'Айгуль', shop: 'Магазин одежды', regime: 'single', activity: 'trade', revenue12: 4000000, city: 'bishkek',
      importExport: false, distributor: false, pharmaFuel: false, specialZone: false, patentPlace: 'container', cycle: 'quarter' };
    var rnd = mulberry32(11), entries = [];
    var cur = R.periodOf(today, 'quarter'), prev = R.shiftPeriod(cur, -1);
    function fill(per, endDate, total) {
      var days = [];
      for (var d = new Date(per.start); d <= endDate; d.setDate(d.getDate() + 1)) days.push(new Date(d));
      var w = days.map(function (d) { var k = d.getDay() === 0 ? 0.6 : d.getDay() === 6 ? 1.4 : 1; return k * (0.7 + rnd() * 0.6); });
      var sw = w.reduce(function (a, b) { return a + b; }, 0), acc = 0;
      days.forEach(function (d, i) {
        var amt = i === days.length - 1 ? total - acc : Math.round(total * w[i] / sw / 100) * 100;
        acc += amt;
        var non = Math.round(amt * (0.28 + rnd() * 0.17) / 100) * 100;
        entries.push({ id: 'd' + R.iso(d), date: R.iso(d), cash: amt - non, noncash: non });
      });
    }
    fill(prev, prev.end, 1120000);
    fill(cur, today < cur.end ? today : cur.end, 1000000);
    state.entries = entries; state.demo = true; state.confirmed = {};
  }

  /* ---------- Производные данные ---------- */
  function today() { return new Date(); }
  function analysis() { return R.analyzeProfile(state.profile || {}); }
  function reportPeriods(a) {
    var cur = R.periodOf(today(), a.period);
    var list = [];
    for (var i = 0; i >= -3; i--) list.push(R.shiftPeriod(cur, i));
    return list;
  }
  function defaultReportOffset(a) {
    var cur = R.periodOf(today(), a.period), prev = R.shiftPeriod(cur, -1);
    return R.daysBetween(today(), R.deadlineOf(prev)) >= 0 ? -1 : 0;
  }
  function reportPeriod(a) {
    var off = state.reportOffset == null ? defaultReportOffset(a) : state.reportOffset;
    return R.shiftPeriod(R.periodOf(today(), a.period), off);
  }
  function isCurrent(per) { var d = R.iso(today()); return d >= R.iso(per.start) && d <= R.iso(per.end); }
  function deadlines(a) {
    return R.upcomingDeadlines(state.profile, a, today(), state.entries).map(function (e) {
      var title, detail;
      if (e.kind === 'report') {
        title = t('dl_report');
        var per = R.periodOf(R.parseISO(e.id.slice(3)), a.period);
        detail = t('dl_report_d', { period: periodLabel(per) }) + (e.amount != null ? ' · ' + t(e.current ? 'dl_sofar' : 'dl_tax', { tax: money(e.amount) }) : '');
      } else if (e.kind === 'end') {
        title = t('dl_end');
        detail = e.notRequired ? ruleText(a.endReason) : (state.lang === 'ky' ? (R.parseISO(e.date).getFullYear() - 1) + '-жыл үчүн.' : 'За ' + (R.parseISO(e.date).getFullYear() - 1) + ' год.');
      } else {
        title = t('dl_patent');
        detail = money(e.amount);
      }
      return { id: e.id, date: e.date, kind: e.kind, title: title, detail: detail, notRequired: e.notRequired, current: e.current };
    });
  }

  /* ================= ИИ: встроенный (claude.ai) или сервер IPilot ================= */
  var AI = (function () {
    var mode = 'detecting', sample = null;
    var ready = (async function () {
      if (window.claude && typeof window.claude.use === 'function') {
        try { sample = await window.claude.use('sample'); } catch (e) { sample = null; }
        mode = sample ? 'claude' : 'off';
        return mode;
      }
      try {
        var r = await fetch('api/health', { cache: 'no-store' });
        var j = await r.json();
        mode = j && j.ok ? 'server' : 'off';
      } catch (e) { mode = 'off'; }
      return mode;
    })();
    function parseLoose(text) {
      try { return JSON.parse(text); } catch (e) { /* дальше */ }
      var m = String(text).match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) { try { return JSON.parse(m[1]); } catch (e) { /* дальше */ } }
      var a = text.indexOf('{'), b = text.lastIndexOf('}');
      if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch (e) { /* дальше */ } }
      throw { code: 'invalid_json' };
    }
    async function ask(turns, opts) {
      opts = opts || {};
      await ready;
      if (mode === 'claude') {
        var o = { cache: false };
        if (opts.signal) o.signal = opts.signal;
        if (opts.quick) o.modelTier = 'quick';
        if (opts.onText) o.onText = function (u) { opts.onText(u.text); };
        if (opts.json) return await sample.json(turns, o);
        var res = await sample(turns, o);
        return res.text;
      }
      if (mode === 'server') {
        var msgs = typeof turns === 'string' ? [{ role: 'user', content: turns }] : turns;
        var r = await fetch('api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: msgs, json: !!opts.json }), signal: opts.signal });
        if (!r.ok) throw { code: r.status === 429 ? 'rate_limited' : 'upstream_error' };
        var j = await r.json();
        if (opts.onText && j.text) opts.onText(j.text);
        return opts.json ? parseLoose(j.text || '') : j.text;
      }
      throw { code: 'off' };
    }
    return { ready: ready, ask: ask, get mode() { return mode; } };
  })();

  function aiErrorText(e) {
    var c = e && e.code;
    if (c === 'off') return t('ai_off');
    if (c === 'not_granted' || c === 'sampling_disabled' || c === 'not_declared' || c === 'capability_disabled') return t('ai_denied');
    if (c === 'rate_limited') return t('ai_rate');
    return t('ai_err');
  }

  function profileContext() {
    var p = state.profile, a = analysis(), per = reportPeriod(a), rep = R.computeReport(p, a, state.entries, per);
    var L = [];
    L.push('Сегодня: ' + R.dateLabel(today()) + '.');
    L.push('ДАННЫЕ ИП: ' + (p.name || 'ИП') + (p.shop ? ', ' + p.shop : '') + '. Режим: ' + (p.regime === 'patent' ? 'патент' : 'единый налог') +
      '. Вид деятельности: ' + (T.ru['act_' + p.activity] || p.activity) + '. Выручка за 12 месяцев: ' + money(p.revenue12) +
      '. Город: ' + (T.ru[p.city] || T.ru.other_city) + '.');
    if (!a.supported) { L.push('Случай не поддерживается приложением: ' + a.reason); return L.join('\n'); }
    if (a.regime !== 'patent') L.push('Цикл отчёта и оплаты (выбран самим ИП): ' + (a.period === 'month' ? 'каждый месяц' : 'раз в квартал') + '. Не спорь с этим выбором.');
    if (a.customApplied) L.push('Ставка указана самим ИП: наличные ' + rate(a.rates.cash) + ', безнал ' + rate(a.rates.noncash) + (a.legalRates ? '. По таблице ГНС было бы: наличные ' + rate(a.legalRates.cash) + ', безнал ' + rate(a.legalRates.noncash) : '') + '. Используй ставку ИП, но если она отличается от таблицы, мягко посоветуй сверить её в ГНС (116).');
    if (a.regime === 'patent') {
      L.push('РАСЧЁТ: патент, годовая сумма ' + money(a.patent.annual) + ', в месяц около ' + money(a.patent.monthly) + ', платить до 1 числа каждого месяца. ЕНД: ' + a.endReason);
    } else {
      L.push('Ставка: наличные ' + rate(a.rates.cash) + ', безнал ' + rate(a.rates.noncash) + '. Строка формы STI-091_10: ' + a.row.label + '.');
      L.push('ЕНД: ' + (a.endRequired ? 'нужна. ' : 'не нужна. ') + a.endReason);
      L.push('РАСЧЁТ за ' + R.periodLabel(per) + (isCurrent(per) ? ' (период ещё идёт)' : '') + ': выручка наличными ' + money(rep.revenue.cash) +
        ', безнал ' + money(rep.revenue.noncash) + ', всего ' + money(rep.revenue.total) + '. Налог: ' + money(rep.tax) + '. Формула: ' + rep.formula +
        '. Срок отчёта и оплаты: ' + R.dateLabel(R.parseISO(rep.deadline)) + '. Период в отчёте: 201 = ' + rep.from + ', 202 = ' + rep.to + '.');
      L.push('Ячейки: ' + rep.cells.map(function (c) { return c.code + ' (' + c.label + ') = ' + c.value; }).join('; ') + '.');
    }
    a.warnings.concat(a.notes || []).forEach(function (w) { L.push('Важно: ' + w); });
    return L.join('\n');
  }
  function langLine() { return state.lang === 'ky' ? 'Отвечай на кыргызском языке.' : 'Отвечай на русском языке.'; }

  /* ================= Утилиты интерфейса ================= */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var $view = document.getElementById('view');
  var toastTimer;
  function toast(msg) {
    var el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.hidden = true; }, 2200);
  }
  function copyText(text, btn) {
    function ok() { if (btn) { btn.classList.add('done'); setTimeout(function () { btn.classList.remove('done'); }, 1200); } toast(t('copied')); }
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
    try { navigator.clipboard.writeText(text).then(ok, fallback); } catch (e) { fallback(); }
  }
  var ICON = {
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3 2 20h20z"/><path d="M12 10v5M12 17.5v.5"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m5 12 4.5 4.5L19 7"/></svg>',
    no: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 20 4l-6 16-3-7z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'
  };

  function calLinks(e) {
    var s = '<a href="' + esc(R.googleCalUrl({ date: e.date, title: e.title, detail: e.detail })) + '" target="_blank" rel="noopener" aria-label="' + esc(t('cal_add')) + '" title="' + esc(t('cal_add')) + '">' + ICON.cal + '</a>';
    if (IS_STANDALONE) s += '<button type="button" data-action="ics" data-id="' + esc(e.id) + '" aria-label="' + esc(t('ics_add')) + '" title="' + esc(t('ics_add')) + '">' + ICON.dl + '</button>';
    return s;
  }
  function dlItem(e) {
    var d = R.parseISO(e.date), left = R.daysBetween(today(), d);
    var mon = state.lang === 'ky' ? KY_MONTHS[d.getMonth()].slice(0, 3) : R.MONTHS[d.getMonth()].slice(0, 3);
    return '<div class="dl-item' + (e.notRequired ? ' off' : '') + '">' +
      '<div class="dl-date num"><b>' + d.getDate() + '</b><span>' + esc(mon) + '</span></div>' +
      '<div class="dl-text"><b>' + esc(e.title) + (e.notRequired ? ' — ' + esc(t('not_required')) : '') + '</b><span>' + esc(e.detail) +
      (e.notRequired ? '' : ' · ' + (left >= 0 ? left + ' ' + esc(t('days')) : esc(t('overdue')))) + '</span></div>' +
      '<div class="dl-actions">' + (e.notRequired ? '' : calLinks(e)) + '</div></div>';
  }
  function profileChips(a) {
    var p = state.profile, c = [];
    c.push('<span class="chip">' + esc(t('act_' + (p.regime === 'patent' ? 'trade' : p.activity))) + '</span>');
    c.push('<span class="chip">' + esc(t(p.regime === 'patent' ? 'reg_patent' : 'reg_single')) + '</span>');
    if (a.supported && a.regime !== 'patent') {
      c.push('<span class="chip">' + esc(t(a.period === 'month' ? 'cyc_month' : 'cyc_quarter')) + '</span>');
      if (a.customApplied) c.push('<span class="chip warn">' + esc(t('chip_custom', { r: rateStr(a.rates, a.row) })) + '</span>');
    }
    if (a.supported) c.push('<span class="chip ' + (a.endRequired ? 'warn' : 'good') + '">' + esc(t(a.endRequired ? 'end_yes' : 'end_no')) + '</span>');
    return '<div class="chips">' + c.join('') + '</div>';
  }

  function notesHTML(a) {
    return a.warnings.map(function (w) { return '<div class="banner warn">' + ICON.warn + '<p class="grow">' + esc(ruleText(w)) + '</p></div>'; }).join('') +
      (a.notes || []).map(function (w) { return '<div class="banner info">' + ICON.info + '<p class="grow">' + esc(ruleText(w)) + '</p></div>'; }).join('');
  }
  function rateStr(rates, row) {
    if (!rates) return '—';
    if ((row && !row.split) || rates.cash === rates.noncash) return rate(rates.cash);
    return t('cash') + ' ' + rate(rates.cash) + ' · ' + t('noncash') + ' ' + rate(rates.noncash);
  }
  function cycleSeg(p, a, action) {
    var val = p.cycle === 'month' ? 'month' : 'quarter';
    return '<div class="seg" role="group" aria-label="' + esc(t('cycle_title')) + '">' +
      [['month', t('cycle_month')], ['quarter', t('cycle_quarter')]].map(function (o) {
        return '<button type="button" data-action="' + action + '" data-field="cycle" data-val="' + o[0] + '" aria-pressed="' + (val === o[0]) + '">' + esc(o[1]) + '</button>';
      }).join('') + '</div>';
  }
  function customRateFields(prefix, p, a) {
    var c = p.customRate || {}, split = !a.row || a.row.split;
    var leg = a.legalRates || { cash: '', noncash: '' };
    var cash = c.cash != null && c.cash !== '' ? c.cash : leg.cash, non = c.noncash != null && c.noncash !== '' ? c.noncash : leg.noncash;
    var h = '<div class="toggle-row"><span class="t">' + esc(t('custom_on')) + '</span><label class="switch"><input type="checkbox" id="' + prefix + '-cr-on"' + (c.on ? ' checked' : '') + ' aria-label="' + esc(t('custom_on')) + '"><i></i></label></div>';
    if (c.on) {
      h += '<div class="grid-2"><div class="field"><label for="' + prefix + '-cr-cash">' + esc(t(split ? 'custom_cash' : 'custom_single')) + '</label><input class="input num" id="' + prefix + '-cr-cash" inputmode="decimal" value="' + esc(String(cash).replace('.', ',')) + '"></div>' +
        (split ? '<div class="field"><label for="' + prefix + '-cr-non">' + esc(t('custom_noncash')) + '</label><input class="input num" id="' + prefix + '-cr-non" inputmode="decimal" value="' + esc(String(non).replace('.', ',')) + '"></div>' : '') + '</div>';
    }
    return h;
  }
  function readCustom(prefix, p) {
    var on = document.getElementById(prefix + '-cr-on'), c1 = document.getElementById(prefix + '-cr-cash'), c2 = document.getElementById(prefix + '-cr-non');
    if (!on) return;
    p.customRate = p.customRate || {};
    p.customRate.on = on.checked;
    if (c1) p.customRate.cash = c1.value.trim();
    if (c2) p.customRate.noncash = c2.value.trim(); else if (c1) p.customRate.noncash = '';
  }
  function rateValid(v) { if (v === '' || v == null) return false; var n = toNum(v); return n >= 0 && n <= 100; }

  /* ================= Экраны ================= */
  function renderHome() {
    var p = state.profile, a = analysis(), h = [];
    if (state.demo) h.push('<div class="banner info">' + ICON.info + '<p class="grow">' + esc(t('demo_banner')) + ' <button type="button" class="link" data-action="onb-start">' + esc(t('demo_cta')) + '</button></p></div>');
    h.push('<div class="h-row"><h1 style="font-size:24px">' + esc(t('hello', { name: p.name || 'ИП' })) + '</h1>' + (state.demo ? '<span class="chip warn">' + esc(t('demo_badge')) + '</span>' : '') + '</div>');
    if (p.shop) h.push('<p class="muted" style="margin-top:-12px">' + esc(p.shop) + '</p>');

    if (!a.supported) {
      h.push('<section class="card"><h2 class="section-title">' + esc(t('unsupported_title')) + '</h2><p>' + esc(ruleText(a.reason)) + '</p><p class="muted">' + esc(t('call116')) + '</p>' +
        (p.regime !== 'patent' && !p.specialZone ? '<button type="button" class="btn primary" data-action="go" data-to="profile">' + esc(t('set_rate')) + '</button>' : '') + '</section>');
    } else if (a.regime === 'patent') {
      var nd = new Date(today().getFullYear(), today().getMonth() + 1, 1), lp = R.daysBetween(today(), nd);
      h.push('<section class="hero"><p class="label">' + esc(t('patent_title')) + '</p><p class="amount num">' + esc(money(a.patent.monthly)) + '</p>' +
        '<p class="sub">' + esc(t('patent_sub', { annual: money(a.patent.annual) })) + '</p>' +
        '<div class="deadline"><div class="days num"><b>' + lp + '</b><span>' + esc(t('days')) + '</span></div><div class="what"><b>' + esc(t('patent_due')) + '</b>' + esc(t('due_by', { date: dateLabel(nd) })) + '</div></div></section>');
    } else {
      var per = reportPeriod(a), rep = R.computeReport(p, a, state.entries, per), dl = R.parseISO(rep.deadline), left = R.daysBetween(today(), dl);
      var cells = rep.cells.filter(function (c) { return !c.total; });
      h.push('<section class="hero" aria-label="' + esc(t('tax_for', { period: periodLabel(per) })) + '">' +
        '<p class="label">' + esc(t('tax_for', { period: periodLabel(per) })) + (isCurrent(per) ? ' · ' + esc(t('tax_sofar')) : '') + '</p>' +
        '<p class="amount num">' + esc(money(rep.tax)) + '</p>' +
        '<p class="sub">' + esc(t('rate_rev', { rate: a.rates.cash === a.rates.noncash ? rate(a.rates.cash) : rate(a.rates.cash) + ' / ' + rate(a.rates.noncash), rev: money(rep.revenue.total) })) + '</p>' +
        '<p class="formula num">' + esc(rep.formula) + '</p>' +
        '<div class="deadline"><div class="days num"><b>' + Math.max(left, 0) + '</b><span>' + esc(t('days')) + '</span></div><div class="what"><b>' + esc(t('due_report')) + '</b>' + esc(t('due_by', { date: dateLabel(dl) })) + '</div></div>' +
        '<div class="cells"><span class="sub" style="font-size:13px;align-self:center">' + esc(t('cells_lbl')) + '</span>' + cells.map(function (c) { return '<span class="cell-chip">' + c.code + '</span>'; }).join('') + '</div>' +
        '<button type="button" class="btn primary" data-action="go" data-to="report">' + esc(t('open_draft')) + '</button></section>');
      h.push('<div class="field"><span class="lbl">' + esc(t('cycle_title')) + '</span>' + cycleSeg(p, a, 'set-cycle') + '</div>');
    }
    h.push(profileChips(a));
    h.push(notesHTML(a));

    h.push('<div class="btn-row"><button type="button" class="btn dark" data-action="go" data-to="revenue">' + ICON.plus + esc(t('add_revenue')) + '</button><button type="button" class="btn" data-action="go" data-to="assistant">' + ICON.spark + esc(t('ask_ai')) + '</button></div>');

    var dls = deadlines(a).slice(0, 3);
    if (dls.length) {
      h.push('<section class="card"><div class="h-row"><h2 class="section-title">' + esc(t('upcoming')) + '</h2><button type="button" class="btn small ghost" data-action="go" data-to="profile">' + esc(t('all')) + '</button></div><div class="dl-list">' +
        dls.map(dlItem).join('') + '</div></section>');
    }
    return h.join('');
  }

  function weekBars(per) {
    var weeks = [], start = new Date(per.start), end = per.end;
    var d = new Date(start);
    while (d <= end) {
      var wEnd = new Date(d); wEnd.setDate(wEnd.getDate() + 6); if (wEnd > end) wEnd = new Date(end);
      var s = R.sumRevenue(state.entries, { start: d, end: wEnd });
      weeks.push({ from: new Date(d), total: s.total });
      d = new Date(wEnd); d.setDate(d.getDate() + 1);
    }
    var W = 320, H = 130, top = 10, bottom = 24, n = weeks.length, gap = 4, bw = (W - gap * (n - 1)) / n;
    var max = Math.max.apply(null, weeks.map(function (w) { return w.total; }).concat([1]));
    var bars = weeks.map(function (w, i) {
      var h = Math.round((H - top - bottom) * w.total / max), x = i * (bw + gap), y = H - bottom - h;
      var future = w.from > today();
      return '<rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + bw.toFixed(1) + '" height="' + Math.max(h, w.total ? 2 : 0) + '" rx="3" fill="var(--' + (future ? 'line' : 'accent') + ')"><title>' + esc(dateLabel(w.from) + ': ' + money(w.total)) + '</title></rect>' +
        (i % 2 === 0 ? '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="var(--ink-3)" font-family="Nunito Sans, Arial">' + pad(w.from.getDate()) + '.' + pad(w.from.getMonth() + 1) + '</text>' : '');
    }).join('');
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(t('by_week')) + '"><line x1="0" x2="' + W + '" y1="' + (H - bottom) + '" y2="' + (H - bottom) + '" stroke="var(--line)" stroke-width="1"/>' + bars + '</svg>';
  }

  function renderRevenue() {
    var a = analysis(), per = R.periodOf(today(), a.supported ? a.period : 'quarter'), s = R.sumRevenue(state.entries, per);
    var h = [];
    h.push('<div class="h-row"><h1 style="font-size:24px">' + esc(t('rev_title')) + '</h1><span class="tiny">' + esc(periodLabel(per)) + '</span></div>');
    h.push('<div class="stat-row"><div class="stat"><span>' + esc(t('cash')) + '</span><b class="num">' + esc(money(s.cash)) + '</b></div><div class="stat"><span>' + esc(t('noncash')) + '</span><b class="num">' + esc(money(s.noncash)) + '</b></div><div class="stat"><span>' + esc(t('total')) + '</span><b class="num">' + esc(money(s.total)) + '</b></div></div>');

    h.push('<form class="card" id="rev-form" novalidate><h2 class="section-title">' + esc(t('rev_add_title')) + '</h2>' +
      '<div class="field"><label for="rev-amount">' + esc(t('amount')) + '</label><input class="input big num" id="rev-amount" inputmode="decimal" autocomplete="off" placeholder="0"></div>' +
      '<div class="grid-2"><div class="field"><span class="lbl">' + esc(t('cash')) + ' / ' + esc(t('noncash')) + '</span><div class="seg" role="group" id="rev-kind">' +
      '<button type="button" id="rev-kind-cash" data-kind="cash" aria-pressed="true">' + esc(t('cash')) + '</button><button type="button" id="rev-kind-noncash" data-kind="noncash" aria-pressed="false">' + esc(t('noncash')) + '</button></div></div>' +
      '<div class="field"><label for="rev-date">' + esc(t('date')) + '</label><input class="input" type="date" id="rev-date" value="' + R.iso(today()) + '"></div></div>' +
      '<button type="submit" class="btn dark">' + esc(t('save')) + '</button>' +
      '<div class="field" style="margin-top:6px"><label for="rev-text">' + ICON.spark.replace('<svg', '<svg width="16" height="16" style="vertical-align:-3px"') + ' ' + esc(t('ai_input_label')) + '</label>' +
      '<div style="display:flex;gap:8px"><textarea class="input" id="rev-text" rows="1" placeholder="' + esc(t('ai_input_ph')) + '"></textarea><button type="button" class="btn" id="rev-parse" data-action="parse">' + esc(t('ai_parse')) + '</button></div></div>' +
      (state.parsed ? '<div class="parse-preview"><b>' + esc(t('parse_found')) + '</b><p class="num">' + esc(t('cash')) + ': <b>' + esc(money(state.parsed.cash)) + '</b> · ' + esc(t('noncash')) + ': <b>' + esc(money(state.parsed.noncash)) + '</b> · ' + esc(dateLabel(state.parsed.date)) + '</p>' +
        '<div class="btn-row"><button type="button" class="btn primary small" data-action="parse-add">' + esc(t('add')) + '</button><button type="button" class="btn small" data-action="parse-cancel">' + esc(t('cancel')) + '</button></div></div>' : '') +
      '</form>');

    h.push('<section class="card"><h2 class="section-title">' + esc(t('by_week')) + '</h2>' + weekBars(per) + '</section>');

    var list = state.entries.filter(function (e) { return e.date >= R.iso(per.start) && e.date <= R.iso(per.end); })
      .sort(function (x, y) { return x.date < y.date ? 1 : -1; }).slice(0, 30);
    h.push('<section class="card"><h2 class="section-title">' + esc(t('history', { period: periodLabel(per) })) + '</h2>' +
      (list.length ? '<div>' + list.map(function (e) {
        return '<div class="rev-day"><div class="rev-row"><span class="when">' + esc(dateLabel(e.date)) + '</span><span class="sum num">' + esc(money((+e.cash || 0) + (+e.noncash || 0))) + '</span>' +
          '<button type="button" data-action="del" data-id="' + esc(e.id) + '" aria-label="Удалить">' + ICON.trash + '</button></div>' +
          '<span class="rev-split num">' + esc(t('cash')) + ' ' + esc(money(e.cash)) + ' · ' + esc(t('noncash')) + ' ' + esc(money(e.noncash)) + '</span></div>';
      }).join('') + '</div>' : '<p class="muted">' + esc(t('no_entries')) + '</p>') + '</section>');
    return h.join('');
  }

  function renderReport() {
    var p = state.profile, a = analysis(), h = [];
    h.push('<h1 style="font-size:24px">' + esc(t('report_title')) + '</h1>');
    if (!a.supported) { h.push('<section class="card"><h2 class="section-title">' + esc(t('unsupported_title')) + '</h2><p>' + esc(ruleText(a.reason)) + '</p><p class="muted">' + esc(t('call116')) + '</p></section>'); return h.join(''); }
    if (a.regime === 'patent') { h.push('<div class="banner info">' + ICON.info + '<p class="grow">' + esc(t('report_patent')) + '</p></div>'); return h.join(''); }

    var per = reportPeriod(a), rep = R.computeReport(p, a, state.entries, per), key = 'p' + rep.from;
    var periods = reportPeriods(a);
    h.push('<div class="field"><label for="rep-period">' + esc(t('period')) + '</label><select class="input" id="rep-period">' +
      periods.map(function (pp, i) { return '<option value="' + (-i) + '"' + (R.iso(pp.start) === rep.from ? ' selected' : '') + '>' + esc(periodLabel(pp)) + '</option>'; }).join('') + '</select></div>');
    h.push('<div class="banner warn">' + ICON.warn + '<p class="grow">' + esc(t('disclaimer')) + '</p></div>');
    if (isCurrent(per)) h.push('<div class="banner info">' + ICON.info + '<p class="grow">' + esc(t('period_running')) + '</p></div>');
    h.push(notesHTML(a));

    // Форма
    function frow(code, label, val, cls, copyVal) {
      return '<div class="frow ' + (cls || '') + '"><span class="code">' + code + '</span><span class="lbl">' + esc(label) + '</span><span class="val num">' + esc(val) +
        (copyVal != null ? '<button type="button" class="copy" data-action="copy" data-val="' + esc(copyVal) + '" aria-label="' + esc(t('copied')) + ' ' + code + '">' + ICON.copy + '</button>' : '') + '</span></div>';
    }
    var used = rep.cells.map(function (c) { return c.code; });
    var rest = [];
    Object.keys(R.ROWS).forEach(function (k) { if (k !== a.rowKey) rest.push(R.ROWS[k].label); });
    rest = rest.concat(['Швейное и текстильное производство', 'Ювелирные изделия', 'Лотереи, сауна, бильярд, баня', 'Парк креативной индустрии',
      'Режим ст. 324 НК', 'Сельхоззаготовители', 'Реализация обезличенному субъекту', 'Субъекты СЭЗ', 'Питание в школах', 'Обмен имущества для госнужд',
      'Виртуальные активы', 'Деятельность вне территории КР']);
    var dd = function (iso) { var d = R.parseISO(iso); return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear(); };
    h.push('<section class="form-sheet" aria-label="FORM STI-091_10"><div class="form-head"><b>FORM STI-091_10</b><span>' + esc(t('form_name')) + '<br>' + esc(periodLabel(per)) + '</span></div>' +
      '<div class="form-sec"><h3>' + esc(t('sec1')) + '</h3>' +
      frow('001', t('c001'), '☒ ' + t('v001'), 'fill') +
      frow('102', t('c102'), t('auto'), 'auto') + frow('103', t('c103'), t('auto'), 'auto') + frow('104', t('c104'), t('auto'), 'auto') +
      frow('115', t('c115'), p.phone || t('v115'), '') +
      frow('201', t('c201'), dd(rep.from), 'fill', dd(rep.from)) + frow('202', t('c202'), dd(rep.to), 'fill', dd(rep.to)) + '</div>' +
      '<div class="form-sec"><h3>' + esc(t('sec2')) + '</h3><p class="tiny" style="padding-bottom:4px">' + esc(a.row.label) + '</p>' +
      rep.cells.map(function (c) {
        var v = c.kind === 'rate' ? String(c.value).replace('.', ',') : money(c.value);
        return frow(c.code, t('cell_' + c.role), v, 'fill' + (c.total ? ' total' : ''), c.kind === 'rate' ? String(c.value) : (Math.round(c.value * 100) / 100).toFixed(2));
      }).join('') + '</div>' +
      '<button type="button" class="rest-toggle" data-action="rest" aria-expanded="' + state.restOpen + '"><span>' + esc(t('rest', { n: rest.length })) + '</span><span>' + (state.restOpen ? '−' : '+') + '</span></button>' +
      (state.restOpen ? '<div class="rest-list">' + rest.map(function (r) { return '<span>· ' + esc(r) + '</span>'; }).join('') + '</div>' : '') + '</section>');

    h.push('<button type="button" class="btn" data-action="copy-all">' + ICON.copy + esc(t('copy_all')) + '</button>');

    h.push('<section class="card"><h2 class="section-title">' + esc(t('formula')) + '</h2><p class="num" style="font-family:var(--f-mono);font-size:14px;overflow-wrap:anywhere">' + esc(rep.formula) + '</p>' +
      '<div class="src-list"><b class="tiny">' + esc(t('sources')) + '</b>' + a.sources.filter(function (v, i, arr) { return arr.indexOf(v) === i; }).map(function (k) {
        var s = R.SOURCES[k]; return s ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a>' : '';
      }).join('') + '</div></section>');

    // ИИ-объяснение
    var ex = state.aiExplain && state.aiExplain.key === key + state.lang ? state.aiExplain : null;
    h.push('<section class="card"><h2 class="section-title">' + esc(t('steps_title')) + '</h2>' +
      '<ol class="steps"><li>' + esc(t('step1')) + '</li><li>' + esc(t('step2', { period: periodLabel(per) })) + '</li><li>' + esc(t('step3')) + '</li><li>' + esc(t('step4')) + '</li><li>' +
      esc(t('step5', { tax: money(rep.tax), date: dateLabel(rep.deadline) })) + '</li></ol>' +
      '<button type="button" class="btn primary" data-action="explain"' + (ex && ex.busy ? ' disabled' : '') + '>' + ICON.spark + esc(t('ai_explain')) + '</button>' +
      (ex ? '<div><p class="eyebrow" style="margin-bottom:6px">' + esc(t('ai_explain_title')) + '</p><div class="ai-box" id="ai-explain">' + esc(ex.text || t('thinking')) + '</div>' +
        (ex.busy ? '<button type="button" class="btn small" data-action="stop-explain" style="margin-top:8px">' + esc(t('stop')) + '</button>' : '') + '</div>' : '') + '</section>');

    h.push('<label class="check-row card" for="rep-confirm"><input type="checkbox" id="rep-confirm"' + (state.confirmed[key] ? ' checked' : '') + '><span>' + esc(t('confirm')) + '</span></label>');
    return h.join('');
  }

  function renderAssistant() {
    var h = [];
    h.push('<div><h1 style="font-size:24px">' + esc(t('assistant_title')) + '</h1><p class="muted" style="margin-top:4px">' + esc(t('assistant_sub')) + '</p></div>');
    if (AI.mode === 'off') h.push('<div class="banner warn">' + ICON.warn + '<p class="grow">' + esc(t('ai_off')) + '</p></div>');
    h.push('<div class="chat" id="chat">');
    h.push('<div class="msg ai">' + esc(t('chat_hello')) + '</div>');
    state.chat.forEach(function (m, i) {
      if (m.role === 'user') h.push('<div class="msg user">' + esc(m.text) + '</div>');
      else h.push(aiBubble(m, i));
    });
    h.push('</div>');
    if (!state.chat.length) {
      h.push('<div class="quick">' + ['q1', 'q2', 'q3', 'q4'].map(function (q) { return '<button type="button" data-action="quick" data-q="' + q + '">' + esc(t(q)) + '</button>'; }).join('') + '</div>');
    }
    var busy = state.chat.some(function (m) { return m.busy; });
    h.push('<form class="composer" id="chat-form"><label class="sr" for="chat-input">' + esc(t('chat_ph')) + '</label><textarea class="input" id="chat-input" rows="1" placeholder="' + esc(t('chat_ph')) + '"></textarea>' +
      (busy ? '<button type="button" class="btn" data-action="stop-chat">' + esc(t('stop')) + '</button>' : '<button type="submit" class="btn primary" aria-label="' + esc(t('send')) + '">' + ICON.send + '</button>') + '</form>');
    return h.join('');
  }
  function aiBubble(m, i) {
    var src = '';
    if (!m.busy && m.sources && m.sources.length) {
      var cited = m.sources.filter(function (s, k) { return (m.text || '').indexOf('[' + (k + 1) + ']') >= 0; });
      if (cited.length) src = '<div class="msg-src">' + cited.map(function (s) { return '<a href="' + esc(s.source.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a>'; }).join('') + '</div>';
    }
    return '<div class="msg ai' + (m.busy && !m.text ? ' thinking' : '') + '" id="msg-' + i + '">' + esc(m.text || t('thinking')) + src + '</div>';
  }

  function renderProfile() {
    var p = state.profile, a = analysis(), h = [];
    h.push('<h1 style="font-size:24px">' + esc(t('profile_title')) + '</h1>');
    h.push(profileChips(a));
    if (a.supported) {
      var lines = [];
      if (a.regime === 'patent') lines.push(t('patent_title') + ': ' + money(a.patent.monthly));
      else {
        lines.push(t('your_rate') + ': ' + (a.rates.cash === a.rates.noncash ? rate(a.rates.cash) : t('cash') + ' ' + rate(a.rates.cash) + ', ' + t('noncash') + ' ' + rate(a.rates.noncash)));
        lines.push(t('report_every') + ': ' + t(a.period === 'quarter' ? 'every_quarter' : 'every_month'));
      }
      lines.push(ruleText(a.endReason));
      h.push('<section class="card"><h2 class="section-title">' + esc(t('analysis')) + '</h2>' + lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</section>');
    } else {
      h.push('<div class="banner bad">' + ICON.warn + '<p class="grow">' + esc(ruleText(a.reason)) + '</p></div>');
    }

    if (p.regime !== 'patent' && !p.specialZone) {
      h.push('<form class="card" id="rate-form" novalidate><h2 class="section-title">' + esc(t('rate_card_title')) + '</h2>' +
        '<p class="muted" style="font-size:14px">' + esc(a.legalRates ? t('legal_rate', { r: rateStr(a.legalRates, a.row) }) : t('legal_rate_none')) + '</p>' +
        customRateFields('pf', p, a) + '<p class="tiny">' + esc(t('custom_sub')) + '</p>' +
        ((p.customRate && p.customRate.on) ? '<button type="submit" class="btn dark">' + esc(t('save_rate')) + '</button>' : '') +
        '<div class="field" style="margin-top:6px"><span class="lbl">' + esc(t('cycle_title')) + '</span>' + cycleSeg(p, a, 'set-cycle') + '</div><p class="tiny">' + esc(t('cycle_hint')) + '</p></form>');
    }
    var dls = deadlines(a);
    h.push('<section class="card"><h2 class="section-title">' + esc(t('reminders')) + '</h2><p class="muted" style="font-size:14px">' + esc(t('reminders_sub')) + '</p><div class="dl-list">' + dls.map(dlItem).join('') + '</div>' +
      (IS_STANDALONE && dls.length ? '<button type="button" class="btn" data-action="ics-all">' + ICON.dl + esc(t('ics_all')) + '</button>' : '') + '</section>');

    // Редактирование
    function sel(id, label, opts, val) {
      return '<div class="field"><label for="' + id + '">' + esc(label) + '</label><select class="input" id="' + id + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(val) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>';
    }
    function sw(id, label, on) { return '<div class="toggle-row"><span class="t">' + esc(label) + '</span><label class="switch"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + ' aria-label="' + esc(label) + '"><i></i></label></div>'; }
    h.push('<form class="card" id="profile-form" novalidate>' +
      '<div class="grid-2"><div class="field"><label for="pf-name">' + esc(t('name')) + '</label><input class="input" id="pf-name" value="' + esc(p.name || '') + '"></div>' +
      '<div class="field"><label for="pf-shop">' + esc(t('shop')) + '</label><input class="input" id="pf-shop" value="' + esc(p.shop || '') + '"></div></div>' +
      '<div class="grid-2">' + sel('pf-regime', t('regime'), [['single', t('reg_single')], ['patent', t('reg_patent')]], p.regime) +
      (p.regime === 'patent' ? sel('pf-place', t('patent_place'), [['stall', t('pp_stall')], ['container', t('pp_container')], ['shop30', t('pp_shop30')]], p.patentPlace || 'container')
        : sel('pf-activity', t('activity'), [['trade', t('act_trade')], ['production', t('act_production')], ['services', t('act_services')], ['catering', t('act_catering')], ['other', t('act_other')]], p.activity)) + '</div>' +
      '<div class="grid-2"><div class="field"><label for="pf-rev">' + esc(t('revenue12')) + '</label><input class="input num" id="pf-rev" inputmode="numeric" value="' + esc(p.revenue12 || '') + '"></div>' +
      sel('pf-city', t('city'), [['bishkek', t('bishkek')], ['osh', t('osh')], ['other', t('other_city')]], p.city) + '</div>' +
      '<div>' + sw('pf-imp', t('tf_import'), p.importExport) + sw('pf-dis', t('tf_distr'), p.distributor) + sw('pf-pha', t('tf_pharma'), p.pharmaFuel) + sw('pf-zone', t('tf_zone'), p.specialZone) + '</div>' +
      '<button type="submit" class="btn dark">' + esc(t('save_profile')) + '</button></form>');

    h.push('<div class="btn-row"><button type="button" class="btn" data-action="onb-start">' + esc(t('edit_profile')) + '</button><button type="button" class="btn" data-action="demo">' + esc(t('load_demo')) + '</button></div>');
    h.push('<button type="button" class="btn ghost" data-action="reset" style="color:var(--bad)">' + esc(state.resetArmed ? t('reset_confirm') : t('reset_data')) + '</button>');
    h.push('<p class="tiny">' + esc(t('rules_ver', { v: R.RULES_VERSION })) + '</p>');
    return h.join('');
  }

  /* ---------- Онбординг ---------- */
  function onbSteps(d) {
    var s = ['welcome', 'name', 'regime'];
    if (d.regime === 'patent') s.push('place'); else { s.push('activity'); if (d.activity === 'trade') s.push('trade'); }
    s.push('revenue');
    if (d.regime !== 'patent') s.push('cycle');
    s.push('result');
    return s;
  }
  function renderOnb() {
    var o = state.onb, d = o.draft, steps = onbSteps(d), step = steps[o.i], h = [];
    var pct = Math.round(100 * o.i / (steps.length - 1));
    h.push('<div class="onb"><div class="onb-progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div>');
    function choice(field, val, title, desc) {
      return '<button type="button" class="choice" data-action="onb-pick" data-field="' + field + '" data-val="' + val + '" aria-pressed="' + (String(d[field]) === String(val)) + '"><b>' + esc(title) + '</b>' + (desc ? '<span>' + esc(desc) + '</span>' : '') + '</button>';
    }
    function sw(id, label, on) { return '<div class="toggle-row"><span class="t">' + esc(label) + '</span><label class="switch"><input type="checkbox" data-onb="' + id + '" id="onb-' + id + '"' + (on ? ' checked' : '') + ' aria-label="' + esc(label) + '"><i></i></label></div>'; }
    if (step === 'welcome') {
      h.push('<h1>' + esc(t('onb_welcome_title')) + '</h1><p class="muted">' + esc(t('onb_welcome_text')) + '</p>');
    } else if (step === 'name') {
      h.push('<h1>' + esc(t('onb_name_title')) + '</h1><div class="field"><label for="onb-name">' + esc(t('name')) + '</label><input class="input" id="onb-name" value="' + esc(d.name || '') + '" autocomplete="given-name"></div>' +
        '<div class="field"><label for="onb-shop">' + esc(t('shop')) + '</label><input class="input" id="onb-shop" value="' + esc(d.shop || '') + '" placeholder="' + esc(t('onb_shop_ph')) + '"></div>');
    } else if (step === 'regime') {
      h.push('<h1>' + esc(t('onb_regime_title')) + '</h1><div class="choice-list">' + choice('regime', 'single', t('reg_single'), t('reg_single_d')) + choice('regime', 'patent', t('reg_patent'), t('reg_patent_d')) + choice('regime', 'unknown', t('reg_unknown'), t('reg_unknown_d')) + '</div>');
    } else if (step === 'activity') {
      h.push('<h1>' + esc(t('onb_activity_title')) + '</h1><div class="choice-list">' + ['trade', 'production', 'services', 'catering', 'other'].map(function (k) { return choice('activity', k, t('act_' + k), t('act_' + k + '_d')); }).join('') + '</div>');
    } else if (step === 'place') {
      h.push('<h1>' + esc(t('onb_patent_title')) + '</h1><div class="choice-list">' + ['stall', 'container', 'shop30'].map(function (k) { return choice('patentPlace', k, t('pp_' + k)); }).join('') + '</div>');
    } else if (step === 'trade') {
      h.push('<h1>' + esc(t('onb_trade_title')) + '</h1><p class="muted">' + esc(t('onb_trade_text')) + '</p><div class="card">' +
        sw('importExport', t('tf_import'), d.importExport) + sw('distributor', t('tf_distr'), d.distributor) + sw('pharmaFuel', t('tf_pharma'), d.pharmaFuel) + sw('specialZone', t('tf_zone'), d.specialZone) + '</div>');
    } else if (step === 'revenue') {
      h.push('<h1>' + esc(t('onb_rev_title')) + '</h1><p class="muted">' + esc(t('onb_rev_hint')) + '</p>' +
        '<div class="field"><label for="onb-rev">' + esc(t('revenue12')) + '</label><input class="input big num" id="onb-rev" inputmode="numeric" value="' + esc(d.revenue12 || '') + '" placeholder="4 000 000"></div>' +
        '<div class="field"><span class="lbl">' + esc(t('city')) + '</span><div class="seg" role="group">' + ['bishkek', 'osh', 'other'].map(function (c) { return '<button type="button" data-action="onb-pick" data-field="city" data-val="' + c + '" aria-pressed="' + (d.city === c) + '">' + esc(t(c === 'other' ? 'other_city' : c)) + '</button>'; }).join('') + '</div></div>');
    } else if (step === 'cycle') {
      h.push('<h1>' + esc(t('onb_cycle_title')) + '</h1><p class="muted">' + esc(t('onb_cycle_text')) + '</p><div class="choice-list">' +
        choice('cycle', 'month', t('cycle_month'), t('cyc_month_d')) + choice('cycle', 'quarter', t('cycle_quarter'), t('cyc_quarter_d')) + '</div>');
    } else if (step === 'result') {
      var a = R.analyzeProfile(d);
      h.push('<h1>' + esc(t('onb_result_title')) + '</h1>');
      if (!a.supported) h.push('<div class="banner bad">' + ICON.warn + '<p class="grow">' + esc(ruleText(a.reason)) + '</p></div>');
      else {
        var rows = [];
        if (a.regime === 'patent') rows.push([t('patent_title'), money(a.patent.monthly)]);
        else {
          rows.push([t('your_rate'), a.rates.cash === a.rates.noncash ? rate(a.rates.cash) : rate(a.rates.cash) + ' / ' + rate(a.rates.noncash)]);
          rows.push([t('report_every'), t(a.period === 'quarter' ? 'every_quarter' : 'every_month')]);
        }
        var nd = R.upcomingDeadlines(d, a, today(), [])[0];
        if (nd) rows.push([t('next_deadline'), dateLabel(nd.date)]);
        h.push('<section class="hero">' + rows.map(function (r) { return '<div><p class="label">' + esc(r[0]) + '</p><p style="font-family:var(--f-display);font-size:28px;font-weight:700">' + esc(r[1]) + '</p></div>'; }).join('') +
          '<p class="sub">' + esc(ruleText(a.endReason)) + '</p></section>');
      }
      if (d.regime !== 'patent' && !d.specialZone) {
        h.push('<section class="card"><h2 class="section-title">' + esc(t('rate_card_title')) + '</h2>' +
          '<p class="muted" style="font-size:14px">' + esc(a.legalRates ? t('legal_rate', { r: rateStr(a.legalRates, a.row) }) : t('legal_rate_none')) + '</p>' +
          customRateFields('onb', d, a) + '<p class="tiny">' + esc(t('custom_sub')) + '</p></section>');
        h.push(notesHTML(a));
      }
    }
    var last = o.i === steps.length - 1;
    h.push('<div class="btn-row">' + (o.i > 0 ? '<button type="button" class="btn" data-action="onb-back">' + esc(t('back')) + '</button>' : '') +
      '<button type="button" class="btn primary" data-action="' + (last ? 'onb-done' : 'onb-next') + '">' + esc(t(o.i === 0 ? 'start' : last ? 'done' : 'next')) + '</button></div></div>');
    return h.join('');
  }
  function onbCollect() {
    var o = state.onb; if (!o) return; var d = o.draft;
    var g = function (id) { return document.getElementById(id); };
    if (g('onb-name')) d.name = g('onb-name').value.trim();
    if (g('onb-shop')) d.shop = g('onb-shop').value.trim();
    if (g('onb-rev')) d.revenue12 = toNum(g('onb-rev').value);
    document.querySelectorAll('[data-onb]').forEach(function (el) { d[el.getAttribute('data-onb')] = el.checked; });
    readCustom('onb', d);
  }
  function toNum(s) { var n = parseFloat(String(s).replace(/\s| /g, '').replace(',', '.')); return isFinite(n) ? n : 0; }

  /* ================= Отрисовка и навигация ================= */
  function setTabs() {
    document.querySelectorAll('.tab').forEach(function (b) {
      var on = b.getAttribute('data-tab') === state.view;
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    document.getElementById('lang-ru').setAttribute('aria-pressed', state.lang === 'ru');
    document.getElementById('lang-ky').setAttribute('aria-pressed', state.lang === 'ky');
    document.getElementById('tabs').hidden = !!state.onb;
    document.documentElement.lang = state.lang === 'ky' ? 'ky' : 'ru';
  }
  function render() {
    var html;
    if (state.onb) html = renderOnb();
    else if (state.view === 'revenue') html = renderRevenue();
    else if (state.view === 'report') html = renderReport();
    else if (state.view === 'assistant') html = renderAssistant();
    else if (state.view === 'profile') html = renderProfile();
    else html = renderHome();
    // Сохраняем фокус и курсор в поле ввода при перерисовке
    var ae = document.activeElement, fid = ae && ae.id && $view.contains(ae) ? ae.id : null, sel = null;
    try { if (fid && typeof ae.selectionStart === 'number') sel = [ae.selectionStart, ae.selectionEnd]; } catch (e) { sel = null; }
    $view.innerHTML = '<div class="view">' + html + '</div>';
    if (fid) { var ne = document.getElementById(fid); if (ne) { try { ne.focus({ preventScroll: true }); if (sel) ne.setSelectionRange(sel[0], sel[1]); } catch (e) { /* ignore */ } } }
    setTabs();
  }
  function go(view) { state.view = view; state.onb = null; state.resetArmed = false; render(); window.scrollTo(0, 0); }

  /* ================= Действия ================= */
  function addEntry(cash, noncash, date) {
    state.entries.push({ id: 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), date: date, cash: cash, noncash: noncash });
    persist();
  }
  function localParse(text) {
    var s = text.toLowerCase().replace(/ё/g, 'е');
    var d = today();
    if (/позавчера/.test(s)) d.setDate(d.getDate() - 2); else if (/вчера|кечээ/.test(s)) d.setDate(d.getDate() - 1);
    var nums = [], re = /(\d[\d\s]*(?:[.,]\d+)?)\s*(млн|миллион\w*|тыс\w*|миң\w*|k|к)?(?![а-яa-z])/gi, m;
    while ((m = re.exec(s))) {
      var v = toNum(m[1]); var u = (m[2] || '').toLowerCase();
      if (/^млн|^миллион/.test(u)) v *= 1e6; else if (/^тыс|^миң|^k$|^к$/.test(u)) v *= 1000;
      if (v > 0) nums.push({ v: v, at: m.index });
    }
    if (!nums.length) return null;
    var nonKw = /(перевод|картой|карт|безнал|qr|мбанк|элсом|оптим|которуу|o!)/;
    if (nums.length >= 2 && /(из них|анын)/.test(s)) return { cash: nums[0].v - nums[1].v, noncash: nums[1].v, date: R.iso(d) };
    if (nums.length >= 2 && /налич|накталай/.test(s) && nonKw.test(s)) {
      var iN = s.search(nonKw), iC = s.search(/налич|накталай/);
      var a1 = nums[0], a2 = nums[1];
      var cashFirst = iC < iN;
      return { cash: cashFirst ? a1.v : a2.v, noncash: cashFirst ? a2.v : a1.v, date: R.iso(d) };
    }
    var total = nums.reduce(function (x, y) { return x + y.v; }, 0);
    return nonKw.test(s) ? { cash: 0, noncash: total, date: R.iso(d) } : { cash: total, noncash: 0, date: R.iso(d) };
  }
  async function parseRevenue(text) {
    var btn = document.getElementById('rev-parse');
    if (btn) { btn.disabled = true; btn.textContent = t('thinking'); }
    var res = null;
    try {
      await AI.ready;
      if (AI.mode !== 'off') {
        var prompt = 'Извлеки из сообщения индивидуального предпринимателя выручку. Сегодня ' + R.iso(today()) + '. ' +
          'Ответь только JSON без пояснений: {"ok": true, "cash": число, "noncash": число, "date": "ГГГГ-ММ-ДД"}. ' +
          '«тыс», «к», «миң» = 1000, «млн» = 1000000. Переводы, карта, QR, МБанк, Элсом, безнал, «которуу» — это noncash, остальное cash. ' +
          'Если сказано «из них X переводом», то noncash = X, cash = общая сумма − X. «вчера»/«кечээ» — вчерашняя дата. Если даты нет — сегодня. Если суммы нет — {"ok": false}.\n\nСообщение: «' + text.slice(0, 500) + '»';
        var j = await AI.ask(prompt, { json: true, quick: true });
        if (j && j.ok && (toNum(j.cash) > 0 || toNum(j.noncash) > 0)) {
          res = { cash: Math.max(0, toNum(j.cash)), noncash: Math.max(0, toNum(j.noncash)), date: /^\d{4}-\d{2}-\d{2}$/.test(j.date || '') ? j.date : R.iso(today()) };
        }
      }
    } catch (e) { /* используем разбор без ИИ */ }
    if (!res) res = localParse(text);
    if (!res || res.cash + res.noncash <= 0) { toast(t('parse_fail')); state.parsed = null; }
    else state.parsed = res;
    render();
  }

  var explainCtl = null;
  async function explainReport() {
    var a = analysis(), per = reportPeriod(a), rep = R.computeReport(state.profile, a, state.entries, per), key = 'p' + rep.from + state.lang;
    state.aiExplain = { key: key, text: '', busy: true }; render();
    explainCtl = new AbortController();
    var prompt = 'Ты — IPilot, помощник индивидуальных предпринимателей Кыргызстана. ' + langLine() + '\n' +
      'Напиши пошаговую инструкцию (6–8 коротких нумерованных шагов), как подать отчёт по единому налогу FORM STI-091_10 в «Кабинете налогоплательщика» (cabinet.salyk.kg, раздел «Е-отчёты»). ' +
      'Используй ровно эти значения и не меняй их, не добавляй новых чисел. Объясняй просто, без канцелярита. В последнем шаге напомни оплатить налог до срока. ' +
      'Последней строкой отдельно напиши, что это черновик и отчёт отправляет сам предприниматель.\n\n' +
      'Вид отчёта (ячейка 001): первоначальный.\n' + profileContext();
    try {
      await AI.ask(prompt, { signal: explainCtl.signal, onText: function (txt) {
        if (state.aiExplain && state.aiExplain.key === key) { state.aiExplain.text = txt; var el = document.getElementById('ai-explain'); if (el) el.textContent = txt; }
      } }).then(function (txt) { if (state.aiExplain && state.aiExplain.key === key) state.aiExplain.text = txt; });
    } catch (e) {
      if (state.aiExplain && state.aiExplain.key === key) state.aiExplain.text = (e && e.text ? e.text + '\n\n' : '') + (e && e.code === 'cancelled' ? '' : aiErrorText(e));
    }
    if (state.aiExplain && state.aiExplain.key === key) state.aiExplain.busy = false;
    explainCtl = null;
    if (state.view === 'report') render();
  }

  var chatCtl = null;
  async function sendChat(text) {
    text = text.trim(); if (!text) return;
    var docs = KB.search(text, 4);
    state.chat.push({ role: 'user', text: text });
    var idx = state.chat.length;
    state.chat.push({ role: 'ai', text: '', busy: true, sources: docs });
    render(); scrollChat();
    var instructions = 'Ты — IPilot, помощник индивидуальных предпринимателей (ИП) Кыргызстана по налогам.\n' +
      'Правила ответа:\n1. ' + langLine() + ' Пиши просто и коротко (до 120 слов), без канцелярита.\n' +
      '2. Опирайся только на ДАННЫЕ ИП, РАСЧЁТ и ДОКУМЕНТЫ ниже. Не придумывай ставки, сроки и номера ячеек.\n' +
      '3. Суммы налога, ставки и сроки бери только из расчёта приложения. Сам ничего не пересчитывай.\n' +
      '4. Если ответа нет в документах или случай сложный, честно скажи, что не уверен, и посоветуй позвонить в ГНС по номеру 116.\n' +
      '5. Ты не подаёшь отчёты: отчёт отправляет сам ИП в кабинете налогоплательщика.\n' +
      '6. В конце ответа укажи номера документов, на которые опирался, в виде [1], [2].\n\n' +
      profileContext() + '\n\nДОКУМЕНТЫ:\n' + docs.map(function (d, i) { return '[' + (i + 1) + '] ' + d.title + ' (' + d.source.title + '): ' + d.text; }).join('\n');
    var turns = [{ role: 'user', content: instructions }];
    state.chat.slice(0, idx).slice(-8).forEach(function (m) {
      if (m.role === 'user') turns.push({ role: 'user', content: m.text });
      else if (m.text && !m.error) turns.push({ role: 'assistant', content: m.text });
    });
    if (turns[turns.length - 1].role !== 'user') turns.push({ role: 'user', content: text });
    chatCtl = new AbortController();
    var msg = state.chat[idx];
    try {
      var out = await AI.ask(turns, { signal: chatCtl.signal, onText: function (txt) {
        msg.text = txt; var el = document.getElementById('msg-' + idx); if (el) { el.classList.remove('thinking'); el.textContent = txt; } scrollChat();
      } });
      msg.text = out;
    } catch (e) {
      msg.error = true;
      msg.text = (e && e.text ? e.text + '\n\n' : '') + (e && e.code === 'cancelled' ? '' : aiErrorText(e));
      if (!msg.text.trim()) msg.text = '…';
    }
    msg.busy = false; chatCtl = null;
    if (state.view === 'assistant') { render(); scrollChat(); }
  }
  function scrollChat() { var c = document.getElementById('chat-form'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'end' }); }

  function saveIcs(events, name) {
    var data = R.icsFor(events.map(function (e) { return { id: e.id, date: e.date, title: e.title, detail: e.detail }; }));
    try {
      var blob = new Blob([data], { type: 'text/calendar' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    } catch (e) { toast(t('ai_err')); }
  }

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-action], [data-tab], [data-lang], #btn-profile, #logo, #rev-kind button');
    if (!el) return;
    if (el.id === 'logo') { ev.preventDefault(); go('home'); return; }
    if (el.id === 'btn-profile') { go('profile'); return; }
    if (el.hasAttribute('data-tab')) { go(el.getAttribute('data-tab')); return; }
    if (el.hasAttribute('data-lang')) { state.lang = el.getAttribute('data-lang'); persist(); render(); return; }
    if (el.parentElement && el.parentElement.id === 'rev-kind') {
      el.parentElement.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b === el); }); return;
    }
    var act = el.getAttribute('data-action');
    switch (act) {
      case 'go': go(el.getAttribute('data-to')); break;
      case 'set-cycle':
        if (document.getElementById('pf-cr-on')) readCustom('pf', state.profile);
        var cv = el.getAttribute('data-val');
        state.profile.cycle = cv === 'auto' ? 'auto' : cv; state.reportOffset = null; persist();
        var an = analysis(); toast(t('cycle_set', { c: t(an.period === 'month' ? 'cycle_month' : 'cycle_quarter') })); render(); break;
      case 'onb-start':
        state.onb = { i: 0, draft: state.demo ? { regime: 'single', activity: 'trade', city: 'bishkek', patentPlace: 'container', cycle: 'quarter' }
          : JSON.parse(JSON.stringify(state.profile)) };
        render(); window.scrollTo(0, 0); break;
      case 'onb-pick':
        onbCollect();
        var f = el.getAttribute('data-field'), v = el.getAttribute('data-val');
        if (f === 'regime' && v === 'unknown') { state.onb.draft.regime = 'single'; state.onb.draft.regimeUnknown = true; }
        else { state.onb.draft[f] = v; if (f === 'regime') state.onb.draft.regimeUnknown = false; }
        render(); break;
      case 'onb-next': onbCollect(); state.onb.i++; render(); window.scrollTo(0, 0); break;
      case 'onb-back': onbCollect(); state.onb.i = Math.max(0, state.onb.i - 1); render(); break;
      case 'onb-done':
        onbCollect();
        var wasDemo = state.demo;
        state.profile = state.onb.draft; state.demo = false; state.onb = null;
        if (wasDemo) { state.entries = []; state.confirmed = {}; }
        state.reportOffset = null; persist(); go('home'); break;
      case 'parse':
        var tx = document.getElementById('rev-text'); if (tx && tx.value.trim()) parseRevenue(tx.value); break;
      case 'parse-add':
        if (state.parsed) { addEntry(state.parsed.cash, state.parsed.noncash, state.parsed.date); state.parsed = null; toast(t('added')); render(); } break;
      case 'parse-cancel': state.parsed = null; render(); break;
      case 'del':
        var id = el.getAttribute('data-id'); state.entries = state.entries.filter(function (e) { return e.id !== id; }); persist(); toast(t('deleted')); render(); break;
      case 'copy': copyText(el.getAttribute('data-val'), el); break;
      case 'copy-all':
        var a0 = analysis(), rep0 = R.computeReport(state.profile, a0, state.entries, reportPeriod(a0));
        copyText(['201: ' + rep0.from, '202: ' + rep0.to].concat(rep0.cells.map(function (c) { return c.code + ': ' + (c.kind === 'rate' ? c.value : (Math.round(c.value * 100) / 100).toFixed(2)); })).join('\n'), null); break;
      case 'rest': state.restOpen = !state.restOpen; render(); break;
      case 'explain': explainReport(); break;
      case 'stop-explain': if (explainCtl) explainCtl.abort(); break;
      case 'quick': sendChat(t(el.getAttribute('data-q'))); break;
      case 'stop-chat': if (chatCtl) chatCtl.abort(); break;
      case 'ics':
        var evs = deadlines(analysis()).filter(function (e) { return e.id === el.getAttribute('data-id'); }); if (evs.length) saveIcs(evs, 'ipilot-' + evs[0].date + '.ics'); break;
      case 'ics-all': saveIcs(deadlines(analysis()).filter(function (e) { return !e.notRequired; }), 'ipilot-sroki.ics'); break;
      case 'demo': loadDemo(); state.reportOffset = null; persist(); go('home'); break;
      case 'reset':
        if (!state.resetArmed) { state.resetArmed = true; render(); break; }
        try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
        state.resetArmed = false; loadDemo(); state.onb = null; toast(t('reset_done'));
        state.onb = { i: 0, draft: { regime: 'single', activity: 'trade', city: 'bishkek', patentPlace: 'container', cycle: 'quarter' } };
        render(); break;
    }
  });

  document.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = ev.target;
    if (f.id === 'rev-form') {
      var amt = toNum(document.getElementById('rev-amount').value);
      if (!(amt > 0)) { toast(t('bad_amount')); return; }
      var non = document.getElementById('rev-kind-noncash').getAttribute('aria-pressed') === 'true';
      addEntry(non ? 0 : amt, non ? amt : 0, document.getElementById('rev-date').value || R.iso(today()));
      toast(t('added')); render();
    } else if (f.id === 'chat-form') {
      var inp = document.getElementById('chat-input');
      if (state.chat.some(function (m) { return m.busy; })) return;
      var v = inp.value; inp.value = ''; sendChat(v);
    } else if (f.id === 'rate-form') {
      var pr = state.profile; readCustom('pf', pr);
      if (pr.customRate && pr.customRate.on) {
        var two = document.getElementById('pf-cr-non');
        if (!rateValid(pr.customRate.cash) || (two && !rateValid(pr.customRate.noncash))) { toast(t('bad_rate')); return; }
      }
      state.demo = false; persist(); toast(t('saved')); render();
    } else if (f.id === 'profile-form') {
      var p = state.profile, g = function (id) { return document.getElementById(id); };
      p.name = g('pf-name').value.trim(); p.shop = g('pf-shop').value.trim(); p.regime = g('pf-regime').value;
      if (g('pf-activity')) p.activity = g('pf-activity').value;
      if (g('pf-place')) p.patentPlace = g('pf-place').value;
      p.revenue12 = toNum(g('pf-rev').value); p.city = g('pf-city').value;
      p.importExport = g('pf-imp').checked; p.distributor = g('pf-dis').checked; p.pharmaFuel = g('pf-pha').checked; p.specialZone = g('pf-zone').checked;
      state.demo = false; state.reportOffset = null; persist(); toast(t('saved')); render();
    }
  });

  document.addEventListener('change', function (ev) {
    var el = ev.target;
    if (el.id === 'rep-period') { state.reportOffset = parseInt(el.value, 10); render(); }
    else if (el.id === 'rep-confirm') {
      var a = analysis(), key = 'p' + R.iso(reportPeriod(a).start);
      state.confirmed[key] = el.checked; persist(); if (el.checked) toast(t('confirmed'));
    } else if (el.id === 'pf-cr-on') {
      var pp = state.profile; pp.customRate = pp.customRate || {}; pp.customRate.on = el.checked;
      if (el.checked && (pp.customRate.cash == null || pp.customRate.cash === '')) {
        var lg = R.analyzeProfile(Object.assign({}, pp, { customRate: null })).legalRates;
        pp.customRate.cash = lg ? String(lg.cash) : ''; pp.customRate.noncash = lg ? String(lg.noncash) : '';
      }
      persist(); render();
    }
    else if (el.id === 'onb-cr-on') {
      onbCollect(); var dd0 = state.onb.draft;
      if (el.id === 'onb-cr-on' && el.checked && (dd0.customRate.cash == null || dd0.customRate.cash === '')) {
        var lg2 = R.analyzeProfile(Object.assign({}, dd0, { customRate: null })).legalRates;
        dd0.customRate.cash = lg2 ? String(lg2.cash) : ''; dd0.customRate.noncash = lg2 ? String(lg2.noncash) : '';
      }
      render();
    }
    else if (el.id === 'pf-regime') { state.profile.regime = el.value; render(); }
  });

  // Своя ставка в опросе: пересчитываем итог через полсекунды после ввода
  var crTimer;
  document.addEventListener('input', function (ev) {
    var id = ev.target && ev.target.id;
    if (state.onb && (id === 'onb-cr-cash' || id === 'onb-cr-non')) {
      clearTimeout(crTimer);
      crTimer = setTimeout(function () { if (state.onb) { onbCollect(); render(); } }, 450);
    }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.target && ev.target.id === 'chat-input' && ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault(); var f = document.getElementById('chat-form'); if (f) f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  });

  var topEl = document.getElementById('top');
  window.addEventListener('scroll', function () { topEl.classList.toggle('scrolled', window.scrollY > 4); }, { passive: true });

  load();
  render();
  AI.ready.then(function () { if (state.view === 'assistant') render(); });
})();
