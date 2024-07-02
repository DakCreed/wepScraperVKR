# 📚 Приложение на ScienceScrape выполненное на технологиях Express.js с PostgreSQL и puppteer

## Обзор
Этот проект представляет собой приложение на Express.js, которое подключается к базе данных PostgreSQL и осуществляет парсинг данных с [elibrary.ru](https://elibrary.ru). Парсенные данные затем сохраняются в базе данных PostgreSQL.

## Возможности
- 🌐 **Веб-скрапинг** с elibrary.ru
- 💾 **PostgreSQL** для хранения данных
- 🚀 **Express.js** для обработки серверной части


## Предварительные требования
Убедитесь, что у вас установлены следующие программы:
- [Node.js](https://nodejs.org/) (версии 14.x или выше)
- [PostgreSQL](https://www.postgresql.org/) (версии 12.x или выше)
- [npm](https://www.npmjs.com/)

## Установка

1. **Клонируйте репозиторий**:
    ```bash
    git clone https://github.com/DakCreed/wepScraperVKR
    cd your-repo
    ```

2. **Установите зависимости**:
    ```bash
    npm install
    ```

3. **Настройте базу данных PostgreSQL в файле db.js, поменяйте на параметры своей базы**:
    ```sql
    const pool = new Pool({
    user: 'postgres', // Замените на ваше имя пользователя PostgreSQL
    host: 'localhost',
    database: 'VKR', // Замените на имя вашей базы данных
    password: 'root', // Замените на ваш пароль PostgreSQL
    port: 5432,
});
    ```


## Использование

Чтобы запустить сервер, откройте bash-консоль в директории проекта и выполните:
```bash
node app.js
```
