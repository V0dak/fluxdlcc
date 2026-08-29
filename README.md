# FLUX website

Проект приведён к нормальной структуре без огромного монолитного `index.html`.

## Структура

- `index.html` — только разметка страницы.
- `css/style.css` — базовые стили и компоненты.
- `css/auth.css` — финальные стили окна авторизации.
- `css/account.css` — финальные стили кабинета и раздела безопасности.
- `js/language.js` — переводы RU/EN и переключатель языка.
- `js/app.js` — навигация, общие действия и обработчик `data-action`.
- `js/auth-ui.js` — логика интерфейса входа/регистрации и кабинета.
- `js/account.js` — меню личного кабинета.
- `js/store.js` — окно покупки, промокоды и FunPay.
- `js/auth.js` — Supabase Auth.
- `js/intro.js` — стартовая анимация FLUX.
- `assets/images/` — изображения.

## Запуск

Распакуйте архив и откройте `index.html` или `START-SITE.bat`. Для Supabase-авторизации нужен интернет.

## Важно

Существующая авторизация через Supabase сохранена. Покупка через FunPay и промокоды по-прежнему работают на клиентской стороне так же, как в исходной версии; для серверной проверки лицензий/покупок понадобится отдельная серверная логика и схема базы данных.


## Referral / subscription defaults
- Referral links use `https://v0dak.github.io/fluxdlcc/?ref=<nickname>`.
- Every account displays `0` subscription days initially until a real purchase/activation backend updates it.


## V0dak config
The storefront shows only the V0dak config at 50 ₽. The paid `V0dak.json` is intentionally not included in public site assets; deliver it after payment or through a protected backend.


## Roulette fix
Roulette state is now per account, resets at 01:00 MSK, and a spin is only consumed after the animation finishes. Legacy `flux_roulette` state is ignored.


## Latest fixes
- Unified action-button states across all themes; black theme no longer produces bright white buttons.
- Roulette is weighted: 1-day subscription 2%, 7-day subscription 1%, Beta 0.5%.
