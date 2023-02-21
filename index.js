const botApi = require('node-telegram-bot-api');
const {commands, getCatUrl, currencyOptions, getCurrency, createTicTacOptions} =  require('./helpers');

const token = "5917423880:AAFsxbj1eyss2bkMpmvl_0DR23bOirR6J14";
const bot = new botApi(token, {polling: true});

bot.setMyCommands([
    {command: commands.hello, description: "Команда приветствия"},
    {command: commands.info, description: "Получить информацию"},
    {command: commands.cat, description: "Скинь котика"},
    {command: commands.currency, description: "Получить курс доллара к валюте"},
    {command: commands.game, description: "Сыграть в крестики-нолики"}
]);

function start() {
    bot.on("message", async data => {
        let message = data.text;
        const chatId = data.chat.id;
        switch (message) {
            case "/start":
            case commands.hello: {
                await bot.sendMessage(chatId,"Приветствую тебя, мой друг!");
                await bot.sendSticker(chatId,"https://cdn.tlgrm.app/stickers/987/a9a/987a9af2-cc48-41b1-aa72-011cc4acad4e/192/5.webp");
                break;
            }
            case commands.info: {
                await bot.sendMessage(chatId,`Тебя все еще зовут ${data.from.first_name} ${data.from.last_name}`);
                break;
            }
            case commands.cat: {
                const url = await getCatUrl();
                await bot.sendPhoto(chatId,url);
                break;
            }
            case commands.currency: {
                await bot.sendMessage(chatId, "Выбирай валюту:", currencyOptions);
                break;
            }
            case commands.game: {
                await bot.sendMessage(chatId, "Играем!", createTicTacOptions().options);
                break;
            }
            default: {
                if (message.search(/кот/i) !== -1) {
                    const url = await getCatUrl();
                    await bot.sendPhoto(chatId,url);
                    break;
                }
                await bot.sendMessage(chatId,"Я тебя не понял(");
                await bot.sendSticker(chatId, "https://cdn.tlgrm.app/stickers/987/a9a/987a9af2-cc48-41b1-aa72-011cc4acad4e/192/9.webp");
                break;
            }
        }
    });

    bot.on("callback_query",  async msg => {
        const data = msg.data;
        const {chat, message_id, text} = msg.message;
        const chatId = chat.id;

        if (text === 'Выбирай валюту:') {
            const course = await getCurrency(data);
            await bot.sendMessage(chatId, `1 Доллар США = ${course} ${data}`);
            return;
        }
        const currentResult = createTicTacOptions(data);
        if (currentResult.winner) {
            await bot.sendMessage(chatId, `Игра закончена. Победил: ${currentResult.winner}`);
        }
        try {
            await bot.editMessageReplyMarkup(currentResult.options.reply_markup, {
                chat_id: chatId,
                message_id: message_id,
            });
        } catch (e) {
            console.log(e.message);
        }

    });
}

start();