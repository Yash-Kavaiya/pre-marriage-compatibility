export interface DiscussionGuide {
  why: string;
  prompts: string[];
}

export const discussionGuides: Record<string, DiscussionGuide> = {
  'Core Values & Ethics': {
    why: 'Shared values are the lens through which every later decision is judged.',
    prompts: [
      'Describe a time you held to a principle when it cost you something. What made it worth it?',
      'Which value would you want people to name first when describing our marriage in twenty years?',
      'Where do you think our values differ, and how should we decide when they collide?',
    ],
  },
  Religion: {
    why: 'Faith shapes weekly rhythms, holidays, child-rearing and family expectations.',
    prompts: [
      'What does practicing your faith look like on an ordinary week, and what would you want from me in that?',
      'Which religious traditions or ceremonies are non-negotiable for you, and which are flexible?',
      'How will we answer our families if they expect a level of observance we have not chosen?',
    ],
  },
  Spirituality: {
    why: 'Personal meaning-making affects how each of you handles stress, loss and big choices.',
    prompts: [
      'Where do you find meaning or peace when life feels heavy?',
      'Is there a spiritual practice you would like us to share, or one you need to keep personal?',
    ],
  },
  'Relationship Model & Boundaries': {
    why: 'Unspoken boundary assumptions are one of the most common sources of early-marriage hurt.',
    prompts: [
      'What would feel like a breach of trust to you, even if it seems small to others?',
      'How much time alone or with friends do you need to feel like yourself?',
      'What are our rules for social media, phones and friendships with ex-partners?',
    ],
  },
  'Life Vision & Home': {
    why: 'Where and how you live sets the stage for careers, family and daily happiness.',
    prompts: [
      'Picture an ordinary Tuesday ten years from now. Where are we, and what does the day look like?',
      'Which matters more to you: the place we live or the life we can afford there?',
      'What would make you willing to move somewhere you had not planned on?',
    ],
  },
  'Children & Parenting': {
    why: 'Whether, when and how to raise children is among the hardest differences to compromise on.',
    prompts: [
      'Do you want children? How sure are you, and has that ever changed?',
      'How were you disciplined growing up, and what would you keep or change?',
      'If we faced infertility or a child with special needs, what options would you be open to?',
    ],
  },
  Finances: {
    why: 'Money conflicts are one of the strongest predictors of marital stress.',
    prompts: [
      'What did money feel like in your home growing up: safe, scarce, secret or shared?',
      'Joint accounts, separate accounts, or both? What spending amount should require a conversation first?',
      'Do you have debts, obligations or family financial commitments I should know about?',
    ],
  },
  'Work & Career': {
    why: 'Two careers need a plan for whose opportunity comes first, and when.',
    prompts: [
      'If one of us got a great offer in another city, how would we decide?',
      'What does a healthy amount of working hours look like to you?',
      'What would you want me to do if you wanted to change careers or start a business?',
    ],
  },
  'Household & Roles': {
    why: 'An uneven load at home quietly builds resentment over time.',
    prompts: [
      'Which household tasks do you actually enjoy, and which do you dread?',
      'How were chores divided in your family, and did it feel fair?',
      'How will we rebalance when one of us is overloaded at work or unwell?',
    ],
  },
  'Communication & Conflict': {
    why: 'How you fight matters more than how often you fight.',
    prompts: [
      'When you are upset, do you need space first or to talk it through right away?',
      'What is something I do during disagreements that makes it harder for you?',
      'Would you be willing to see a counselor together, and what would make that easier?',
    ],
  },
  'Love, Intimacy & Sex': {
    why: 'Mismatched expectations about intimacy are common and rarely raised without a prompt.',
    prompts: [
      'What makes you feel most loved: words, time, touch, help or gifts?',
      'How comfortable are you talking about sexual needs, and how can I make it easier?',
      'How will we keep making time for each other after children, illness or busy seasons?',
    ],
  },
  'Health & Lifestyle': {
    why: 'Health habits and attitudes to care affect each other daily and over decades.',
    prompts: [
      'What are your habits around alcohol, sleep, food and exercise that you would want me to respect?',
      'How do you want to be cared for when you are sick or struggling mentally?',
      'Is there a family health history we should plan around?',
    ],
  },
  'Family of Origin & In-Laws': {
    why: 'In-law expectations are one of the most frequent sources of conflict in the early years.',
    prompts: [
      'How often do you expect to see or speak with your family once we are married?',
      'If your parents needed full-time care, what would you want to do?',
      'When a family member criticises one of us, how should the other respond?',
    ],
  },
  'Growth & Change': {
    why: 'Both of you will change; the marriage needs room for that.',
    prompts: [
      'What is one way you hope to grow over the next five years, and how can I support it?',
      'How will we check in on our relationship when life is going well, not only when it is hard?',
    ],
  },
};
