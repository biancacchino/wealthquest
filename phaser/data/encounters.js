export const ENCOUNTERS = [
  {
    id: 'corner_store',
    title: 'Corner Store',
    prompt: 'Snack for $4',
    cost: 4,
    tile: { x: 2, y: 2 },
    notes: {
      buy: [
        'You get a quick snack now, but your goal takes longer.',
        'Small choices can add up over the week.'
      ],
      skip: [
        'Skipping keeps your money for bigger plans.',
        'You stay on track for your goal.'
      ]
    }
  },
  {
    id: 'arcade',
    title: 'Arcade',
    prompt: 'New game for $8',
    cost: 8,
    tile: { x: 9, y: 2 },
    notes: {
      buy: [
        'Fun now means less money for later.',
        'Your goal may take another week.'
      ],
      skip: [
        'You keep your balance for your goal.',
        'Waiting can make big goals easier.'
      ]
    }
  },
  {
    id: 'friend_invite',
    title: 'Friend Invite',
    prompt: 'Movie night on Friday costs $10',
    cost: 10,
    tile: { x: 6, y: 6 },
    notes: {
      buy: [
        'You spend money now and have less for your goal.',
        'Planning ahead helps avoid surprises.'
      ],
      skip: [
        'You keep your balance for your goal.',
        'Saying no can help with long-term plans.'
      ]
    }
  }
];
