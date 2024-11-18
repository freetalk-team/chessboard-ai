const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ROWS = ['1', '2', '3', '4', '5', '6', '7', '8']
const PIECES = {
    KING_W: 'K',
    QUEEN_W: 'Q',
    ROOK_W: 'R',
    BISHOP_W: 'B',
    KNIGHT_W: 'N',
    PAWN_W: 'P',
    KING_B: 'k',
    QUEEN_B: 'q',
    ROOK_B: 'r',
    BISHOP_B: 'b',
    KNIGHT_B: 'n',
    PAWN_B: 'p',
}
const COLORS = {
    BLACK: 'black',
    WHITE: 'white',
}
const AI_LEVELS = [0, 1, 2, 3, 4]
const AI_DEPTH_BY_LEVEL = {
    BASE: {
        0: 1,
        1: 2,
        2: 2,
        3: 3,
        4: 3,
        5: 4,
    },
    EXTENDED: {
        0: 2,
        1: 2,
        2: 4,
        3: 4,
        4: 5,
        5: 5,
    },
}
const NEW_GAME_SETTINGS = {
    fullMove: 1,
    halfMove: 0,
    enPassant: null,
    isFinished: false,
    checkMate: false,
    check: false,
    turn: COLORS.WHITE,
}
const NEW_GAME_BOARD_CONFIG = Object.assign({
    pieces: {
        E1: 'K',
        D1: 'Q',
        A1: 'R',
        H1: 'R',
        C1: 'B',
        F1: 'B',
        B1: 'N',
        G1: 'N',
        A2: 'P',
        B2: 'P',
        C2: 'P',
        D2: 'P',
        E2: 'P',
        F2: 'P',
        G2: 'P',
        H2: 'P',
        E8: 'k',
        D8: 'q',
        A8: 'r',
        H8: 'r',
        C8: 'b',
        F8: 'b',
        B8: 'n',
        G8: 'n',
        A7: 'p',
        B7: 'p',
        C7: 'p',
        D7: 'p',
        E7: 'p',
        F7: 'p',
        G7: 'p',
        H7: 'p',
    },
    castling: {
        whiteShort: true,
        blackShort: true,
        whiteLong: true,
        blackLong: true,
    },
}, NEW_GAME_SETTINGS)

