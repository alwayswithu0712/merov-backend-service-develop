export const DocumentType = {
    IDCARD : 'IDCARD',
    PASSPORT: 'PASSPORT',
    DRIVING_LICENSE: 'DRIVING_LICENSE',
};

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];
