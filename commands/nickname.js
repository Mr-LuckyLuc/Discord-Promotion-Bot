const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js');

const { unpackInteraction } = require('../functions');
const { updateEnlisted } = require('../functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nickname')
		.setDescription('Change your nickname!')
        .addStringOption(option => option
            .setName('nickname')
            .setDescription('your new nickname')
            .setRequired(true)),
        
	async execute(interaction) {
        
        const [, ranks, units, , enlisted, guildId, interacterId] = unpackInteraction(interaction);

        const nickname = interaction.options.getString('nickname') ?? 'ERR%R';

        if (nickname.lenght > 20) {
            interaction.reply({
                content: `Nickname should be shorter then 20 characters`
            })
            return;
        }

        // User ----------------
        
        const userSelect = new UserSelectMenuBuilder()
        .setCustomId("user")
        .setPlaceholder('Make a selection!');

        const userRow = new ActionRowBuilder()
        .addComponents(userSelect);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger);

        const cancelRow = new ActionRowBuilder()
            .addComponents(cancel);
            
        interaction.reply({
            content: `Who do you want to rename?`,
			components: [userRow, cancelRow],
        });


        try {
            const reply = await interaction.fetchReply();

            let userConfirmation = {member: {id: 0}};

            while (userConfirmation.member.id !== interacterId) userConfirmation = await reply.awaitMessageComponent({ time: 60_000 });

            if (userConfirmation.customId === 'user') {
                const enlisteeId = userConfirmation.values[0];
                const user = await interaction.guild.members.fetch(enlisteeId);
                
                if (enlisteeId == interaction.guild.ownerId) {
                    await userConfirmation.update({content: "No permission to change this soldier (server owner)", components: []});
                    return;
                }
                
                if (user.user.bot) {
                    await userConfirmation.update({content: "No permission to change this soldier (bot)", components: []});
                    return;
                }

                const enlistee = enlisted[enlisteeId];

                const oldNickname = enlistee.nickname;

                enlistee.nickname = nickname;
                enlisted[enlisteeId] = enlistee;

                updateNickname(member);
                updateEnlisted(enlisted, guildId, 'nickname changed');                

                userConfirmation.update({
                    content: `Changed <@${enlisteeId}>'s (${oldNickname}) nickname to ${nickname}.`,
                    components: [],
                });
            } else if (userConfirmation.customId === 'cancel') {
                await interaction.editReply({ content: 'Cancelled', components: [] });
                return;
            }
            
        } catch(err) {
            console.log(Date.now());
            console.log(err);
            
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
	}
}