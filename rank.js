const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js');
const { log } = require('node:console');

const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Promote somebody!'),
        
	async execute(interaction) {
        const client = interaction.client;
        const ranks = client.ranks;
        const units = client.units;
        const enlisted = client.enlisted;

        const interacterId = interaction.member.user.id;
        const promoterRank = enlisted[interacterId].rank;
        let underranked = false;

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

            if ((rank === promoterRank) || (underranked))  {
                underranked = true;
                continue;
            }

            

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

            let userConfirmation = {member: {id: 0}}

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

                const oldRank = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["rank role"]);
                const oldExtra = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["extra role"]);


                userConfirmation.update({
                    content: `What rank do you want to promote to?`,
                    components: [rankRow, cancelRow],
                })

                try {
                    const reply = await interaction.fetchReply();

                    let rankConfirmation = {member: {id: 0}}

                    while (rankConfirmation.member.id !== interacterId) rankConfirmation = await reply.awaitMessageComponent({ time: 60_000 });
                    
                    if (rankConfirmation.customId === 'rank') {
                        const rank = rankConfirmation.values[0];

                        try{

                            enlistee.rank = rank;
                            enlistee.active = true;
                            enlisted[enlisteeId] = enlistee;
                    
                            fs.writeFile("./enlisted.txt", JSON.stringify(enlisted), (err) => {
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log('rank changed');
                                }
                            });
                            
                            const newRank = await interaction.guild.roles.cache.find(role => role.name === ranks[rank]["rank role"]);
                            const newExtra = await interaction.guild.roles.cache.find(role => role.name === ranks[rank]["extra role"]);
                            const staffPermissions = await ranks[rank]["staff permissions"]!=="" ? interaction.guild.roles.cache.find(role => role.name === ranks[rank]["staff permissions"]) : undefined;
                            const K3 = await interaction.guild.roles.cache.find(role => role.name === "K3");
                            const civ = await interaction.guild.roles.cache.find(role => role.name === "Civ");
                            
                            user.roles.remove(oldRank);
                            user.roles.add(newRank);

                            staffPermissions && user.roles.add(staffPermissions);

                            user.roles.remove(oldExtra);
                            user.roles.add(newExtra);

                            user.roles.add(K3);
                            user.roles.remove(civ);

                            await user.setNickname(units[enlisted[enlisteeId].unit]["unit tag"] + ' ' + ranks[rank]["rank tag"] + ' ' + enlisted[enlisteeId].nickname)

                            rankConfirmation.update({
                                content: `Changed <@${enlisteeId}>'s rank to ${rank}.`,
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