const users = [
  {
    user_id: "100-000-001",
    type: "community",
    fullname: {
      lastname: "Doe",
      firstname: "John",
      middlename: "Miles",
    },
    username: "johndoe",
    address: "123 Main St, Springfield",
    phone_number: "123-456-7890",
    birthdate: "1990-01-01",
    email: "johndoe@gmail.com",
    password: "password123",
    photo_id: null,
    reports: 1
  },
  {
    user_id: "100-000-002",
    type: "community",
    fullname: {
      lastname: "Sumanting",
      firstname: "Azel",
      middlename: "Ventura",
    },
    username: "azelsumanting",
    address: "Bulihan, Silang, Cavite",
    phone_number: "920-853-7663",
    birthdate: "2002-10-12",
    email: "azel.sumanting@gmail.com",
    password: "123456",
    photo_id: null,
    reports: 1
  },
  {
    user_id: "100-000-007",
    type: "community",
    fullname: {
        lastname: "Castillo",
        firstname: "Nino Angelo",
        middlename: ""
    },
    username: "nyong",
    address: "Naic, Cavite",
    phone_number: "111-222-3333",
    birthdate: "1992-04-20",
    email: "nino.castillo@gmail.com",
    password: "nyong",
    photo_id: null,
    reports: 1
  },
  {
    user_id: "100-000-008",
    type: "community",
    fullname: {
        lastname: "Blancaflor",
        firstname: "Denielle Ivan",
        middlename: "Longa"
    },
    username: "akosiivan",
    address: "Nakatira ako sa kuweba",
    phone_number: "921-927-2960",
    birthdate: "1988-12-15",
    email: "ivan.blancaflor@gmail.com",
    password: "ivan",
    photo_id: null,
    reports: 0
  },
  {
    user_id: "100-000-009",
    type: "community",
    fullname: {
        lastname: "Cabildo",
        firstname: "Jay Bryan",
        middlename: ""
    },
    username: "jaybryan",
    address: "888 Pine Lane, Springfield",
    phone_number: "777-888-9999",
    birthdate: "1995-08-10",
    email: "jay.cabildo@gmail.com",
    password: "jay",
    photo_id: null,
    reports: 1
  },
  {
    user_id: "100-000-011",
    type: "community",
    fullname: {
        lastname: "Lin",
        firstname: "Erin",
        middlename: "Dy"
    },
    username: "erinlols",
    address: "333 Oak Lane, Springfield",
    phone_number: "555-666-7777",
    birthdate: "2003-01-08",
    email: "erin.lui@gmail.com",
    password: "lui",
    photo_id: null,
    reports: 1
  },
  {
    user_id: "100-000-523",
    type: "community",
    fullname: {
        lastname: "Villanueva",
        firstname: "Emilia",
        middlename: "Kojima"
    },
    username: "millaaa",
    address: "111 Pine Lane, Springfield",
    phone_number: "777-888-9999",
    birthdate: "2003-05-23",
    email: "emilia.villanueva@gmail.com",
    password: "moji",
    photo_id: null,
    reports: 2
  }, 
  {
    user_id: "201-000-002",
    type: "responder",
    fullname: {
      lastname: "Smith",
      firstname: "Jane",
      middlename: "A",
    },
    username: "janesmith@respo",
    address: "456 Elm St, Springfield",
    phone_number: "987-654-3210",
    birthdate: "1985-05-15",
    organization: {
      name: "Springfield Fire Department",
      address: "789 Oak St, Springfield",
      location: { latitude: 37.7749, longitude: -122.4194 },
      type: "fire_station",
    },
    email: "janesmith@gmail.com",
    password: "password456",
    photo_id: null,
    reports: 0
  },
  {
    user_id: "201-000-003",
    type: "responder",
    fullname: {
      lastname: "Sumanting",
      firstname: "Azel",
      middlename: "Ventura",
    },
    username: "sumanting@respo",
    address: "Bulihan, Silang Cavite",
    phone_number: "920-853-7663",
    birthdate: "2002-10-12",
    organization: {
      name: "Dasmarinas City",
      address: "Zone 4, Central Market Ave, Dasmariñas, Cavite",
      location: { latitude: 14.322286406013484, longitude: 120.94416678974966 },
      type: "fire_station",
    },
    email: "sumantingazel@gmail.com",
    password: "123456",
    photo_id: null,
    reports: 0
  }
];

export default users;
