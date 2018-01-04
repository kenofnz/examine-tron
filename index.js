// Import the discord.js module
const config = require('./config.json');
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

function hasDegree(userServerMember, wingRoles, wingNumber){
  return userServerMember.roles.find(role => role === wingRoles[wingNumber]) !== null;
}

function checkGW2BotMessage(userServerMember, wingRoles, message) {
  for (let i = 0; i < message.embeds.length; i += 1 ){
  	const embedMessage = message.embeds[i]
    const wings = embedMessage.fields;
    
    var receiveMasters = true;
    for (let j = 0; j < wings.length && j < wingRoles.length; j += 1 ){
  	  if (wings[j].name === config.wingClearName[j]) {
  	  	console.log(`${userServerMember.displayName}: Earned ${wingRoles[j].name}`);
  	  	userServerMember.addRole(wingRoles[j]);
  	  } else {
  	  	receiveMasters = false;
  	  }
    }
    return receiveMasters;
  }
}

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
  console.log('I am ready to hand out some degrees!');
});

client.on('message', async message => {
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

  //Make sure its the '$bosses' command
  if(message.content.match(/.+, here are your raid bosses:/) == null) return;

  const requestingUser = message.mentions.users.first();
  const userServerMember = server.member(requestingUser);

  if (userServerMember.nickname === null){
    message.channel.send(`<@${userServerMember.id}> could you change your nickname to match your GW2 account name please? <:OoO:395377784895045633>`);
  }
  console.log(`${author.username} boss check from ${userServerMember.displayName}`);

  //Check $bosses message for degrees
  console.log(`${userServerMember.displayName}: Updating degrees...`);
  var receiveMasters = checkGW2BotMessage(userServerMember, wingRoles, message);

  console.log(`${userServerMember.displayName}: Checking Masters requirement...`);
  if (!receiveMasters) {
  	receiveMasters = true;
    for (let i = 0; i < config.mastersNumberOfWings; i = i + 1) {
      if (!hasDegree(userServerMember, wingRoles, i)) {
  	    console.log(`${userServerMember.displayName}: Does not have ${wingRoles[i].name}`);
  	    receiveMasters = false;
      }
    }
  }

  if (receiveMasters &&
   (userServerMember.roles.find(role => role === undergradRole) !== null
    || userServerMember.roles.find(role => role === mastersRole) === null)) {
  	console.log(`${userServerMember.displayName}: Has met requirements for Masters`);
    userServerMember.addRole(mastersRole);
    userServerMember.removeRole(undergradRole);
    message.channel.send(`<@${userServerMember.id}> Congratulations on your Masters degree! :tada:`);
  }

});

client.login(process.env.TOKEN);