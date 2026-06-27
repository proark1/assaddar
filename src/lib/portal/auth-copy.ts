import type { Locale } from "@/content";

/**
 * Localized copy for the auth surface (login, register, password reset,
 * email verification, project invite) plus the transactional emails and the
 * JSON login route. German is authored first; English is an equal-quality
 * sibling, formal register throughout.
 */
const de = {
  brand: "ASSADDAR.",
  login: {
    metaTitle: "Portal Login | Assad Dar",
    title: "Kundenportal Login",
    intro:
      "Melden Sie sich an, um Projektstatus, Dateien, Aufgaben und Rechnungen zu sehen.",
    notices: {
      invalid: "Login nicht möglich. Bitte prüfen Sie E-Mail und Passwort.",
      verify: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.",
      rate: "Zu viele Login-Versuche. Bitte versuchen Sie es in einigen Minuten erneut.",
      config: "Das Portal ist noch nicht vollständig für die Produktion konfiguriert.",
      verifySent: "Bitte prüfen Sie Ihr Postfach und bestätigen Sie Ihre E-Mail.",
      verified: "E-Mail bestätigt. Sie können sich jetzt anmelden.",
      reset: "Passwort geändert. Sie können sich jetzt anmelden.",
    },
    noAccount: "Noch kein Konto?",
    registerLink: "Registrieren",
    forgotPrompt: "Passwort vergessen?",
    forgotLink: "Zurücksetzen",
    emailLabel: "E-Mail",
    passwordLabel: "Passwort",
    submit: "Einloggen",
    submitting: "Einloggen...",
    opening: "Portal wird geöffnet...",
    successPrefix: "Login erfolgreich.",
    openPortal: "Portal öffnen",
    genericError: "Login nicht möglich. Bitte erneut versuchen.",
    timeoutError:
      "Der Login dauert zu lange. Bitte Verbindung prüfen und erneut versuchen.",
    failError: "Login konnte nicht abgeschlossen werden. Bitte erneut versuchen.",
  },
  register: {
    metaTitle: "Portal Registrierung | Assad Dar",
    title: "Kundenkonto erstellen",
    intro:
      "Nach der Registrierung kann Assad Ihr Konto einem oder mehreren Projekten zuordnen.",
    nameLabel: "Name",
    emailLabel: "E-Mail",
    passwordLabel: "Passwort",
    passwordHint: "Mindestens 8 Zeichen.",
    submit: "Konto erstellen",
    invalid: "Bitte füllen Sie Name, E-Mail und Passwort korrekt aus.",
    exists: "Für diese E-Mail existiert bereits ein Konto.",
    rate: "Zu viele Registrierungsversuche. Bitte versuchen Sie es später erneut.",
    haveAccount: "Schon registriert?",
    loginLink: "Einloggen",
  },
  forgot: {
    metaTitle: "Passwort zurücksetzen | Assad Dar",
    title: "Passwort zurücksetzen",
    intro: "Wenn ein Konto existiert, senden wir einen Link zum Zurücksetzen.",
    sent: "Bitte prüfen Sie Ihr Postfach. Der Link ist 60 Minuten gültig.",
    emailLabel: "E-Mail",
    submit: "Link senden",
    backTo: "Zurück zum",
    loginLink: "Login",
  },
  reset: {
    metaTitle: "Neues Passwort | Assad Dar",
    title: "Neues Passwort setzen",
    intro: "Wählen Sie ein neues Passwort mit mindestens 8 Zeichen.",
    passwordLabel: "Neues Passwort",
    submit: "Passwort speichern",
    invalid: "Bitte geben Sie ein gültiges Passwort ein.",
    token: "Der Link ist ungültig oder abgelaufen.",
  },
  verify: {
    metaTitle: "E-Mail bestätigen | Assad Dar",
    title: "E-Mail bestätigen",
    intro: "Bestätigen Sie Ihre E-Mail-Adresse, um das Portal zu nutzen.",
    submit: "E-Mail bestätigen",
    token: "Der Bestätigungslink ist ungültig oder abgelaufen.",
  },
  invite: {
    metaTitle: "Portal Einladung | Assad Dar",
    title: "Portal Einladung annehmen",
    intro:
      "Legen Sie ein Passwort fest. Danach werden Sie direkt in Ihr Projektportal weitergeleitet.",
    passwordLabel: "Passwort",
    confirmLabel: "Passwort bestätigen",
    submit: "Einladung annehmen",
    token: "Der Einladungslink ist ungültig oder abgelaufen.",
    invalid:
      "Bitte geben Sie ein gültiges Passwort ein und bestätigen Sie es identisch.",
  },
  loginApi: {
    config: "Das Portal ist noch nicht vollständig für die Produktion konfiguriert.",
    parse: "Die Login-Anfrage konnte nicht gelesen werden.",
    rate: "Zu viele Login-Versuche. Bitte versuchen Sie es in einigen Minuten erneut.",
    invalid: "Login nicht möglich. Bitte prüfen Sie E-Mail und Passwort.",
    verify: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.",
  },
  emails: {
    verify: {
      subject: "Assad Dar Portal: E-Mail bestätigen",
      body: (name: string, url: string) =>
        [
          `Hallo ${name},`,
          "",
          "bitte bestätigen Sie Ihre E-Mail-Adresse für das Assad Dar Portal:",
          url,
          "",
          "Der Link ist 24 Stunden gültig.",
        ].join("\n"),
    },
    reset: {
      subject: "Assad Dar Portal: Passwort zurücksetzen",
      body: (name: string, url: string) =>
        [
          `Hallo ${name},`,
          "",
          "über diesen Link können Sie Ihr Passwort zurücksetzen:",
          url,
          "",
          "Der Link ist 60 Minuten gültig. Falls Sie die Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.",
        ].join("\n"),
    },
  },
};

