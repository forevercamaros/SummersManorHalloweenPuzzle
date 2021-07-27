const initialData = {
    tasks: {
        'part-1': { id: 'part-1', line1: 'I knew her for a little ghost', line2: 'That in my garden walked;', 'realOrder': 1, 'realStanza': 1 },
        'part-2': { id: 'part-2', line1: 'The wall is high—higher than most—', line2: 'And the green gate was locked.', 'realOrder': 2, 'realStanza': 1 },
        'part-3': { id: 'part-3', line1: 'And yet I did not think of that', line2: 'Till after she was gone—', 'realOrder': 1, 'realStanza': 2 },
        'part-4': { id: 'part-4', line1: 'I knew her by the broad white hat,', line2: 'All ruffled, she had on.', 'realOrder': 2, 'realStanza': 2 },
        'part-5': { id: 'part-5', line1: 'By the dear ruffles round her feet,', line2: 'By her small hands that hung', 'realOrder': 1, 'realStanza': 3 },
        'part-6': { id: 'part-6', line1: 'In their lace mitts, austere and sweet,', line2: 'Her gown\'s white folds among.', 'realOrder': 2, 'realStanza': 3 },
        'part-7': { id: 'part-7', line1: 'I watched to see if she would stay,', line2: 'What she would do—and oh!', 'realOrder': 1, 'realStanza': 4 },
        'part-8': { id: 'part-8', line1: 'She looked as if she liked the way', line2: 'I let my garden grow!', 'realOrder': 2, 'realStanza': 4 },
        'part-9': { id: 'part-9', line1: 'She bent above my favourite mint', line2: 'With conscious garden grace,', 'realOrder': 1, 'realStanza': 5 },
        'part-10': { id: 'part-10', line1: 'She smiled and smiled—there was no hint', line2: 'Of sadness in her face.', 'realOrder': 2, 'realStanza': 5 },
        'part-11': { id: 'part-11', line1: 'She held her gown on either side', line2: 'To let her slippers show,', 'realOrder': 1, 'realStanza': 6 },
        'part-12': { id: 'part-12', line1: 'And up the walk she went with pride,', line2: 'The way great ladies go.', 'realOrder': 2, 'realStanza': 6 },
        'part-13': { id: 'part-13', line1: 'And where the wall is built in new', line2: 'And is of ivy bare', 'realOrder': 1, 'realStanza': 7 },
        'part-14': { id: 'part-14', line1: 'She paused—then opened and passed through', line2: 'A gate that once was there.', 'realOrder': 2, 'realStanza': 7 }
    },
    columns: {
        'stanza-1': {
            id: 'stanza-1',
            title: 'Stanza 1',
            taskIds: ['part-10',
                'part-3'],
            completed: false,
            realStanza:0
        },
        'stanza-2': {
            id: 'stanza-2',
            title: 'Stanza 2',
            taskIds: ['part-11',
                'part-1'],
            completed: false,
            realStanza: 0
        },
        'stanza-3': {
            id: 'stanza-3',
            title: 'Stanza 3',
            taskIds: ['part-7',
                'part-2'],
            completed: false,
            realStanza: 0
        },
        'stanza-4': {
            id: 'stanza-4',
            title: 'Stanza 4',
            taskIds: ['part-5',
                'part-8'],
            completed: false,
            realStanza: 0
        },
        'stanza-5': {
            id: 'stanza-5',
            title: 'Stanza 5',
            taskIds: ['part-9',
                'part-4'],
            completed: false,
            realStanza: 0
        },
        'stanza-6': {
            id: 'stanza-6',
            title: 'Stanza 6',
            taskIds: ['part-12',
                'part-13'],
            completed: false,
            realStanza: 0
        },
        'stanza-7': {
            id: 'stanza-7',
            title: 'Stanza 7',
            taskIds: ['part-6',
                'part-14'],
            completed: false,
            realStanza: 0
        },
    },
    // Facilitate reordering of the columns
    columnOrder: ['stanza-1', 'stanza-2', 'stanza-3', 'stanza-4', 'stanza-5', 'stanza-6', 'stanza-7'],
};

export default initialData;
