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
                {name: "rank", value: "rank"},
                {name: "unit", value: "unit"},
                {name: "career", value: "career"},
                {name: "settings", value: "settings"},
            )
		),
        
    async execute(interaction) {

		const option = interaction.options.getString('option');

        await interaction.reply({ content: JSON.stringify(client[interaction.guild.id][option]), flags: MessageFlags.Ephemeral }); 
        
    }
}