const en: typeof de = {
  brand: "ASSADDAR.",
  login: {
    metaTitle: "Portal login | Assad Dar",
    title: "Client portal login",
    intro:
      "Sign in to see project status, files, tasks, and invoices.",
    notices: {
      invalid: "Login failed. Please check your email and password.",
      verify: "Please confirm your email address first.",
      rate: "Too many login attempts. Please try again in a few minutes.",
      config: "The portal is not yet fully configured for production.",
      verifySent: "Please check your inbox and confirm your email.",
      verified: "Email confirmed. You can sign in now.",
      reset: "Password changed. You can sign in now.",
    },
    noAccount: "No account yet?",
    registerLink: "Register",
    forgotPrompt: "Forgot your password?",
    forgotLink: "Reset it",
    emailLabel: "Email",
    passwordLabel: "Password",
    submit: "Sign in",
    submitting: "Signing in...",
    opening: "Opening the portal...",
    successPrefix: "Signed in.",
    openPortal: "Open portal",
    genericError: "Login failed. Please try again.",
    timeoutError: "The login is taking too long. Please check your connection and try again.",
    failError: "The login could not be completed. Please try again.",
  },
  register: {
    metaTitle: "Portal registration | Assad Dar",
    title: "Create a client account",
    intro:
      "After registering, Assad can assign your account to one or more projects.",
    nameLabel: "Name",
    emailLabel: "Email",
    passwordLabel: "Password",
    passwordHint: "At least 8 characters.",
    submit: "Create account",
    invalid: "Please complete name, email, and password correctly.",
    exists: "An account already exists for this email.",
    rate: "Too many registration attempts. Please try again later.",
    haveAccount: "Already registered?",
    loginLink: "Sign in",
  },
  forgot: {
    metaTitle: "Reset password | Assad Dar",
    title: "Reset your password",
    intro: "If an account exists, we'll send a reset link.",
    sent: "Please check your inbox. The link is valid for 60 minutes.",
    emailLabel: "Email",
    submit: "Send link",
    backTo: "Back to",
    loginLink: "login",
  },
  reset: {
    metaTitle: "New password | Assad Dar",
    title: "Set a new password",
    intro: "Choose a new password with at least 8 characters.",
    passwordLabel: "New password",
    submit: "Save password",
    invalid: "Please enter a valid password.",
    token: "The link is invalid or has expired.",
  },
  verify: {
    metaTitle: "Confirm email | Assad Dar",
    title: "Confirm your email",
    intro: "Confirm your email address to use the portal.",
    submit: "Confirm email",
    token: "The confirmation link is invalid or has expired.",
  },
  invite: {
    metaTitle: "Portal invitation | Assad Dar",
    title: "Accept portal invitation",
    intro:
      "Set a password. You'll then be taken straight into your project portal.",
    passwordLabel: "Password",
    confirmLabel: "Confirm password",
    submit: "Accept invitation",
    token: "The invitation link is invalid or has expired.",
    invalid: "Please enter a valid password and confirm it identically.",
  },
  loginApi: {
    config: "The portal is not yet fully configured for production.",
    parse: "The login request could not be read.",
    rate: "Too many login attempts. Please try again in a few minutes.",
    invalid: "Login failed. Please check your email and password.",
    verify: "Please confirm your email address first.",
  },
  emails: {
    verify: {
      subject: "Assad Dar Portal: confirm your email",
      body: (name: string, url: string) =>
        [
          `Hello ${name},`,
          "",
          "please confirm your email address for the Assad Dar Portal:",
          url,
          "",
          "The link is valid for 24 hours.",
        ].join("\n"),
    },
    reset: {
      subject: "Assad Dar Portal: reset your password",
      body: (name: string, url: string) =>
        [
          `Hello ${name},`,
          "",
          "use this link to reset your password:",
          url,
          "",
          "The link is valid for 60 minutes. If you didn't request this, you can ignore this email.",
        ].join("\n"),
    },
  },
};

export type AuthCopy = typeof de;

export function getAuthCopy(locale: Locale): AuthCopy {
  return locale === "en" ? en : de;
}
