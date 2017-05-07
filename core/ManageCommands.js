exports.commands = [];

const quietChannels = {
	"284746138995785729": true,
	"289447389251502080": true,
	"285040042001432577": true,
	"284746888715042818": true,
	"294244239485829122": true,
	"290228574273798146": true
};

function isQuiet(channel, speaker) {
	if (quietChannels[channel.id] && !Util.checkStaff(channel.guild, speaker)) {
		return true;
	}
	return false;
}

exports.addCommand = function(structure) {
	var cmds = structure.cmds;
	var fixedCmds = [];

	for (var i = 0; i < cmds.length; i++) {
		fixedCmds.push(cmds[i].toLowerCase());
	}

	var cmdData = [fixedCmds, structure.func, structure.requires, structure.desc, structure.args, structure.example];

	exports.commands.push(cmdData);
	exports.commands.sort();

	return cmdData;
};

exports.getCommand = function(content) {
	var contentLower = content.toLowerCase();

	for (var i = 0; i < exports.commands.length; i++) {
		var cmdData = exports.commands[i];
		var cmdNames = cmdData[0];

		for (var i2 = 0; i2 < cmdNames.length; i2++) {
			var cmd = cmdNames[i2];
			var cmdLength = cmd.length;
			var hasParameters = cmd[cmdLength-1] == " ";
			if (hasParameters && contentLower.substr(0, cmdLength) == cmd || !hasParameters && contentLower == cmd) {
				return cmdData;
			}
		}
	}

	return null;
};

exports.initCommands = function() {
	Util.bulkRequire("./commands/");
};

exports.checkMessage = (msgObj, speaker, channel, guild, content, contentLower, authorId, isStaff) => {
	if ((channel.id != "168743219788644352" || authorId == vaebId)/* && (guild.id != "257235915498323969" || channel.id == "257244216772526092")*/) { //script-builders
		for (var i = 0; i < exports.commands.length; i++) {

			var cmdData = exports.commands[i];
			var cmdNames = cmdData[0];
			var cmdFunc = cmdData[1];
			var cmdRequires = cmdData[2];

			for (var i2 = 0; i2 < cmdNames.length; i2++) {

				var cmd = cmdNames[i2];
				var cmdLength = cmd.length;
				var hasParameters = cmd[cmdLength-1] == " ";
				if (hasParameters && contentLower.substr(0, cmdLength) == cmd || !hasParameters && contentLower == cmd) {

					if (cmdRequires.staff && !isStaff) {
						Util.sendEmbed(channel, "Restricted", "This command can only be used by Staff", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
					} else if (cmdRequires.vaeb && authorId != vaebId) {
						Util.sendEmbed(channel, "Restricted", "This command can only be used by Vaeb", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
					} else if (cmdRequires.guild && guild == null) {
						Util.sendEmbed(channel, "Restricted", "This command can only be used in Guilds", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
					} else if (cmdRequires.loud && isQuiet(channel, speaker)) {
						Util.sendEmbed(channel, "Quiet Channel", "This command cannot be used in this Channel (use #bot-commands)", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
					} else {

						var args = content.substring(cmdLength);
						var argStr = args.length < 1 ? "None" : args;
						var outLog = Util.getName(speaker) + " (" + speaker.id + ") Ran command: " + cmd.trim();
						if (hasParameters) outLog += " | Args: " + argStr;
						console.log(outLog);

						if (cmdRequires.staff && guild != null) {

							var sendLogData = [
								"Command Entry",
								guild,
								speaker,
								{name: "Username", value: speaker.toString()},
								{name: "Channel Name", value: channel.toString()},
								{name: "Command Name", value: cmd},
							];

							if (hasParameters) {
								sendLogData.push({name: "Command Argument(s)", value: argStr});
							} else {
								sendLogData.push({name: "Command Argument(s)", value: "N/A"});
							}
							
							Util.sendLog(sendLogData, colCommand);

						}

						try {
							cmdFunc(cmd, args, msgObj, speaker, channel, guild, isStaff);
						} catch(err) {
							console.log("COMMAND ERROR: " + err.stack);
						}

					}

					return;

				}

			}

		}

	}
};

