const {SlashCommandBuilder, MessageFlags, EmbedBuilder} = require('discord.js');
const { updateMessage } = require('../utils/message');
const { unpackInteraction } = require('../utils/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('See the stats')
		.addBooleanOption((option) => option
			.setName('visible')
			.setDescription('Whether or not the stats should be visible to everyone')
		),
        
	async execute(interaction) {

		const [client, , , , , , , guildId, ] = unpackInteraction(interaction);

		const stats = client.stats[guildId];

		const visible = interaction.options.getBoolean('visible');

        await interaction.reply({ content: "Generating Stats ...", flags: MessageFlags.Ephemeral }); 


		if (visible) {
			const channel = await interaction.guild.channels.fetch(interaction.channelId);

			const myEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle('Loading ...');

			msg = await channel.send({content: `# ${stats.title}`, embeds: [myEmbed] });

			client.message = msg
		}

		const message = updateMessage(interaction);

		if (!visible) await interaction.editReply({ content: message, flags: MessageFlags.Ephemeral });
		console.log(`${visible?"Publicly":"Privatly"} displaying stats`);
		
	}
}