const CLOSE_FIELDS_MAP = {
    UP: {
        A1: 'A2',
        A2: 'A3',
        A3: 'A4',
        A4: 'A5',
        A5: 'A6',
        A6: 'A7',
        A7: 'A8',
        A8: null,
        B1: 'B2',
        B2: 'B3',
        B3: 'B4',
        B4: 'B5',
        B5: 'B6',
        B6: 'B7',
        B7: 'B8',
        B8: null,
        C1: 'C2',
        C2: 'C3',
        C3: 'C4',
        C4: 'C5',
        C5: 'C6',
        C6: 'C7',
        C7: 'C8',
        C8: null,
        D1: 'D2',
        D2: 'D3',
        D3: 'D4',
        D4: 'D5',
        D5: 'D6',
        D6: 'D7',
        D7: 'D8',
        D8: null,
        E1: 'E2',
        E2: 'E3',
        E3: 'E4',
        E4: 'E5',
        E5: 'E6',
        E6: 'E7',
        E7: 'E8',
        E8: null,
        F1: 'F2',
        F2: 'F3',
        F3: 'F4',
        F4: 'F5',
        F5: 'F6',
        F6: 'F7',
        F7: 'F8',
        F8: null,
        G1: 'G2',
        G2: 'G3',
        G3: 'G4',
        G4: 'G5',
        G5: 'G6',
        G6: 'G7',
        G7: 'G8',
        G8: null,
        H1: 'H2',
        H2: 'H3',
        H3: 'H4',
        H4: 'H5',
        H5: 'H6',
        H6: 'H7',
        H7: 'H8',
        H8: null,
    },
    DOWN: {
        A1: null,
        A2: 'A1',
        A3: 'A2',
        A4: 'A3',
        A5: 'A4',
        A6: 'A5',
        A7: 'A6',
        A8: 'A7',
        B1: null,
        B2: 'B1',
        B3: 'B2',
        B4: 'B3',
        B5: 'B4',
        B6: 'B5',
        B7: 'B6',
        B8: 'B7',
        C1: null,
        C2: 'C1',
        C3: 'C2',
        C4: 'C3',
        C5: 'C4',
        C6: 'C5',
        C7: 'C6',
        C8: 'C7',
        D1: null,
        D2: 'D1',
        D3: 'D2',
        D4: 'D3',
        D5: 'D4',
        D6: 'D5',
        D7: 'D6',
        D8: 'D7',
        E1: null,
        E2: 'E1',
        E3: 'E2',
        E4: 'E3',
        E5: 'E4',
        E6: 'E5',
        E7: 'E6',
        E8: 'E7',
        F1: null,
        F2: 'F1',
        F3: 'F2',
        F4: 'F3',
        F5: 'F4',
        F6: 'F5',
        F7: 'F6',
        F8: 'F7',
        G1: null,
        G2: 'G1',
        G3: 'G2',
        G4: 'G3',
        G5: 'G4',
        G6: 'G5',
        G7: 'G6',
        G8: 'G7',
        H1: null,
        H2: 'H1',
        H3: 'H2',
        H4: 'H3',
        H5: 'H4',
        H6: 'H5',
        H7: 'H6',
        H8: 'H7',
    },
    LEFT: {
        A1: null,
        A2: null,
        A3: null,
        A4: null,
        A5: null,
        A6: null,
        A7: null,
        A8: null,
        B1: 'A1',
        B2: 'A2',
        B3: 'A3',
        B4: 'A4',
        B5: 'A5',
        B6: 'A6',
        B7: 'A7',
        B8: 'A8',
        C1: 'B1',
        C2: 'B2',
        C3: 'B3',
        C4: 'B4',
        C5: 'B5',
        C6: 'B6',
        C7: 'B7',
        C8: 'B8',
        D1: 'C1',
        D2: 'C2',
        D3: 'C3',
        D4: 'C4',
        D5: 'C5',
        D6: 'C6',
        D7: 'C7',
        D8: 'C8',
        E1: 'D1',
        E2: 'D2',
        E3: 'D3',
        E4: 'D4',
        E5: 'D5',
        E6: 'D6',
        E7: 'D7',
        E8: 'D8',
        F1: 'E1',
        F2: 'E2',
        F3: 'E3',
        F4: 'E4',
        F5: 'E5',
        F6: 'E6',
        F7: 'E7',
        F8: 'E8',
        G1: 'F1',
        G2: 'F2',
        G3: 'F3',
        G4: 'F4',
        G5: 'F5',
        G6: 'F6',
        G7: 'F7',
        G8: 'F8',
        H1: 'G1',
        H2: 'G2',
        H3: 'G3',
        H4: 'G4',
        H5: 'G5',
        H6: 'G6',
        H7: 'G7',
        H8: 'G8',
    },
    RIGHT: {
        A1: 'B1',
        A2: 'B2',
        A3: 'B3',
        A4: 'B4',
        A5: 'B5',
        A6: 'B6',
        A7: 'B7',
        A8: 'B8',
        B1: 'C1',
        B2: 'C2',
        B3: 'C3',
        B4: 'C4',
        B5: 'C5',
        B6: 'C6',
        B7: 'C7',
        B8: 'C8',
        C1: 'D1',
        C2: 'D2',
        C3: 'D3',
        C4: 'D4',
        C5: 'D5',
        C6: 'D6',
        C7: 'D7',
        C8: 'D8',
        D1: 'E1',
        D2: 'E2',
        D3: 'E3',
        D4: 'E4',
        D5: 'E5',
        D6: 'E6',
        D7: 'E7',
        D8: 'E8',
        E1: 'F1',
        E2: 'F2',
        E3: 'F3',
        E4: 'F4',
        E5: 'F5',
        E6: 'F6',
        E7: 'F7',
        E8: 'F8',
        F1: 'G1',
        F2: 'G2',
        F3: 'G3',
        F4: 'G4',
        F5: 'G5',
        F6: 'G6',
        F7: 'G7',
        F8: 'G8',
        G1: 'H1',
        G2: 'H2',
        G3: 'H3',
        G4: 'H4',
        G5: 'H5',
        G6: 'H6',
        G7: 'H7',
        G8: 'H8',
        H1: null,
        H2: null,
        H3: null,
        H4: null,
        H5: null,
        H6: null,
        H7: null,
        H8: null,
    },
    UP_LEFT: {
        A1: null,
        A2: null,
        A3: null,
        A4: null,
        A5: null,
        A6: null,
        A7: null,
        A8: null,
        B1: 'A2',
        B2: 'A3',
        B3: 'A4',
        B4: 'A5',
        B5: 'A6',
        B6: 'A7',
        B7: 'A8',
        B8: null,
        C1: 'B2',
        C2: 'B3',
        C3: 'B4',
        C4: 'B5',
        C5: 'B6',
        C6: 'B7',
        C7: 'B8',
        C8: null,
        D1: 'C2',
        D2: 'C3',
        D3: 'C4',
        D4: 'C5',
        D5: 'C6',
        D6: 'C7',
        D7: 'C8',
        D8: null,
        E1: 'D2',
        E2: 'D3',
        E3: 'D4',
        E4: 'D5',
        E5: 'D6',
        E6: 'D7',
        E7: 'D8',
        E8: null,
        F1: 'E2',
        F2: 'E3',
        F3: 'E4',
        F4: 'E5',
        F5: 'E6',
        F6: 'E7',
        F7: 'E8',
        F8: null,
        G1: 'F2',
        G2: 'F3',
        G3: 'F4',
        G4: 'F5',
        G5: 'F6',
        G6: 'F7',
        G7: 'F8',
        G8: null,
        H1: 'G2',
        H2: 'G3',
        H3: 'G4',
        H4: 'G5',
        H5: 'G6',
        H6: 'G7',
        H7: 'G8',
        H8: null,
    },
    DOWN_RIGHT: {
        A1: null,
        A2: 'B1',
        A3: 'B2',
        A4: 'B3',
        A5: 'B4',
        A6: 'B5',
        A7: 'B6',
        A8: 'B7',
        B1: null,
        B2: 'C1',
        B3: 'C2',
        B4: 'C3',
        B5: 'C4',
        B6: 'C5',
        B7: 'C6',
        B8: 'C7',
        C1: null,
        C2: 'D1',
        C3: 'D2',
        C4: 'D3',
        C5: 'D4',
        C6: 'D5',
        C7: 'D6',
        C8: 'D7',
        D1: null,
        D2: 'E1',
        D3: 'E2',
        D4: 'E3',
        D5: 'E4',
        D6: 'E5',
        D7: 'E6',
        D8: 'E7',
        E1: null,
        E2: 'F1',
        E3: 'F2',
        E4: 'F3',
        E5: 'F4',
        E6: 'F5',
        E7: 'F6',
        E8: 'F7',
        F1: null,
        F2: 'G1',
        F3: 'G2',
        F4: 'G3',
        F5: 'G4',
        F6: 'G5',
        F7: 'G6',
        F8: 'G7',
        G1: null,
        G2: 'H1',
        G3: 'H2',
        G4: 'H3',
        G5: 'H4',
        G6: 'H5',
        G7: 'H6',
        G8: 'H7',
        H1: null,
        H2: null,
        H3: null,
        H4: null,
        H5: null,
        H6: null,
        H7: null,
        H8: null,
    },
    UP_RIGHT: {
        A1: 'B2',
        A2: 'B3',
        A3: 'B4',
        A4: 'B5',
        A5: 'B6',
        A6: 'B7',
        A7: 'B8',
        A8: null,
        B1: 'C2',
        B2: 'C3',
        B3: 'C4',
        B4: 'C5',
        B5: 'C6',
        B6: 'C7',
        B7: 'C8',
        B8: null,
        C1: 'D2',
        C2: 'D3',
        C3: 'D4',
        C4: 'D5',
        C5: 'D6',
        C6: 'D7',
        C7: 'D8',
        C8: null,
        D1: 'E2',
        D2: 'E3',
        D3: 'E4',
        D4: 'E5',
        D5: 'E6',
        D6: 'E7',
        D7: 'E8',
        D8: null,
        E1: 'F2',
        E2: 'F3',
        E3: 'F4',
        E4: 'F5',
        E5: 'F6',
        E6: 'F7',
        E7: 'F8',
        E8: null,
        F1: 'G2',
        F2: 'G3',
        F3: 'G4',
        F4: 'G5',
        F5: 'G6',
        F6: 'G7',
        F7: 'G8',
        F8: null,
        G1: 'H2',
        G2: 'H3',
        G3: 'H4',
        G4: 'H5',
        G5: 'H6',
        G6: 'H7',
        G7: 'H8',
        G8: null,
        H1: null,
        H2: null,
        H3: null,
        H4: null,
        H5: null,
        H6: null,
        H7: null,
        H8: null,
    },
    DOWN_LEFT: {
        A1: null,
        A2: null,
        A3: null,
        A4: null,
        A5: null,
        A6: null,
        A7: null,
        A8: null,
        B1: null,
        B2: 'A1',
        B3: 'A2',
        B4: 'A3',
        B5: 'A4',
        B6: 'A5',
        B7: 'A6',
        B8: 'A7',
        C1: null,
        C2: 'B1',
        C3: 'B2',
        C4: 'B3',
        C5: 'B4',
        C6: 'B5',
        C7: 'B6',
        C8: 'B7',
        D1: null,
        D2: 'C1',
        D3: 'C2',
        D4: 'C3',
        D5: 'C4',
        D6: 'C5',
        D7: 'C6',
        D8: 'C7',
        E1: null,
        E2: 'D1',
        E3: 'D2',
        E4: 'D3',
        E5: 'D4',
        E6: 'D5',
        E7: 'D6',
        E8: 'D7',
        F1: null,
        F2: 'E1',
        F3: 'E2',
        F4: 'E3',
        F5: 'E4',
        F6: 'E5',
        F7: 'E6',
        F8: 'E7',
        G1: null,
        G2: 'F1',
        G3: 'F2',
        G4: 'F3',
        G5: 'F4',
        G6: 'F5',
        G7: 'F6',
        G8: 'F7',
        H1: null,
        H2: 'G1',
        H3: 'G2',
        H4: 'G3',
        H5: 'G4',
        H6: 'G5',
        H7: 'G6',
        H8: 'G7',
    },
}

