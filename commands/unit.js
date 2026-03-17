const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js');

const { updateMessage } = require('../message');
const { unpackInteraction, updateEnlisted, updateNickname } = require('../functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unit')
		.setDescription('assign somebody to a unit!'),
        
	async execute(interaction) {
        
        const [, ranks, units, , , enlisted, guildId, interacterId] = unpackInteraction(interaction);

        // User ----------------

        const userSelect = new UserSelectMenuBuilder()
        .setCustomId("user")
        .setPlaceholder('Make a selection!');

        const userRow = new ActionRowBuilder()
        .addComponents(userSelect);
		
        // Rank ----------------

        const unitSelect = new StringSelectMenuBuilder()
			.setCustomId('unit')
			.setPlaceholder('Make a selection!');
        
		for (const [unit, _] of Object.entries(units)) {
            unitSelect.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(unit)
					.setDescription('Assign the person to ' + unit )
					.setValue(unit)
            );
        }

		const unitRow = new ActionRowBuilder()
			.addComponents(unitSelect);


		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Danger);

		const cancelRow = new ActionRowBuilder()
			.addComponents(cancel);

    // messages -------------------------------

        interaction.reply({
            content: `Who do you want to transfer?`,
			components: [userRow, cancelRow],
        });


        try {
            const reply = await interaction.fetchReply();
            
            let userConfirmation = {member: {id: 0}};

            while (userConfirmation.member.id !== interacterId) userConfirmation = await reply.awaitMessageComponent({ time: 60_000 });

            if (userConfirmation.customId === 'user') {
                const enlisteeId = userConfirmation.values[0];
                const enlistee = enlisted[enlisteeId];
                const member = await interaction.guild.members.fetch(enlisteeId);

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

                const oldUnit = interaction.guild.roles.cache.find(role => role.name === units[enlistee.unit]["unit role"]);
                const oldExtras = units[enlistee.unit]["extra role"]!=="" ? interaction.guild.roles.cache.find(role => role.name === units[enlistee.unit]["extra roles"]) : undefined;

                userConfirmation.update({
                    content: `What unit do you want to transfer to?`,
                    components: [unitRow, cancelRow],
                });

                try {
                    const reply = await interaction.fetchReply();
                    
                    let unitConfirmation = {member: {id: 0}};

                    while (unitConfirmation.member.id !== interacterId) unitConfirmation = await reply.awaitMessageComponent({ time: 60_000 });

                    
                    if (unitConfirmation.customId === 'unit') {
                        const unit = unitConfirmation.values[0];

                        try{

                            enlistee.unit = unit;
                            enlisted[enlisteeId] = enlistee;
                    
                            updateEnlisted(enlisted, guildId, 'unit changed');
                            
                            const newUnit = await interaction.guild.roles.cache.find(role => role.name === units[unit]["unit role"]);
                            const newExtras = interaction.guild.roles.cache.find(role => role.name === units[enlistee.unit]["extra roles"]);
                            
                            try{
                                member.roles.remove(oldUnit);
                                member.roles.remove(oldExtras);

                                member.roles.add(newUnit);
                                member.roles.add(newExtras);
                            } catch (err) {
                                await interaction.update("You are missing one of the roles, check with the /show command");
                            }
                            
                            updateNickname(member);
                            updateMessage(interaction);

                            unitConfirmation.update({
                                content: `Changed <@${enlisteeId}>'s unit to ${unit}.`,
                                components: [],
                            });
                        } catch(err) {
                            console.log(Date.now());
                            console.log(err);
                            
                            await interaction.update("Something went wrong");
                        }

                    } else if (unitConfirmation.customId === 'cancel') {
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