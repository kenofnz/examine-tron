// Import the discord.js module
const config = require('./config.json');
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

function hasDegree(userServerMember, earnedRoles, wingRoles, wingNumber){
  return userServerMember.roles.find(role => role.equals(wingRoles[wingNumber])) !== null || earnedRoles.find(role => role === wingRoles[wingNumber]);
}

function checkGW2BotMessage(userServerMember, wingRoles, message) {
  for (let i = 0; i < message.embeds.length; i += 1 ){
  	const embedMessage = message.embeds[i]
    const wings = embedMessage.fields;
    
    var earnedDegrees = [];
    var earnedRoles = [];
    for (let j = 0; j < wings.length && j < wingRoles.length; j += 1 ){
  	  if (wings[j].name === config.wingClearName[j]) {
        if (!hasDegree(userServerMember, earnedDegrees, wingRoles, j)) {
          console.log(`${userServerMember.displayName}: Earned ${wingRoles[j].name}`);
          earnedDegrees.push(wingRoles[j].name);
          earnedRoles.push(wingRoles[j]);
          userServerMember.addRole(wingRoles[j]);
        }
  	  }
    }

    if (earnedDegrees.length > 0) {
      message.channel.send(`<@${userServerMember.id}> You've earned ${earnedDegrees.join(', ')}! <:OoO:395377784895045633>`);
    }
    return earnedRoles;
  }
}

function assignClassRole(message, classRoleName){
  const author = message.author;

   //Make sure its not a bot
  if(author.bot) return;

  const server = message.guild;
  const roles = server.roles;
  const classRole = roles.find(role => role.name === classRoleName);

  const userServerMember = server.member(message.author);

  if (userServerMember.roles.find(role => role.equals(classRole)) !== null) {
    userServerMember.removeRole(classRole);
    console.log(`${userServerMember.displayName}: Removed ${classRole.name} role`);
  } else {
    userServerMember.addRole(classRole);
    console.log(`${userServerMember.displayName}: Added ${classRole.name} role`);
  }
}

function assignDegreeRole(message){
  const author = message.author;

   //Make sure its GW2Bot
  if(!author.bot || author.id !== '310050883100737536' || author.username !== 'GW2Bot') return;

  const server = message.guild;
  const roles = server.roles;
  const wingRoles = [];
  const undergradRole = roles.find(role => role.name === config.undergradRole);
  const mastersRole = roles.find(role => role.name === config.mastersRole);
  const phdRole = roles.find(role => role.name === config.phdRole);

  for (let i = 0; i < config.wingRoles.length; i += 1 ){
    wingRoles.push(roles.find(role => role.name === config.wingRoles[i]));
  }

  const requestingUser = message.mentions.users.first();
  const userServerMember = server.member(requestingUser);

  /*
  if (userServerMember.nickname === null){
    message.channel.send(`<@${userServerMember.id}> could you change your nickname to match your GW2 account name please? <:OoO:395377784895045633>`);
  }
  */
  
  console.log(`${author.username} boss check from ${userServerMember.displayName}`);

  //Check $bosses message for degrees
  console.log(`${userServerMember.displayName}: Updating degrees...`);
  var earnedRoles = checkGW2BotMessage(userServerMember, wingRoles, message);

  console.log(`${userServerMember.displayName}: Checking Masters requirement...`);
  var receiveMasters = true;
  if (earnedRoles.length < config.mastersNumberOfWings) {
    for (let i = 0; i < config.mastersNumberOfWings; i = i + 1) {
      if (!hasDegree(userServerMember, earnedRoles, wingRoles, i)) {
        console.log(`${userServerMember.displayName}: Does not have ${wingRoles[i].name}`);
        receiveMasters = false;
      }
    }
  }
  
  if (receiveMasters &&
   (userServerMember.roles.find(role => role.equals(undergradRole)) !== null
    || userServerMember.roles.find(role => role.equals(mastersRole)) === null)) {
    console.log(`${userServerMember.displayName}: Has met requirements for Masters`);
    userServerMember.addRole(mastersRole);
    userServerMember.removeRole(undergradRole);
    message.channel.send(`<@${userServerMember.id}> Congratulations on your Masters degree! :tada:`);
  }

  console.log(`${userServerMember.displayName}: Done`);
}

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
  console.log('I am ready to hand out some degrees!');
});

client.on('message', async message => {
  //Make sure its the '!<some role>' command
  for (let i = 0; i < config.classRoles.length; i += 1 ) {
    if(message.content === `!${config.classRoles[i]}`) {
      assignClassRole(message, config.classRoles[i]);
      return;
    } 
  }

  //Make sure its the '$bosses' command
  if(message.content.match(/.+, here are your raid bosses:/) != null) {
    assignDegreeRole(message);
    return;
  }
});

client.login(process.env.TOKEN);