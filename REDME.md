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
    git clone https://github.com/yourusername/your-repo.git
    cd your-repo
    ```

2. **Установите зависимости**:
    ```bash
    npm install
    ```

3. **Настройте базу данных PostgreSQL**:
    ```sql
    CREATE DATABASE your_db_name;
    \c your_db_name
    CREATE TABLE scraped_data (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        author VARCHAR(255),
        link TEXT
    );
    ```

4. **Создайте файл `.env`** в корневом каталоге с следующим содержимым:
    ```plaintext
    PORT=3000
    DATABASE_URL=postgres://yourusername:yourpassword@localhost:5432/your_db_name
    ```

## Использование

Чтобы запустить сервер, выполните:
```bash
npm start
