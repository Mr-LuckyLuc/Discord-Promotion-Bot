const {Collection, SlashCommandBuilder, MessageFlags, REST, Routes} = require('discord.js');

const path = require('node:path');
const fs = require('node:fs');

const { reloadFiles, updateFile } = require('../utils/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Update role assignment')
		.addStringOption((option) => option
			.setName('settings')
            .setRequired(true)
			.setDescription('The JSON structured text to update the role assignment')
		)
        .addStringOption((option) => option
			.setName('option')
            .setRequired(true)
			.setDescription('The setting to update with these settings')
            .addChoices(
                {name: "rank", value: "rank"},
                {name: "unit", value: "unit"},
                {name: "career", value: "career"},
				{name: "award", value: "award"},
                {name: "settings", value: "settings"},
            )
		),
        
	async execute(interaction) {

        await interaction.deferReply()
		
		const option = interaction.options.getString('option');
		const textJSON = interaction.options.getString('settings') ?? "";
		let newJSON;

		const client = interaction.client;
		const guildId = interaction.guild.id;


        try {
            newJSON = JSON.parse(textJSON);
        } catch {
            interaction.editReply("Couldn't parse json, check your json structuring");
			return;
        }

		switch (option) {
			case 'rank':
				for (const rank in Object.values(newJSON)) {
					if (Object.keys(rank).includes(["rank tag", "rank role", "extra roles"])) {
            			await interaction.editReply({ content: "Missing correct entries, does it include all of the following:\nrank tag, rank role, extra roles", flags: MessageFlags.Ephemeral});
						return;
					}
				}
				client.ranks[guildId] = newJSON;
				await updateFile("ranks");
				break;
			case 'unit':
				for (const unit in Object.values(newJSON)) {
					if (Object.keys(unit).includes(["unit tag", "unit role", "extra roles"])) {
            			await interaction.editReply({ content: "Missing correct entries, does it include all of the following:\nunit tag, unit role, extra roles", flags: MessageFlags.Ephemeral});
						return;
					}
				}
				client.units[guildId] = newJSON;
				await updateFile("units");
				break;
			case 'career':
				for (const career in Object.values(newJSON)) {
					if (Object.keys(career).includes(["career tag", "career role", "extra roles"])) {
            			await interaction.editReply({ content: "Missing correct entries, does it include all of the following:\ncareer tag, career role, extra roles", flags: MessageFlags.Ephemeral});
						return;
					}
				}
				client.careers[guildId] = newJSON;
				await updateFile("careers");
				break;
			case 'award':
				for (const award in Object.values(newJSON)) {
					if (Object.keys(award).includes(["role"])) {
            			await interaction.editReply({ content: "Missing correct entries, does it include all of the following:\nrole", flags: MessageFlags.Ephemeral});
						return;
					}
				}
				client.awards[guildId] = newJSON;
				await updateFile("awards");
				break;
			case 'settings':
				if (Object.keys(settings).includes(["civilian role", "empolyee role", "autoroles", "nickname prefixes", "available commands"])) {
					await interaction.editReply({ content: "Missing correct entries, does it include all of the following:\civilian role, employee name, autorole, nickname prefixes, available commands", flags: MessageFlags.Ephemeral});
					return;
				}

				const oldCommands = client.settings[guildId]["available commands"];

				client.settings[guildId] = newJSON;

				if (!(oldCommands.sort().join("&")===client.settings[guildId]["available commands"].sort().join("&"))) {
					const commandsPath = __dirname
					const commandsFiles = fs.readdirSync(commandsPath);

					const commands = new Collection();

					for (const file of commandsFiles) {
						const filePath = path.join(commandsPath, file);
						const command = require(filePath);
						if ('data' in command && 'execute' in command) {
							commands.set(command.data.name, command);
						} else {
							console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
						}
					}

					const rest = new REST().setToken(process.env.TOKEN);
				
					const jsonCommands = commands.map(command => command.data.toJSON());
					const availableCommands = client.settings[guildId]["available commands"];
					const guildCommands = jsonCommands.filter( command => availableCommands.includes(command.name));
					
					const data = await rest.put(
					// Routes.applicationCommands(process.env.CLIENTID), //for all guilds
					Routes.applicationGuildCommands(process.env.CLIENTID, guildId), //per guild
					// Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDID), //for individual guild
						{ body: guildCommands },);
					
					console.log(`Successfully reloaded ${data.length} commands to ${guildId}.`);
				}

				await updateFile("settings");
				break;
		}

		reloadFiles();

        await interaction.editReply({ content: `Updated ${option}s role assignment`, flags: MessageFlags.Ephemeral }); 
		
	}
}