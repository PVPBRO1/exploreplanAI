import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ASSISTANT_NAME, BRAND_NAME } from '../lib/constants/branding';

const faqs = [
  {
    question: `What is ${BRAND_NAME}?`,
    answer: `${BRAND_NAME} is a free AI-powered travel planning tool that creates personalised, day-by-day itineraries based on your preferences, budget, and travel style. Think of it as a personal travel agent available anytime, anywhere.`,
  },
  {
    question: `Who is ${ASSISTANT_NAME}?`,
    answer: `${ASSISTANT_NAME} is your AI travel companion — a friendly, knowledgeable guide who chats with you to understand your travel style and builds a custom itinerary around your unique preferences. ${ASSISTANT_NAME} drops insider tips, fun facts, and always has a destination suggestion up his sleeve.`,
  },
  {
    question: `Is ${BRAND_NAME} free to use?`,
    answer: `Yes. ${BRAND_NAME} is completely free to use. Create as many trip plans as you need at no cost.`,
  },
  {
    question: `How does ${ASSISTANT_NAME} create personalised plans?`,
    answer: `${ASSISTANT_NAME} analyses your destination, travel dates, interests, and budget to recommend activities, restaurants, and accommodations that match your unique preferences. Every itinerary is built from scratch just for you — no two trips are the same.`,
  },
  {
    question: 'Can I access my itinerary offline?',
    answer: 'Absolutely. You can save or screenshot your complete itinerary for offline access anytime. No internet connection required once you have it saved.',
  },
  {
    question: 'How do I edit my itinerary?',
    answer: `Just ask ${ASSISTANT_NAME}! Continue the conversation and tell him what you'd like to change — swap an activity, adjust the pace, find a different restaurant. ${ASSISTANT_NAME} will update the plan in real time.`,
  },
  {
    question: 'Where can I get support?',
    answer: `Reach out to our support team anytime at support@vincentai.com. We're here to help you plan the perfect trip.`,
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="px-4 sm:px-8 py-12 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold md:text-5xl md:leading-tight text-zinc-900">
              Frequently asked questions
            </h2>
          </div>

          <div className="md:col-span-3">
            <div className="divide-y divide-gray-200">
              {faqs.map((faq, index) => (
                <div key={index} className="py-5">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between gap-4 text-left group"
                  >
                    <span className="text-base md:text-lg font-semibold text-zinc-800 group-hover:text-gray-600 transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <p className="mt-3 text-gray-600 leading-relaxed pr-8">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
