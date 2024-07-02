import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import pkg from 'pg';
import { fileURLToPath } from 'url';
import path from "path";
import bodyParser from 'body-parser';
import morgan from 'morgan';
import {analyzeString} from "./identifySearchParams.js";
import pool from './db.js';


// const { Pool } = pkg;

const app = express();

// Подключение к базе данных PostgreSQL
// const pool = new Pool({
//     user: 'postgres', // Замените на ваше имя пользователя PostgreSQL
//     host: 'localhost',
//     database: 'VKR', // Замените на имя вашей базы данных
//     password: 'root', // Замените на ваш пароль PostgreSQL
//     port: 5432,
// });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
}));

const checkAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    let { username, password, confirmPassword } = req.body;
    console.log('Registration request received');

    // Экранирование символов
    username = validator.escape(username);
    password = validator.escape(password);
    confirmPassword = validator.escape(confirmPassword);

    if (password !== confirmPassword) {
        console.log('Passwords do not match');
        return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
        console.log('User registered successfully');
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err);
        res.redirect('/register');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    let { username, password } = req.body;
    console.log('Login request received');

    // Экранирование символов
    username = validator.escape(username);
    password = validator.escape(password);

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.redirect('/login');
                }
                console.log('User logged in successfully');
                res.redirect('/api/searchPage');
            });
        } else {
            console.log('Invalid username or password');
            res.redirect('/login');
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.redirect('/login');
    }
});

app.get('/api/searchPage', checkAuth, async (req, res) => {
    let username = await getUsernameByUserId(req.session.userId);
    res.render('searchPage', { user: { username } });
});

async function getUsernameByUserId(userId) {
    const query = 'SELECT username FROM users WHERE id = $1';
    const values = [userId];

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return result.rows[0].username;
            // return result.rows[0].id;
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error fetching username:', error.message);
        throw error;
    }
}

app.post('/api/goScrape', async (req, res) => {
    const { userInput } = req.body;
    if (!userInput) {
        // Возвращаем JSON-ответ с сообщением об отсутствии данных
        return res.status(400).json({ error: 'Вы передали пустой или неверный параметр!' });
    }
    try {
        const analysisResult = await analyzeString(userInput);
        // res.json(analysisResult);
        res.send(analysisResult);
    } catch (error) {
        // Возвращаем JSON-ответ с сообщением об ошибке
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/getAllSearchResult', checkAuth, async (req, res) => {
    try {
        console.log(req.session.userId);
        let p = req.session.userId;
        console.log(p);

        // Измененный SQL-запрос с условием WHERE для фильтрации по userid
        const query = 'SELECT * FROM author_publications WHERE userid = $1';
        const values = [p];

        // Выполнение параметризованного запроса
        const result = await pool.query(query, values);
        const rows = result.rows;

        // Проверка, вернул ли запрос хотя бы одну строку
        if (rows.length === 0) {
            return res.status(200).json({ message: 'История поиска пуста' });
        }

        // Логирование данных каждой строки
        rows.forEach(row => {
            console.log(`
        Uniqkey: ${row.uniqkey}
        Date Stamp: ${row.date_stamp}
        Message to User: ${row.message_to_user}
        Source URL: ${row.source_url}
        Author Name: ${row.author_name}
        Author Page URL: ${row.author_page_url}
        Articles Count: ${row.articles_count}
        Articles: ${JSON.stringify(row.articles, null, 2)}
      `);
        });

        // Отправка результата запроса в формате JSON
        res.status(200).json(rows);
    } catch (error) {
        // Логирование ошибки и ее стека, если произошла ошибка при выполнении запроса
        console.error('Error while fetching data:', error.message);
        console.error('Stack trace:', error.stack);

        // Отправка ошибки клиенту
        res.status(500).json({ error: 'Ошибка при получении данных' });
    }
});



app.delete('/api/deletehistoryuser/:id', checkAuth, async (req, res) => {
    const userId = req.params.id;
    try {
        // let delUser = await getUsernameByUserId(req.session.userId);
        let delUser=req.session.userId;
        console.log(`User to delete: ${delUser}`);

        // Удаление записей из таблицы author_publications
        const deleteQuery = 'DELETE FROM author_publications WHERE userid = $1';
        const deleteValues = [delUser];
        await pool.query(deleteQuery, deleteValues);

        console.log(`DELETE request to /api/deletehistoryuser/${userId} received.`);

        res.json({ message: `History for user ${delUser} has been successfully deleted.` });
    } catch (error) {
        console.error('Error deleting user history:', error.message);
        res.status(500).json({ error: 'Ошибка при удалении истории пользователя' });
    }
});


app.delete('/api/deletepublications/:uniqkey', async (req, res) => {
    try {
        const uniqkey = req.params.uniqkey;
        // Запрос на удаление данных из базы по uniqkey
        const query = 'DELETE FROM author_publications WHERE uniqkey = $1';
        const result = await pool.query(query, [uniqkey]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Запись не найдена' });
        }
        res.status(200).json({ message: 'Запись успешно удалена' });
    } catch (error) {
        console.error('Error while deleting data:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ error: 'Ошибка при удалении данных' });
    }
});


app.post('/api/savetoDB', async (req, res) => {
    try {
        const resultRequest = req.body.resultRequest;

        if (!resultRequest) {
            return res.status(400).json({ error: 'Неверный запрос, отсутствует resultRequest' });
        }
        let statusSaveDB = await insertDataIntoDatabase(resultRequest, req.session.userId);
        if (statusSaveDB.success) {
            console.log('После добавления');
            return res.status(200).json(statusSaveDB);
        } else {
            return res.status(500).json({ error: 'Ошибка при сохранении данных в базу данных' });
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса на сохранение данных:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

app.get('/dashboard', checkAuth, (req, res) => {
    res.render('dashboard');
});

app.get('/profile', checkAuth, async (req, res) => {
    let username = await getUsernameByUserId(req.session.userId);
    res.render('profile', { user: { username } });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        console.log('User logged out');
        res.redirect('/login');
    });
});

const insertDataIntoDatabase = async (dataObject, userId) => {
    try {
        // Убедимся, что все необходимые поля присутствуют
        if (!dataObject.uniqkey || !dataObject.dateStamp || !dataObject.messageToUser || !dataObject.from || !dataObject.nameAuthor || !dataObject.pageAuthors || !dataObject.foundArticles || !dataObject.articlesList) {
            throw new Error('Недостаточно данных');
        }
        // Извлекаем только числовое значение из строки foundArticles
        const articlesCount = parseInt(dataObject.foundArticles.replace(/\D/g, ''), 10);
        // Запрос на вставку данных в базу
        const query = `
            INSERT INTO author_publications (
                uniqkey, date_stamp, message_to_user, source_url, author_name, author_page_url, articles_count, articles, userid
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (uniqkey) DO NOTHING;
        `;
        const values = [
            dataObject.uniqkey,
            dataObject.dateStamp,
            dataObject.messageToUser,
            dataObject.from,
            dataObject.nameAuthor,
            dataObject.pageAuthors,
            articlesCount,
            JSON.stringify(dataObject.articlesList),
            userId
        ];
        await pool.query(query, values);
        return { success: true, data: dataObject };
    } catch (error) {
        console.error('Error while processing data:', error.message);
        console.error('Stack trace:', error.stack);
        return { success: false, error: 'Ошибка при обработке данных' };
    }
};


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Что-то пошло не так!' });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    console.log('Server is running on http://localhost:3000/login');
});
