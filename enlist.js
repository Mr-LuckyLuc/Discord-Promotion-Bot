const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enlist')
		.setDescription('enlist someone'),
        
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
        .addComponents(userSelect)

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger);

        const cancelRow = new ActionRowBuilder()
            .addComponents(cancel);

        interaction.reply({
            content: `Who do you want to enlist?`,
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

                console.log('enlisted');

                const rank = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["rank role"]);
                const rankExtra = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["extra role"]);
                const staffPermissions = ranks[enlistee.rank]["staff permissions"]!=="" ? interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["staff permissions"]) : undefined;
                const unit = interaction.guild.roles.cache.find(role => role.name === units[enlistee.unit]["unit role"]);
                const unitExtra = units[enlistee.unit]["extra role"]!=="" ? interaction.guild.roles.cache.find(role => role.name === units[enlistee.unit]["extra role"]) : undefined;
                const career = interaction.guild.roles.cache.find(role => role.name === careers[enlistee.career]["role"]);
                const K3 = interaction.guild.roles.cache.find(role => role.name === "K3");
                const civ = interaction.guild.roles.cache.find(role => role.name === "Civ");

                user.roles.add(rank);
                user.roles.add(rankExtra);
                staffPermissions && user.roles.add(staffPermissions);
                user.roles.add(unit);
                unitExtra && user.roles.add(unitExtra);
                user.roles.add(career);
                user.roles.add(K3);
                user.roles.remove(civ);

                await user.setNickname(units[enlistee.unit]["unit tag"] + ' ' + ranks[enlistee.rank]["rank tag"] + ' ' + enlistee.nickname)

                userConfirmation.update({
                    content: `Enlisted <@${enlisteeId}>.`,
                    components: [],
                });

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