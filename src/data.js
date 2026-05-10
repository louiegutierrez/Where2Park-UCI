export const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const permitRates = {
  s: { name: '"S" Zone Commuter', day: 16, week: 40, month: 81 },
  p: { name: '"P" Preferred Zone Commuter', day: 20, week: 49, month: 101 },
  e: { name: '"E" Evening', month: 48 },
  oneDay: { name: "One Day General", day: 16 }
};

export const buildings = [
  {
    id: "ics",
    name: "Information and Computer Science",
    short: "ICS",
    lat: 33.6435,
    lng: -117.8426,
    aliases: ["ics", "information and computer science", "ics building", "ics 1", "ics 2"]
  },
  {
    id: "dbh",
    name: "Donald Bren Hall",
    short: "DBH",
    lat: 33.6431,
    lng: -117.8422,
    aliases: ["dbh", "donald bren hall", "bren hall"]
  },
  {
    id: "eg",
    name: "Engineering Gateway",
    short: "EG",
    lat: 33.6439,
    lng: -117.8414,
    aliases: ["eg", "engineering gateway", "engineering gateway 3161"]
  },
  {
    id: "et",
    name: "Engineering Tower",
    short: "ET",
    lat: 33.6444,
    lng: -117.841,
    aliases: ["et", "engineering tower"]
  },
  {
    id: "alp",
    name: "Anteater Learning Pavilion",
    short: "ALP",
    lat: 33.6451,
    lng: -117.8443,
    aliases: ["alp", "anteater learning pavilion"]
  },
  {
    id: "ssl",
    name: "Social Science Lab",
    short: "SSL",
    lat: 33.6472,
    lng: -117.8404,
    aliases: ["ssl", "social science lab", "social science laboratory"]
  },
  {
    id: "sslh",
    name: "Social Science Lecture Hall",
    short: "SSLH",
    lat: 33.6475,
    lng: -117.8408,
    aliases: ["sslh", "social science lecture hall"]
  },
  {
    id: "sst",
    name: "Social Science Tower",
    short: "SST",
    lat: 33.6477,
    lng: -117.8415,
    aliases: ["sst", "social science tower"]
  },
  {
    id: "hh",
    name: "Humanities Hall",
    short: "HH",
    lat: 33.6472,
    lng: -117.8441,
    aliases: ["hh", "humanities hall"]
  },
  {
    id: "hib",
    name: "Humanities Instructional Building",
    short: "HIB",
    lat: 33.6467,
    lng: -117.8447,
    aliases: ["hib", "humanities instructional building"]
  },
  {
    id: "pslh",
    name: "Physical Sciences Lecture Hall",
    short: "PSLH",
    lat: 33.6439,
    lng: -117.8449,
    aliases: ["pslh", "physical sciences lecture hall"]
  },
  {
    id: "rh",
    name: "Rowland Hall",
    short: "RH",
    lat: 33.6434,
    lng: -117.8457,
    aliases: ["rh", "rowland hall"]
  },
  {
    id: "sh",
    name: "Steinhaus Hall",
    short: "SH",
    lat: 33.644,
    lng: -117.8464,
    aliases: ["sh", "steinhaus hall"]
  },
  {
    id: "bsl3",
    name: "Biological Sciences III",
    short: "BS3",
    lat: 33.6448,
    lng: -117.8469,
    aliases: ["bs3", "bsl3", "biological sciences iii", "bio sci 3", "biological sciences 3"]
  },
  {
    id: "pcb",
    name: "Parkview Classroom Building",
    short: "PCB",
    lat: 33.6437,
    lng: -117.8391,
    aliases: ["pcb", "parkview classroom building"]
  },
  {
    id: "mstb",
    name: "Multipurpose Science and Technology Building",
    short: "MSTB",
    lat: 33.6428,
    lng: -117.8445,
    aliases: ["mstb", "multipurpose science and technology building"]
  },
  {
    id: "sc",
    name: "Student Center",
    short: "SC",
    lat: 33.6486,
    lng: -117.8427,
    aliases: ["student center", "student center a", "student center b", "sc"]
  },
  {
    id: "ctsa",
    name: "Claire Trevor School of the Arts",
    short: "Arts",
    lat: 33.6503,
    lng: -117.8459,
    aliases: ["claire trevor", "arts", "art", "school of the arts"]
  },
  {
    id: "hslh",
    name: "Health Sciences Lecture Hall",
    short: "HSLH",
    lat: 33.6429,
    lng: -117.8512,
    aliases: ["hslh", "health sciences lecture hall"]
  }
];

