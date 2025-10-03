const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js')

const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('promote')
		.setDescription('Promote somebody!'),
        
	async execute(interaction) {
        const client = interaction.client;
        const ranks = client.ranks;
        const enlisted = client.enlisted;

        // User ----------------

        const userSelect = new UserSelectMenuBuilder()
        .setCustomId("user")
        .setPlaceholder('Make a selection!');

        const userRow = new ActionRowBuilder()
        .addComponents(userSelect)
		
        // Rank ----------------

        const rankSelect = new StringSelectMenuBuilder()
			.setCustomId('rank')
			.setPlaceholder('Make a selection!');
        
		for (const [rank, _] of Object.entries(ranks)) {
            rankSelect.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(rank)
					.setDescription('Promote the person to ' + rank )
					.setValue(rank)
            )
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
            const userConfirmation = await reply.awaitMessageComponent({ time: 60_000 });

            if (userConfirmation.customId === 'user') {
                const enlisteeId = userConfirmation.values[0];
                const user = await interaction.guild.members.fetch(enlisteeId);
                const enlistee = enlisted[enlisteeId];

                const oldGroup = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank].group);
                const oldRank = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank].rank);

                if (enlisteeId == interaction.guild.ownerId) {
                    await userConfirmation.update({content: "No permission to change this soldier (server owner)", components: []});
                    return;
                }

                userConfirmation.update({
                    content: `What rank do you want to promote to?`,
                    components: [rankRow, cancelRow],
                })

                try {
                    const reply = await interaction.fetchReply();
                    const rankConfirmation = await reply.awaitMessageComponent({ time: 60_000 });
                    
                    if (rankConfirmation.customId === 'rank') {
                        const rank = rankConfirmation.values[0];

                        try{

                            enlistee.rank = rank;
                            enlisted[enlisteeId] = enlistee;
                    
                            fs.writeFile("./promotionBot/enlisted.txt", JSON.stringify(enlisted), (err) => {
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log('rank changed');
                                }
                            });
                            
                            const newGroup = await interaction.guild.roles.cache.find(role => role.name === ranks[rank].group);
                            const newRank = await interaction.guild.roles.cache.find(role => role.name === ranks[rank].rank);

                            user.roles.remove(oldGroup);
                            user.roles.add(newGroup);
                            
                            user.roles.remove(oldRank);
                            user.roles.add(newRank);

                            await user.setNickname(ranks[rank].name + ' ' + enlisted[enlisteeId].nickname)

                            rankConfirmation.update({
                                content: `Changed ${enlisted[enlisteeId].nickname}'s rank to ${rank}`,
                                components: [],
                            });
                        } catch(err) {
                            console.log(err);
                            
                            await interaction.update("Something went wrong")
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
            console.log(err);
            
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
		
	}
}