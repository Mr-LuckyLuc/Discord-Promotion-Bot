export default function updateMessage(client) {
    const enlisted = client.enlisted;
    const ranks = client.ranks;
    const units = client.units;
    const careers = client.careers;
    
    const me = "540576751005466637"
    const companyLeaderFilter = ["Captain"]
    const companyStaffFilter = ["First Sergeant"]
    const platoonLeaderFilter = ["Lieutenant"]
    const platoonStaffFilter = ["Sergeant", "Corporal"]
    const seperatedUnits = ["Motala Helicopter Squadron, 1st", "Motala Helicopter Squadron, 2nd"]
    const seperatedCareers = ["Aircrew Specialist"]

    let message = "# 1st Light Cavalry Company \n"
    message += "__**Order of Battle**__ \n"

    const rankList = Object.keys(ranks);
    
    
    const reformatted = Object.entries(enlisted).map(arr => {arr[1].id = arr[0]; return arr[1]}).filter(enlistee => enlistee.active && !(enlistee.id === me))
    
    const companyLeader = reformatted.filter(enlistee => companyLeaderFilter.includes(enlistee.rank))
    const companyStaff = reformatted.filter(enlistee => companyLeaderFilter.includes(enlistee.rank)) //juck hardcoded

    for (const filter of companyLeaderFilter) {
        for (const person of companyLeader.filter(enlistee => enlistee.rank === filter)) {
            message += `**Company C.O\n **<@${person.id}> \n\n`
        }
    }

    message += "**Company Staff** \n"
    message += `<@${me}> \n`
    for (const filter of companyStaffFilter) {
        for (const person of companyStaff.filter(enlistee => enlistee.rank === filter)) {
            message += `<@${person.id}> \n`
        }
    }

    for (const unit of Object.keys(units).filter(unit => !seperatedUnits.includes(unit))) {
        message += `## __${unit}__\n`
        
        const platoon = reformatted.filter(enlistee => enlistee.unit === unit);
        const platoonLeader = platoon.filter(enlistee => platoonLeaderFilter.includes(enlistee.rank))
        const platoonStaff = platoon.filter(enlistee => platoonStaffFilter.includes(enlistee.rank))
        const rest = platoon.filter(enlistee => !companyLeaderFilter.includes(enlistee.rank) && !platoonLeaderFilter.includes(enlistee.rank) && !platoonStaffFilter.includes(enlistee.rank))
        
        for (const filter of platoonLeaderFilter) {
            for (const person of platoonLeader.filter(enlistee => enlistee.rank === filter)) {
                message += `**Platoon C.O\n** <@${person.id}> \n\n`
            }
        }

        message += "**Platoon Staff** \n"
        for (const filter of platoonStaffFilter) {
            for (const person of platoonStaff.filter(enlistee => enlistee.rank === filter)) {
                message += `<@${person.id}> \n`
            }
        }

        for (const career of Object.keys(careers).filter(career => !seperatedCareers.includes(career))) {
            const group = rest.filter(enlistee => enlistee.career===career)
            message += `### ${career}: ${group.length}\n`;

            for (const rank of rankList) {
                const people = group.filter(enlistee => enlistee.rank===rank)
                for (const person of people) {
                    message += `- <@${person.id}> \n`
                }
            }
        }

    }

    for (const unit of Object.keys(units).filter(unit => seperatedUnits.includes(unit))) {
        message += `## __${unit}__\n`

        const seperatedRest = reformatted.filter(enlistee => enlistee.unit === unit);

        for (const career of Object.keys(careers).filter(career => seperatedCareers.includes(career))) {
            const group = seperatedRest.filter(enlistee => enlistee.career===career)
            message += `### ${career}: ${group.length}\n`;

            for (const rank of rankList) {
                const people = group.filter(enlistee => enlistee.rank===rank)
                for (const person of people) {
                    message += `- <@${person.id}> \n`
                }
            }
        }

    }

    client.message?.edit(message)
    .then(() => console.log(`Updated the stats`))
    .catch(console.error);

    return message
}