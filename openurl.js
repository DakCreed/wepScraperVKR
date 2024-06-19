import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';


// Подключаем плагин stealth
puppeteer.use(StealthPlugin());

async function openUrl(url) {
    // Запускаем браузер
    const browser = await puppeteer.launch({ headless: false, userDataDir: './tmp' });

    // Открываем новую страницу
    const page = await browser.newPage();

    // Переходим по переданной ссылке
    await page.goto(url);

}

// Пример использования
const url = 'https://www.elibrary.ru/author_items.asp?authorid=110&show_refs=1&show_option=1';
openUrl(url);
