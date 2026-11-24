declare namespace NodeJS {
  // eslint-disable-next-line unicorn/prevent-abbreviations
  interface ProcessEnv {
    // Public env (inlined at build time):
    NEXT_PUBLIC_APP_NAME?: string;
    NEXT_PUBLIC_APP_URL?: string;
    /** @deprecated Use NEXT_PUBLIC_APP_URL. */
    NEXT_PUBLIC_TARTEEL_APP_URL?: string;
    NEXT_PUBLIC_APP_VERSION?: string;
    NEXT_PUBLIC_DEBUG?: string;

    // Private env:
    PORT?: string;
    DEBUG?: string;

    CONTACT_TO?: string;
  }
}
