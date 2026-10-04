# Lead worker — заявки с сайта в Telegram

Маленький Cloudflare Worker: принимает POST с формой «Контакта»
и пересылает заявку ботом вам в Telegram. Бесплатного плана хватает с запасом.

## Настройка (5 минут)

1. **Бот**: в Telegram у @BotFather → `/newbot` → получите токен
   вида `123456:AA...`.
2. **Chat ID**: напишите своему новому боту любое сообщение, затем откройте
   `https://api.telegram.org/bot<ТОКЕН>/getUpdates` — в ответе найдите
   `"chat":{"id":123456789}`.
3. **Деплой**:
   ```bash
   cd worker
   npx wrangler login
   npx wrangler deploy
   ```
   Wrangler выдаст URL вида `https://azoth-lead.<ваш-субдомен>.workers.dev`.
4. **Секреты**:
   ```bash
   npx wrangler secret put TELEGRAM_BOT_TOKEN   # вставить токен из п.1
   npx wrangler secret put TELEGRAM_CHAT_ID     # вставить id из п.2
   ```
5. **Подключить сайт**: в `js/config.js` вставьте URL воркера:
   ```js
   export const LEAD_API = 'https://azoth-lead.<ваш-субдомен>.workers.dev';
   ```

Готово: форма на «Контакте» шлёт заявки напрямую, а при недоступности
эндпоинта автоматически падает в старый режим (текст для Telegram/почты).

## Что внутри

- CORS на POST/OPTIONS, только JSON;
- honeypot-поле `company`: боты отсеиваются молча (клиенту — «успех»);
- лимиты длины полей, HTML-экранирование;
- проверка конфигурации: без секретов отвечает ошибкой 500.
