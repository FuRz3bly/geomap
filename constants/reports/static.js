let reports = [
    {
        id: 123456789,
        status: "waiting",
        time: "6:32:23 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-001",
            name: "John Miles Doe",
            username: "johndoe",
            address: "123 Main St, Springfield",
            phone_number: "123-456-7890",
            birthdate: "1990-01-01",
            photo_id: null
        },
        latitude: 14.280289476946388,
        longitude: 120.99322984482292,
        address: "Silang, Calabarzon, Philippines",
        type: "fire_rescue",
        handler: "fire_station",
        services: ["ambulance"],
        photos: [
            {
                location: [{
                    latitude: 14.9282,
                    longitude: 120.9892,
                    address: "Silang Calabarzon, Philippines"
                }],
                timestamp: "2024-07-05, 6:32:39 AM",
                uri: "picture1.png"
            },
            {
                location: [{
                    latitude: 14.9283,
                    longitude: 120.9893,
                    address: "Silang Calabarzon, Philippines"
                }],
                timestamp: "2024-07-05, 6:32:45 AM",
                uri: "picture2.png"
            },
            {
                location: [{
                    latitude: 14.9283,
                    longitude: 120.9893,
                    address: "Silang Calabarzon, Philippines"
                }],
                timestamp: "2024-07-05, 6:32:47 AM",
                uri: "picture3.png"
            },
        ]
    },
    {
        id: 987654321,
        status: "preliminary",
        time: "6:35:15 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-102",
            name: "Emily Grace Smith",
            username: "emilysmith",
            address: "456 Oak Ave, Springfield",
            phone_number: "987-654-3210",
            birthdate: "1985-03-15",
            photo_id: null
        },
        latitude: 14.279451233485787,
        longitude: 120.9930381307285,
        address: "Silang, Calabarzon, Philippines",
        type: "vehicular_fire",
        handler: "fire_station",
        services: ["ambulance", "firetruck"],
        photos: [
            {
                location: {
                    latitude: 14.9281,
                    longitude: 120.9895,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:35:30 AM",
                uri: "picture4.png"
            },
            {
                location: {
                    latitude: 14.9281,
                    longitude: 120.9895,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:35:40 AM",
                uri: "picture5.png"
            },
            {
                location: {
                    latitude: 14.9281,
                    longitude: 120.9895,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:35:50 AM",
                uri: "picture6.png"
            }
        ]
    },
    {
        id: 246810753,
        status: "receive",
        time: "6:37:00 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-003",
            name: "David Michael Brown",
            username: "davidbrown",
            address: "789 Pine Rd, Springfield",
            phone_number: "456-789-0123",
            birthdate: "1978-09-25",
            photo_id: null
        },
        latitude: 14.280012977164612,
        longitude: 120.992426901133,
        address: "Silang, Calabarzon, Philippines",
        type: "wildfire",
        handler: "fire_station",
        services: ["ambulance", "firetruck"],
        photos: [
            {
                location: {
                    latitude: 14.9280,
                    longitude: 120.9894,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:37:15 AM",
                uri: "picture7.png"
            },
            {
                location: {
                    latitude: 14.9280,
                    longitude: 120.9894,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:37:20 AM",
                uri: "picture8.png"
            },
            {
                location: {
                    latitude: 14.9280,
                    longitude: 120.9894,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:37:25 AM",
                uri: "picture9.png"
            }
        ]
    },
    {
        id: 135792468,
        status: "arrived",
        time: "6:38:45 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-004",
            name: "Sarah Elizabeth Johnson",
            username: "sarahjohnson",
            address: "321 Elm St, Springfield",
            phone_number: "789-012-3456",
            birthdate: "1993-07-12",
            photo_id: null
        },
        latitude: 14.28055832621071,
        longitude: 120.99283401160672,
        address: "Silang, Calabarzon, Philippines",
        type: "structural_fire",
        handler: "fire_station",
        services: ["ambulance", "firetruck"],
        photos: [
            {
                location: {
                    latitude: 14.9279,
                    longitude: 120.9896,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:39:00 AM",
                uri: "picture10.png"
            },
            {
                location: {
                    latitude: 14.9279,
                    longitude: 120.9896,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:39:05 AM",
                uri: "picture11.png"
            },
            {
                location: {
                    latitude: 14.9279,
                    longitude: 120.9896,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:39:10 AM",
                uri: "picture12.png"
            }
        ]
    },
    {
        id: 369258147,
        status: "waiting",
        time: "6:40:30 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-005",
            name: "Michael James Wilson",
            username: "michaelwilson",
            address: "567 Maple Dr, Springfield",
            phone_number: "234-567-8901",
            birthdate: "1980-12-03",
            photo_id: null
        },
        latitude: 14.280715701238753,
        longitude: 120.99347456219972,
        address: "Silang, Calabarzon, Philippines",
        type: "explosion",
        handler: "fire_station",
        services: ["ambulance", "firetruck"],
        photos: [
            {
                location: {
                    latitude: 14.9282,
                    longitude: 120.9893,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:40:45 AM",
                uri: "picture13.png"
            },
            {
                location: {
                    latitude: 14.9282,
                    longitude: 120.9893,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:40:50 AM",
                uri: "picture14.png"
            },
            {
                location: {
                    latitude: 14.9282,
                    longitude: 120.9893,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:40:55 AM",
                uri: "picture15.png"
            }
        ]
    },
    {
        id: 574839201,
        status: "preliminary",
        time: "6:42:15 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-006",
            name: "Emma Olivia Taylor",
            username: "emmataylor",
            address: "987 Cedar Lane, Springfield",
            phone_number: "345-678-9012",
            birthdate: "1987-06-08",
            photo_id: null
        },
        latitude: 14.280329913646563,
        longitude: 120.99367868133258,
        address: "Silang, Calabarzon, Philippines",
        type: "fire_rescue",
        handler: "fire_station",
        services: ["ambulance", "firetruck"],
        photos: [
            {
                location: {
                    latitude: 14.9283,
                    longitude: 120.9892,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:42:30 AM",
                uri: "picture16.png"
            },
            {
                location: {
                    latitude: 14.9283,
                    longitude: 120.9892,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:42:35 AM",
                uri: "picture17.png"
            },
            {
                location: {
                    latitude: 14.9283,
                    longitude: 120.9892,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:42:40 AM",
                uri: "picture18.png"
            }
        ]
    },
    {
        id: 987654322,
        status: "preliminary",
        time: "6:50:00 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-007",
            name: "Nino Castillo",
            username: "ninocastillo",
            address: "555 Cherry Lane, Springfield",
            phone_number: "111-222-3333",
            birthdate: "1992-04-20",
            photo_id: null
        },
        latitude: 14.279767077866527,
        longitude: 120.99356478064387,
        address: "Silang, Calabarzon, Philippines",
        type: "structural_fire",
        handler: "fire_station",
        services: ["ambulance", "firetruck"],
        photos: [
            {
                location: {
                    latitude: 14.9278,
                    longitude: 120.9897,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:50:15 AM",
                uri: "picture19.png"
            },
            {
                location: {
                    latitude: 14.9278,
                    longitude: 120.9897,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:50:20 AM",
                uri: "picture20.png"
            },
            {
                location: {
                    latitude: 14.9278,
                    longitude: 120.9897,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 6:50:25 AM",
                uri: "picture21.png"
            }
        ]
    },
    {
        id: 987654323,
        status: "waiting",
        time: "7:05:00 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-008",
            name: "Ivan Longa Blancaflor",
            username: "akosiivan",
            address: "Nakatira ako sa kuweba",
            phone_number: "921-927-2960",
            birthdate: "1988-12-15",
            photo_id: null
        },
        latitude: 14.27934522333273,
        longitude: 120.99289941996217,
        address: "Silang, Calabarzon, Philippines",
        type: "vehicular_fire",
        handler: "fire_station",
        services: ["ambulance", "firetruck"],
        photos: [
            {
                location: {
                    latitude: 14.9284,
                    longitude: 120.9891,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 7:05:15 AM",
                uri: "picture22.png"
            },
            {
                location: {
                    latitude: 14.9284,
                    longitude: 120.9891,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 7:05:20 AM",
                uri: "picture23.png"
            },
            {
                location: {
                    latitude: 14.9284,
                    longitude: 120.9891,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 7:05:25 AM",
                uri: "picture24.png"
            }
        ]
    },
    {
        id: 987654324,
        status: "arrived",
        time: "7:20:00 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-009",
            name: "Jay Bryan Cabildo",
            username: "jaybryan",
            address: "888 Pine Lane, Springfield",
            phone_number: "777-888-9999",
            birthdate: "1995-08-10",
            photo_id: null
        },
        latitude: 14.279399867747163,
        longitude: 120.99236600368292,
        address: "Silang, Calabarzon, Philippines",
        type: "wildfire",
        handler: "fire_station",
        services: ["ambulance", "firetruck"],
        photos: [
            {
                location: {
                    latitude: 14.9285,
                    longitude: 120.9890,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 7:20:15 AM",
                uri: "picture25.png"
            },
            {
                location: {
                    latitude: 14.9285,
                    longitude: 120.9890,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 7:20:20 AM",
                uri: "picture26.png"
            },
            {
                location: {
                    latitude: 14.9285,
                    longitude: 120.9890,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 7:20:25 AM",
                uri: "picture27.png"
            }
        ]
    },
    {
        id: 987654325,
        status: "preliminary",
        time: "7:35:00 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-002",
            name: "Azel Sumanting",
            username: "azelsumanting",
            address: "Bulihan, Silang Cavite",
            phone_number: "920-853-7663",
            birthdate: "2002-10-12",
            photo_id: null
        },
        latitude: 14.279360523767616,
        longitude: 120.9932287170667,
        address: "Silang, Calabarzon, Philippines",
        type: "fire_rescue",
        handler: "fire_station",
        services: ["ambulance", "firetruck"],
        photos: [
            {
                location: {
                    latitude: 14.9286,
                    longitude: 120.9889,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 7:35:15 AM",
                uri: "picture28.png"
            },
            {
                location: {
                    latitude: 14.9286,
                    longitude: 120.9889,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 7:35:20 AM",
                uri: "picture29.png"
            },
            {
                location: {
                    latitude: 14.9286,
                    longitude: 120.9889,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 7:35:25 AM",
                uri: "picture30.png"
            }
        ]
    },
    {
        id: 987654326,
        status: "waiting",
        time: "7:50:00 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-011",
            name: "Erin Dy Lin",
            username: "erinlols",
            address: "333 Oak Lane, Springfield",
            phone_number: "555-666-7777",
            birthdate: "2003-01-08",
            photo_id: null
        },
        latitude: 14.27968292559877,
        longitude: 120.99375198379178,
        address: "Silang, Calabarzon, Philippines",
        type: "explosion",
        handler: "fire_station",
        services: ["ambulance", "firetruck"],
        photos: [
            {
                location: {
                    latitude: 14.9287,
                    longitude: 120.9898,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 7:50:15 AM",
                uri: "picture31.png"
            },
            {
                location: {
                    latitude: 14.9287,
                    longitude: 120.9898,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 7:50:20 AM",
                uri: "picture32.png"
            },
            {
                location: {
                    latitude: 14.9287,
                    longitude: 120.9898,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 7:50:25 AM",
                uri: "picture33.png"
            }
        ]
    },
    {
        id: 987654327,
        status: "preliminary",
        time: "8:05:00 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-523",
            name: "Emilia Villanueva",
            username: "millaaa",
            address: "111 Pine Lane, Springfield",
            phone_number: "777-888-9999",
            birthdate: "2003-05-23",
            photo_id: null
        },
        latitude: 14.280053413917317,
        longitude: 120.99381851986162,
        address: "Silang, Calabarzon, Philippines",
        type: "vehicular_fire",
        handler: "fire_station",
        services: ["ambulance", "firetruck"],
        photos: [
            {
                location: {
                    latitude: 14.9288,
                    longitude: 120.9897,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 8:05:15 AM",
                uri: "accident1.png"
            },
            {
                location: {
                    latitude: 14.9288,
                    longitude: 120.9897,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 8:05:20 AM",
                uri: "accident2.png"
            },
            {
                location: {
                    latitude: 14.9288,
                    longitude: 120.9897,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 8:05:25 AM",
                uri: "accident3.png"
            }
        ]
    },
    {
        id: 987654328,
        status: "waiting",
        time: "8:20:00 AM",
        date: "2024-07-05",
        user: {
            user_id: "100-000-523",
            name: "Emilia Villanueva",
            username: "millaaa",
            address: "111 Pine Lane, Springfield",
            phone_number: "777-888-9999",
            birthdate: "2003-05-23",
            photo_id: null
        },
        latitude: 14.280821710749311,
        longitude: 120.99413315651074,
        address: "Silang, Calabarzon, Philippines",
        type: "fire_rescue",
        handler: "fire_station",
        services: ["ambulance", "firetruck"],
        photos: [
            {
                location: {
                    latitude: 14.9289,
                    longitude: 120.9896,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 8:20:15 AM",
                uri: "accident4.png"
            },
            {
                location: {
                    latitude: 14.9289,
                    longitude: 120.9896,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 8:20:20 AM",
                uri: "accident5.png"
            },
            {
                location: {
                    latitude: 14.9289,
                    longitude: 120.9896,
                    address: "Silang Calabarzon, Philippines"
                },
                timestamp: "2024-07-05, 8:20:25 AM",
                uri: "accident6.png"
            }
        ]
    }
]

export const getReports = () => reports;

export const addReport = (newReport) => {
    reports.push(newReport);
};