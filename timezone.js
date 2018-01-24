'use strict'

const Discord = require('discord.js');
const moment = require('moment-timezone');

module.exports.convertTime = function(message) {
  const currentDate = new Date();
  const args = message.split(" ");
  var richMessage = new Discord.RichEmbed();

  const newDateString = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${args[1]} ${args[2]}`;

  for (let i = 0; i < 3; i = i + 1) {
    if (args[i] == null){
      richMessage.addField('Invalid Date', "Use the correct format for command. `!kentime <Time> <AM or PM>`");
      return richMessage;
    }
  }

  var kenTime = moment.tz(newDateString, 'YYYY-MM-DD h:m a', 'Pacific/Auckland');
  var convertedTimes = [];

  convertedTimes.push(kenTime.clone().tz("America/Los_Angeles"));
  convertedTimes.push(kenTime.clone().tz("America/New_York"));
  convertedTimes.push(kenTime.clone().tz("America/Phoenix"));
  convertedTimes.push(kenTime.clone().tz("Europe/Paris"));
  convertedTimes.push(kenTime.clone().tz("Australia/Melbourne"));
  convertedTimes.push(kenTime.clone().tz("Asia/Singapore"));



  richMessage.setTitle(`Here are the converted times for ${args[1]} ${args[2]} from Ken's timezone ${kenTime.format('zz')}`);
  for (let i = 0; i < convertedTimes.length; i = i + 1) {
    richMessage.addField(convertedTimes[i].format('zz'), convertedTimes[i].format('hh:mm A'));
  };
  return richMessage;
}