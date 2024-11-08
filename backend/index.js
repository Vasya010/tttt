const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Для генерации случайных паролей
const fs = require('fs');
require('dotenv').config();
const multer = require('multer'); // Для загрузки файлов
const nodemailer = require('nodemailer');
const path = require('path');


const app = express(); // Создание приложения Express
app.use(cors());
app.use(bodyParser.json());
const secretKey = 'ваш_секретный_ключ'; // Добавьте это перед использованием
// Получаем секретный ключ из окружения
;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectTimeout: 10000, // увеличьте время ожидания для подключения
});




app.get('/', (req, res) => {
    res.send('Сервер работает!'); // Ответ, который будет возвращён при GET запросе на '/'
});
// Проверка соединения с базой данных
db.connect(async (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
        return;
    }
    console.log('Подключено к базе данных MySQL');

    // Проверка на наличие администратора
    const checkAdminQuery = 'SELECT * FROM users WHERE role = "admin"';
    db.query(checkAdminQuery, async (error, results) => {
        if (error) {
            console.error('Ошибка проверки администратора:', error);
            return;
        }

        if (results.length === 0) {
            // Если нет администратора, создаём нового
            const generatedUsername = 'admin'; // Можно сгенерировать случайный логин, если нужно
            const generatedPassword = crypto.randomBytes(8).toString('hex'); // Генерация случайного пароля
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            // Генерация токена
            const generatedToken = crypto.randomBytes(32).toString('hex'); // Генерация случайного токена

            const insertAdminQuery = 'INSERT INTO users (username, email, password, role, token, phone, country, gender) VALUES (?, ?, ?, "admin", ?, ?, ?, ?)';
            db.query(insertAdminQuery, [generatedUsername, 'admin@example.com', hashedPassword, generatedToken, '1234567890', 'DefaultCountry', 'male'], (error) => {
                if (error) {
                    console.error('Ошибка при создании администратора:', error);
                    return;
                }
                console.log(`Администратор создан! Логин: ${generatedUsername}, Пароль: ${generatedPassword}`);
            });
        } else {
            console.log('Администратор уже существует');
        }
    });
});
const createFolderIfNotExists = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true }); // Создание папки с рекурсивным флагом
    }
};
// Настройка multer для загрузки файлов
// Define the storage configuration for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folderPath;
        switch (file.fieldname) {
            case 'gameFile':
                folderPath = 'games'; // Folder for game files
                break;
            case 'image':
            case 'screenshots':
                folderPath = 'images'; // All images and screenshots go to 'images'
                break;
            case 'trailer':
                folderPath = 'video'; // Trailer goes to 'video' folder
                break;
            default:
                folderPath = 'uploads'; // Default folder
        }
        createFolderIfNotExists(folderPath); // Create folder if it doesn't exist
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Add timestamp to the filename
    }
});


app.use('/games', express.static(path.join(__dirname, 'games')));
// Загрузка изображений
const upload = multer({ storage });
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Пожалуйста, выберfите изображение' });
    }
    const imageUrl = `/images/${req.file.filename}`; // Путь к загруженному изображению
    res.status(200).json({ imageUrl });
});

/// Setup multer for multiple file fields
const uploadGame = multer({ storage }).fields([
    { name: 'gameFile', maxCount: 1 },  // Ensure this name matches what's used in FormData
    { name: 'image', maxCount: 1 },     // Image field
    { name: 'trailer', maxCount: 1 },   // Trailer (video)
    { name: 'screenshots', maxCount: 5 } // Multiple screenshots
]);
// Storage configuration for multer


app.use('/images', express.static(path.join(__dirname, 'images')));


// Маршрут для обновления токена
app.post('/api/token/refresh', (req, res) => {
    // Извлечение токена из тела запроса
    const refreshToken = req.body.token;

    console.log('Полученный refreshToken:', refreshToken);

    // Проверка наличия токена
    if (!refreshToken) {
        console.error('Отсутствует refreshToken');
        return res.sendStatus(401); // Не авторизован
    }

    // Верификация токена
    jwt.verify(refreshToken, secretKey, (err, user) => {
        if (err) {
            console.error('Ошибка верификации токена:', err);
            return res.sendStatus(403); // Токен недействителен
        }

        // Создание нового токена
        const newToken = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
        res.json({ token: newToken });
    });
});

// Раздача статических файлов для видео
app.use('/video', express.static(path.join(__dirname, 'video')));
// Маршрут для регистрации
// Маршрут для регистрации

