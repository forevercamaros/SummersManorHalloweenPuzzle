const initialData = {
    tasks: {
        'part-1': { id: 'part-1', line1: 'I knew her for a little ghost', line2: 'That in my garden walked;', 'realOrder': 1, 'realStanza': 1 },
        'part-2': { id: 'part-2', line1: 'The wall is high—higher than most—', line2: 'And the green gate was locked.', 'realOrder': 2, 'realStanza': 1 },
        'part-3': { id: 'part-3', line1: 'And yet I did not think of that', line2: 'Till after she was gone—', 'realOrder': 1, 'realStanza': 2 },
        'part-4': { id: 'part-4', line1: 'I knew her by the broad white hat,', line2: 'All ruffled, she had on.', 'realOrder': 2, 'realStanza': 2 },
        'part-5': { id: 'part-5', line1: 'She held her gown on either side', line2: 'To let her slippers show,', 'realOrder': 1, 'realStanza': 3 },
        'part-6': { id: 'part-6', line1: 'And up the walk she went with pride,', line2: 'The way great ladies go.', 'realOrder': 2, 'realStanza': 3 },
        'part-7': { id: 'part-7', line1: 'And where the wall is built in new', line2: 'And is of ivy bare', 'realOrder': 1, 'realStanza': 4 },
        'part-8': { id: 'part-8', line1: 'She paused—then opened and passed through', line2: 'A gate that once was there.', 'realOrder': 2, 'realStanza': 4 }
    },
    columns: {
        'stanza-1': {
            id: 'stanza-1',
            title: 'Stanza 1',
            taskIds: ['part-1',
                'part-5'],
            completed: false,
            realStanza: 0,
            inCorrectPosition: false
        },
        'stanza-2': {
            id: 'stanza-2',
            title: 'Stanza 2',
            taskIds: ['part-6',
                'part-2'],
            completed: false,
            realStanza: 0,
            inCorrectPosition: false
        },
        'stanza-3': {
            id: 'stanza-3',
            title: 'Stanza 3',
            taskIds: ['part-3',
                'part-7'],
            completed: false,
            realStanza: 0,
            inCorrectPosition: false
        },
        'stanza-4': {
            id: 'stanza-4',
            title: 'Stanza 4',
            taskIds: ['part-4',
                'part-8'],
            completed: false,
            realStanza: 0,
            inCorrectPosition: false
        },
    },
    // Facilitate reordering of the columns
    columnOrder: ['stanza-3', 'stanza-2', 'stanza-1', 'stanza-4'],
};

export default initialData;
