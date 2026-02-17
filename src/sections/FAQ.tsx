import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What is ExplorePlan?',
    answer:
      'ExplorePlan is a free AI powered travel planning tool that creates personalized, day by day itineraries based on your preferences, budget, and travel style. Think of it as a personal travel agent that is available anytime, anywhere.',
  },
  {
    question: 'Is ExplorePlan free to use?',
    answer:
      'Yes. ExplorePlan is completely free to use. Create as many trip plans as you need at no cost.',
  },
  {
    question: 'How does the AI create personalized plans?',
    answer:
      'Our AI analyzes your destination, travel dates, interests, and budget to recommend activities, restaurants, and accommodations that match your unique preferences. Every itinerary is built from scratch for you.',
  },
  {
    question: 'Can I access my itinerary offline?',
    answer:
      'Absolutely. You can download your complete itinerary as a PDF for offline access anytime, anywhere. No internet connection required.',
  },
  {
    question: 'How do I edit my itinerary?',
    answer:
      'Your itinerary is fully editable. Rearrange stops, add new destinations, or remove items directly from your trip page. Changes save instantly.',
  },
  {
    question: 'Where can I get support?',
    answer:
      'Reach out to our support team anytime at support@exploreplan.ai. We are here to help you plan the perfect trip.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-4 sm:px-8 py-12 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold md:text-5xl md:leading-tight text-zinc-900">
              FAQs
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
