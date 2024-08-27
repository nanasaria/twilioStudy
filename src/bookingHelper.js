require('dotenv').config();
const weekdays = process.env.WEEKDAYS.split(',')
const hourRegex = /\b(\d?\d)\s?([aApP][mM])/g

function matchType(req, messageContent){
    if(messageContent.includes('gym')){
        req.session.type = 'gym'
       }else if (messageContent.includes('personal')){
        req.session.type = 'personal trainer'
       }else if (messageContent.includes('massage')){
        req.session.type = 'massage'
       }

       if(req.session.type) {
        return `Sorry I didn't understand your request`
       }
        req.session.step = 2
        return `What date do you want to see the ${req.session.type}`
}

function matchDay(req, messageContent){
    const day = weekdays.filter((w) => messageContent.toLowerCase().includes(w))
                if(day.length === 0){
                    return `I couldn't understand the day of the week`
                }else if(day.length > 1){
                    return `Please select just one day for the booking do you prefer ${weekday.join(', ')}`
                }
                    req.session.step = 3
                    req.session.weekday = day[0];
                    return `Do you want to book it on ${day[0]}:\n
                    10am, 11am, 1pm, 4pm`
}

function matchTime(req, messageContent){
    const match = hourRegex.exec(messageContent);
                if(!match && match.length !== 3){
                    return `Sorry, I couldn't understand what time do you want to come to see the ${type} on ${weekday}`
                }

                const {type, weekday} = req.session;
                req.session.step  = 4
                req.session.time = match[0]
                return `Your appointment to see the ${type} on ${weekday} at ${match[0]} was made, please let us know if you need to change the time, otherwise see you than.`
}

function confirmBooking(req){
    const {type, weekday, time} = req.session
    return `${type} on ${weekday} at ${time}. If you want to change it, please contact us.`
}

module.exports = {
    matchType,
    matchDay,
    matchTime,
    confirmBooking
}