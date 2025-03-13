declare module 'wowjs' {
  interface WOWOptions {
    live?: boolean
  }

  class WOW {
    init(): void
    constructor(options: WOWOptions)
  }
}
