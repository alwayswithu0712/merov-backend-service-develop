const isAdult = (dateString: string): boolean => {
    const today = new Date();
    const birthDate = new Date(dateString);
    const age = today.getFullYear() - birthDate.getFullYear();
    const thisMonthLessBirthMonth = today.getMonth() - birthDate.getMonth();
    return !(
        age < 18 ||
        (age === 18 && (thisMonthLessBirthMonth < 0 || (thisMonthLessBirthMonth === 0 && today.getDate() < birthDate.getDate())))
    );
};
export default isAdult;
