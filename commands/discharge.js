const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js');

const { updateMessage } = require('../utils/message');
const { unpackInteraction, updateEnlisted } = require('../utils/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('discharge')
		.setDescription('Discharge someone'),
        
	async execute(interaction) {
        
        const [, ranks, units, careers, settings, enlisted, guildId, interacterId] = unpackInteraction(interaction);

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
                const enlistee = enlisted[enlisteeId];

                if (enlisteeId == interaction.guild.ownerId) {
                    await userConfirmation.update({content: "No permission to change this soldier (server owner)", components: []});
                    return;
                }
                
                if (user.user.bot) {
                    await userConfirmation.update({content: "No permission to change this soldier (bot)", components: []});
                    return;
                }

                if (Object.keys(ranks).indexOf(ranks[interacterId].rank) <= Object.keys(ranks).indexOf(enlistee.rank)) {
                    interaction.editReply("They are to high rank for you to change them.");
                    return
                }
                
                
                enlistee.active = false;
                enlisted[enlisteeId] = enlistee;
        
                updateEnlisted(enlisted, guildId, 'discharged');

                const oldRank = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["rank role"]);
                const oldRankExtras = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["extra roles"]);
                const oldUnit = interaction.guild.roles.cache.find(role => role.name === units[enlistee.unit]["unit role"]);
                const oldUnitExtras = interaction.guild.roles.cache.find(role => role.name in units[enlistee.unit]["extra roles"]);
                const oldCareer = interaction.guild.roles.cache.find(role => role.name === careers[enlistee.career]["career role"]);
                const oldCareerExtras = interaction.guild.roles.cache.find(role => role.name in careers[enlistee.career]["extra roles"]);
                const employee = interaction.guild.roles.cache.find(role => role.name === settings["employee role"]);
                const civ = interaction.guild.roles.cache.find(role => role.name === settings["civilian role"]);

                if (!oldRank || !oldUnit || !oldCareer || !civ || !employee) {
                    await interaction.editReply({content: "You are missing one of the roles, check with the /show command", components: []});
                    return;
                }

                user.roles.remove(oldRank);
                user.roles.remove(oldRankExtras);
                user.roles.remove(oldUnit);
                user.roles.remove(oldUnitExtras);
                user.roles.remove(oldCareer);
                user.roles.remove(oldCareerExtras);
                user.roles.remove(employee);
                user.roles.add(civ);

                await user.setNickname(enlisted[enlisteeId].nickname);

                updateMessage(interaction);

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