export const parkingOptions = [
  {
    id: "scps",
    name: "Student Center Parking Structure",
    short: "SCPS",
    zone: 6,
    lat: 33.6492,
    lng: -117.842,
    type: "structure",
    permits: ["S", "P", "E"],
    note: "Zone 6 anchor near Student Center, Humanities, and Social Sciences."
  },
  {
    id: "lot5",
    name: "Lot 5",
    short: "Lot 5",
    zone: 6,
    lat: 33.6488,
    lng: -117.8404,
    type: "lot",
    permits: ["S", "P", "E"],
    note: "Zone 6 surface lot near Student Center and Social Sciences."
  },
  {
    id: "ssps",
    name: "Social Science Parking Structure",
    short: "SSPS",
    zone: 5,
    lat: 33.6489,
    lng: -117.8395,
    type: "structure",
    permits: ["S", "P", "E"],
    note: "Zone 5 anchor for Social Sciences and north/east Ring Road."
  },
  {
    id: "aps",
    name: "Anteater Parking Structure",
    short: "APS",
    zone: 4,
    lat: 33.6504,
    lng: -117.849,
    type: "structure",
    permits: ["S", "P", "E"],
    note: "Zone 4 anchor near Bren Events Center, Arts, and west campus."
  },
  {
    id: "lot70",
    name: "Lot 70",
    short: "Lot 70",
    zone: 3,
    lat: 33.6502,
    lng: -117.8466,
    type: "lot",
    permits: ["S", "P", "E"],
    note: "Zone 3 option near Arts and west/north campus."
  },
  {
    id: "mps",
    name: "Mesa Parking Structure",
    short: "MPS",
    zone: 1,
    lat: 33.6414,
    lng: -117.8392,
    type: "structure",
    permits: ["S", "P", "E"],
    note: "Zone 1 anchor near Engineering, ICS, and Mesa Road."
  },
  {
    id: "lot14",
    name: "Lot 14 / 14A",
    short: "Lot 14",
    zone: 1,
    lat: 33.642,
    lng: -117.842,
    type: "lot",
    permits: ["S", "P", "E"],
    note: "Zone 1 lot near ICS and Engineering."
  },
  {
    id: "hsps",
    name: "Health Sciences Parking Structure",
    short: "HSPS",
    zone: 2,
    lat: 33.6422,
    lng: -117.8524,
    type: "structure",
    permits: ["S", "E"],
    note: "Zone 2 is graduate-student oriented in UCI student permit rules."
  },
  {
    id: "arc",
    name: "Lot ARC",
    short: "ARC",
    zone: 1,
    lat: 33.6543,
    lng: -117.8298,
    type: "lot",
    permits: ["S", "P", "E"],
    note: "Overflow option; use Anteater Express when core lots are full."
  },
  {
    id: "ecps",
    name: "East Campus Parking Structure",
    short: "ECPS",
    zone: 1,
    lat: 33.6535,
    lng: -117.8275,
    type: "structure",
    permits: ["S", "P", "E"],
    note: "White stalls are listed as valid for commuter zones; yellow stalls are excluded."
  }
];

export const sampleSchedule = `ICS 31 MW 9:00 AM-9:50 AM ICS 174
Writing 60 MWF 11:00 AM-11:50 AM Humanities Hall 178
Math 2B TuTh 12:30 PM-1:50 PM Physical Sciences Lecture Hall 100
Anthro 2A TuTh 3:30 PM-4:50 PM Social Science Lecture Hall 100
Lab F 6:00 PM-8:50 PM Engineering Gateway 3161`;
