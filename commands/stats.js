const {SlashCommandBuilder, MessageFlags, EmbedBuilder} = require('discord.js');
const { updateMessage } = require('../message');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('See the stats')
		.addBooleanOption((option) => option
			.setName('visible')
			.setDescription('Whether or not the stats should be visible to everyone')
		),
        
	async execute(interaction) {

		const visible = interaction.options.getBoolean('visible');

        await interaction.reply({ content: "Generating Stats ...", flags: MessageFlags.Ephemeral }); 

    	const client = interaction.client;

		if (visible) {
			const channel = await interaction.member.guild.channels.fetch(interaction.channelId);

			const myEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle('Loading ...');

			msg = await channel.send({content: "# 1st Light Cavalry Company", embeds: [myEmbed] });

			client.message = msg
		}

		const message = updateMessage(client);

		if (!visible) await interaction.editReply({ content: message, flags: MessageFlags.Ephemeral });
		console.log(`${visible?"Publicly":"Privatly"} displaying stats`);
		
	}
}