app.post('/api/register', async (req, res) => {
    const { username, email, phone, country, gender, password } = req.body;

    if (!username || !email || !phone || !country || !gender || !password) {
        return res.status(400).send('Пожалуйста, заполните все поля!');
    }

    // Проверка на существующий email
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], async (error, results) => {
        if (error) {
            console.error('Ошибка при проверке email:', error);
            return res.status(500).send('Ошибка при проверке email');
        }

        if (results.length > 0) {
            return res.status(400).send('Пользователь с таким email уже существует!');
        }

        try {
            // Хешируем пароль
            const hashedPassword = await bcrypt.hash(password, 10);

            // SQL для вставки нового пользователя
            const sql = 'INSERT INTO users (username, email, phone, country, gender, password) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(sql, [username, email, phone, country, gender, hashedPassword], async (error, results) => {
                if (error) {
                    console.error('Ошибка при выполнении запроса:', error);
                    return res.status(500).send('Ошибка при сохранении пользователя');
                }

                // Генерация токена
                const token = jwt.sign({ user_id: results.insertId }, secretKey, { expiresIn: '95y' });

                // Сохранение токена в базе данных
                const updateTokenQuery = 'UPDATE users SET token = ? WHERE user_id = ?';
                db.query(updateTokenQuery, [token, results.insertId], (error) => {
                    if (error) {
                        console.error('Ошибка при сохранении токена:', error);
                        return res.status(500).send('Ошибка при сохранении токена');
                    }
                });

                // Генерация и сохранение кода подтверждения
                const confirmationCode = Math.floor(100000 + Math.random() * 900000); // Простой 6-значный код
                const saveConfirmationCodeQuery = 'UPDATE users SET confirmation_code = ? WHERE user_id = ?';
                db.query(saveConfirmationCodeQuery, [confirmationCode, results.insertId], (error) => {
                    if (error) {
                        console.error('Ошибка при сохранении кода подтверждения:', error);
                        return res.status(500).send('Ошибка при сохранении кода подтверждения');
                    }
                });

                // Email setup
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'vorlodgamess@gmail.com',
                        pass: 'hpmjnrjmaedrylve'
                    },
                });

                // Send confirmation email
                try {
                    await transporter.sendMail({
                        from: 'vorlodgamess@gmail.com',
                        to: email,
                        subject: 'Подтверждение регистрации',
                        text: `Ваш код подтверждения: ${confirmationCode}. Пожалуйста, не передавайте этот код никому.`,
                    });

                    // Отправляем успешный ответ после отправки email
                    res.status(201).json({ message: 'Регистрация успешна! Код подтверждения отправлен на почту.' });

                    // Повторная отправка кода подтверждения через 5 минут
                    setTimeout(async () => {
                        await transporter.sendMail({
                            from: 'vorlodgamess@gmail.com',
                            to: email,
                            subject: 'Повторный код подтверждения',
                            text: `Ваш код подтверждения: ${confirmationCode}. Пожалуйста, не передавайте этот код никому.`,
                        });
                    }, 5 * 60 * 1000);
                } catch (emailError) {
                    console.error('Ошибка при отправке email:', emailError);
                    return res.status(500).send('Ошибка при отправке email');
                }
            });
        } catch (hashError) {
            console.error('Ошибка при хешировании пароля:', hashError);
            return res.status(500).send('Ошибка при регистрации пользователя');
        }
    });
});




// Определение функции findUserByConfirmationCode напрямую в index.js
async function findUserByConfirmationCode(code) {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM users WHERE confirmation_code = ?", [code], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results[0]); // Возвращаем первый пользователь или undefined, если ничего не найдено
            }
        });
    });
}


// Определение функции confirmUser для подтверждения пользователя
async function confirmUser(userId) {
    const query = `UPDATE users SET is_confirmed = 1 WHERE user_id = ?`;
    await db.query(query, [userId]);
}

// Маршрут для подтверждения кода
app.post('/api/confirm-code', async (req, res) => {
    const { code } = req.body;

    try {
        const user = await findUserByConfirmationCode(code);

        if (user) {
            const userId = user.user_id;
            await confirmUser(userId);
            res.status(200).json({ message: 'Подтверждение успешно!' });
        } else {
            res.status(400).json({ message: 'Неверный код' });
        }
    } catch (error) {
        console.error('Ошибка при подтверждении:', error);
        res.status(500).json({ message: 'Ошибка при подтверждении' });
    }
});

