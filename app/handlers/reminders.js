'use strict';

const moment = require('moment');
const moment_timezone = require('moment-timezone');
const uuid = require('uuid/v4');
const logger = require(__base + '/app/modules/common/logger');

const response = require(__base + '/app/modules/common/response');
const addModule = require(__base + '/app/modules/reminder/add');
const infoModule = require(__base + '/app/modules/reminder/info');
const deleteModule = require(__base + '/app/modules/reminder/delete');
const editModule = require(__base + '/app/modules/reminder/edit');
const bot = require(__base + '/app/modules/common/telegramBot');

const constants = require(__base + '/app/constants');

const postEngine = require(__base +
  '/app/modules/secondary_service/postEngine');
const secondaryServices = require(__base +
  '/app/modules/secondary_service/secondaryServices');
const postGeneration = require(__base +
  '/app/modules/secondary_service/postGeneration');

module.exports.getAllReminders = async (req, res) => {
  try {
    const user_id = req.authInfo.user_id;
    let response_body = {
      user_id
    };

    const reminders = await infoModule.getAllRemindersForUser(
      req.request_id,
      response_body
    );

    const filteredDataStructure = await infoModule.filterDataStructure(
      req.request_id,
      reminders
    );

    response_body.groupReminders = filteredDataStructure;
    response.success(req.request_id, response_body, res);
  } catch (e) {
    response.failure(req.request_id, e, res);
  }
};

module.exports.addSpecificReminder = async (req, res) => {
  try {
    logger.info('adding specific reminder');
    let user_id = req.authInfo.user_id;
    let body = req.body;
    let reminder_body = {};

    const {
      timezone,
      number_of_posts,
      bucket_id,
      type,
      days,
      bucket_name,
      time_of_day
    } = body;
    const group_id = uuid();

    let new_body = {
      timezone,
      number_of_posts,
      user_id,
      days,
      bucket_id,
      type,
      bucket_name,
      group_id,
      time_of_day
    };

    const dateForTZ = moment.tz(timezone);
    const currentDate = moment.tz(timezone).format(constants.date_fomat);

    await addModule.checkIfReminderAlreadyExists(req.request_id, new_body);
    //check for any missing values
    await addModule.init(req.request_id, new_body);
    await addModule.checkIfDaysAreaValid(req.request_id, days);

    //convert days(string) into number.
    const days_to_integer = secondaryServices.convertDaysToNumber(days);

    for (let i = 0; i < days_to_integer.length; i++) {
      const config_id = uuid();
      new_body.config_id = config_id;

      let selected_day_as_num = days_to_integer[i];
      // new_body.day = day;
      new_body.day = days[i];
      let result = secondaryServices.addDaysAndTime(
        currentDate,
        selected_day_as_num,
        moment.tz(timezone).day(),
        new_body.type
      );
      let date = moment(result.date).format(constants.date_format);

      const timeDependingOnType = await secondaryServices.getTimeBasedOnType(
        time_of_day
      );
      // const utc_time = moment.utc(`${date} ${timeDependingOnType}`).valueOf();

      // logger.info('utc_time', utc_time);
      new_body.reminder_date = date;
      new_body.reminder_time = timeDependingOnType;

      // await addModule.specificReminderInit(req.request_id, new_body);

      const post = await postEngine.generatePosts(req.request_id, new_body);
      reminder_body = {
        config_id: new_body.config_id,
        email: post.email,
        post_id: post.post_id,
        bucket_id: post.random_bucket_id_selected,
        reminder_date: new_body.reminder_date,
        reminder_time: new_body.reminder_time,
        user_id: new_body.user_id,
        // reminder_timestamp_utc: utc_time,
        time_of_day: time_of_day,
        timezone: timezone,
        group_id: group_id
      };

      //insert into config if success
      await addModule.insertIntoConfigTable(req.request_id, new_body);

      // insert first reminder into reminder table
      const reminder_id = await addModule.insertIntoRemindersTable(
        req.request_id,
        reminder_body
      );
    }
    bot.send(req.request_id, `Someone set a specific reminder- ${req.request_id}`);

    response.success(req.request_id, { bucket_id }, res);
  } catch (e) {
    response.failure(req.request_id, e, res);
  }
};