const pawnScore = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
    [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
    [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
    [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
    [0.5, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.5],
    [0.5, 0.0, 0.0, -2.0, -2.0, 0.0, 0.0, 0.5],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
]

const knightScore = [
    [-4.0, -3.0, -2.0, -2.0, -2.0, -2.0, -3.0, -4.0],
    [-3.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -3.0],
    [-2.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -2.0],
    [-2.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -2.0],
    [-2.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -2.0],
    [-2.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -2.0],
    [-3.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -3.0],
    [-4.0, -3.0, -2.0, -2.0, -2.0, -2.0, -3.0, -4.0],
]

const bishopScore = [
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
    [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
    [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
    [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
    [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
]

const rookScore = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0],
]

const kingScore = [
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
    [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0],
]

const queenScore = [
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
]

const scoreByPosition = {
    P: pawnScore.slice().reverse(),
    p: pawnScore,
    N: knightScore.slice().reverse(),
    n: knightScore,
    B: bishopScore.slice().reverse(),
    b: bishopScore,
    R: rookScore.slice().reverse(),
    r: rookScore,
    K: kingScore.slice().reverse(),
    k: kingScore,
    Q: queenScore.slice().reverse(),
    q: queenScore,
}

function up (location) {
    return CLOSE_FIELDS_MAP.UP[location]
}

function down (location) {
    return CLOSE_FIELDS_MAP.DOWN[location]
}

function left (location) {
    return CLOSE_FIELDS_MAP.LEFT[location]
}

function right (location) {
    return CLOSE_FIELDS_MAP.RIGHT[location]
}

function upLeft (location) {
    return CLOSE_FIELDS_MAP.UP_LEFT[location]
}

function upRight (location) {
    return CLOSE_FIELDS_MAP.UP_RIGHT[location]
}

function downLeft (location) {
    return CLOSE_FIELDS_MAP.DOWN_LEFT[location]
}

function downRight (location) {
    return CLOSE_FIELDS_MAP.DOWN_RIGHT[location]
}

function upLeftUp (location) {
    const field = upLeft(location)
    return field ? up(field) : null
}

function upLeftLeft (location) {
    const field = upLeft(location)
    return field ? left(field) : null
}

function upRightUp (location) {
    const field = upRight(location)
    return field ? up(field) : null
}

function upRightRight (location) {
    const field = upRight(location)
    return field ? right(field) : null
}

function downLeftDown (location) {
    const field = downLeft(location)
    return field ? down(field) : null
}

function downLeftLeft (location) {
    const field = downLeft(location)
    return field ? left(field) : null
}

function downRightDown (location) {
    const field = downRight(location)
    return field ? down(field) : null
}

function downRightRight (location) {
    const field = downRight(location)
    return field ? right(field) : null
}

function upByColor (location, color) {
    if (color === COLORS.WHITE) {
        return CLOSE_FIELDS_MAP.UP[location]
    } else {
        return CLOSE_FIELDS_MAP.DOWN[location]
    }
}

function downByColor (location, color) {
    if (color === COLORS.WHITE) {
        return CLOSE_FIELDS_MAP.DOWN[location]
    } else {
        return CLOSE_FIELDS_MAP.UP[location]
    }
}

function leftByColor (location, color) {
    if (color === COLORS.WHITE) {
        return CLOSE_FIELDS_MAP.LEFT[location]
    } else {
        return CLOSE_FIELDS_MAP.RIGHT[location]
    }
}

function rightByColor (location, color) {
    if (color === COLORS.WHITE) {
        return CLOSE_FIELDS_MAP.RIGHT[location]
    } else {
        return CLOSE_FIELDS_MAP.LEFT[location]
    }
}

function upLeftByColor (location, color) {
    if (color === COLORS.WHITE) {
        return CLOSE_FIELDS_MAP.UP_LEFT[location]
    } else {
        return CLOSE_FIELDS_MAP.DOWN_RIGHT[location]
    }
}

function upRightByColor (location, color) {
    if (color === COLORS.WHITE) {
        return CLOSE_FIELDS_MAP.UP_RIGHT[location]
    } else {
        return CLOSE_FIELDS_MAP.DOWN_LEFT[location]
    }
}

function downLeftByColor (location, color) {
    if (color === COLORS.WHITE) {
        return CLOSE_FIELDS_MAP.DOWN_LEFT[location]
    } else {
        return CLOSE_FIELDS_MAP.UP_RIGHT[location]
    }
}

function downRightByColor (location, color) {
    if (color === COLORS.WHITE) {
        return CLOSE_FIELDS_MAP.DOWN_RIGHT[location]
    } else {
        return CLOSE_FIELDS_MAP.UP_LEFT[location]
    }
}

function printToConsole (configuration) {
    console.log('\n')
    let fieldColor = COLORS.WHITE
    Object.assign([], ROWS).reverse().map(row => {
        console.log(`${row}`)
        COLUMNS.map(column => {
            switch (configuration.pieces[`${column}${row}`]) {
            case 'K': console.log('\u265A'); break
            case 'Q': console.log('\u265B'); break
            case 'R': console.log('\u265C'); break
            case 'B': console.log('\u265D'); break
            case 'N': console.log('\u265E'); break
            case 'P': console.log('\u265F'); break
            case 'k': console.log('\u2654'); break
            case 'q': console.log('\u2655'); break
            case 'r': console.log('\u2656'); break
            case 'b': console.log('\u2657'); break
            case 'n': console.log('\u2658'); break
            case 'p': console.log('\u2659'); break
            default: console.log(fieldColor === COLORS.WHITE ? '\u2588' : '\u2591')
            }

            fieldColor = fieldColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE
        })
        fieldColor = fieldColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE
        console.log('\n')
    })
    console.log(' ')
    COLUMNS.map(column => {
        console.log(`${column}`)
    })
    console.log('\n')
}

function getPieceValue (piece) {
    const values = { k: 10, q: 9, r: 5, b: 3, n: 3, p: 1 }
    return values[piece.toLowerCase()] || 0
}

function getFEN (configuration) {
    let fen = ''
    Object.assign([], ROWS).reverse().map(row => {
        let emptyFields = 0
        if (row < 8) {
            fen += '/'
        }
        COLUMNS.map(column => {
            const piece = configuration.pieces[`${column}${row}`]
            if (piece) {
                if (emptyFields) {
                    fen += emptyFields.toString()
                    emptyFields = 0
                }
                fen += piece
            } else {
                emptyFields++
            }
        })
        fen += `${emptyFields || ''}`
    })

    fen += configuration.turn === COLORS.WHITE ? ' w ' : ' b '

    const { whiteShort, whiteLong, blackLong, blackShort } = configuration.castling
    if (!whiteLong && !whiteShort && !blackLong && !blackShort) {
        fen += '-'
    } else {
        if (whiteShort) fen += 'K'
        if (whiteLong) fen += 'Q'
        if (blackShort) fen += 'k'
        if (blackLong) fen += 'q'
    }

    fen += ` ${configuration.enPassant ? configuration.enPassant.toLowerCase() : '-'}`

    fen += ` ${configuration.halfMove}`

    fen += ` ${configuration.fullMove}`

    return fen
}

function getJSONfromFEN (fen = '') {
    const [board, player, castlings, enPassant, halfmove, fullmove] = fen.split(' ')

    // pieces
    const configuration = {
        pieces: Object.fromEntries(board.split('/').flatMap((row, rowIdx) => {
            let colIdx = 0
            return row.split('').reduce((acc, sign) => {
                const piece = sign.match(/k|b|q|n|p|r/i)
                if (piece) {
                    acc.push([`${COLUMNS[colIdx]}${ROWS[7 - rowIdx]}`, piece[0]])
                    colIdx += 1
                }
                const squares = sign.match(/[1-8]/)
                if (squares) {
                    colIdx += Number(squares)
                }
                return acc
            }, [])
        })),
    }

    // playing player
    if (player === 'b') {
        configuration.turn = COLORS.BLACK
    } else {
        configuration.turn = COLORS.WHITE
    }

    // castlings
    configuration.castling = {
        whiteLong: false,
        whiteShort: false,
        blackLong: false,
        blackShort: false,
    }
    if (castlings.includes('K')) {
        configuration.castling.whiteShort = true
    }
    if (castlings.includes('k')) {
        configuration.castling.blackShort = true
    }
    if (castlings.includes('Q')) {
        configuration.castling.whiteLong = true
    }
    if (castlings.includes('q')) {
        configuration.castling.blackLong = true
    }

    // enPassant
    if (isLocationValid(enPassant)) {
        configuration.enPassant = enPassant.toUpperCase()
    }

    // halfmoves
    configuration.halfMove = parseInt(halfmove)

    // fullmoves
    configuration.fullMove = parseInt(fullmove)

    return configuration
}

function isLocationValid (location) {
    return typeof location === 'string' && location.match('^[a-hA-H]{1}[1-8]{1}$')
}

function isPieceValid (piece) {
    return Object.values(PIECES).includes(piece)
}

const SCORE = {
    MIN: -1000,
    MAX: 1000,
}

const PIECE_VALUE_MULTIPLIER = 10

class Board {
    constructor (configuration = JSON.parse(JSON.stringify(NEW_GAME_BOARD_CONFIG))) {
        if (typeof configuration === 'object') {
            this.configuration = Object.assign({}, NEW_GAME_SETTINGS, configuration)
        } else if (typeof configuration === 'string') {
            this.configuration = Object.assign({}, NEW_GAME_SETTINGS, getJSONfromFEN(configuration))
        } else {
            throw new Error(`Unknown configuration type ${typeof config}.`)
        }
        if (!this.configuration.castling) {
            this.configuration.castling = {
                whiteShort: true,
                blackShort: true,
                whiteLong: true,
                blackLong: true,
            }
        }
        this.history = []
    }

    getAttackingFields (color = this.getPlayingColor()) {
        let attackingFields = []
        for (const location in this.configuration.pieces) {
            const piece = this.getPiece(location)
            if (this.getPieceColor(piece) === color) {
                attackingFields = [...attackingFields, ...this.getPieceMoves(piece, location)]
            }
        }
        return attackingFields
    }

    isAttackingKing (color = this.getPlayingColor()) {
        let kingLocation = this.getKingPosition(color);
        return this.isPieceUnderAttack(kingLocation)
    }

	getKingPosition(color = this.getPlayingColor()) {
		let kingLocation = null
        for (const location in this.configuration.pieces) {
            const piece = this.getPiece(location)
            if (this.isKing(piece) && this.getPieceColor(piece) !== color) {
                kingLocation = location
                break
            }
        }

		return kingLocation;
	}

    isPieceUnderAttack (pieceLocation) {
        const playerColor = this.getPieceOnLocationColor(pieceLocation)
        const enemyColor = this.getEnemyColor(playerColor)
        let isUnderAttack = false

        let field = pieceLocation
        let distance = 0
        while (up(field) && !isUnderAttack) {
            field = up(field)
            distance++
            const piece = this.getPiece(field)
            if (piece && this.getPieceColor(piece) === enemyColor &&
                (this.isRook(piece) || this.isQueen(piece) || (this.isKing(piece) && distance === 1))) {
                isUnderAttack = true
            }
            if (piece) break
        }

        field = pieceLocation
        distance = 0
        while (down(field) && !isUnderAttack) {
            field = down(field)
            distance++
            const piece = this.getPiece(field)
            if (piece && this.getPieceColor(piece) === enemyColor &&
                (this.isRook(piece) || this.isQueen(piece) || (this.isKing(piece) && distance === 1))) {
                isUnderAttack = true
            }
            if (piece) break
        }

        field = pieceLocation
        distance = 0
        while (left(field) && !isUnderAttack) {
            field = left(field)
            distance++
            const piece = this.getPiece(field)
            if (piece && this.getPieceColor(piece) === enemyColor &&
                (this.isRook(piece) || this.isQueen(piece) || (this.isKing(piece) && distance === 1))) {
                isUnderAttack = true
            }
            if (piece) break
        }

        field = pieceLocation
        distance = 0
        while (right(field) && !isUnderAttack) {
            field = right(field)
            distance++
            const piece = this.getPiece(field)
            if (piece && this.getPieceColor(piece) === enemyColor &&
                (this.isRook(piece) || this.isQueen(piece) || (this.isKing(piece) && distance === 1))) {
                isUnderAttack = true
            }
            if (piece) break
        }

        field = pieceLocation
        distance = 0
        while (upRightByColor(field, playerColor) && !isUnderAttack) {
            field = upRightByColor(field, playerColor)
            distance++
            const piece = this.getPiece(field)
            if (piece && this.getPieceColor(piece) === enemyColor &&
                (this.isBishop(piece) || this.isQueen(piece) || (distance === 1 && (this.isKing(piece) || this.isPawn(piece))))) {
                isUnderAttack = true
            }
            if (piece) break
        }

        field = pieceLocation
        distance = 0
        while (upLeftByColor(field, playerColor) && !isUnderAttack) {
            field = upLeftByColor(field, playerColor)
            distance++
            const piece = this.getPiece(field)
            if (piece && this.getPieceColor(piece) === enemyColor &&
                (this.isBishop(piece) || this.isQueen(piece) || (distance === 1 && (this.isKing(piece) || this.isPawn(piece))))) {
                isUnderAttack = true
            }
            if (piece) break
        }

        field = pieceLocation
        distance = 0
        while (downRightByColor(field, playerColor) && !isUnderAttack) {
            field = downRightByColor(field, playerColor)
            distance++
            const piece = this.getPiece(field)
            if (piece && this.getPieceColor(piece) === enemyColor &&
                (this.isBishop(piece) || this.isQueen(piece) || (this.isKing(piece) && distance === 1))) {
                isUnderAttack = true
            }
            if (piece) break
        }

        field = pieceLocation
        distance = 0
        while (downLeftByColor(field, playerColor) && !isUnderAttack) {
            field = downLeftByColor(field, playerColor)
            distance++
            const piece = this.getPiece(field)
            if (piece && this.getPieceColor(piece) === enemyColor &&
                (this.isBishop(piece) || this.isQueen(piece) || (this.isKing(piece) && distance === 1))) {
                isUnderAttack = true
            }
            if (piece) break
        }

        field = upRightUp(pieceLocation)
        let piece = this.getPiece(field)
        if (piece && this.getPieceColor(piece) === enemyColor && this.isKnight(piece)) {
            isUnderAttack = true
        }
        field = upRightRight(pieceLocation)
        piece = this.getPiece(field)
        if (piece && this.getPieceColor(piece) === enemyColor && this.isKnight(piece)) {
            isUnderAttack = true
        }
        field = upLeftLeft(pieceLocation)
        piece = this.getPiece(field)
        if (piece && this.getPieceColor(piece) === enemyColor && this.isKnight(piece)) {
            isUnderAttack = true
        }
        field = upLeftUp(pieceLocation)
        piece = this.getPiece(field)
        if (piece && this.getPieceColor(piece) === enemyColor && this.isKnight(piece)) {
            isUnderAttack = true
        }
        field = downLeftDown(pieceLocation)
        piece = this.getPiece(field)
        if (piece && this.getPieceColor(piece) === enemyColor && this.isKnight(piece)) {
            isUnderAttack = true
        }
        field = downLeftLeft(pieceLocation)
        piece = this.getPiece(field)
        if (piece && this.getPieceColor(piece) === enemyColor && this.isKnight(piece)) {
            isUnderAttack = true
        }
        field = downRightDown(pieceLocation)
        piece = this.getPiece(field)
        if (piece && this.getPieceColor(piece) === enemyColor && this.isKnight(piece)) {
            isUnderAttack = true
        }
        field = downRightRight(pieceLocation)
        piece = this.getPiece(field)
        if (piece && this.getPieceColor(piece) === enemyColor && this.isKnight(piece)) {
            isUnderAttack = true
        }

        return isUnderAttack
    }

    hasPlayingPlayerCheck () {
        return this.isAttackingKing(this.getNonPlayingColor())
    }

    hasNonPlayingPlayerCheck () {
        return this.isAttackingKing(this.getPlayingColor())
    }

    getLowestValuePieceAttackingLocation (location, color = this.getPlayingColor()) {
        let pieceValue = null
        for (const field in this.configuration.pieces) {
            const piece = this.getPiece(field)
            if (this.getPieceColor(piece) === color) {
                this.getPieceMoves(piece, field).map(attackingLocation => {
                    if (attackingLocation === location && (pieceValue === null || getPieceValue(piece) < pieceValue)) {
                        pieceValue = getPieceValue(piece)
                    }
                })
            }
        }
        return pieceValue
    }

    getMoves (color = this.getPlayingColor(), movablePiecesRequiredToSkipTest = null) {
        const allMoves = {}
        let movablePiecesCount = 0
        for (const location in this.configuration.pieces) {
            const piece = this.getPiece(location)
            if (this.getPieceColor(piece) === color) {
                const moves = this.getPieceMoves(piece, location)
                if (moves.length) {
                    movablePiecesCount++
                }
                Object.assign(allMoves, { [location]: moves })
            }
        }

        const enemyAttackingFields = this.getAttackingFields(this.getNonPlayingColor())
        if (this.isLeftCastlingPossible(enemyAttackingFields)) {
            if (this.isPlayingWhite()) allMoves.E1.push('C1')
            if (this.isPlayingBlack()) allMoves.E8.push('C8')
        }
        if (this.isRightCastlingPossible(enemyAttackingFields)) {
            if (this.isPlayingWhite()) allMoves.E1.push('G1')
            if (this.isPlayingBlack()) allMoves.E8.push('G8')
        }

        if (movablePiecesRequiredToSkipTest && movablePiecesCount > movablePiecesRequiredToSkipTest) return allMoves

        const moves = {}
        for (const from in allMoves) {
            allMoves[from].map(to => {
                const testConfiguration = {
                    pieces: Object.assign({}, this.configuration.pieces),
                    castling: Object.assign({}, this.configuration.castling),
                }
                const testBoard = new Board(testConfiguration)
                testBoard.move(from, to)
                if (
                    (this.isPlayingWhite() && !testBoard.isAttackingKing(COLORS.BLACK)) ||
                    (this.isPlayingBlack() && !testBoard.isAttackingKing(COLORS.WHITE))
                ) {
                    if (!moves[from]) {
                        moves[from] = []
                    }
                    moves[from].push(to)
                }
            })
        }

        if (!Object.keys(moves).length) {
            this.configuration.isFinished = true
            if (this.hasPlayingPlayerCheck()) {
                this.configuration.checkMate = true
            }
        }

        return moves
    }

    isLeftCastlingPossible (enemyAttackingFields) {
        if (this.isPlayingWhite() && !this.configuration.castling.whiteLong) return false
        if (this.isPlayingBlack() && !this.configuration.castling.blackLong) return false

        let kingLocation = null
        if (this.isPlayingWhite() && this.getPiece('E1') === 'K' && this.getPiece('A1') === 'R' && !enemyAttackingFields.includes('E1')) {
            kingLocation = 'E1'
        } else if (this.isPlayingBlack() && this.getPiece('E8') === 'k' && this.getPiece('A8') === 'r' && !enemyAttackingFields.includes('E8')) {
            kingLocation = 'E8'
        }
        if (!kingLocation) return false
        let field = left(kingLocation)
        if (this.getPiece(field) || enemyAttackingFields.includes(field)) return false
        field = left(field)
        if (this.getPiece(field) || enemyAttackingFields.includes(field)) return false
        field = left(field)
        if (this.getPiece(field)) return false

        return true
    }

    isRightCastlingPossible (enemyAttackingFields) {
        if (this.isPlayingWhite() && !this.configuration.castling.whiteShort) return false
        if (this.isPlayingBlack() && !this.configuration.castling.blackShort) return false

        let kingLocation = null
        if (this.isPlayingWhite() && this.getPiece('E1') === 'K' && this.getPiece('H1') === 'R' && !enemyAttackingFields.includes('E1')) {
            kingLocation = 'E1'
        } else if (this.isPlayingBlack() && this.getPiece('E8') === 'k' && this.getPiece('H8') === 'r' && !enemyAttackingFields.includes('E8')) {
            kingLocation = 'E8'
        }
        if (!kingLocation) return false

        let field = right(kingLocation)
        if (this.getPiece(field) || enemyAttackingFields.includes(field)) return false
        field = right(field)
        if (this.getPiece(field) || enemyAttackingFields.includes(field)) return false

        return true
    }

    getPieceMoves (piece, location) {
        if (this.isPawn(piece)) return this.getPawnMoves(piece, location)
        if (this.isKnight(piece)) return this.getKnightMoves(piece, location)
        if (this.isRook(piece)) return this.getRookMoves(piece, location)
        if (this.isBishop(piece)) return this.getBishopMoves(piece, location)
        if (this.isQueen(piece)) return this.getQueenMoves(piece, location)
        if (this.isKing(piece)) return this.getKingMoves(piece, location)
        return []
    }

    isPawn (piece) {
        return piece.toUpperCase() === 'P'
    }

    isKnight (piece) {
        return piece.toUpperCase() === 'N'
    }

    isRook (piece) {
        return piece.toUpperCase() === 'R'
    }

    isBishop (piece) {
        return piece.toUpperCase() === 'B'
    }

    isQueen (piece) {
        return piece.toUpperCase() === 'Q'
    }

    isKing (piece) {
        return piece.toUpperCase() === 'K'
    }

    getPawnMoves (piece, location) {
        const moves = []
        const color = this.getPieceColor(piece)
        let move = upByColor(location, color)

        if (move && !this.getPiece(move)) {
            moves.push(move)
            move = upByColor(move, color)
            if (isInStartLine(color, location) && move && !this.getPiece(move)) {
                moves.push(move)
            }
        }

        move = upLeftByColor(location, color)
        if (move && ((this.getPiece(move) && this.getPieceOnLocationColor(move) !== color) || (move === this.configuration.enPassant))) {
            moves.push(move)
        }

        move = upRightByColor(location, color)
        if (move && ((this.getPiece(move) && this.getPieceOnLocationColor(move) !== color) || (move === this.configuration.enPassant))) {
            moves.push(move)
        }

        function isInStartLine (color, location) {
            if (color === COLORS.WHITE && location[1] === '2') {
                return true
            }
            if (color === COLORS.BLACK && location[1] === '7') {
                return true
            }
            return false
        }

        return moves
    }

    getKnightMoves (piece, location) {
        const moves = []
        const color = this.getPieceColor(piece)

        let field = upRightUp(location)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = upRightRight(location)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = upLeftUp(location)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = upLeftLeft(location)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = downLeftLeft(location)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = downLeftDown(location)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = downRightRight(location)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = downRightDown(location)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        return moves
    }

    getRookMoves (piece, location) {
        const moves = []
        const color = this.getPieceColor(piece)

        let field = location
        while (up(field)) {
            field = up(field)
            const pieceOnFieldColor = this.getPieceOnLocationColor(field)
            if (this.getPieceOnLocationColor(field) !== color) {
                moves.push(field)
            }
            if (pieceOnFieldColor) break
        }

        field = location
        while (down(field)) {
            field = down(field)
            const pieceOnFieldColor = this.getPieceOnLocationColor(field)
            if (this.getPieceOnLocationColor(field) !== color) {
                moves.push(field)
            }
            if (pieceOnFieldColor) break
        }

        field = location
        while (right(field)) {
            field = right(field)
            const pieceOnFieldColor = this.getPieceOnLocationColor(field)
            if (this.getPieceOnLocationColor(field) !== color) {
                moves.push(field)
            }
            if (pieceOnFieldColor) break
        }

        field = location
        while (left(field)) {
            field = left(field)
            const pieceOnFieldColor = this.getPieceOnLocationColor(field)
            if (this.getPieceOnLocationColor(field) !== color) {
                moves.push(field)
            }
            if (pieceOnFieldColor) break
        }

        return moves
    }

    getBishopMoves (piece, location) {
        const moves = []
        const color = this.getPieceColor(piece)

        let field = location
        while (upLeft(field)) {
            field = upLeft(field)
            const pieceOnFieldColor = this.getPieceOnLocationColor(field)
            if (this.getPieceOnLocationColor(field) !== color) {
                moves.push(field)
            }
            if (pieceOnFieldColor) break
        }

        field = location
        while (upRight(field)) {
            field = upRight(field)
            const pieceOnFieldColor = this.getPieceOnLocationColor(field)
            if (this.getPieceOnLocationColor(field) !== color) {
                moves.push(field)
            }
            if (pieceOnFieldColor) break
        }

        field = location
        while (downLeft(field)) {
            field = downLeft(field)
            const pieceOnFieldColor = this.getPieceOnLocationColor(field)
            if (this.getPieceOnLocationColor(field) !== color) {
                moves.push(field)
            }
            if (pieceOnFieldColor) break
        }

        field = location
        while (downRight(field)) {
            field = downRight(field)
            const pieceOnFieldColor = this.getPieceOnLocationColor(field)
            if (this.getPieceOnLocationColor(field) !== color) {
                moves.push(field)
            }
            if (pieceOnFieldColor) break
        }

        return moves
    }

    getQueenMoves (piece, location) {
        const moves = [
            ...this.getRookMoves(piece, location),
            ...this.getBishopMoves(piece, location),
        ]
        return moves
    }

    getKingMoves (piece, location) {
        const moves = []
        const color = this.getPieceColor(piece)

        let field = location
        field = up(field)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = location
        field = right(field)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = location
        field = down(field)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = location
        field = left(field)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = location
        field = upLeft(field)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = location
        field = upRight(field)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = location
        field = downLeft(field)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        field = location
        field = downRight(field)
        if (field && this.getPieceOnLocationColor(field) !== color) {
            moves.push(field)
        }

        return moves
    }

    getPieceColor (piece) {
        if (piece.toUpperCase() === piece) return COLORS.WHITE
        return COLORS.BLACK
    }

    getPieceOnLocationColor (location) {
        const piece = this.getPiece(location)
        if (!piece) return null
        if (piece.toUpperCase() === piece) return COLORS.WHITE
        return COLORS.BLACK
    }

    getPiece (location) {
        return this.configuration.pieces[location]
    }

    setPiece (location, piece) {
        if (!isPieceValid(piece)) {
            throw new Error(`Invalid piece ${piece}`)
        }

        if (!isLocationValid(location)) {
            throw new Error(`Invalid location ${location}`)
        }

        this.configuration.pieces[location.toUpperCase()] = piece
    }

    removePiece (location) {
        if (!isLocationValid(location)) {
            throw new Error(`Invalid location ${location}`)
        }

        delete this.configuration.pieces[location.toUpperCase()]
    }

    isEmpty (location) {
        if (!isLocationValid(location)) {
            throw new Error(`Invalid location ${location}`)
        }

        return !this.configuration.pieces[location.toUpperCase()]
    }

    getEnemyColor (playerColor) {
        return playerColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE
    }

    getPlayingColor () {
        return this.configuration.turn
    }

    getNonPlayingColor () {
        return this.isPlayingWhite() ? COLORS.BLACK : COLORS.WHITE
    }

    isPlayingWhite () {
        return this.configuration.turn === COLORS.WHITE
    }

    isPlayingBlack () {
        return this.configuration.turn === COLORS.BLACK
    }

    addMoveToHistory (from, to) {
        this.history.push({ from, to, configuration: JSON.parse(JSON.stringify(this.configuration)) })
    }

    move (from, to) {
        // Move logic
        const chessmanFrom = this.getPiece(from)
        const chessmanTo = this.getPiece(to)

        if (!chessmanFrom) {
            throw new Error(`There is no piece at ${from}`)
        }

        Object.assign(this.configuration.pieces, { [to]: chessmanFrom })
        delete this.configuration.pieces[from]

        // pawn reaches an end of a chessboard
        if (this.isPlayingWhite() && this.isPawn(chessmanFrom) && to[1] === '8') {
            Object.assign(this.configuration.pieces, { [to]: 'Q' })
        }
        if (this.isPlayingBlack() && this.isPawn(chessmanFrom) && to[1] === '1') {
            Object.assign(this.configuration.pieces, { [to]: 'q' })
        }

        // En passant check
        if (this.isPawn(chessmanFrom) && to === this.configuration.enPassant) {
            delete this.configuration.pieces[downByColor(to, this.getPlayingColor())]
        }

        // pawn En passant special move history
        if (this.isPawn(chessmanFrom) && this.isPlayingWhite() && from[1] === '2' && to[1] === '4') {
            this.configuration.enPassant = `${from[0]}3`
        } else if (this.isPawn(chessmanFrom) && this.isPlayingBlack() && from[1] === '7' && to[1] === '5') {
            this.configuration.enPassant = `${from[0]}6`
        } else {
            this.configuration.enPassant = null
        }

        // Castling - disabling
        if (from === 'E1') {
            Object.assign(this.configuration.castling, { whiteLong: false, whiteShort: false })
        }
        if (from === 'E8') {
            Object.assign(this.configuration.castling, { blackLong: false, blackShort: false })
        }
        if (from === 'A1') {
            Object.assign(this.configuration.castling, { whiteLong: false })
        }
        if (from === 'H1') {
            Object.assign(this.configuration.castling, { whiteShort: false })
        }
        if (from === 'A8') {
            Object.assign(this.configuration.castling, { blackLong: false })
        }
        if (from === 'H8') {
            Object.assign(this.configuration.castling, { blackShort: false })
        }

        // Castling - rook is moving too
        if (this.isKing(chessmanFrom)) {
            if (from === 'E1' && to === 'C1') return this.move('A1', 'D1')
            if (from === 'E8' && to === 'C8') return this.move('A8', 'D8')
            if (from === 'E1' && to === 'G1') return this.move('H1', 'F1')
            if (from === 'E8' && to === 'G8') return this.move('H8', 'F8')
        }

        this.configuration.turn = this.isPlayingWhite() ? COLORS.BLACK : COLORS.WHITE

        if (this.isPlayingWhite()) {
            this.configuration.fullMove++
        }

        this.configuration.halfMove++
        if (chessmanTo || this.isPawn(chessmanFrom)) {
            this.configuration.halfMove = 0
        }
    }

    exportJson () {
        return {
            moves: this.getMoves(),
            pieces: this.configuration.pieces,
            turn: this.configuration.turn,
            isFinished: this.configuration.isFinished,
            check: this.hasPlayingPlayerCheck(),
            checkMate: this.configuration.checkMate,
            castling: this.configuration.castling,
            enPassant: this.configuration.enPassant,
            halfMove: this.configuration.halfMove,
            fullMove: this.configuration.fullMove,
        }
    }

    calculateAiMove (level) {
        const scores = this.calculateAiMoves(level)
        return scores[0]
    }

    calculateAiMoves (level) {
        level = parseInt(level)
        if (!AI_LEVELS.includes(level)) {
            throw new Error(`Invalid level ${level}. You can choose ${AI_LEVELS.join(',')}`)
        }
        if (this.shouldIncreaseLevel()) {
            level++
        }
        const scoreTable = []
        const initialScore = this.calculateScore(this.getPlayingColor())
        const moves = this.getMoves()
        for (const from in moves) {
            moves[from].map(to => {
                const testBoard = this.getTestBoard()
                const wasScoreChanged = Boolean(testBoard.getPiece(to))
                testBoard.move(from, to)
                scoreTable.push({
                    from,
                    to,
                    score: testBoard.testMoveScores(this.getPlayingColor(), level, wasScoreChanged, wasScoreChanged ? testBoard.calculateScore(this.getPlayingColor()) : initialScore, to).score +
                        testBoard.calculateScoreByPiecesLocation(this.getPlayingColor()) +
                        (Math.floor(Math.random() * (this.configuration.halfMove > 10 ? this.configuration.halfMove - 10 : 1) * 10) / 10),
                })
            })
        }

        scoreTable.sort((previous, next) => {
            return previous.score < next.score ? 1 : previous.score > next.score ? -1 : 0
        })
        return scoreTable
    }

    shouldIncreaseLevel () {
        return this.getIngamePiecesValue() < 50
    }

    getIngamePiecesValue () {
        let scoreIndex = 0
        for (const location in this.configuration.pieces) {
            const piece = this.getPiece(location)
            scoreIndex += getPieceValue(piece)
        }
        return scoreIndex
    }

    getTestBoard () {
        const testConfiguration = {
            pieces: Object.assign({}, this.configuration.pieces),
            castling: Object.assign({}, this.configuration.castling),
            turn: this.configuration.turn,
            enPassant: this.configuration.enPassant,
        }
        return new Board(testConfiguration)
    }

    testMoveScores (playingPlayerColor, level, capture, initialScore, move, depth = 1) {
        let nextMoves = null
        if (depth < AI_DEPTH_BY_LEVEL.EXTENDED[level] && this.hasPlayingPlayerCheck()) {
            nextMoves = this.getMoves(this.getPlayingColor())
        } else if (depth < AI_DEPTH_BY_LEVEL.BASE[level] || (capture && depth < AI_DEPTH_BY_LEVEL.EXTENDED[level])) {
            nextMoves = this.getMoves(this.getPlayingColor(), 5)
        }

        if (this.configuration.isFinished) {
            return {
                score: this.calculateScore(playingPlayerColor) + (this.getPlayingColor() === playingPlayerColor ? depth : -depth),
                max: true,
            }
        }

        if (!nextMoves) {
            if (initialScore !== null) return { score: initialScore, max: false }
            const score = this.calculateScore(playingPlayerColor)
            return {
                score,
                max: false,
            }
        }

        let bestScore = this.getPlayingColor() === playingPlayerColor ? SCORE.MIN : SCORE.MAX
        let maxValueReached = false
        for (const from in nextMoves) {
            if (maxValueReached) continue
            nextMoves[from].map(to => {
                if (maxValueReached) return
                const testBoard = this.getTestBoard()
                const wasScoreChanged = Boolean(testBoard.getPiece(to))
                testBoard.move(from, to)
                if (testBoard.hasNonPlayingPlayerCheck()) return
                const result = testBoard.testMoveScores(playingPlayerColor, level, wasScoreChanged, wasScoreChanged ? testBoard.calculateScore(playingPlayerColor) : initialScore, to, depth + 1)
                if (result.max) {
                    maxValueReached = true
                }
                if (this.getPlayingColor() === playingPlayerColor) {
                    bestScore = Math.max(bestScore, result.score)
                } else {
                    bestScore = Math.min(bestScore, result.score)
                }
            })
        }

        return { score: bestScore, max: false }
    }

    calculateScoreByPiecesLocation (player = this.getPlayingColor()) {
        const columnMapping = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7 }
        const scoreMultiplier = 0.5
        let score = 0
        for (const location in this.configuration.pieces) {
            const piece = this.getPiece(location)
            if (scoreByPosition[piece]) {
                const scoreIndex = scoreByPosition[piece][location[1] - 1][columnMapping[location[0]]]
                score += (this.getPieceColor(piece) === player ? scoreIndex : -scoreIndex) * scoreMultiplier
            }
        }
        return score
    }

    calculateScore (playerColor = this.getPlayingColor()) {
        let scoreIndex = 0

        if (this.configuration.checkMate) {
            if (this.getPlayingColor() === playerColor) {
                return SCORE.MIN
            } else {
                return SCORE.MAX
            }
        }

        if (this.configuration.isFinished) {
            if (this.getPlayingColor() === playerColor) {
                return SCORE.MAX
            } else {
                return SCORE.MIN
            }
        }

        for (const location in this.configuration.pieces) {
            const piece = this.getPiece(location)
            if (this.getPieceColor(piece) === playerColor) {
                scoreIndex += getPieceValue(piece) * PIECE_VALUE_MULTIPLIER
            } else {
                scoreIndex -= getPieceValue(piece) * PIECE_VALUE_MULTIPLIER
            }
        }

        return scoreIndex
    }
}

export class Game {

	static newGameConfig() {
		return Object.clone(NEW_GAME_BOARD_CONFIG)
	}

	static PIECES = PIECES;

	get state() { return this.board.configuration; }
	get finished() { return this.state.isFinished; }

    constructor (configuration) {
        this.board = new Board(configuration)
    }

    move (from, to) {
        from = from.toUpperCase()
        to = to.toUpperCase()
        const possibleMoves = this.board.getMoves()
        if (!possibleMoves[from] || !possibleMoves[from].includes(to)) {
            throw new Error(`Invalid move from ${from} to ${to} for ${this.board.getPlayingColor()}`)
        }
        this.board.addMoveToHistory(from, to)
        this.board.move(from, to)
        return { [from]: to }
    }

    moves (from = null) {
        return (from ? this.board.getMoves()[from.toUpperCase()] : this.board.getMoves()) || []
    }

    setPiece (location, piece) {
        this.board.setPiece(location, piece)
    }

    removePiece (location) {
        this.board.removePiece(location)
    }

    aiMove (level = 2) {
        const move = this.board.calculateAiMove(level)
        return this.move(move.from, move.to)
    }

    getHistory (reversed = false) {
        return reversed ? this.board.history.reverse() : this.board.history
    }

    printToConsole () {
        printToConsole(this.board.configuration)
    }

    exportJson () {
        return this.board.exportJson()
    }

    exportFEN () {
        return getFEN(this.board.configuration)
    }

	undo() {
		const hist = this.getHistory();
		const m = hist.pop();

		if (m) {

			this.board.configuration = m.configuration;

			return m;
		}
	}
}

export function moves (config) {
    if (!config) {
        throw new Error('Configuration param required.')
    }
    const game = new Game(config)
    return game.moves()
}

export function status (config) {
    if (!config) {
        throw new Error('Configuration param required.')
    }
    const game = new Game(config)
    return game.exportJson()
}

export function getFen (config) {
    if (!config) {
        throw new Error('Configuration param required.')
    }
    const game = new Game(config)
    return game.exportFEN()
}

export function move (config, from, to) {
    if (!config) {
        throw new Error('Configuration param required.')
    }
    const game = new Game(config)
    game.move(from, to)
    if (typeof config === 'object') {
        return game.exportJson()
    } else {
        return game.exportFEN()
    }
}

export function aiMove (config, level = 2) {
    if (!config) {
        throw new Error('Configuration param required.')
    }
    const game = new Game(config)
    const move = game.board.calculateAiMove(level)
    return { [move.from]: move.to }
}
