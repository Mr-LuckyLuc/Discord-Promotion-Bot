const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js');

const fs = require('node:fs');
const { updateMessage } = require('../message');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('discharge')
		.setDescription('Discharge someone'),
        
	async execute(interaction) {

        const client = interaction.client;
        const ranks = client.ranks;
        const units = client.units;
        const careers = client.careers;
        const enlisted = client.enlisted;

        const interacterId = interaction.member.user.id;

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
            content: `Who do you want to discharge?`,
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
                
                enlistee.active = false;
                enlisted[enlisteeId] = enlistee;
        
                fs.writeFile("./enlisted.txt", JSON.stringify(enlisted), (err) => {
                    if(err){
                        console.log(Date.now());
                        console.log(err);
                    }else{
                        console.log('discharged');
                    }
                });

                const oldRank = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["rank role"]);
                const oldRankExtra = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["extra role"]);
                const staffPermissions = ranks[enlistee.rank]["staff permissions"]!=="" ? interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["staff permissions"]) : undefined;
                const oldUnit = interaction.guild.roles.cache.find(role => role.name === units[enlistee.unit]["unit role"]);
                const oldUnitExtra = units[enlistee.unit]["extra role"]!=="" ? interaction.guild.roles.cache.find(role => role.name === units[enlistee.unit]["extra role"]) : undefined;
                const oldCareer = interaction.guild.roles.cache.find(role => role.name === careers[enlistee.career]["role"]);
                const K3 = interaction.guild.roles.cache.find(role => role.name === "K3");
                const civ = interaction.guild.roles.cache.find(role => role.name === "Civ");

                user.roles.remove(oldRank);
                user.roles.remove(oldRankExtra);
                staffPermissions && user.roles.remove(staffPermissions);
                user.roles.remove(oldUnit);
                oldUnitExtra && user.roles.remove(oldUnitExtra);
                user.roles.remove(oldCareer);
                user.roles.remove(K3);
                user.roles.add(civ);

                await user.setNickname(enlisted[enlisteeId].nickname);

                updateMessage(client);

                userConfirmation.update({
                    content: `Discharged <@${enlisteeId}>.`,
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