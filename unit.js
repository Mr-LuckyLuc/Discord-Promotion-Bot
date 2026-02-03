const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js');
const { log } = require('node:console');

const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unit')
		.setDescription('assign somebody to a unit!'),
        
	async execute(interaction) {
        const client = interaction.client;
        const ranks = client.ranks;
        const units = client.units;
        const enlisted = client.enlisted;

        // User ----------------

        const userSelect = new UserSelectMenuBuilder()
        .setCustomId("user")
        .setPlaceholder('Make a selection!');

        const userRow = new ActionRowBuilder()
        .addComponents(userSelect)
		
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
            )
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
            
            let userConfirmation = {member: {id: 0}}

            while (userConfirmation.member.id !== interacterId) userConfirmation = await reply.awaitMessageComponent({ time: 60_000 });

            if (userConfirmation.customId === 'user') {
                const enlisteeId = userConfirmation.values[0];
                const user = await interaction.guild.members.fetch(enlisteeId);
                const enlistee = enlisted[enlisteeId];

                const oldUnit = interaction.guild.roles.cache.find(role => role.name === units[enlistee.unit]["unit role"]);
                const oldExtra = units[enlistee.unit]["extra role"]!=="" ? interaction.guild.roles.cache.find(role => role.name === units[enlistee.unit]["extra role"]) : undefined;

                if (enlisteeId == interaction.guild.ownerId) {
                    await userConfirmation.update({content: "No permission to change this soldier (server owner)", components: []});
                    return;
                }

                userConfirmation.update({
                    content: `What unit do you want to transfer to?`,
                    components: [unitRow, cancelRow],
                })

                try {
                    const reply = await interaction.fetchReply();
                    
                    let unitConfirmation = {member: {id: 0}}

                    while (unitConfirmation.member.id !== interacterId) unitConfirmation = await reply.awaitMessageComponent({ time: 60_000 });

                    
                    if (unitConfirmation.customId === 'unit') {
                        const unit = unitConfirmation.values[0];

                        try{

                            enlistee.unit = unit;
                            enlisted[enlisteeId] = enlistee;
                    
                            fs.writeFile("./enlisted.txt", JSON.stringify(enlisted), (err) => {
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log('unit changed');
                                }
                            });
                            
                            const newUnit = await interaction.guild.roles.cache.find(role => role.name === units[unit]["unit role"]);
                            const newExtra = units[unit]["extra role"]!=="" ? interaction.guild.roles.cache.find(role => role.name === units[enlistee.unit]["extra role"]) : undefined;
                            
                            user.roles.remove(oldUnit);
                            user.roles.add(newUnit);

                            oldExtra && user.roles.remove(oldExtra);
                            newExtra && user.roles.add(newExtra);
                            
                            await user.setNickname(units[unit]["unit tag"] + ' ' + ranks[enlisted[enlisteeId].rank]["rank tag"] + ' ' + enlisted[enlisteeId].nickname)

                            unitConfirmation.update({
                                content: `Changed ${enlisted[enlisteeId].nickname}'s unit to ${unit}.`,
                                components: [],
                            });
                        } catch(err) {
                            console.log(err);
                            
                            await interaction.update("Something went wrong")
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
            console.log(err);
            
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
		
	}
}