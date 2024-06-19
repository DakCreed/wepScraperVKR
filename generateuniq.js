import { v4 as uuidv4 } from 'uuid';

// Генерация уникального ключа длиной 16 символов
function generateUniqueKey() {
    return uuidv4().replace(/-/g, '').substring(0, 16);
}


export {generateUniqueKey};
