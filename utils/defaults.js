const RANKDEFAULTS = {
        "Recruit": {
            "rank tag": "RCT.",
            "rank role": "Recruit",
            "extra roles": ["Enlisted"]
        },
        "Private": {
            "rank tag": "PVT.",
            "rank role": "Private",
            "extra roles": ["Enlisted"]
        },
        "Sergeant": {
            "rank tag": "SGT.",
            "rank role": "Sergeant",
            "extra roles": ["Enlisted"]
        },
        "Lieutenant": {
            "rank tag": "LT.",
            "rank role": "Lieutenant",
            "extra roles": ["Officer"]
        }
    }

const UNITDEFAULTS = {
        "1st Platoon": {
            "career tag": "[1]",
            "career role": "1st Platoon",
            "extra roles": []
        }
    }

const CAREERDEFAULTS = {
        "Rifleman": {
            "career tag": "",
            "career role": "Rifleman",
            "extra roles": []
        },
        "Vehicle Specialist": {
            "career tag": "",
            "career role": "Vehicle Specialist",
            "extra roles": []
        },
        "Pilot": {
            "career tag": "",
            "career role": "Pilot",
            "extra roles": []
        },
    }

const SETTINGSDEFAULTS = {
        "civilian role": "Civilian",
        "employee role": "Soldier",
        "autoroles": [],
        "nickname prefixes": ["unit", "rank"],
        "available commands": ["nickname", "rank", "unit", "career", "enlist", "discharge", "show", "update", "reload"]
    }

const STATSDEFAULT = {
        "title": "Company Statistics",
        "sections": [{
                "title": "Leadership",
                "image": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fclipart-library.com%2Fimg%2F1841735.jpg&f=1&nofb=1&ipt=a2b473edcc156b39b04980f7a4eab5b83c90c79ce42c163be84b94d919af08db",
                "subsections": [
                    {
                        "name": "Company Leader: ",
                        "content": "",
                        "filter": {
                            "rank": ["Lieutenant"],
                            "unit": [],
                            "career": []
                        },
                        "inline": true
                    }
                ]
            },
            {
                "title": "1st Platoon",
                "image": "",
                "subsections": [
                    {
                        "name": "Riflemen",
                        "content": "",
                        "filter": {
                            "rank": ["Sergeant", "Private"],
                            "unit": ["1st Platoon"],
                            "career": ["Rifleman"]
                        }
                    },
                    {
                        "name": "Vehicle Specialists",
                        "content": "",
                        "filter": {
                            "rank": ["Sergeant", "Private"],
                            "unit": ["1st Platoon"],
                            "career": ["Vehicle Specialists"]
                        }
                    },
                    {
                        "name": "Pilots",
                        "content": "",
                        "filter": {
                            "rank": ["Sergeant", "Private"],
                            "unit": ["1st Platoon"],
                            "career": ["Pilots"]
                        }
                    }
                ]
            }
        ]
    }

module.exports = {
    RANKDEFAULTS,
    UNITDEFAULTS,
    CAREERDEFAULTS,
    SETTINGSDEFAULTS,
    STATSDEFAULT
}