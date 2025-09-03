# Настройка Email для отправки уведомлений

Для работы функции отправки email при выборе двери нужно настроить переменные окружения.

## Необходимые переменные окружения (.env)

Создайте файл `.env` в корне проекта со следующими переменными:

```env
# Email Configuration
# SMTP settings for sending emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin email for notifications
ADMIN_EMAIL=admin@yourcompany.com

# Google Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key-here
```

## Настройка Gmail (если используете Gmail)

1. Включите двухфакторную аутентификацию в аккаунте Gmail
2. Создайте "App Password" в настройках безопасности Google:
   - Перейдите в https://myaccount.google.com/security
   - В разделе "Signing in to Google" нажмите "App passwords"
   - Выберите "Mail" и "Other (custom name)"
   - Введите название приложения (например, "Garage Door App")
   - Скопируйте сгенерированный пароль (без пробелов)
3. Используйте этот пароль в переменной `SMTP_PASS`

## Настройка других почтовых сервисов

### Outlook/Hotmail:

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo:

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## Тестирование

После настройки переменных окружения:

1. Запустите приложение: `npm run dev`
2. Перейдите на страницу offer
3. Выберите дверь и нажмите "Choose"
4. Проверьте почту пользователя и администратора

### Пример файла .env.local для тестирования:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@yourcompany.com
GEMINI_API_KEY=your-gemini-api-key-here
```

**Примечание:** Создайте файл `.env.local` в корне проекта и добавьте туда ваши реальные настройки.

## Как теперь работают изображения в email

### ✅ Решение проблемы с пустыми изображениями

**Проблема была:** Base64 изображения слишком большие для email клиентов (Gmail, Outlook и т.д.)

**Решение:** Изображения теперь отправляются как attachments с CID ссылками:

- `original-garage.jpg` → `cid:original-garage-image`
- `generated-doors.png` → `cid:generated-doors-image`

### Преимущества нового подхода:

- ✅ Совместимость со всеми почтовыми клиентами
- ✅ Изображения отображаются корректно
- ✅ Файлы прикрепляются к письму автоматически
- ✅ Пользователь может скачать изображения отдельно

### Тестирование изображений:

1. После настройки `.env.local` перезагрузите приложение
2. Выберите дверь на странице offer
3. Нажмите "Choose"
4. Проверьте оба email - изображения должны отображаться корректно

## Устранение неполадок

Если emails не отправляются:

1. Проверьте корректность SMTP настроек
2. Убедитесь, что пароль приложения правильный
3. Проверьте логи сервера на ошибки
4. Для Gmail убедитесь, что "Less secure app access" отключен (используйте App Passwords)

## Безопасность

- Никогда не коммитите файл `.env` в git
- Используйте App Passwords вместо основного пароля
- Регулярно меняйте пароли приложений
