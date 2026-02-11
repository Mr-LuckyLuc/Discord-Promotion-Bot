const {EmbedBuilder} = require('discord.js');

function updateMessage(client) {
    const enlisted = client.enlisted;
    const ranks = client.ranks;
    const units = client.units;
    const careers = client.careers;
    
    const me = "540576751005466637"
    const picture = "https://cdn.discordapp.com/attachments/1467595806419849219/1469732485339545690/K3_logo.webp" // ?ex=698c064a&is=698ab4ca&hm=950084da319177e8d69dd2f314c0977c090020f436bc32dcd5cef15f6bbba48a&
    const companyLeaderFilter = ["Captain"]
    const companyStaffFilter = ["First Sergeant"]
    const platoonLeaderFilter = ["Lieutenant"]
    const platoonStaffFilter = ["Sergeant", "Corporal"]
    const seperatedUnitsFilter = ["Motala Helicopter Squadron, 1st", "Motala Helicopter Squadron, 2nd"]
    const seperatedLeaderFilter = ["Lieutenant"]
    const seperatedCareerFilter = ["Aircrew Specialist"]

    let message = "# 1st Light Cavalry Company \n"
    message += "__**Order of Battle**__ \n"
    let embeds = []

    const rankList = Object.keys(ranks);
    
    const reformatted = Object.entries(enlisted).map(arr => {arr[1].id = arr[0]; return arr[1]}).filter(enlistee => enlistee.active && !(enlistee.id === me))
    
    const companyLeader = reformatted.filter(enlistee => companyLeaderFilter.includes(enlistee.rank))
    const companyStaff = reformatted.filter(enlistee => companyLeaderFilter.includes(enlistee.rank)) //juck hardcoded

    let embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle('Order of Battle')
				.setThumbnail(picture)
                
    for (const filter of companyLeaderFilter) {
        for (const person of companyLeader.filter(enlistee => enlistee.rank === filter)) {
            message += `**Company C.O\n **<@${person.id}> \n\n`
            embed.addFields({ name: 'Company C.O.', value: `<@${person.id}>`, inline: true})
        }
    }

    message += "**Company Staff** \n"
    message += `<@${me}> \n`
    let list = `<@${me}> \n`
    for (const filter of companyStaffFilter) {
        for (const person of companyStaff.filter(enlistee => enlistee.rank === filter)) {
            message += `<@${person.id}> \n`
            list += `<@${person.id}> \n`
        }
    }
    
    embed.addFields({ name: 'Company Staff', value: list})
    embeds.push(embed)

    for (const [unitName, unit] of Object.entries(units).filter(([unit, _]) => !seperatedUnitsFilter.includes(unit))) {
        message += `## __${unit["display name"]}__\n`
        embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`${unit["display name"]}`)
        
        const platoon = reformatted.filter(enlistee => enlistee.unit === unitName);
        const platoonLeader = platoon.filter(enlistee => platoonLeaderFilter.includes(enlistee.rank))
        const platoonStaff = platoon.filter(enlistee => platoonStaffFilter.includes(enlistee.rank))
        const rest = platoon.filter(enlistee => !companyLeaderFilter.includes(enlistee.rank) && !platoonLeaderFilter.includes(enlistee.rank) && !platoonStaffFilter.includes(enlistee.rank))
        
        for (const filter of platoonLeaderFilter) {
            for (const person of platoonLeader.filter(enlistee => enlistee.rank === filter)) {
                message += `**Platoon C.O\n** <@${person.id}> \n\n`
                embed.addFields({ name: 'Platoon C.O.', value: `<@${person.id}>`, inline: true})
            }
        }

        message += "**Platoon Staff** \n"
        list = ""
        for (const filter of platoonStaffFilter) {
            for (const person of platoonStaff.filter(enlistee => enlistee.rank === filter)) {
                message += `<@${person.id}> \n`
                list += `<@${person.id}> \n`
            }
        }
        if (list.length === 0) list = "     "
        embed.addFields({ name: 'Platoon Staff', value: list })

        for (const [careerName, career] of Object.entries(careers).filter(([career, _]) => !seperatedCareerFilter.includes(career))) {
            const group = rest.filter(enlistee => enlistee.career===careerName)
            message += `### ${career["display name"]} ${group.length}/${career.amount}\n`;
            list = ""

            for (const rank of rankList) {
                const people = group.filter(enlistee => enlistee.rank===rank)
                for (const person of people) {
                    message += `- <@${person.id}> \n`
                    list += `- <@${person.id}> \n`
                }
            }
            if (list.length === 0) list = "     "
            embed.addFields({ name: `${career["display name"]} ${group.length}/${career.amount}`, value: list })
        }
        embeds.push(embed)

    }

    for (const [unitName, unit] of Object.entries(units).filter(([unit, _]) => seperatedUnitsFilter.includes(unit))) {
        message += `## __${unit["display name"]}__\n`
        embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`${unit["display name"]}`)

        const seperated = reformatted.filter(enlistee => enlistee.unit === unitName);
        const seperatedLeader = seperated.filter(enlistee => seperatedLeaderFilter.includes(enlistee.rank))
        const seperatedRest = seperated.filter(enlistee => enlistee.unit === unitName);

        for (const filter of platoonLeaderFilter) {
            for (const person of seperatedLeader.filter(enlistee => enlistee.rank === filter)) {
                message += `**Flight Commander \n** <@${person.id}> \n\n`
                embed.addFields({ name: 'Flight Commander', value: `<@${person.id}>`, inline: true})
            }
        }

        for (const [careerName, career] of Object.entries(careers).filter(([career, _]) => seperatedCareerFilter.includes(career))) {
            const group = seperatedRest.filter(enlistee => enlistee.career===careerName)
            message += `### ${career["display name"]} ${group.length}/${career.amount}\n`;
            list = ""
            
            for (const rank of rankList) {
                const people = group.filter(enlistee => enlistee.rank===rank)
                for (const person of people) {
                    message += `- <@${person.id}> \n`
                    list += `- <@${person.id}> \n`
                }
            }
            if (list.length === 0) list = "     "
            embed.addFields({ name: `${career["display name"]} ${group.length}/${career.amount}`, value: list })
        }
        embeds.push(embed)

    }
    
    client.message?.edit({ embeds: embeds })
    .catch(console.error);

    return message
}

module.exports = {
    updateMessage
};