module.exports.addGeneralReminder = async (req, res) => {
  try {
    const user_id = req.authInfo.user_id;
    const {
      number_of_posts,
      bucket_id,
      bucket_name,
      timezone,
      days,
      time_of_day,
      type
    } = req.body;
    let new_body = {
      number_of_posts,
      bucket_id,
      bucket_name,
      timezone,
      days,
      time_of_day,
      type,
      user_id
    };

    new_body.group_id = uuid(); //all reminders for 1 req goes into a single group
    await addModule.checkIfReminderAlreadyExists(req.request_id, new_body);

    const dateForTZ = moment.tz(timezone);
    const currentDate = moment.tz(timezone).format(constants.date_fomat);

    const days_to_integer = secondaryServices.convertDaysToNumber(days);

    //check for any missing values
    await addModule.init(req.request_id, new_body);
    await addModule.checkIfDaysAreaValid(req.request_id, days);

    for (let i = 0; i < days_to_integer.length; i++) {
      const config_id = uuid();
      new_body.config_id = config_id;

      let selected_day_as_num = days_to_integer[i];
      new_body.day = days[i];
      let result = secondaryServices.addDaysAndTime(
        currentDate,
        selected_day_as_num,
        moment(currentDate).day(),
        new_body.type
      );
      let date = moment(result.date).format(constants.date_format);

      const timeDependingOnType = await secondaryServices.getTimeBasedOnType(
        time_of_day
      );
      // const utc_time = moment.utc(`${date} ${timeDependingOnType}`, constants.date_format).valueOf();
      new_body.reminder_date = date;
      new_body.reminder_time = timeDependingOnType;

      const post = await postEngine.generatePosts(req.request_id, new_body);

      const reminder_body = {
        config_id: new_body.config_id,
        email: post.email,
        post_id: post.post_id,
        bucket_id: post.random_bucket_id_selected,
        reminder_date: new_body.reminder_date,
        reminder_time: new_body.reminder_time,
        user_id: new_body.user_id,
        // reminder_timestamp_utc: utc_time,
        time_of_day: time_of_day,
        timezone: timezone,
        group_id: new_body.group_id
      };

      await addModule.genericReminderValidation(req.request_id, reminder_body);
      await addModule.insertIntoConfigTable(req.request_id, new_body);
      await addModule.insertIntoRemindersTable(req.request_id, reminder_body);
    }
    response.success(req.request_id, { bucket_id }, res);
  } catch (e) {
    response.failure(req.request_id, e, res);
  }
};

module.exports.addDailyReminder = async (req, res) => {
  try {
    const user_id = req.authInfo.user_id;
    const {
      number_of_posts,
      bucket_id,
      bucket_name,
      timezone,
      time_of_day,
      type
    } = req.body;
    let new_body = {
      number_of_posts,
      bucket_id,
      bucket_name,
      timezone,
      time_of_day,
      type,
      user_id
    };

    new_body.group_id = uuid(); //all reminders for 1 req goes into a single group

    await addModule.checkIfReminderAlreadyExists(req.request_id, new_body);

    const dateForTZ = moment.tz(timezone);
    const currentDate = moment.tz(timezone).format(constants.date_fomat);

    const day = moment(currentDate).day();
    // const days_to_integer =  secondaryServices.convertDaysToNumber(days);

    //check for any missing values
    await addModule.initDaily(req.request_id, new_body);

    const config_id = uuid();
    new_body.config_id = config_id;

    let selected_day_as_num = day;

    //add one day - as reminder starts from next day
    let result = secondaryServices.addDaysAndTime(
      currentDate,
      selected_day_as_num,
      moment(currentDate).day(),
      new_body.type
    );
    let date = moment(result.date).format(constants.date_format);

    const timeDependingOnType = await secondaryServices.getTimeBasedOnType(
      time_of_day
    );
    // const utc_time = moment.utc(`${date} ${timeDependingOnType}`, constants.date_format).valueOf();
    new_body.reminder_date = date;
    new_body.reminder_time = timeDependingOnType;

    const post = await postEngine.generatePosts(req.request_id, new_body);

    const reminder_body = {
      config_id: new_body.config_id,
      email: post.email,
      post_id: post.post_id,
      bucket_id: post.random_bucket_id_selected,
      reminder_date: new_body.reminder_date,
      reminder_time: new_body.reminder_time,
      user_id: new_body.user_id,
      // reminder_timestamp_utc: utc_time,
      time_of_day: time_of_day,
      timezone: timezone,
      group_id: new_body.group_id
    };

    await addModule.dailyReminderValidation(req.request_id, reminder_body);
    await addModule.insertIntoConfigTable(req.request_id, new_body);
    await addModule.insertIntoRemindersTable(req.request_id, reminder_body);
    bot.send(req.request_id, `Someone set a daily reminder- ${req.request_id}`);
    response.success(req.request_id, { bucket_id }, res);
  } catch (e) {
    response.failure(req.request_id, e, res);
  }
};

