export const isUsPhone = (phone: string) => {
    return phone.startsWith('+1') || phone.startsWith('1');
}