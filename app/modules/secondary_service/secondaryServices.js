'use strict';

const moment = require('moment');
const constants = require(__base +'/app/constants');

module.exports.convertDaysToNumber = (days) => {
  const converted_days = [];
  days.forEach(day => {
    day = day.toLowerCase();
    console.log(day);
    switch (day) {
      case 'sunday':
        converted_days.push(0);
        break;
      case 'monday':
        converted_days.push(1);
        break;
      case 'tuesday':
        converted_days.push(2);
        break;
      case 'wednesday':
        converted_days.push(3);
        break;
      case 'thursday':
        converted_days.push(4);
        break;
      case 'friday':
        converted_days.push(5);
        break;
      case 'saturday':
        converted_days.push(6);
        break;
      default:
        break;
    }
  });
  return converted_days;
}

module.exports.getTimeBasedOnType = (time_of_day) => {
  return new Promise((resolve, reject) => {
    try {
      if(time_of_day.toLowerCase() === 'mornings') {
        resolve(constants.generic_morning_time)
      } else if(time_of_day.toLowerCase() === 'afternoons') {
        resolve(constants.generic_afternoon_time)
      } else if(time_of_day.toLowerCase() === 'evenings') {
        resolve(constants.generic_evening_time)
      } else if(time_of_day.toLowerCase() === 'nights') {
        resolve(constants.generic_night_time)
      }
      else {
        reject({code: 103.3, custom_message: 'Invalid time type provided.'});
      }
    } catch(e) {
      reject({ code: 103, message: { message: e.message, stack: e.stack } });
    }
  })

}

module.exports.addDaysAndTime = (currentDate, reminderDay, currentDay, type) => {
  let res = {};
  let desiredDate = currentDate;
  type = type.toLowerCase();
  switch (type) {
    case 'daily':
      desiredDate = moment(currentDate, 'YYYY-MM-DD').add(1, 'day')
      break;

    case 'monthly':
      desiredDate = moment(currentDate, 'YYYY-MM-DD')
        .add(1, 'months')
        .startOf('month');
      while (desiredDate.day() !== reminderDay) {
        desiredDate = moment(desiredDate, 'YYYY-MM-DD').add(1, 'days');
      }
      break;

    case 'specific':
      while (currentDay != reminderDay) {
        if (currentDay == 7) {
          currentDay = 0;
        } else {
          desiredDate = moment(desiredDate, 'YYYY-MM-DD').add(1, 'days');
          currentDay++;
        }
      }
      break;

    case 'weekly':
      while (currentDay != reminderDay) {
        if (currentDay == 7) {
          currentDay = 0;
        } else {
          desiredDate = moment(desiredDate, 'YYYY-MM-DD').add(1, 'days');
          currentDay++;
        }
      }
      break;

    default:
      res.err = 'Invalid type';
      break;
  }

  //add time
  // desiredDate= moment(desiredDate).add(hours, 'hours');
  res.date = desiredDate;
  return res;
}

