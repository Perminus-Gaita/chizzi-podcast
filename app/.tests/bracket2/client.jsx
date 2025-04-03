"use client";
const defaultMatches2 = [
  {
    id: 19874,
    name: 'Final - Match',
    nextLooserMatchId: null,
    nextMatchId: null,
    participants: [
      {
        id: '354506c4-d07d-4785-9759-755941a6cccc',
        isWinner: false,
        name: 'TestTeam1234',
        picture: null,
        resultText: '',
        status: null
      }
    ],
    startTime: '2021-05-30',
    state: 'DONE',
    tournamentRoundText: '6'
  },
  {
    id: 19875,
    name: 'Semi Final - Match 1',
    nextLooserMatchId: null,
    nextMatchId: 19874,
    participants: [
      {
        id: 'e7fe8889-13e8-46f7-8515-3c9d89c07ba1',
        isWinner: false,
        name: 'test87',
        picture: 'teamlogos/client_team_default_logo',
        resultText: '',
        status: null
      }
    ],
    startTime: '2021-05-30',
    state: 'SCHEDULED',
    tournamentRoundText: '5'
  },
  {
    id: 19906,
    name: 'Semi Final - Match 2',
    nextLooserMatchId: null,
    nextMatchId: 19874,
    participants: [
      {
        id: '0be9036e-4cb4-4d95-b45a-b8725b4a2b73',
        isWinner: false,
        name: 'test357375',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '354506c4-d07d-4785-9759-755941a6cccc',
        isWinner: true,
        name: 'TestTeam1234',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '5'
  },
  {
    id: 19876,
    name: 'Round 4 - Match 1',
    nextLooserMatchId: null,
    nextMatchId: 19875,
    participants: [
      {
        id: '059743f7-9501-471e-8f9e-2d1032eccc67',
        isWinner: false,
        name: 'TestTeamz',
        picture: null,
        resultText: '',
        status: null
      }
    ],
    startTime: '2021-05-30',
    state: 'DONE',
    tournamentRoundText: '4'
  },
  {
    id: 19891,
    name: 'Round 4 - Match 2',
    nextLooserMatchId: null,
    nextMatchId: 19875,
    participants: [
      {
        id: 'e7fe8889-13e8-46f7-8515-3c9d89c07ba1',
        isWinner: true,
        name: 'test87',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: 'c266ef2c-eab7-4b14-b41a-03265b6dfd74',
        isWinner: false,
        name: 'adamamd',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '4'
  },
  {
    id: 19907,
    name: 'Round 4 - Match 3',
    nextLooserMatchId: null,
    nextMatchId: 19906,
    participants: [
      {
        id: 'de637dbe-363b-40cd-bae9-5a5e97a61ccc',
        isWinner: false,
        name: 'Test Post',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '0be9036e-4cb4-4d95-b45a-b8725b4a2b73',
        isWinner: true,
        name: 'test357375',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '4'
  },
  {
    id: 19922,
    name: 'Round 4 - Match 4',
    nextLooserMatchId: null,
    nextMatchId: 19906,
    participants: [
      {
        id: '4ce605b1-28c5-4359-a2b8-5aa232299f2e',
        isWinner: false,
        name: 'TESTWTF',
        picture: 'teamlogos/images_wstysk',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '354506c4-d07d-4785-9759-755941a6cccc',
        isWinner: true,
        name: 'TestTeam1234',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '4'
  },
  {
    id: 19877,
    name: 'Round 3 - Match 1',
    nextLooserMatchId: null,
    nextMatchId: 19876,
    participants: [
      {
        id: 'acf45434-78a1-4907-bf19-92235d180e8b',
        isWinner: false,
        name: 'omaromar',
        picture: null,
        resultText: '',
        status: null
      }
    ],
    startTime: '2021-05-30',
    state: 'DONE',
    tournamentRoundText: '3'
  },
  {
    id: 19884,
    name: 'Round 3 - Match 2',
    nextLooserMatchId: null,
    nextMatchId: 19876,
    participants: [
      {
        id: '059743f7-9501-471e-8f9e-2d1032eccc67',
        isWinner: true,
        name: 'TestTeamz',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '51c449a7-fb04-445a-b478-1ca95feeeafa',
        isWinner: false,
        name: 'test73',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '3'
  },
  {
    id: 19892,
    name: 'Round 3 - Match 3',
    nextLooserMatchId: null,
    nextMatchId: 19891,
    participants: [
      {
        id: 'e7fe8889-13e8-46f7-8515-3c9d89c07ba1',
        isWinner: true,
        name: 'test87',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '7eac0db4-2e53-4f42-a670-58847b1f5e4c',
        isWinner: false,
        name: 'Test 1',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '3'
  },
  {
    id: 19899,
    name: 'Round 3 - Match 4',
    nextLooserMatchId: null,
    nextMatchId: 19891,
    participants: [
      {
        id: '9d13814a-81b9-43d1-b9f9-42da1fe22578',
        isWinner: false,
        name: 'adam peleback',
        picture: 'teamlogos/G-Loot_Logo_Portrait_Green_Black128px_yhkf4w',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: 'c266ef2c-eab7-4b14-b41a-03265b6dfd74',
        isWinner: true,
        name: 'adamamd',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '3'
  },
  {
    id: 19908,
    name: 'Round 3 - Match 5',
    nextLooserMatchId: null,
    nextMatchId: 19907,
    participants: [
      {
        id: '02aae6b1-bd99-4469-9d5a-4a83019d7dbc',
        isWinner: false,
        name: 'test6000',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: 'de637dbe-363b-40cd-bae9-5a5e97a61ccc',
        isWinner: true,
        name: 'Test Post',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '3'
  },
  {
    id: 19915,
    name: 'Round 3 - Match 6',
    nextLooserMatchId: null,
    nextMatchId: 19907,
    participants: [
      {
        id: '390f872a-fe15-48a3-9283-4191ff4263e7',
        isWinner: false,
        name: 'Test123',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '0be9036e-4cb4-4d95-b45a-b8725b4a2b73',
        isWinner: true,
        name: 'test357375',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '3'
  },
  {
    id: 19923,
    name: 'Round 3 - Match 7',
    nextLooserMatchId: null,
    nextMatchId: 19922,
    participants: [
      {
        id: '4ce605b1-28c5-4359-a2b8-5aa232299f2e',
        isWinner: true,
        name: 'TESTWTF',
        picture: 'teamlogos/images_wstysk',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: 'ad2a0a89-d3bb-49dd-b8fc-2ec100e33477',
        isWinner: false,
        name: 'Testing new Team',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '3'
  },
  {
    id: 19930,
    name: 'Round 3 - Match 8',
    nextLooserMatchId: null,
    nextMatchId: 19922,
    participants: [
      {
        id: '7fbd66f3-7eaa-4567-bc87-5a82f10417ad',
        isWinner: false,
        name: 'adamapexnice',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '354506c4-d07d-4785-9759-755941a6cccc',
        isWinner: true,
        name: 'TestTeam1234',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '3'
  },
  {
    id: 19878,
    name: 'Round 2 - Match 1',
    nextLooserMatchId: null,
    nextMatchId: 19877,
    participants: [
      {
        id: 'a552ca06-579d-41ee-9405-4cedd187c5bf',
        isWinner: false,
        name: 'Test of Tests',
        picture: null,
        resultText: '',
        status: null
      },
      {
        id: '6d9ec9e8-d10d-424b-a00f-2078d4e08d39',
        isWinner: false,
        name: 'test9',
        picture: 'teamlogos/client_team_default_logo',
        resultText: '',
        status: null
      }
    ],
    startTime: '2021-05-30',
    state: 'DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19881,
    name: 'Round 2 - Match 2',
    nextLooserMatchId: null,
    nextMatchId: 19877,
    participants: [
      {
        id: 'acf45434-78a1-4907-bf19-92235d180e8b',
        isWinner: true,
        name: 'omaromar',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: 'fdce979a-002e-4906-a80f-d161f108bcde',
        isWinner: false,
        name: 'omar boi',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19885,
    name: 'Round 2 - Match 3',
    nextLooserMatchId: null,
    nextMatchId: 19884,
    participants: [
      {
        id: 'c7a2ec6b-389f-429d-819e-53594e94d475',
        isWinner: false,
        name: 'test123',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '059743f7-9501-471e-8f9e-2d1032eccc67',
        isWinner: true,
        name: 'TestTeamz',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19888,
    name: 'Round 2 - Match 4',
    nextLooserMatchId: null,
    nextMatchId: 19884,
    participants: [
      {
        id: 'ce914b1b-fe1e-4be9-8409-681049265614',
        isWinner: false,
        name: 'test5',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '51c449a7-fb04-445a-b478-1ca95feeeafa',
        isWinner: true,
        name: 'test73',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19893,
    name: 'Round 2 - Match 5',
    nextLooserMatchId: null,
    nextMatchId: 19892,
    participants: [
      {
        id: 'e7fe8889-13e8-46f7-8515-3c9d89c07ba1',
        isWinner: true,
        name: 'test87',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '43ddad56-5798-4364-bd5c-81ba2640e22a',
        isWinner: false,
        name: 'testing',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19896,
    name: 'Round 2 - Match 6',
    nextLooserMatchId: null,
    nextMatchId: 19892,
    participants: [
      {
        id: '7eac0db4-2e53-4f42-a670-58847b1f5e4c',
        isWinner: true,
        name: 'Test 1',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '85568369-9f06-4098-be5f-1922e2ae61e5',
        isWinner: false,
        name: 'Testpubg',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19900,
    name: 'Round 2 - Match 7',
    nextLooserMatchId: null,
    nextMatchId: 19899,
    participants: [
      {
        id: '5b29528f-0dab-4dea-97d8-e6528b6cfc6c',
        isWinner: false,
        name: 'glltest',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '9d13814a-81b9-43d1-b9f9-42da1fe22578',
        isWinner: true,
        name: 'adam peleback',
        picture: 'teamlogos/G-Loot_Logo_Portrait_Green_Black128px_yhkf4w',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19903,
    name: 'Round 2 - Match 8',
    nextLooserMatchId: null,
    nextMatchId: 19899,
    participants: [
      {
        id: 'c266ef2c-eab7-4b14-b41a-03265b6dfd74',
        isWinner: true,
        name: 'adamamd',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '8055f16b-3cc9-495a-b40a-2742712be6c6',
        isWinner: false,
        name: 'Adam testar',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19909,
    name: 'Round 2 - Match 9',
    nextLooserMatchId: null,
    nextMatchId: 19908,
    participants: [
      {
        id: 'cb177e1d-6e6c-44b5-829a-45b699529274',
        isWinner: false,
        name: 'test50',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '02aae6b1-bd99-4469-9d5a-4a83019d7dbc',
        isWinner: true,
        name: 'test6000',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19912,
    name: 'Round 2 - Match 10',
    nextLooserMatchId: null,
    nextMatchId: 19908,
    participants: [
      {
        id: 'de637dbe-363b-40cd-bae9-5a5e97a61ccc',
        isWinner: true,
        name: 'Test Post',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: 'b4889d7a-5e25-4bae-aa4a-40776f44ef2d',
        isWinner: false,
        name: 'omarapexnice',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19916,
    name: 'Round 2 - Match 11',
    nextLooserMatchId: null,
    nextMatchId: 19915,
    participants: [
      {
        id: '390f872a-fe15-48a3-9283-4191ff4263e7',
        isWinner: true,
        name: 'Test123',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '3a353047-4af3-4320-b2cf-2d83ddc9115a',
        isWinner: false,
        name: 'TestTeamData',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19919,
    name: 'Round 2 - Match 12',
    nextLooserMatchId: null,
    nextMatchId: 19915,
    participants: [
      {
        id: '4b5c9937-9e69-4e5b-8344-6a68d6c12a64',
        isWinner: false,
        name: 'test9',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '0be9036e-4cb4-4d95-b45a-b8725b4a2b73',
        isWinner: true,
        name: 'test357375',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19924,
    name: 'Round 2 - Match 13',
    nextLooserMatchId: null,
    nextMatchId: 19923,
    participants: [
      {
        id: '4ce605b1-28c5-4359-a2b8-5aa232299f2e',
        isWinner: true,
        name: 'TESTWTF',
        picture: 'teamlogos/images_wstysk',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '0f8844f8-91a3-4969-9557-8ac560f3a7d2',
        isWinner: false,
        name: 'TestTeam12344',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19927,
    name: 'Round 2 - Match 14',
    nextLooserMatchId: null,
    nextMatchId: 19923,
    participants: [
      {
        id: 'ad2a0a89-d3bb-49dd-b8fc-2ec100e33477',
        isWinner: true,
        name: 'Testing new Team',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '613f708c-b000-4aa7-a9b1-47de355c9fac',
        isWinner: false,
        name: 'testteam',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19931,
    name: 'Round 2 - Match 15',
    nextLooserMatchId: null,
    nextMatchId: 19930,
    participants: [
      {
        id: '7fbd66f3-7eaa-4567-bc87-5a82f10417ad',
        isWinner: true,
        name: 'adamapexnice',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: 'b5edee08-6d0a-4e3d-9587-57a2d585e490',
        isWinner: false,
        name: 'Adam testar',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19934,
    name: 'Round 2 - Match 16',
    nextLooserMatchId: null,
    nextMatchId: 19930,
    participants: [
      {
        id: '354506c4-d07d-4785-9759-755941a6cccc',
        isWinner: true,
        name: 'TestTeam1234',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '3dce492c-ecad-453c-98e7-2b96ddbf8800',
        isWinner: false,
        name: 'gloot3 test',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '2'
  },
  {
    id: 19879,
    name: 'Round 1 - Match 1',
    nextLooserMatchId: null,
    nextMatchId: 19878,
    participants: [
      {
        id: 'bcbe20a3-82b5-4818-bb29-4c1149e9f04e',
        isWinner: false,
        name: 'AdamsinLaDoncu',
        picture: 'teamlogos/px6aikyzeej5vhecturj',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: 'a552ca06-579d-41ee-9405-4cedd187c5bf',
        isWinner: true,
        name: 'Test of Tests',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19880,
    name: 'Round 1 - Match 2',
    nextLooserMatchId: null,
    nextMatchId: 19878,
    participants: [
      {
        id: '5acb196d-5f82-47f3-ae5a-2e87d070f610',
        isWinner: false,
        name: 'testtesttetstst',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '6d9ec9e8-d10d-424b-a00f-2078d4e08d39',
        isWinner: true,
        name: 'test9',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19882,
    name: 'Round 1 - Match 3',
    nextLooserMatchId: null,
    nextMatchId: 19881,
    participants: [
      {
        id: 'acf45434-78a1-4907-bf19-92235d180e8b',
        isWinner: true,
        name: 'omaromar',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: 'be2db859-515f-4159-9051-6723d0b47eb7',
        isWinner: false,
        name: 'Test3',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19883,
    name: 'Round 1 - Match 4',
    nextLooserMatchId: null,
    nextMatchId: 19881,
    participants: [
      {
        id: 'fdce979a-002e-4906-a80f-d161f108bcde',
        isWinner: true,
        name: 'omar boi',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: 'b264744c-0114-46b9-ab28-a7f56aded7bd',
        isWinner: false,
        name: 'omar',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19886,
    name: 'Round 1 - Match 5',
    nextLooserMatchId: null,
    nextMatchId: 19885,
    participants: [
      {
        id: 'd9a7b576-9d7e-430c-aa7e-6401d6eb7cf8',
        isWinner: false,
        name: 'Testteam2',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: 'c7a2ec6b-389f-429d-819e-53594e94d475',
        isWinner: true,
        name: 'test123',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19887,
    name: 'Round 1 - Match 6',
    nextLooserMatchId: null,
    nextMatchId: 19885,
    participants: [
      {
        id: '8411c4ef-f337-42c9-bff9-63c2f0e80255',
        isWinner: false,
        name: 'TESTGLL',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '059743f7-9501-471e-8f9e-2d1032eccc67',
        isWinner: true,
        name: 'TestTeamz',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19889,
    name: 'Round 1 - Match 7',
    nextLooserMatchId: null,
    nextMatchId: 19888,
    participants: [
      {
        id: 'ce914b1b-fe1e-4be9-8409-681049265614',
        isWinner: true,
        name: 'test5',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '86cd4ff0-14ae-445c-820a-777fe448cddb',
        isWinner: false,
        name: 'ALEX',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19890,
    name: 'Round 1 - Match 8',
    nextLooserMatchId: null,
    nextMatchId: 19888,
    participants: [
      {
        id: '51c449a7-fb04-445a-b478-1ca95feeeafa',
        isWinner: true,
        name: 'test73',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: 'b370498e-5e54-4d98-88ef-ba039ee7fb62',
        isWinner: false,
        name: 'adam24',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19894,
    name: 'Round 1 - Match 9',
    nextLooserMatchId: null,
    nextMatchId: 19893,
    participants: [
      {
        id: 'f00e68b3-70d4-46c6-8004-1b2726adb0dc',
        isWinner: false,
        name: 'testforcontentful',
        picture: 'teamlogos/5o7zgmejbgc41_ip4xil',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: 'e7fe8889-13e8-46f7-8515-3c9d89c07ba1',
        isWinner: true,
        name: 'test87',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19895,
    name: 'Round 1 - Match 10',
    nextLooserMatchId: null,
    nextMatchId: 19893,
    participants: [
      {
        id: '43ddad56-5798-4364-bd5c-81ba2640e22a',
        isWinner: true,
        name: 'testing',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: 'a34587db-a088-44ba-98b2-c8efd07df9ed',
        isWinner: false,
        name: 'TestTeam2253',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19897,
    name: 'Round 1 - Match 11',
    nextLooserMatchId: null,
    nextMatchId: 19896,
    participants: [
      {
        id: '7eac0db4-2e53-4f42-a670-58847b1f5e4c',
        isWinner: true,
        name: 'Test 1',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '20bc489c-6c63-402f-908e-586e531a96b2',
        isWinner: false,
        name: 'Test146',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19898,
    name: 'Round 1 - Match 12',
    nextLooserMatchId: null,
    nextMatchId: 19896,
    participants: [
      {
        id: '3947ccbc-18d4-47e3-ba19-f1ba697800e3',
        isWinner: false,
        name: 'omarnice',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '85568369-9f06-4098-be5f-1922e2ae61e5',
        isWinner: true,
        name: 'Testpubg',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19901,
    name: 'Round 1 - Match 13',
    nextLooserMatchId: null,
    nextMatchId: 19900,
    participants: [
      {
        id: 'e44b992f-676c-492e-98d2-b238162cc2e0',
        isWinner: false,
        name: 'test team 1234',
        picture: 'teamlogos/image_8_grwpnj',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '5b29528f-0dab-4dea-97d8-e6528b6cfc6c',
        isWinner: true,
        name: 'glltest',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19902,
    name: 'Round 1 - Match 14',
    nextLooserMatchId: null,
    nextMatchId: 19900,
    participants: [
      {
        id: '5a02ce4d-ad2a-4ee7-b3d2-4dad7b9b164a',
        isWinner: false,
        name: 'TestTeam1243',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '9d13814a-81b9-43d1-b9f9-42da1fe22578',
        isWinner: true,
        name: 'adam peleback',
        picture: 'teamlogos/G-Loot_Logo_Portrait_Green_Black128px_yhkf4w',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19904,
    name: 'Round 1 - Match 15',
    nextLooserMatchId: null,
    nextMatchId: 19903,
    participants: [
      {
        id: '856abe5e-5e46-4113-8485-f7829aeb27ba',
        isWinner: false,
        name: 'omarpubgnotnice',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: 'c266ef2c-eab7-4b14-b41a-03265b6dfd74',
        isWinner: true,
        name: 'adamamd',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19905,
    name: 'Round 1 - Match 16',
    nextLooserMatchId: null,
    nextMatchId: 19903,
    participants: [
      {
        id: '8055f16b-3cc9-495a-b40a-2742712be6c6',
        isWinner: true,
        name: 'Adam testar',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: 'c934f0ee-c9d8-4cf7-ad55-7f98a7b19b6f',
        isWinner: false,
        name: 'test2',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19910,
    name: 'Round 1 - Match 17',
    nextLooserMatchId: null,
    nextMatchId: 19909,
    participants: [
      {
        id: 'cb177e1d-6e6c-44b5-829a-45b699529274',
        isWinner: true,
        name: 'test50',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '2ae79460-4d1c-42a9-88cc-cf76adb4bb08',
        isWinner: false,
        name: 'Adamadamsms',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19911,
    name: 'Round 1 - Match 18',
    nextLooserMatchId: null,
    nextMatchId: 19909,
    participants: [
      {
        id: '348c0a6b-5499-421a-9125-6b3d08bcef9c',
        isWinner: false,
        name: 'TestingAgain',
        picture: 'teamlogos/teddy-bear_tmxfyl',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '02aae6b1-bd99-4469-9d5a-4a83019d7dbc',
        isWinner: true,
        name: 'test6000',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19913,
    name: 'Round 1 - Match 19',
    nextLooserMatchId: null,
    nextMatchId: 19912,
    participants: [
      {
        id: '91c101fd-d744-4eb1-abf1-7edfe09e7429',
        isWinner: false,
        name: 'TestTeamz123',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: 'de637dbe-363b-40cd-bae9-5a5e97a61ccc',
        isWinner: true,
        name: 'Test Post',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19914,
    name: 'Round 1 - Match 20',
    nextLooserMatchId: null,
    nextMatchId: 19912,
    participants: [
      {
        id: '1262eafb-9d48-4536-a428-fb43d0da2e07',
        isWinner: false,
        name: 'Test 2',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: 'b4889d7a-5e25-4bae-aa4a-40776f44ef2d',
        isWinner: true,
        name: 'omarapexnice',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19917,
    name: 'Round 1 - Match 21',
    nextLooserMatchId: null,
    nextMatchId: 19916,
    participants: [
      {
        id: '390f872a-fe15-48a3-9283-4191ff4263e7',
        isWinner: true,
        name: 'Test123',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '59a941da-398d-4dbd-baa6-1769314e5826',
        isWinner: false,
        name: 'teståtestätestö',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19918,
    name: 'Round 1 - Match 22',
    nextLooserMatchId: null,
    nextMatchId: 19916,
    participants: [
      {
        id: 'cc4b8479-e825-40a8-b24b-3f0fbfb421f4',
        isWinner: false,
        name: 'test9',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '3a353047-4af3-4320-b2cf-2d83ddc9115a',
        isWinner: true,
        name: 'TestTeamData',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19920,
    name: 'Round 1 - Match 23',
    nextLooserMatchId: null,
    nextMatchId: 19919,
    participants: [
      {
        id: '4b5c9937-9e69-4e5b-8344-6a68d6c12a64',
        isWinner: true,
        name: 'test9',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: 'a37c7aeb-38bd-46b8-87f7-3cbaf212a9fb',
        isWinner: false,
        name: 'TestingClient',
        picture: 'teamlogos/gentleman-bear_gwzbjd',
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19921,
    name: 'Round 1 - Match 24',
    nextLooserMatchId: null,
    nextMatchId: 19919,
    participants: [
      {
        id: '0be9036e-4cb4-4d95-b45a-b8725b4a2b73',
        isWinner: true,
        name: 'test357375',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '2486582b-574a-40fc-a8d3-b426cda99abf',
        isWinner: false,
        name: 'Chat test',
        picture: 'teamlogos/асдасдадс_ziqhqk',
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19925,
    name: 'Round 1 - Match 25',
    nextLooserMatchId: null,
    nextMatchId: 19924,
    participants: [
      {
        id: '3ae53b5b-958d-4f01-a40e-bab340036a29',
        isWinner: false,
        name: 'testadam',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '4ce605b1-28c5-4359-a2b8-5aa232299f2e',
        isWinner: true,
        name: 'TESTWTF',
        picture: 'teamlogos/images_wstysk',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19926,
    name: 'Round 1 - Match 26',
    nextLooserMatchId: null,
    nextMatchId: 19924,
    participants: [
      {
        id: 'c85a0d8a-4e22-4781-8494-d2cd600a3396',
        isWinner: false,
        name: 'Gloot1 test',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '0f8844f8-91a3-4969-9557-8ac560f3a7d2',
        isWinner: true,
        name: 'TestTeam12344',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19928,
    name: 'Round 1 - Match 27',
    nextLooserMatchId: null,
    nextMatchId: 19927,
    participants: [
      {
        id: 'ad2a0a89-d3bb-49dd-b8fc-2ec100e33477',
        isWinner: true,
        name: 'Testing new Team',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '241150ef-951e-4e4c-82b5-9a26125521d1',
        isWinner: false,
        name: 'test200',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19929,
    name: 'Round 1 - Match 28',
    nextLooserMatchId: null,
    nextMatchId: 19927,
    participants: [
      {
        id: 'a35b99fb-fd75-4ed5-9a51-6cd772beebf0',
        isWinner: false,
        name: 'TestTeam1696',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '613f708c-b000-4aa7-a9b1-47de355c9fac',
        isWinner: true,
        name: 'testteam',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19932,
    name: 'Round 1 - Match 29',
    nextLooserMatchId: null,
    nextMatchId: 19931,
    participants: [
      {
        id: '7fbd66f3-7eaa-4567-bc87-5a82f10417ad',
        isWinner: true,
        name: 'adamapexnice',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '6eefadaa-11e0-4551-8874-faec113f875f',
        isWinner: false,
        name: 'test500000',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19933,
    name: 'Round 1 - Match 30',
    nextLooserMatchId: null,
    nextMatchId: 19931,
    participants: [
      {
        id: 'bb31a7b7-8563-416c-8c8f-b57b7b56fdca',
        isWinner: false,
        name: 'test teamsfsfsfsfs',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: 'b5edee08-6d0a-4e3d-9587-57a2d585e490',
        isWinner: true,
        name: 'Adam testar',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19935,
    name: 'Round 1 - Match 31',
    nextLooserMatchId: null,
    nextMatchId: 19934,
    participants: [
      {
        id: 'f4e36b1f-ba40-4368-ab2e-97cad78c2932',
        isWinner: false,
        name: 'Testabc',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      },
      {
        id: '354506c4-d07d-4785-9759-755941a6cccc',
        isWinner: true,
        name: 'TestTeam1234',
        picture: null,
        resultText: 'Won',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  },
  {
    id: 19936,
    name: 'Round 1 - Match 32',
    nextLooserMatchId: null,
    nextMatchId: 19934,
    participants: [
      {
        id: '3dce492c-ecad-453c-98e7-2b96ddbf8800',
        isWinner: true,
        name: 'gloot3 test',
        picture: 'teamlogos/client_team_default_logo',
        resultText: 'Won',
        status: 'PLAYED'
      },
      {
        id: '8ef16ac0-358b-4d6a-8049-1f3962d060e0',
        isWinner: false,
        name: 'TestTeam1253',
        picture: null,
        resultText: 'Lost',
        status: 'PLAYED'
      }
    ],
    startTime: '2021-05-30',
    state: 'SCORE_DONE',
    tournamentRoundText: '1'
  }
]

// Default tournament data
const defaultMatches = [
  // Quarter Finals
  {
    id: 'qf-1',
    name: 'Quarter Final 1',
    nextMatchId: 'sf-1',
    tournamentRoundText: '1',
    state: 'DONE',
    participants: [
      {
        id: '1',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'John Smith',
        username: '@johnsmith'
      },
      {
        id: '2',
        resultText: '1',
        isWinner: false,
        status: 'PLAYED',
        name: 'Sarah Wilson',
        username: '@sarahw'
      }
    ]
  },
  {
    id: 'qf-2',
    name: 'Quarter Final 2',
    nextMatchId: 'sf-1',
    tournamentRoundText: '1',
    state: 'DONE',
    participants: [
      {
        id: '3',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'James Brown',
        username: '@jamesb'
      },
      {
        id: '4',
        resultText: '0',
        isWinner: false,
        status: 'PLAYED',
        name: 'Emma Davis',
        username: '@emmad'
      }
    ]
  },
  {
    id: 'qf-3',
    name: 'Quarter Final 3',
    nextMatchId: 'sf-2',
    tournamentRoundText: '1',
    state: 'DONE',
    participants: [
      {
        id: '5',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'Michael Johnson',
        username: '@michaelj'
      },
      {
        id: '6',
        resultText: '1',
        isWinner: false,
        status: 'PLAYED',
        name: 'Lisa Anderson',
        username: '@lisaa'
      }
    ]
  },
  {
    id: 'qf-4',
    name: 'Quarter Final 4',
    nextMatchId: 'sf-2',
    tournamentRoundText: '1',
    state: 'DONE',
    participants: [
      {
        id: '7',
        resultText: '0',
        isWinner: false,
        status: 'PLAYED',
        name: 'David Wilson',
        username: '@davidw'
      },
      {
        id: '8',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'Emily Taylor',
        username: '@emilyt'
      }
    ]
  },
  // Semi Finals
  {
    id: 'sf-1',
    name: 'Semi Final 1',
    nextMatchId: 'f-1',
    tournamentRoundText: '2',
    state: 'DONE',
    participants: [
      {
        id: '1',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'John Smith',
        username: '@johnsmith'
      },
      {
        id: '3',
        resultText: '1',
        isWinner: false,
        status: 'PLAYED',
        name: 'James Brown',
        username: '@jamesb'
      }
    ]
  },
  {
    id: 'sf-2',
    name: 'Semi Final 2',
    nextMatchId: 'f-1',
    tournamentRoundText: '2',
    state: 'DONE',
    participants: [
      {
        id: '5',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'Michael Johnson',
        username: '@michaelj'
      },
      {
        id: '8',
        resultText: '0',
        isWinner: false,
        status: 'PLAYED',
        name: 'Emily Taylor',
        username: '@emilyt'
      }
    ]
  },
  // Final
  {
    id: 'f-1',
    name: 'Final',
    nextMatchId: null,
    tournamentRoundText: '3',
    state: 'DONE',
    participants: [
      {
        id: '1',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'John Smith',
        username: '@johnsmith'
      },
      {
        id: '5',
        resultText: '1',
        isWinner: false,
        status: 'PLAYED',
        name: 'Michael Johnson',
        username: '@michaelj'
      }
    ]
  }
];


import React, { useState, useRef, useEffect } from 'react';
import { SingleEliminationBracket, SVGViewer } from '@g-loot/react-tournament-brackets';

// Custom window size hook with debouncing for better performance
const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    const updateSize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setSize([window.innerWidth, window.innerHeight]);
      }, 100);
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();
    
    return () => {
      window.removeEventListener('resize', updateSize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return size;
};

const CustomMatchCard = ({ match, onMatchClick, onPartyClick, topParty, bottomParty }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg w-72 h-20">
      {/* Team 1 */}
      <div className="flex items-center gap-2 p-2 h-[38px] bg-blue-50 dark:bg-blue-900/30">
        <img 
          src="/api/placeholder/24/24"
          alt={topParty?.name || "Player"}
          className="w-6 h-6 rounded-full bg-gray-100"
        />
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate leading-none mb-0.5">
            {topParty?.name || "John Smith"}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-none">
            {topParty?.username || "@johnsmith"}
          </span>
        </div>
      </div>
      
      <div className="h-px bg-gray-200 dark:bg-gray-700" />
      
      {/* Team 2 */}
      <div className="flex items-center gap-2 p-2 h-[38px] bg-blue-50 dark:bg-blue-900/30">
        <img 
          src="/api/placeholder/24/24"
          alt={bottomParty?.name || "Player"}
          className="w-6 h-6 rounded-full bg-gray-100"
        />
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate leading-none mb-0.5">
            {bottomParty?.name || "Emma Wilson"}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-none">
            {bottomParty?.username || "@emmaw"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function TournamentBracket({ matches = defaultMatches2}) {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [windowWidth, windowHeight] = useWindowSize();

  // Update container size when window resizes or component mounts
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      
      try {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect) {
          setContainerSize({
            width: rect.width || 0,
            height: rect.height || 0
          });
        }
      } catch (error) {
        console.warn('Error measuring container:', error);
        // Set fallback size if measurement fails
        setContainerSize({
          width: windowWidth || 800,
          height: windowHeight || 600
        });
      }
    };

    // Initial size update
    updateSize();
    
    // Set up ResizeObserver with error handling
    let resizeObserver;
    try {
      resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]) {
          updateSize();
        }
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
    } catch (error) {
      console.warn('ResizeObserver error:', error);
      // Fallback to window resize only if ResizeObserver fails
      window.addEventListener('resize', updateSize);
    }
    
    return () => {
      if (resizeObserver && containerRef.current) {
        try {
          resizeObserver.unobserve(containerRef.current);
        } catch (error) {
          console.warn('Error cleaning up ResizeObserver:', error);
        }
      }
      window.removeEventListener('resize', updateSize);
    };
  }, [windowWidth, windowHeight]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-screen">
      {containerSize.width > 0 && (
        <SingleEliminationBracket
          matches={matches}
          matchComponent={CustomMatchCard}
          svgWrapper={({ children, ...props }) => (
            <SVGViewer 
              width={containerSize.width} 
              height={Math.max(400)}// containerSize.width * 0.75
              {...props}
            >
              {children}
            </SVGViewer>
          )}
          options={{
            style: {
              // Compact dimensions
              width: 200, // Reduced from default 300
              boxHeight: 80, // Reduced from default 110
              canvasPadding: 15, // Reduced from default 25
              spaceBetweenColumns: 35, // Reduced from default 50
              spaceBetweenRows: 25, // Reduced from default 50
              
              // Round header styling
              roundHeader: {
                isShown: true,
                height: 30, // Reduced from default 40
                marginBottom: 15, // Reduced from default 25
                fontSize: 14, // Reduced from default 16
                fontColor: '#1a1a1a',
                backgroundColor: '#f3f4f6',
              },
  
              // Connector styling
              roundSeparatorWidth: 20, // Reduced from default 24
              lineInfo: {
                separation: -10,
                homeVisitorSpread: 0.4
              },
              horizontalOffset: 10
            }
          }}
        />
      )}
    </div>
  );
}