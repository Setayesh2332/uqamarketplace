export const validateName = (name, t) => {
    if (!name.trim()) {
        return t("validation.required");
    }
    if (name.length > 50) {
        return t("validation.nameMaxLength");
    }
    if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(name)) {
        return t("validation.nameInvalidChars");
    }
    return "";
};

export const validateEmail = (email, t) => {
    if (!email.trim()) {
        return t("validation.required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return t("validation.emailInvalid");
    }
    const emailLower = email.toLowerCase();
    if (!/@uqam\.ca$/.test(emailLower)) {
        return t("validation.emailUQAM");
    }
    return "";
};

export const validatePassword = (password, t) => {
    if (!password) {
        return t("validation.required");
    }
    if (password.length < 8) {
        return t("validation.passwordMinLength");
    }
    if (!/[a-z]/.test(password)) {
        return t("validation.passwordLowercase");
    }
    if (!/[A-Z]/.test(password)) {
        return t("validation.passwordUppercase");
    }
    if (!/[0-9]/.test(password)) {
        return t("validation.passwordDigit");
    }
    if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
        return t("validation.passwordSymbol");
    }
    return "";
};

export const validatePasswordMatch = (password, confirmPassword, t) => {
    if (!confirmPassword) {
        return t("validation.passwordConfirm");
    }
    if (password !== confirmPassword) {
        return t("validation.passwordMatch");
    }
    return "";
};

export const validateSelect = (value, fieldName, t) => {
    if (!value) {
        return t("validation.selectField", { fieldName });
    }
    return "";
};