module.exports.editReminders = async (req, res) => {
  try{
    const user_id = req.authInfo.user_id;
    let body = req.body;
    let reminder_body = {};
    const {
      number_of_posts,
      bucket_id,
      group_id,
      days,
      type,
      timezone,
      bucket_name,
      time_of_day
    } = body;
    let new_body = {
      number_of_posts,
      user_id,
      days,
      type,
      timezone,
      bucket_id,
      bucket_name,
      group_id,
      time_of_day
    };
    const UpdatedGroup_id = uuid();
    new_body.UpdatedGroup_id = UpdatedGroup_id;
    const dateForTZ = moment.tz(timezone);
    const currentDate = moment.tz(timezone).format(constants.date_fomat);

    const payload = {bucket_id, user_id, group_id};
    const result = await editModule.checkIfReminderExists(req.request_id, payload);
    //edit in config_reminder table and reminders table
    for(let i=0; i<result.length;i++){
      new_body.config_id = result[i].config_id;
      await editModule.editInConfigTable(req.request_id, new_body);
      await editModule.editInRemindersTable(req.request_id, new_body);
    }

    //adding a new reminder if type chosen is specific
    if(type === 'specific'){

      await editModule.init(req.request_id, new_body);
      await editModule.checkIfDaysAreaValid(req.request_id, days);
      //convert days(string) into number.
      const days_to_integer = secondaryServices.convertDaysToNumber(days);
      for (let i = 0; i < days_to_integer.length; i++) {
        const UpdatedConfig_id = uuid();
        new_body.UpdatedConfig_id = UpdatedConfig_id;
        let selected_day_as_num = days_to_integer[i];
        new_body.day = days[i];
        let result = secondaryServices.addDaysAndTime(
          currentDate,
          selected_day_as_num,
          moment.tz(timezone).day(),
          new_body.type
        );
        let date = moment(result.date).format(constants.date_format);

        const timeDependingOnType = await secondaryServices.getTimeBasedOnType(
          time_of_day
        );
      
        new_body.reminder_date = date;
        new_body.reminder_time = timeDependingOnType;
        
        const post = await postEngine.generatePosts(req.request_id, new_body);
        await editModule.addInConfigTable(req.request_id, new_body);
        await editModule.addInRemindersTable(req.request_id, new_body);
      }
      bot.send(req.request_id, `Someone edited a reminder to specific- ${req.request_id}`);
      response.success(req.request_id, payload, res); 
    }

    else if(type === 'daily'){
      await editModule.initDaily(req.request_id, new_body);
      const day = moment(currentDate).day();

      let selected_day_as_num = day;
      const UpdatedConfig_id = uuid();
      new_body.UpdatedConfig_id = UpdatedConfig_id;
      //add one day - as reminder starts from next day
      let result = secondaryServices.addDaysAndTime(
        currentDate,
        selected_day_as_num,
        moment(currentDate).day(),
        new_body.type
      );
      let date = moment(result.date).format(constants.date_format);

      const timeDependingOnType = await secondaryServices.getTimeBasedOnType(
        time_of_day
      );
      // const utc_time = moment.utc(`${date} ${timeDependingOnType}`, constants.date_format).valueOf();
      new_body.reminder_date = date;
      new_body.reminder_time = timeDependingOnType;

      const post = await postEngine.generatePosts(req.request_id, new_body);

      const reminder_body = {
        config_id: new_body.config_id,
        email: post.email,
        post_id: post.post_id,
        bucket_id: post.random_bucket_id_selected,
        reminder_date: new_body.reminder_date,
        reminder_time: new_body.reminder_time,
        user_id: new_body.user_id,
        // reminder_timestamp_utc: utc_time,
        time_of_day: time_of_day,
        timezone: timezone,
        group_id: new_body.group_id
      };

      await editModule.dailyReminderValidation(req.request_id, reminder_body);
      await editModule.addInConfigTable(req.request_id, new_body);
      await editModule.addInRemindersTable(req.request_id, new_body);

      bot.send(req.request_id, `Someone edited a reminder to daily- ${req.request_id}`);
      response.success(req.request_id, { bucket_id }, res);
    }
  } catch (e) {
    response.failure(req.request_id, e, res); 
  }
}

module.exports.deleteReminders = async (req, res) => {
  try {
    const user_id = req.authInfo.user_id;
    const { bucket_id, group_id } = req.body;
    const payload = { bucket_id, user_id, group_id };
    await deleteModule.init(req.request_id, payload);
    await deleteModule.checkIfReminderExists(req.request_id, payload);
    await deleteModule.deleteFromRemindersTable(req.request_id, payload);
    await deleteModule.deleteReminderConfigForBucket(req.request_id, payload);

    response.success(req.request_id, payload, res);
  } catch (e) {
    response.failure(req.request_id, e, res);
  }
};
