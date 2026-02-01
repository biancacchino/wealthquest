// Shop Types and Reflections
export const SHOP_REFLECTIONS = {
    COFFEE: {
        title: "COFFEE — AFTER PURCHASE TEXT",
        lines: [
            "This was a convenience choice.",
            "The cost feels small on its own, but habits like this matter more through repetition than price.",
            "Nothing went wrong — this just traded flexibility for a quick boost."
        ]
    },
    MARKET: {
        title: "MARKET — AFTER PURCHASE TEXT",
        lines: [
            "This choice stretches further.",
            "It costs time and effort now, but gives you more control later.",
            "Decisions like this don’t feel exciting, yet they quietly support stability."
        ]
    },
    MALL: {
        title: "MALL — AFTER PURCHASE TEXT",
        lines: [
            "This was a comfort purchase.",
            "It improves how things feel right now, but it doesn’t help future problems.",
            "Enjoyment is real — the tradeoff is long-term flexibility."
        ]
    },
    MOVIES: {
        title: "MOVIES — AFTER PURCHASE TEXT",
        lines: [
            "This purchase buys an experience, not progress.",
            "It reduces stress and adds enjoyment today, but it doesn’t change tomorrow.",
            "That balance is a choice, not a mistake."
        ]
    },
    PIZZA: {
        title: "PIZZA — AFTER PURCHASE TEXT",
        lines: [
            "This paid for convenience over preparation.",
            "It saved time and effort, but cost more than making the same meal yourself.",
            "Small time-savers can become expensive when repeated often."
        ]
    }
} as const;

export type ShopType = keyof typeof SHOP_REFLECTIONS;
