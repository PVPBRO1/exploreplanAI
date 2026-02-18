import type { TripPlanInputs, PlannerField } from '../ai/types';

interface QuestionStep {
  field: PlannerField;
  question: string;
  required: boolean;
}

const questionFlow: QuestionStep[] = [
  {
    field: 'dates',
    question: "When are you planning to go? (Specific dates, a month, or a season all work!)",
    required: false,
  },
  {
    field: 'tripLength',
    question: "How many days are you thinking for this trip?",
    required: false,
  },
  {
    field: 'budget',
    question: "What's your budget range? (e.g. budget, moderate, luxury, or a dollar amount like $2,000–$3,000)",
    required: true,
  },
  {
    field: 'travelers',
    question: "How many travelers? (Just you, a couple, group, family?)",
    required: false,
  },
  {
    field: 'pace',
    question: "What pace do you prefer?\n• **Relaxed** — plenty of downtime\n• **Balanced** — mix of activities and rest\n• **Packed** — maximize every hour",
    required: true,
  },
  {
    field: 'interests',
    question: "What are you most interested in? Pick a few:\n🍽️ Food  ·  🏛️ Culture  ·  🌿 Nature  ·  🌃 Nightlife  ·  🛍️ Shopping  ·  🎨 Art  ·  🏖️ Beach  ·  🧘 Wellness  ·  🏔️ Adventure  ·  📸 Photography",
    required: true,
  },
  {
    field: 'accommodation',
    question: "Any accommodation preference?\n🏨 Hotel  ·  🏠 Airbnb  ·  ✨ Boutique  ·  💎 Luxury  ·  💰 Budget",
    required: true,
  },
];

export function getNextQuestion(inputs: TripPlanInputs): string | null {
  if (!inputs.dates && !inputs.tripLength) {
    return questionFlow[0].question;
  }

  for (const step of questionFlow) {
    if (step.field === 'dates' || step.field === 'tripLength') continue;

    const value = inputs[step.field];
    const isEmpty =
      value === '' ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0);

    if (isEmpty && step.required) {
      return step.question;
    }
  }

  return null;
}

export function isReadyToGenerate(inputs: TripPlanInputs): boolean {
  if (!inputs.destination) return false;
  if (!inputs.dates && !inputs.tripLength) return false;
  if (!inputs.budget) return false;
  if (!inputs.pace) return false;
  if (inputs.interests.length === 0) return false;
  if (!inputs.accommodation) return false;
  return true;
}
