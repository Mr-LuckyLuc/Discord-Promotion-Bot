const {SlashCommandBuilder, MessageFlags} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show')
        .setDescription('See the settings for a specific')
        .addStringOption((option) => option
			.setName('option')
            .setRequired(true)
			.setDescription('The option to show the settings of.')
            .addChoices(
                {name: "rank", value: "ranks"},
                {name: "unit", value: "units"},
                {name: "career", value: "careers"},
                {name: "award", value: "awards"},
                {name: "settings", value: "settings"},
            )
		),
        
    async execute(interaction) {

		const option = interaction.options.getString('option');
        const client = interaction.client;

        await interaction.reply({ content: JSON.stringify(client[option][interaction.guild.id], null, 4), flags: MessageFlags.Ephemeral }); 
        
    }
}