import {
    validateName,
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    validateSelect,
} from "../validation";

const t = (key) => key;

describe("validation helpers", () => {

    test("validateName returns required error when empty", () => {
        expect(validateName("", t)).toBe("validation.required");
    });

    test("validateName returns required error when only spaces", () => {
        expect(validateName("   ", t)).toBe("validation.required");
    });

    test("validateName returns max length error when name is too long", () => {
        const longName = "a".repeat(51);
        expect(validateName(longName, t)).toBe("validation.nameMaxLength");
    });

    test("validateName returns invalid chars error when name contains digits/symbols", () => {
        expect(validateName("John123", t)).toBe("validation.nameInvalidChars");
        expect(validateName("Jane!", t)).toBe("validation.nameInvalidChars");
    });

    test("validateName returns no error for a valid name with accents and hyphen", () => {
        expect(validateName("Élise-Marie Tremblay", t)).toBe("");
    });

    //
    // validateEmail
    //
    test("validateEmail returns required error when empty", () => {
        expect(validateEmail("", t)).toBe("validation.required");
    });

    test("validateEmail returns invalid format error for malformed email", () => {
        expect(validateEmail("not-an-email", t)).toBe("validation.emailInvalid");
        expect(validateEmail("alice@uqam", t)).toBe("validation.emailInvalid");
    });

    test("validateEmail enforces UQAM email domain", () => {
        expect(validateEmail("alice@gmail.com", t)).toBe("validation.emailUQAM");
    });

    test("validateEmail accepts valid uqam.ca email (case insensitive)", () => {
        expect(validateEmail("alice.tremblay@uqam.ca", t)).toBe("");
        expect(validateEmail("ALICE.TREMBLAY@UQAM.CA", t)).toBe("");
    });

    test("validatePassword returns required error when empty", () => {
        expect(validatePassword("", t)).toBe("validation.required");
    });

    test("validatePassword enforces minimum length", () => {
        expect(validatePassword("Ab1!", t)).toBe("validation.passwordMinLength");
    });

    test("validatePassword requires at least one lowercase letter", () => {
        const pwd = "PASSWORD1!";
        expect(validatePassword(pwd, t)).toBe("validation.passwordLowercase");
    });

    test("validatePassword requires at least one uppercase letter", () => {
        const pwd = "password1!";
        expect(validatePassword(pwd, t)).toBe("validation.passwordUppercase");
    });

    test("validatePassword requires at least one digit", () => {
        const pwd = "Password!";
        expect(validatePassword(pwd, t)).toBe("validation.passwordDigit");
    });

    test("validatePassword requires at least one symbol", () => {
        const pwd = "Password1";
        expect(validatePassword(pwd, t)).toBe("validation.passwordSymbol");
    });

    test("validatePassword returns no error for a strong password", () => {
        const pwd = "Password1!";
        expect(validatePassword(pwd, t)).toBe("");
    });

    //
    // validatePasswordMatch
    //
    test("validatePasswordMatch returns confirm error when confirmation is empty", () => {
        expect(validatePasswordMatch("Password1!", "", t)).toBe(
            "validation.passwordConfirm"
        );
    });

    test("validatePasswordMatch detects mismatch", () => {
        expect(
            validatePasswordMatch("Password1!", "Different1!", t)
        ).toBe("validation.passwordMatch");
    });

    test("validatePasswordMatch returns no error when passwords match", () => {
        expect(
            validatePasswordMatch("Password1!", "Password1!", t)
        ).toBe("");
    });

    test("validateSelect requires a non-empty value", () => {
        expect(validateSelect("", "cycle d'étude", t)).toBe(
            "validation.selectField"
        );
    });

    test("validateSelect returns no error when a value is selected", () => {
        expect(validateSelect("bachelor", "cycle d'étude", t)).toBe("");
    });
});
