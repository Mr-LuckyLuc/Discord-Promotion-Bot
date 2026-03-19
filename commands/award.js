const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js')

const { unpackInteraction, updateEnlisted } = require('../utils/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('award')
		.setDescription('Award somebody!'),
        
	async execute(interaction) {

        const [, ranks, , , awards, , enlisted, ,interacterId ] = unpackInteraction(interaction);

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
        
		for (const [award, _] of Object.entries(awards)) {
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
            content: `Who do you want to award?`,
			components: [userRow, cancelRow],
        });


        try {
            const reply = await interaction.fetchReply();

            let userConfirmation = {member: {id: 0}};

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

                if (Object.keys(ranks).indexOf(enlisted[interacterId].rank) <= Object.keys(ranks).indexOf(enlistee.rank)) {
                    interaction.editReply({content: "They are to high rank for you to change them.", components: []});
                    return
                }

                userConfirmation.update({
                    content: `What award do you want to give?`,
                    components: [awardRow, cancelRow],
                })

                try {
                    const reply = await interaction.fetchReply();

                    let awardConfirmation = {member: {id: 0}};

                    while (awardConfirmation.member.id !== interacterId) awardConfirmation = await reply.awaitMessageComponent({ time: 60_000 });
                    
                    if (awardConfirmation.customId === 'award') {
                        const award = awardConfirmation.values[0];

                        try{
                            
                            const awardRole = interaction.guild.roles.cache.find(role => role.name === award);

                            if (!awardRole) {
                                await interaction.editReply({content: "You are missing one of the roles, check with the /show command", components: []});
                                return;
                            }

                            member.roles.add(awardRole);

                            console.log("award given");

                            awardConfirmation.update({
                                content: `Awarded <@${enlisteeId}> the ${award} award`,
                                components: [],
                            });

                        } catch(err) {
                            console.log(Date.now());
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
            console.log(Date.now());
            console.log(err);
            
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
		
	}
}