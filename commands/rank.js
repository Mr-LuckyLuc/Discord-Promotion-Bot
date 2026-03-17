const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js');

const { updateMessage } = require('../message');
const { unpackInteraction, updateEnlisted, updateNickname } = require('../functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Promote somebody!'),
        
	async execute(interaction) {
        
        const [, ranks, , , settings, enlisted, guildId, interacterId] = unpackInteraction(interaction);
        const promoterRank = enlisted[interacterId].rank;
        let underranked = false;

        // User ----------------

        const userSelect = new UserSelectMenuBuilder()
        .setCustomId("user")
        .setPlaceholder('Make a selection!');

        const userRow = new ActionRowBuilder()
        .addComponents(userSelect);
		
        // Rank ----------------

        const rankSelect = new StringSelectMenuBuilder()
			.setCustomId('rank')
			.setPlaceholder('Make a selection!');
        
		for (const rank of Object.keys(ranks)) {

            if ((rank === promoterRank) || (underranked))  {
                underranked = true;
                continue;
            }

            

            rankSelect.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(rank)
					.setDescription('Promote the person to ' + rank )
					.setValue(rank)
            );
        }

		const rankRow = new ActionRowBuilder()
			.addComponents(rankSelect);


		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Danger);

		const cancelRow = new ActionRowBuilder()
			.addComponents(cancel);

    // messages -------------------------------

        interaction.reply({
            content: `Who do you want to promote?`,
			components: [userRow, cancelRow],
        });


        try {
            const reply = await interaction.fetchReply();

            let userConfirmation = {member: {id: 0}}

            while (userConfirmation.member.id !== interacterId) userConfirmation = await reply.awaitMessageComponent({ time: 60_000 });

            if (userConfirmation.customId === 'user') {
                const enlisteeId = userConfirmation.values[0];
                const member = await interaction.guild.members.fetch(enlisteeId);
                const enlistee = enlisted[enlisteeId];

                if (enlisteeId == interaction.guild.ownerId) {
                    await userConfirmation.update({content: "No permission to change this soldier (server owner)", components: []});
                    return;
                }
                
                if (member.user.bot) {
                    await userConfirmation.update({content: "No permission to change this soldier (bot)", components: []});
                    return;
                }

                if (Object.keys(ranks).indexOf(promoterRank) <= Object.keys(ranks).indexOf(enlistee.rank)) {
                    interaction.editReply({content: "They are to high rank for you to promote them.", components: []});
                    return
                }

                const oldRank = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["rank role"]);
                const oldExtras = interaction.guild.roles.cache.filter(role => role.name in ranks[enlistee.rank]["extra roles"]);
                const civ = await interaction.guild.roles.cache.find(role => role.name === settings["civilian role"]);

                userConfirmation.update({
                    content: `What rank do you want to promote to?`,
                    components: [rankRow, cancelRow],
                });

                try {
                    const reply = await interaction.fetchReply();

                    let rankConfirmation = {member: {id: 0}};

                    while (rankConfirmation.member.id !== interacterId) rankConfirmation = await reply.awaitMessageComponent({ time: 60_000 });
                    
                    if (rankConfirmation.customId === 'rank') {
                        const rank = rankConfirmation.values[0];

                        try{

                            enlistee.rank = rank;
                            enlistee.active = true;
                            enlisted[enlisteeId] = enlistee;
                    
                            updateEnlisted(enlisted, guildId, 'rank changed');
                            
                            const newRank = await interaction.guild.roles.cache.find(role => role.name === ranks[rank]["rank role"]);
                            const newExtras = await interaction.guild.roles.cache.filter(role => role.name === ranks[rank]["extra roles"]);
                            const employee = await interaction.guild.roles.cache.find(role => role.name === settings["employee role"]);

                            if (!oldRank || !civ || !newRank || !employee) {
                                await interaction.update("You are missing one of the roles, check with the /show command");
                                return;
                            }

                            member.roles.remove(oldRank);
                            member.roles.remove(oldExtras);
                            member.roles.remove(civ);

                            member.roles.add(newRank);
                            member.roles.add(newExtras);
                            member.roles.add(employee);

                            updateNickname(member);
                            updateMessage(interaction);

                            rankConfirmation.update({
                                content: `Changed <@${enlisteeId}>'s rank to ${rank}.`,
                                components: [],
                            });
                        } catch(err) {
                            console.log(Date.now());
                            console.log(err);
                            
                            await interaction.update("Something went wrong");
                        }

                    } else if (rankConfirmation.customId === 'cancel') {
                        await interaction.editReply({ content: 'Cancelled', components: [] });
                        return;
                    }

                } catch {
                    await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
                }

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