app.post('/api/admin/notify-users', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('Token not provided');
        return res.status(400).json({ message: 'Token not provided.' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.id;

        console.log('Decoded user ID:', userId);

        const query = 'SELECT * FROM users WHERE user_id = ? AND role = "admin"';
        db.query(query, [userId], async (error, results) => {
            if (error) {
                console.error('Error verifying admin role:', error);
                return res.status(500).json({ message: 'Server error during role verification' });
            }

            if (results.length === 0) {
                console.log('User is not an admin');
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }

            try {
                const userQuery = 'SELECT user_id, email FROM users';
                db.query(userQuery, async (error, users) => {
                    if (error) {
                        console.error('Error fetching users:', error);
                        return res.status(500).json({ message: 'Server error retrieving users' });
                    }

                    const subject = req.body.subject || 'Admin Notification';
                    const message = req.body.message || 'This is an automated notification.';
                    const timestamp = new Date();

                    // Insert notification into `notifications` table for in-app display
                    const notificationQuery = 'INSERT INTO notifications (user_id, subject, message, timestamp) VALUES ?';
                    const notificationValues = users.map((user) => [user.user_id, subject, message, timestamp]);

                    db.query(notificationQuery, [notificationValues], (err) => {
                        if (err) {
                            console.error('Error saving notifications:', err);
                            return res.status(500).json({ message: 'Error saving notifications' });
                        }
                    });

                    // Configure mail transporter
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'vorlodgamess@gmail.com', // заключите в кавычки
                                pass: 'hpmjnrjmaedrylve',       // заключите в кавычки
                        },
                    });

                    // Send notification to each user's email
                    const emailPromises = users.map((user) => {
                        return transporter.sendMail({
                            from: 'vorlodgamess@gmail.com',
                            to: user.email,
                            subject: subject,
                            text: message,
                        });
                    });

                    await Promise.all(emailPromises);
                    console.log('Notifications sent successfully to all users');
                    res.status(200).json({ message: 'Notifications sent and saved for all users' });
                });
            } catch (err) {
                console.error('Error sending notifications:', err);
                res.status(500).json({ message: 'Error sending notifications' });
            }
        });
    } catch (err) {
        console.error('Invalid token:', err);
        res.status(403).json({ message: 'Invalid token.' });
    }
});
  
  
app.get('/api/user/notifications', async (req, res) => {
    const userId = req.userId; // Assume middleware for setting userId from token

    const query = 'SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY timestamp DESC';
    db.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).json({ message: 'Error retrieving notifications' });
        }
        res.status(200).json(results);
    });
});
// Маршрут для входа
// Маршрут для входа
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Проверка на наличие обязательных полей
    if (!email || !password) {
        return res.status(400).json({ message: 'Пожалуйста, введите email и пароль!' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (error, results) => {
        if (error || results.length === 0) {
            return res.status(400).json({ message: 'Пользователь не найден!' });
        }

        const user = results[0]; // получаем данные пользователя

        // Сравнение пароля
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Неверный пароль!' });
        }

        // Если токен уже существует в базе данных, возвращаем его
        if (user.token) {
            return res.json({ message: 'Вход успешен', token: user.token, userId: user.user_id });
        } else {
            // Если токена нет, создаем новый, сохраняем и возвращаем
            const token = jwt.sign({ user_id: user.user_id }, secretKey, { expiresIn: '1h' });

            // Обновление токена в базе данных
            const updateTokenQuery = 'UPDATE users SET token = ? WHERE user_id = ?';
            db.query(updateTokenQuery, [token, user.user_id], (error) => {
                if (error) {
                    console.error('Ошибка при сохранении токена:', error);
                    return res.status(500).json({ message: 'Ошибка при сохранении токена' });
                }

                // Возвращаем токен пользователю
                res.json({ message: 'Вход успешен', token, userId: user.user_id });
            });
        }
    });
});




app.post('/api/admin-login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (error, results) => {
        if (error || results.length === 0) {
            console.log('Пользователь не найден');
            return res.status(400).json({ message: 'Пользователь не найден!' });
        }

        const user = results[0];
        console.log('Роль пользователя:', user.role);

        // Проверяем роль
        if (user.role.trim() !== 'admin') {  // Используем trim() для исключения пробелов
            console.log('Пользователь не является администратором');
            return res.status(403).json({ message: 'У вас нет прав для входа в админ-панель', isAdmin: false });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.log('Неверный пароль');
            return res.status(400).json({ message: 'Неверный пароль!' });
        }

        const token = jwt.sign({ id: user.user_id, role: user.role }, secretKey, { expiresIn: '95y' });

        // Отправляем успешный ответ, добавляя isAdmin: true
        res.json({
            message: 'Вход успешен',
            token,
            userId: user.user_id,
            username: user.username,
            isAdmin: true  // Поле isAdmin
        });
    });
});


