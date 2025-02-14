const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // نیاز به نصب دارد

const app = express();
const PORT = 3001;

// حذف بخشهای تکراری
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Accept'],
    })
);

app.use(express.json());

app.get('/proxy', async (req, res) => {
    try {
        const { text } = req.query;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'پارامتر text الزامی است' });
        }

        const apiUrl = `https://haji-api.ir/chatgpt-3.5/?license=C1b4K8ZUEBAV19f608766091391144ajya&chatId=nt1x4fgqjhl8fob2yqqyx9svrxl141iq&text=${encodeURIComponent(text)}`;

        const apiResponse = await fetch(apiUrl).catch(() => null);

        if (!apiResponse) {
            return res.status(500).json({ error: 'خطا در ارتباط با سرور خارجی' });
        }

        if (!apiResponse.ok) {
            return res.status(apiResponse.status).json({
                error: `خطای API: ${apiResponse.statusText}`
            });
        }

        const responseData = await apiResponse.json().catch(() => null);

        if (!responseData || typeof responseData !== 'object') {
            return res.status(500).json({ error: 'پاسخ نامعتبر از سرور API' });
        }

        if (responseData.ok && responseData.answer) {
            try {
                responseData.answer = decodeURIComponent(responseData.answer);
            } catch (e) {
                console.error('خطا در رمزگشایی:', e);
                responseData.answer = 'خطا در پردازش پاسخ';
            }
        }

        res.json(responseData);

    } catch (error) {
        console.error('خطای سرور:', error);
        res.status(500).json({ error: 'خطای داخلی سرور' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});