const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const init = async () => {     
await axios.get(`https://api.telegram.org/bot${telegramApiToken}/setWebhook?url=${webhookBaseUrl}/receive-message&allowed_updates=["message"]`)
}

router.post('/receive', async function name(req, res) {
    const chatId = req.body.message.chat.id;
    const body = req.body.message.text;

    await sendMessageToFlex(chatId, body)

    res.sendStatus(200);
})

router.post('/new-message', async function(req, res){
    if(req.body.Source === 'SDK'){
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`, {
            chat_id: request.query.chat_id,
            text: request.body.Body
        })
    }
    res.sendStatus(200);
})

async function sendMessageToFlex(chatId, body) {
    let identity = `telegram_user_${chatId}`
    let existingConversationSid = await findExistingConversation(identity);
    if(existingConversationSid === undefined){
        const {sid: existingConversationSid} = await createConversation(chatId)
        await createParticipant(conversationSid, identity)
        await createScopedWebhook(conversationSid)
        existingConversationSid = conversationSid;
    }

    await createMessage(existingConversationSid, identity, body)
    deleteConversations(conversationSid)
}

async function findExistingConversation(identity){
    const conversations = await fetchParticipantConversations(identity);
    console.log(conversations)
    let existing = conversations.find(conversation => conversation.conversationState !== 'closed');
    return existing !== undefined ? existing.conversationSid : undefined;
}

async function createConversation(chatId) {
    return client.conversations.v1.conversations.create({
        friendltName: `Telegram_conversation_${chatId}`
    })
}

async function createParticipant(conversationSid, identity) {
    return client.conversations.v1.conversations(conversationSid).participants.create({identity: identity})
}

async function createScopedWebhook(conversationSid) {
    await client.conversations.v1.conversations(conversationSid).webhooks.create({'configuration.filters': 'onMessageAdded',
        target: 'studio',
        'configuration.flowSid': studioFlowSid
    })
}

async function createMessage(conversationSid, author, body){
    return client.conversations.v1.conversations(conversationSid).messages.create({
        author: author,
        body: body,
        xTwilioWebhookEnabled: true
    })
}

async function deleteConversations(conversationSid) {
    await client.conversations.v1.conversations(conversationSid).remove();
    console.log(`Deleted conversation with SID: ${conversationSid}`);
}