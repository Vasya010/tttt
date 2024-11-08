app.post('/api/register', async (req, res) => {
    const { username, email, phone, country, gender, password } = req.body;

    // Check if all fields are filled
    if (!username || !email || !phone || !country || !gender || !password) {
        return res.status(400).send('Пожалуйста, заполните все поля!');
    }

    // Check if the email already exists
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
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            // Generate a random token
            const token = crypto.randomBytes(16).toString('hex');

            // Insert the new user into the database
            const sql = 'INSERT INTO users (username, email, phone, token, country, gender, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.query(sql, [username, email, phone, token, country, gender, hashedPassword], async (error, results) => {
                if (error) {
                    console.error('Ошибка при сохранении пользователя:', error);
                    return res.status(500).send('Ошибка при сохранении пользователя');
                }

                const userId = results.insertId;
                const confirmationCode = crypto.randomBytes(32).toString('hex'); // Генерация кода подтверждения

                // Save the confirmation code
                const saveConfirmationCodeQuery = 'UPDATE users SET confirmation_code = ? WHERE user_id = ?';
                db.query(saveConfirmationCodeQuery, [confirmationCode, userId], (error) => {
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

                    res.status(201).json({ message: 'Регистрация успешна! Код подтверждения отправлен на почту.' });

                    // Resend the confirmation code after 5 minutes
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