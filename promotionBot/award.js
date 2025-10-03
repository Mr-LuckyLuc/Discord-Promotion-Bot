const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js')

const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('award')
		.setDescription('Award somebody!'),
        
	async execute(interaction) {
        const client = interaction.client;
        const awards = client.awards;
        const enlisted = client.enlisted;

        // User ----------------

        const userSelect = new UserSelectMenuBuilder()
        .setCustomId("user")
        .setPlaceholder('Make a selection!');

        const userRow = new ActionRowBuilder()
        .addComponents(userSelect)
		
        // Rank ----------------

        const awardSelect = new StringSelectMenuBuilder()
			.setCustomId('award')
			.setPlaceholder('Make a selection!');
        
		for (const award of awards) {
            awardSelect.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(award)
					.setDescription('Award the person the ' + award + ' award')
					.setValue(award)
            )
        }

		const awardRow = new ActionRowBuilder()
			.addComponents(awardSelect);


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

                if (enlisteeId == interaction.guild.ownerId) {
                    await userConfirmation.update({content: "No permission to change this soldier (server owner)", components: []});
                    return;
                }

                userConfirmation.update({
                    content: `What rank do you want to promote to?`,
                    components: [awardRow, cancelRow],
                })

                try {
                    const reply = await interaction.fetchReply();
                    const awardConfirmation = await reply.awaitMessageComponent({ time: 60_000 });
                    
                    if (awardConfirmation.customId === 'award') {
                        const award = awardConfirmation.values[0];

                        try{
                            
                            const section = interaction.guild.roles.cache.find(role => role.name === "-=Service Awards=-");
                            const awardRole = interaction.guild.roles.cache.find(role => role.name === award);

                            if (!(section in user.roles)) {
                                user.roles.add(section);
                            }

                            user.roles.add(awardRole);

                            console.log("awarded");

                            awardConfirmation.update({
                                content: `Awarded ${enlisted[enlisteeId].nickname} the ${award}`,
                                components: [],
                            });

                        } catch(err) {
                            console.log(err);
                            await interaction.update("Something went wrong")
                        }

                    } else if (awardConfirmation.customId === 'cancel') {
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