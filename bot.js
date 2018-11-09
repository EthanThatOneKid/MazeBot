const Discord = require("discord.js");
const bot = new Discord.Client({autorun: true});

bot.on("ready", () => {
  console.log("I am ready!");
});

bot.on("message", msg => {
  
  if (msg.content.substring(0, 1) == "!") {
    const cmd = msg.content.substring(1);
    msg.channel.send(cmd);
  }
   

});
