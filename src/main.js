const bookingHelper = require('./bookingHelper')

require('dotenv').config();
const Twilio = require("twilio")
const bodyParser = require('body-parser')
const smsResponse = require('twilio').twiml.MessagingResponse
const express = require('express')
const session = require('express-session');
const MessagingResponse = require('twilio/lib/twiml/MessagingResponse');

const app = express()

app.use(bodyParser.urlencoded({extended: true }))
app.use(session({secret: process.env.SESSION_SECRET}))

const port = process.env.EXPRESS_PORT || 3001
const from = process.env.TWILIO_PHONE_NUMBER
const to = process.env.MY_NUMBER

app.get('/send', (req, res) => {
    res.send('Hello world')
})

app.post('/receive', (req, res) => {
    // Requisita o corpo do conteúdo e o Body do Twilio
    const messageContent = req.body.Body.toLowerCase()
    const step = req.session.step
    let message;

    console.log('step ', step)

    if(!step) {
        req.session.step = 1
        message = `Hi, do you want to book an appointment to: \n
        see the gym \n
        book a personal trainer \n
        book a massage`
    }else{
        switch(step) {
            case 1:
               message = bookingHelper.matchType(req, messageContent)
            break;
            case 2: 
                message = bookingHelper.matchDay(req, messageContent)
            break;
            case 3:
                message = bookingHelper.matchTime(req)
            break;
            case 4:
                message = bookingHelper.confirmBooking(req, messageContent)
            break;
            default:
                console.log(`Could not find the step for value: ${step}`)
        }
    }

    const twiml = new MessagingResponse();
    twiml.message(message)

    res.set('Content-Type',  'text/xml')
    res.send(twiml.toString())
})

const twilio = Twilio(
    process.env.TWILIO_TOKEN_SID,
    process.env.TWILIO_TOKEN_SECRET,
    {
        accountSid: process.env.TWILIO_ACCOUNT_SID
    }
)

function sendSms() {
    twilio.messages.create({
        from,
        to,
        body: "HELLO EVERYBODY"
    }).then((message) => console.log(`Message sent with sid ${message.sid}`))
    .catch((error) => console.log(error));
}

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})