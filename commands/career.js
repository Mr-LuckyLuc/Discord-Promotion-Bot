const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js');

const fs = require('node:fs');
const { updateMessage } = require('../message');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('career')
		.setDescription('assign somebody to a career!'),
        
	async execute(interaction) {
        const client = interaction.client;
        const careers = client.careers;
        const enlisted = client.enlisted;

        const interacterId = interaction.member.user.id;
        
        // User ----------------

        const userSelect = new UserSelectMenuBuilder()
        .setCustomId("user")
        .setPlaceholder('Make a selection!');

        const userRow = new ActionRowBuilder()
        .addComponents(userSelect);
		
        // career ----------------

        const careerSelect = new StringSelectMenuBuilder()
			.setCustomId('career')
			.setPlaceholder('Make a selection!');
        
		for (const [career, _] of Object.entries(careers)) {

            careerSelect.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(career)
					.setDescription('Assign the person to ' + career )
					.setValue(career)
            );
        }

		const careerRow = new ActionRowBuilder()
			.addComponents(careerSelect);


		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Danger);

		const cancelRow = new ActionRowBuilder()
			.addComponents(cancel);

        // messages -------------------------------

        interaction.reply({
            content: `Who do you want to assign?`,
			components: [userRow, cancelRow],
        });


        try {
            const reply = await interaction.fetchReply();

            let userConfirmation = {member: {id: 0}};

            while (userConfirmation.member.id !== interacterId) userConfirmation = await reply.awaitMessageComponent({ time: 60_000 });

            if (userConfirmation.customId === 'user') {
                const enlisteeId = userConfirmation.values[0];
                const user = await interaction.guild.members.fetch(enlisteeId);
                const enlistee = enlisted[enlisteeId];

                if (enlisteeId == interaction.guild.ownerId) {
                    await userConfirmation.update({content: "No permission to change this soldier (server owner)", components: []});
                    return;
                }
                
                if (user.user.bot) {
                    await userConfirmation.update({content: "No permission to change this soldier (bot)", components: []});
                    return;
                }

                const oldcareer = interaction.guild.roles.cache.find(role => role.name === careers[enlistee.career]["role"]);

                userConfirmation.update({
                    content: `What career do you want to assign to?`,
                    components: [careerRow, cancelRow],
                });

                try {
                    const reply = await interaction.fetchReply();

                    let careerConfirmation = {member: {id: 0}};

                    while (careerConfirmation.member.id !== interacterId) careerConfirmation = await reply.awaitMessageComponent({ time: 60_000 });

                    
                    if (careerConfirmation.customId === 'career') {
                        const career = careerConfirmation.values[0];

                        try{

                            enlistee.career = career;
                            enlisted[enlisteeId] = enlistee;
                    
                            fs.writeFile("./enlisted.txt", JSON.stringify(enlisted), (err) => {
                                if(err){
                                    console.log(Date.now().toLocaleString("en-GB", { timeZone: "CET" }));
                                    console.log(err);
                                }else{
                                    console.log('career changed');
                                }
                            });
                            
                            const newCareer = await interaction.guild.roles.cache.find(role => role.name === careers[career]["role"]);
                            
                            user.roles.remove(oldcareer);
                            user.roles.add(newCareer);

                            updateMessage(client);

                            careerConfirmation.update({
                                content: `Changed <@${enlisteeId}>'s career to ${career}.`,
                                components: [],
                            });
                        } catch(err) {
                            console.log(Date.now().toLocaleString("en-GB", { timeZone: "CET" }));
                            console.log(err);
                            
                            await interaction.update("Something went wrong");
                        }

                    } else if (careerConfirmation.customId === 'cancel') {
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
            console.log(Date.now().toLocaleString("en-GB", { timeZone: "CET" }));
            console.log(err);
            
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
		
	}
}