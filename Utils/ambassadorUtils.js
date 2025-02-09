exports.createCode = (name, institution) => {
    const getInitials = (str) => {
        const words = str.trim().split(' ');
        if (words.length > 1) {
            return words[0][0].toUpperCase() + words[1][0].toUpperCase();
        } else {
            return str.substring(0, 2).toUpperCase();
        }
    };

    const nameInitials = getInitials(name);
    const institutionInitials = getInitials(institution);

    const randomNumbers = Math.floor(10 + Math.random() * 90);

    const finalCode = `${nameInitials}${institutionInitials}${randomNumbers}`;

    return finalCode;
};