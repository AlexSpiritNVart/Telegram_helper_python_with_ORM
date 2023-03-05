# Telegram helper python with ORM
Диалогове окно на сайте пересылающее сообщения в телеграмм бота
___
## Установка
Для установки необходимо скачать репозиторий и установить все необходимые библеотеки указанные в файле requirements.txt
Далее создать 2 файла конфигурации: один для php скрипта, другой для python модуля.
telegram_site_helper_config.py
telegram-site-helper-config.php
### Файл конфигурации php
```php
<?php
DEFINE("BOTTOKEN","");
DEFINE("DBTYPE","sqlite");
DEFINE("SQLITE_DBNAME","telegram-site-helper.db");
```
### Файл конфигурации python
``` python
MY_TOKEN = ''
MANAGERPASS = ''
DBTYPE = "sqlite"
DBNAME = "telegram-site-helper.db"
```
В поле BOTTOKEN и MY_TOKEN указать токен выданый Botfather в поле MANAGERPASS указать пароль который менеджер будет указывать при логине в чат-боте

___
В данном проекте создано 2 варианта общения пайтон модуля с базой данных: первый модуль telegram_helper_polling.py реализует общение через SQL запросы, второй telegram_helper_polling_with_ORM.py через ORM.
Запустить для работы необходимо только один из них.
Сама логика работы диалогового окна реализована в telegram-site-helper.js
Апи общения окна с телеграммом реализована в telegram-site-helper-api.php
