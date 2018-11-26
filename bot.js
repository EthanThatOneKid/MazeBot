require('dotenv').load();
const Discord = require("discord.js");
const bot = new Discord.Client({autorun: true});
bot.login(process.env.BOT_TOKEN);

let Game;

bot.on("ready", () => {
  console.log("I am ready!");
});

bot.on("message", msg => {

  if (msg.content.substring(0, 1) == "!") {
    const cmd = msg.content.substring(1);
    if (cmd == "start maze") {
      Game = require('./tbg/game.js');
      Game.setChannel(msg.channel);
      Game.play('./tbg/game_data.json');
    } else if (cmd == "end maze") {
      Game = undefined;
      msg.channel.send("Ended the game. Thanks for playing <3");
    } else if (Game) {
      Game.setChannel(msg.channel);
      Game.nextMsgFn(cmd);
    }
  }

});