// главный файл
// Define the upload route for games
app.post('/api/games', uploadGame, (req, res) => {
    try {
        const { title, description, price } = req.body;
        const gameFile = req.files.gameFile ? req.files.gameFile[0] : null;
        const imageFile = req.files.image ? req.files.image[0] : null;
        const trailerFile = req.files.trailer ? req.files.trailer[0] : null;
        const screenshotFiles = req.files.screenshots ? req.files.screenshots : [];

        if (!title || !description || !price || !gameFile) {
            return res.status(400).json({ message: 'Please fill all required fields!' });
        }

        // Paths to uploaded files
        const gameFileUrl = `/games/${gameFile.filename}`;
        const imageUrl = imageFile ? `/images/${imageFile.filename}` : '';
        const trailerUrl = trailerFile ? `/video/${trailerFile.filename}` : '';
        const screenshotsUrl = screenshotFiles.map(file => `/images/${file.filename}`);

        const sql = `INSERT INTO games (title, description, price, imageUrl, gameFileUrl, trailerUrl, screenshotsUrl)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.query(sql, [title, description, price, imageUrl, gameFileUrl, trailerUrl, JSON.stringify(screenshotsUrl)], (error, results) => {
            if (error) {
                console.error('Error adding game:', error);
                return res.status(500).json({ message: 'Error adding game' });
            }

            const newGame = {
                id: results.insertId,
                title,
                description,
                price,
                imageUrl,
                gameFileUrl,
                trailerUrl,
                screenshotsUrl,
            };
            res.status(201).json(newGame);
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
});




app.get('/api/games', (req, res) => {
    const sql = 'SELECT * FROM games WHERE isDeleted = FALSE'; // Запрос на получение всех игр, которые не удалены
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Ошибка при получении игр:', error);
            return res.status(500).send('Ошибка при получении игр');
        }

        res.status(200).json(results); // Возвращаем список игр
    });
});

// Получение игры по ID
app.get('/api/games/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM games WHERE id = ? AND isDeleted = FALSE'; // Запрос на получение игры по ID
    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Ошибка при получении игры:', error);
            return res.status(500).send('Ошибка при получении игры');
        }

        if (results.length === 0) {
            return res.status(404).send('Игра не найдена');
        }

        res.status(200).json(results[0]); // Возвращаем данные об игре
    });
});


// Маршрут для удаления игры (помечаем как удаленную)
app.delete('/api/games/:id', (req, res) => {
    const gameId = req.params.id;

    // Сначала удаляем все покупки, связанные с этой игрой
    const deletePurchasesSql = 'DELETE FROM purchased_games WHERE game_id = ?';
    
    db.query(deletePurchasesSql, [gameId], (error) => {
        if (error) {
            console.error('Ошибка при удалении записей из purchased_games:', error);
            return res.status(500).json({ message: 'Ошибка при удалении записей из purchases' });
        }

        // Теперь обновляем статус игры в таблице games
        const sql = 'UPDATE games SET isDeleted = TRUE WHERE id = ?'; // Помечаем игру как удаленную
        db.query(sql, [gameId], (error, results) => {
            if (error) {
                console.error('Ошибка при удалении игры:', error);
                return res.status(500).json({ message: 'Ошибка при удалении игры' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Игра не найдена' });
            }

            res.json({ message: 'Игра успешно удалена' });
        });
    });
});


app.use('/games', express.static(path.join(__dirname, 'games')));
// Маршрут для удаления пользователя
// Маршрут для получения информации о пользователе
app.get('/api/user', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Извлекаем токен из заголовка

    if (!token) {
        return res.status(401).json({ message: 'Необходим токен для доступа к этому ресурсу' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Неверный токен' });

        const sql = 'SELECT user_id, username, email, phone, country, gender FROM users WHERE user_id = ?';
        db.query(sql, [decoded.user_id], (error, results) => { // Используем decoded.user_id
            if (error || results.length === 0) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            res.json(results[0]);
        });
    });
});


// Маршрут для получения списка пользователей
app.get('/api/users', (req, res) => {
    const sql = 'SELECT user_id, username, email, phone, country, gender FROM users'; // Измените на необходимые поля
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Ошибка при получении пользователей:', error);
            return res.status(500).json({ message: 'Ошибка при получении пользователей' });
        }
        res.json(results); // Возвращаем список пользователей
    });
});

// Маршрут для покупки игры
// Маршрут для покупки игры
app.post('/api/buy-game', (req, res) => {
    // Извлекаем заголовок авторизации
    const authHeader = req.headers['authorization']; 
    const token = authHeader && authHeader.split(' ')[1]; // Извлекаем токен

    // Проверяем наличие токена
    if (!token) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    // Проверка токена
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('Ошибка проверки токена:', err);
            return res.status(401).json({ message: 'Недействительный токен' });
        }

        // Извлекаем user_id из токена
        const userId = decoded.user_id; 
        const gameId = req.body.gameId;

        // Проверка наличия gameId
        if (!gameId) {
            return res.status(400).json({ message: 'ID игры не предоставлен' });
        }

        // Получаем название игры по game_id
        const getGameNameQuery = 'SELECT title FROM games WHERE id = ?';
        db.query(getGameNameQuery, [gameId], (error, gameResults) => {
            if (error) {
                console.error('Ошибка при получении названия игры:', error);
                return res.status(500).send('Ошибка при получении названия игры');
            }

            // Если игра не найдена
            if (gameResults.length === 0) {
                return res.status(404).json({ message: 'Игра не найдена' });
            }

            // Используем правильный столбец title для названия игры
            const gameName = gameResults[0].title;

            // Проверка на существующую покупку
            const checkDuplicateQuery = 'SELECT * FROM purchased_games WHERE user_id = ? AND game_id = ?';
            db.query(checkDuplicateQuery, [userId, gameId], (error, results) => {
                if (error) {
                    console.error('Ошибка при проверке существующей покупки:', error);
                    return res.status(500).send('Ошибка при проверке существующей покупки');
                }

                // Если игра уже куплена, возвращаем ошибку
                if (results.length > 0) {
                    return res.status(400).json({ message: 'Игра уже куплена' });
                }

                // Если покупка не найдена, добавляем запись о покупке
                const sql = 'INSERT INTO purchased_games (user_id, game_id, game_name, purchase_date) VALUES (?, ?, ?, NOW())';
                db.query(sql, [userId, gameId, gameName], (error, results) => {
                    if (error) {
                        console.error('Ошибка при выполнении запроса:', error);
                        return res.status(500).send('Ошибка при покупке игры');
                    }

                    // Успешная покупка
                    res.status(200).json({ message: 'Игра успешно куплена' });
                });
            });
        });
    });
});

app.delete('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;  // Должен быть 26 в этом случае
    try {
        // Удаляем все уведомления, связанные с userId
        await db.query('DELETE FROM notifications WHERE user_id = ?', [userId]);

        // Теперь можно удалить пользователя
        const result = await db.query('DELETE FROM users WHERE user_id = ?', [userId]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Пользователь успешно удален.' });
        } else {
            res.status(404).json({ message: 'Пользователь не найден.' });
        }
    } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении пользователя.' });
    }
});

  
  
  
const foldersToEnsure = ['images', 'games', 'video'];

foldersToEnsure.forEach((folder) => {
    createFolderIfNotExists(path.join(__dirname, folder));
});

app.get('/api/status', (req, res) => {
    res.status(200).send('Сервер работает'); // Возвращает 200 OK
  });


  app.get('/api/my-games', (req, res) => {
    const userId = parseInt(req.headers['user_id'], 10);
    const gameId = req.headers['game_id'] ? parseInt(req.headers['game_id'], 10) : null;

    if (!userId || isNaN(userId)) {
        console.error("Ошибка: некорректный User ID. Получено значение:", req.headers['user_id']);
        return res.status(400).json({ message: 'Некорректный User ID' });
    }

    let gamesQuery = `
        SELECT p.game_id, g.title, COALESCE(g.imageUrl, '/images/unavailable_image.png') AS imageUrl, p.purchase_date 
        FROM purchased_games p 
        JOIN games g ON p.game_id = g.id  
        WHERE p.user_id = ? AND g.isDeleted = FALSE
    `;
    const queryParams = [userId];

    if (gameId) {
        gamesQuery += ` AND p.game_id = ?`;
        queryParams.push(gameId);
    }

    db.query(gamesQuery, queryParams, (error, gamesResults) => {
        if (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            return res.status(500).json({ message: 'Ошибка при получении данных об играх', error: error.message });
        }

        const formattedResults = gamesResults.map(game => ({
            game_id: game.game_id,
            title: game.title,
            imageUrl: game.imageUrl,
            purchase_date: game.purchase_date,
        }));

        // Определяем, была ли игра куплена (если список не пустой)
        const isPurchased = formattedResults.length > 0;

        res.status(200).json({ games: formattedResults, isPurchased });
    });
});


// Обработчик GET-запроса для администратора на '/api/admin/games'
app.get('/api/admin/games', (req, res) => {
    const userId = req.headers['user_id'];
    const isAdmin = req.headers['is_admin'] === 'true';

    // Проверка прав администратора
    if (!userId || !isAdmin) {
        console.error("Ошибка: попытка неавторизованного доступа к данным администратора.");
        return res.status(403).json({ message: 'Только администраторы могут получить доступ.' });
    }

    const targetUserId = req.headers['target_user_id'];
    const gamesQuery = `
        SELECT p.game_id, g.title AS game_name, p.purchase_date, p.user_id
        FROM purchased_games p
        JOIN games g ON p.game_id = g.id
        WHERE g.isDeleted = FALSE
        ${targetUserId ? 'AND p.user_id = ?' : ''}
    `;
    const queryParams = targetUserId ? [targetUserId] : [];

    db.query(gamesQuery, queryParams, (error, gamesResults) => {
        if (error) {
            console.error('Ошибка при выполнении SQL-запроса:', error);
            return res.status(500).json({ message: 'Ошибка при получении данных об играх', error: error.message });
        }

        res.status(200).json({ games: gamesResults });
    });
});

// Обработчик GET-запроса для администратора на '/api/admin/purchased-games'
app.get('/api/admin/purchased-games', (req, res) => {
    const isAdmin = req.headers['is_admin'] === 'true';
    console.log('Получен запрос на /api/admin/purchased-games с is_admin:', isAdmin);

    // Проверка прав администратора
    if (!isAdmin) {
        console.error("Ошибка: попытка неавторизованного доступа к данным администратора.");
        return res.status(403).json({ message: 'Только администраторы могут получить доступ.' });
    }

    const selectSql = `
    SELECT g.id AS game_id, g.title AS name, g.price, u.username, pg.purchase_date
    FROM purchased_games pg
    JOIN games g ON pg.game_id = g.id
    JOIN users u ON pg.user_id = u.user_id  -- Используем u.user_id вместо u.id
    WHERE g.isDeleted = FALSE
`;
    
    db.query(selectSql, (error, results) => {
        if (error) {
            console.error('Ошибка при получении купленных игр:', error);
            return res.status(500).json({ message: 'Ошибка при получении купленных игр', error: error.message });
        }

        console.log('Данные о купленных играх успешно получены:', results);
        res.status(200).json({ games: results });
    });
});


// Обработчик GET-запросов на '/api/user'
app.get('/api/user', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.user_id;

        if (!userId || isNaN(userId)) {
            console.error("Ошибка: некорректный ID пользователя в токене");
            return res.status(400).json({ message: 'Некорректный ID пользователя' });
        }

        const sql = `
            SELECT u.username, g.id AS game_id, g.title, pg.purchase_date
            FROM users u
            LEFT JOIN purchased_games pg ON u.id = pg.user_id
            LEFT JOIN games g ON pg.game_id = g.id
            WHERE u.id = ?
        `;

        db.query(sql, [userId], (error, results) => {
            if (error) {
                console.error('Ошибка при получении данных пользователя:', error);
                return res.status(500).send('Ошибка при получении данных пользователя.');
            }

            const purchasedGames = results
                .filter(row => row.game_id)
                .map(row => ({
                    game_id: row.game_id,
                    title: row.title,
                    purchase_date: row.purchase_date,
                }));

            res.json({
                username: results[0]?.username,
                PurchasedGames: purchasedGames,
            });
        });
    } catch (error) {
        console.error('Ошибка проверки токена:', error);
        return res.status(401).json({ message: 'Недействительный токен' });
    }
});

app.post('/api/support', async (req, res) => {
    const { name, email, message } = req.body;
  
    // Настройка отправки почты
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vorlodgamess@gmail.com',
        pass: 'hpmjnrjmaedrylve',
      },
    });
  
    const mailOptions = {
      from: email,
      to: 'support@yourdomain.com',
      subject: `Support request from ${name}`,
      text: message,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send('Message sent');
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Error sending message');
    }
  });
  


app.listen(5000, '0.0.0.0',() => {
    console.log('Сервер запущен на порту 5000');
});
