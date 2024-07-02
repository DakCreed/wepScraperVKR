import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres', // Замените на ваше имя пользователя PostgreSQL
    host: 'localhost',
    database: 'VKR', // Замените на имя вашей базы данных
    password: 'root', // Замените на ваш пароль PostgreSQL
    port: 5432,
});

// Функция для проверки подключения к базе данных
const checkDatabaseConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to the PostgreSQL database');

        // Запрос списка таблиц в базе данных
        const res = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);

        const existingTables = res.rows.map(row => row.table_name);

        console.log('List of tables in the database:');
        res.rows.forEach(row => {
            console.log(row.table_name);
        });

        // Проверка наличия таблицы "users" и создание, если она отсутствует
        if (!existingTables.includes('users')) {
            console.log('Creating table "users"');
            await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) NOT NULL,
                    password VARCHAR(255) NOT NULL
                )
            `);
            console.log('Table "users" created successfully');
        }

        // Проверка наличия таблицы "author_publications" и создание, если она отсутствует
        if (!existingTables.includes('author_publications')) {
            console.log('Creating table "author_publications"');
            await client.query(`
                CREATE TABLE author_publications (
                    uniqkey VARCHAR(50) PRIMARY KEY NOT NULL,
                    userid INTEGER NOT NULL REFERENCES users(id),
                    date_stamp TIMESTAMP WITHOUT TIME ZONE,
                    message_to_user TEXT,
                    source_url TEXT,
                    author_name TEXT,
                    author_page_url TEXT,
                    articles_count INTEGER,
                    articles JSONB
                )
            `);
            console.log('Table "author_publications" created successfully');
        }

        client.release();
    } catch (err) {
        console.error('Error connecting to the PostgreSQL database:', err.message);
        console.error('Stack trace:', err.stack);
        process.exit(1); // Завершение процесса с ошибкой
    }
};

// Вызов функции проверки подключения и вывода списка таблиц
checkDatabaseConnection();

export default pool;
