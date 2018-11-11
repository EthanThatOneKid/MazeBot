var utils = require('./utils');
var inquirer = require("inquirer");
var Table = require('cli-table');

var c = utils.colors;

function Game() {
  this.inventory = {};
  this.score = 0;
  this.currentRoom = {};
  this.keyWords = ['help', 'info', 'inventory', 'score', 'save', 'restore', 'throw', 'drop', 'take', 'pick', 'get', 'use', 'move', 'nothing'];
  this.channel;
  this.nextMsgFn = () => {};
}

Game.prototype.play = function(gsPath) { //Game Script Path
  var script = utils.parser(gsPath);
  this.rooms = script.rooms;
  this.kickOff(script.name, script.meta);
};

Game.prototype.setChannel = function(channel) {
  this.channel = channel;
}

Game.prototype.help = function() {
  this.channel.send(
    '\nThis is text based adventure game. You can find a set of commands below that will help you navigate around the game.\n' +
    'Rules of the road :\n' +
    '  *  You enter the below commands to progress the game\n'+
    '  *  A command is 2 word phrase consisting of a verb and an object/direction\n' +
    '  *  Examples `go east` or `pick bottle`\n' +
    '  *  The first word should always be a verb and the second word an object\n' +
    '  *  You can navigate around the game using East, West, North and South\n' +
    '  *  You can Pick objects, Throw Objects and Use objects based on the context of the game\n'
  );

  this.channel.send([
    ['help', 'To see these instructions'],
    ['info', 'To see the help based on your game state'],
    ['inventory', 'You can see all the items you have collected here'],
    ['score', 'Your score based on how you are playing the game']
  ].reduce((acc, [cmd, desc]) => acc += `**${cmd}**: ${desc}\n`, "**COMMANDS**:\n"));
}

Game.prototype.kickOff = function(name, meta) {
  var self = this;
  self.help();
  self.executer(self.rooms[0]);
};


Game.prototype.executer = function(room) {
  var _r = {},
    self = this;

  _r.actions = {};


  Object.keys(room).forEach(function(k, v) {
    _r = room[k];
    _r.name = k
  });

  if (_r.exits) {
    Object.keys(_r.exits).forEach(function(k, v) {
      if (parseInt(_r.exits[k]) != -1) {
        _r[k] = _r["go " + k] = _r.exits[k];
      } else {
        _r[k] = _r["go " + k] = "nothing"
      }
    });
  }

  if (_r.actions) {
    Object.keys(_r.actions).forEach(function(k, v) {
      _r.actions[k] = _r.actions[k];
    });
  }

  if (_r.objects) {
    Object.keys(_r.objects).forEach(function(k, v) {
      _r[k] = _r.objects[k];
    });
  }

  if (_r.enemies) {
    Object.keys(_r.enemies).forEach(function(k, v) {
      _r[k] = _r.enemies[k];
    });
  }

  if (_r.meta) {
    Object.keys(_r.meta).forEach(function(k, v) {
      _r[k] = _r.meta[k];
    });
  }

  // cleanup unused vars
  delete _r.exits;
  delete _r.actions;
  delete _r.objects;
  delete _r.enemies;

  self.currentRoom = room;

  if ((_r.isExitRoom && _r.isExitRoom.toString()) === "true") {
    this.channel.send(_r.description);
    return false;
    process.exit(0);
  }

  this.channel.send(_r.description);
  this.nextMsgFn = function(response) {
    if (response.trim().length == 0) {
      this.channel.send('You can do better than that.. ');
      self.executer(room);
    } else if (self.keyWords.indexOf(response) >= 0 || self.keyWords.indexOf(response.split(' ')[0]) >= 0) { // check for keywords
      self.processKeyword(response, room, _r);
    } else if (_r[response]) { // direct commands
      self.feeder(_r[response]);
    } else {
      var filterWords = ['fuck', 'crap', 'shit'];
      if (filterWords.indexOf(response) >= 0) {
        var msgs = [
          'huh!!',
          'Yeah.. and what!!',
          'You kiss your mother with that mouth!'
        ];
        this.channel.send(msgs[Math.ceil(Math.random() * msgs.length) - 1] + '\n');
      } else {
        var msgs = [
          'Sorry what???',
          'Pardon me..'
        ];
        this.channel.send(msgs[Math.ceil(Math.random() * msgs.length) - 1] + '\n');
      }
      self.executer(room);
    }
  };
}

Game.prototype.feeder = function(roomName) {
  var self = this,
    found = false;

  for (let key in Object.keys(self.rooms)) {
    var _r = self.rooms[key];
    if (found) return;

    if (roomName == 'nothing') {
      found = true;
      this.channel.send('Looks like there is nothing here..');
      return self.executer(self.currentRoom);
    }

    Object.keys(_r).forEach(function(k, v) {
      if (k === roomName) {
        found = true;
        return self.executer(_r);
      }
    });
  };

  // > No rooms with the provided name found
  // Warn the player that the game is incomplete and terminate
  if (!found) {
    this.channel.send('Oops.. looks like the game is not completely developed! :/');
  }
};

Game.prototype.prompt = function(text, callback) {
  var p = {
    type: "input",
    name: "input",
    message: text ? text : 'The Room description is empty :('
  };
  this.channel.send('\n' + p.message);
};

Game.prototype.processKeyword = function(response, room, _r) {
  var self = this;
  if (response == 'info') {
    this.channel.send(_r.contextualHelp || _r.description);
  } else if (response == 'inventory') {
    self.printInventory();
  } else if (response == 'score') {
    this.channel.send('Your score is ' + self.score + '\n');
  } else if (response.split(" ")[0] == 'pick' || response.split(" ")[0] == 'take'|| response.split(" ")[0] == 'get') {
    self.pick(_r, response.split(" ")[1]);
  } else if (response.split(" ")[0] == 'throw' || response.split(" ")[0] == 'drop') {
    self.throw(_r, response.split(" ")[1]);
  } else {
    if (response.split(" ").length < 1 || response.split(" ").length > 1) {
      this.channel.send('Enter a verb and an action. Enter `help` for more info');
    } else {
      this.channel.send('response >> ' + response);
    }
  }
  this.executer(room);
};

Game.prototype.pick = function(room, item) {
  var self = this;
  if (room[item]) {
    self.inventory[item] = room[item];
    this.channel.send('  Added ' + item + ' to inventory');
  } else {
    this.channel.send('  I can\'t find any ' + item + ' around ' + room.alias);
  }
};

Game.prototype.throw = function(room, item) {
  var self = this,
    iv = self.inventory;
  this.channel.send(item + " " + iv[item])
  if (iv[item]) {
    delete iv[item];
    this.channel.send('  Updated inventory');
  } else {
    this.channel.send('  I can\'t find any ' + item + ' in the inventory');
  }
};

Game.prototype.printInventory = function() {
  var self = this;
  var items = Object.keys(self.inventory);

  let itemsString = 'No items in your inventory yet!';

  if (items.length)
    itemsString = items.reduce((acc, cur, i) => acc += `${cur}${i + 1 < items.length ? ", " : ""}`, "");
  this.channel.send(itemsString);
};

Game.prototype.save = function() {
  // save the game state
};

Game.prototype.restore = function() {
  // restore the game state
};

module.exports = new Game();
