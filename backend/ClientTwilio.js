require('dotenv').config()
const twilio = require('twilio')
const VoiceResponse = require('twilio/lib/twiml/VoiceResponse')

class Twilio{
    tokenSid = process.env.TWILIO_TOKEN_SID
    tokenSecret = process.env.TWILIO_TOKEN_SECRET
    accountSid = process.env.TWILIO_ACCOUNT_SID
    verify = process.env.TWILIO_SERVICE_SID_VERIFY
    outgoingApplicationSid = process.env.TWILIO_OUTGOING_APP_SID

    constructor(){
        this.client = twilio(this.tokenSid, this.tokenSecret, {
            accountSid: this.accountSid,
        })
    }
    getTwilio(){
        this.client
    }

    async sendVerify(to, channel){
       const data = await this.client.verify.v2.services(this.verify).verifications.create({
            to,
            channel
        })

        console.log('sendVerify: ', data)
        return data
    }

    async verifyCode(to, code){
        const data = await this.client.verify.v2
        .services(this.verify).
        verificationChecks.create({
            to, 
            code
        })
        console.log('verify Code ', data)
        return data
    }

    voiceResponse(message){
        const twiml = new VoiceResponse()
        twiml.say({
            voice: 'female',
        },
        message
        )
        twiml.redirect('http://localhost:3000/enqueue')
        return twiml;
    }

    enqueueCall(queueName){
        const twim = new VoiceResponse()
        twim.enqueue(queueName)
        return twim
    }

    answerCall(sid){
        this.client.calls(sid).update({
            url: 'http://localhost:3000/connect-call',
            method: 'POST',

            function (err, call) {
                console.log('answerCall ', call)
                if(err){
                    console.error('answerCall ', err)
                }
            }
        })
    }

    getAccessTokenForVoice = (identity) => {
        console.log(`Access token for ${identity}`)
        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;
        const outgoingAppSid = this.outgoingApplicationSid
        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: outgoingAppSid,
            incomingAllow: true
        })
        const token = new AccessToken(
            this.accountSid,
            this.tokenSid,
            this.tokenSecret,
            {identity}
        )
        token.addGrant(voiceGrant)
        console.log('Access granted with JWT', token.toJwt())
        return (token.toJwt())
    }
}

const instance = new Twilio()
Object.freeze(instance)

module.exports = instance