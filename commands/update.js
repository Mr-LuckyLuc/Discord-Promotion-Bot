const {SlashCommandBuilder, MessageFlags} = require('discord.js');

const fs = require('node:fs');
const { reloadFiles } = require('../functions');

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
			.setName('command')
            .setRequired(true)
			.setDescription('The command to update with these settings')
            .addChoices(
                {name: "rank", value: "rank"},
                {name: "unit", value: "unit"},
                {name: "career", value: "career"},
            )
		),
        
	async execute(interaction) {

        await interaction.deferReply()
		
		const command = interaction.options.getString('command');
		const textJSON = interaction.options.getString('settings') ?? "";
		let newJSON;

		const client = interaction.client;
		const guildId = interaction.guild.id;


        try {
            newJSON = JSON.parse(textJSON);
        } catch {
            interaction.reply("Couldn't parse json, check your json structuring");
			return;
        }

		switch (command) {
			case 'rank':
				for (const rank in Object.values(newJSON)) {
					if (Object.keys(rank).includes(["rank tag", "rank role", "extra role", "staff permissions"])) {
            			await interaction.editReply({ content: "Missing correct entries, does it include all of the following:\nrank tag, rank role, extra role, staff permissions", flags: MessageFlags.Ephemeral});
						return;
					}
				}
				client.ranks[guildId] = newJSON;
				fs.writeFile(client.files.ranks, JSON.stringify(client.ranks, null, 4), (err) => {
					if(err){
						console.log(Date.now());
						console.log(err);
					}else{
						console.log("ranks updated");
					}
				});
				break;
			case 'unit':
				for (const unit in Object.values(newJSON)) {
					if (Object.keys(unit).includes(["unit tag", "unit role", "extra role", "display name"])) {
            			await interaction.editReply({ content: "Missing correct entries, does it include all of the following:\nunit tag, unit role, extra role, display name", flags: MessageFlags.Ephemeral});
						return;
					}
				}
				client.units[guildId] = newJSON;
				fs.writeFile(client.files.units, JSON.stringify(client.units, null, 4), (err) => {
					if(err){
						console.log(Date.now());
						console.log(err);
					}else{
						console.log("units updated");
					}
				});
				break;
			case 'career':
				for (const career in Object.values(newJSON)) {
					if (Object.keys(career).includes(["career role", "display name"])) {
            			await interaction.editReply({ content: "Missing correct entries, does it include all of the following:\ncareer role, display name", flags: MessageFlags.Ephemeral});
						return;
					}
				}
				client.careers[guildId] = newJSON;
				fs.writeFile(client.files.careers, JSON.stringify(client.careers, null, 4), (err) => {
					if(err){
						console.log(Date.now());
						console.log(err);
					}else{
						console.log("careers updated");
					}
				});
				break;
		}

		reloadFiles();

        await interaction.editReply({ content: `Updated ${command}s role assignment`, flags: MessageFlags.Ephemeral }); 
		
	}
}