/**
 * WhySection - A section explaining layR's value proposition
 * 
 * Features:
 * - Four cards in a responsive grid
 * - Glass/fluid aesthetic with subtle borders
 * - Dark styling with neutral cards
 * 
 * Requirements: 3.1, 3.4, 3.5, 3.6
 */

export interface WhyItem {
  title: string;
  description: string;
}

const whyItems: WhyItem[] = [
  {
    title: "Curated Quality",
    description: "Every repository is reviewed for code quality, documentation, and best practices."
  },
  {
    title: "Production Ready",
    description: "Find templates and starters that are ready to deploy, not just demos."
  },
  {
    title: "Developer First",
    description: "Built by developers, for developers. No marketing fluff, just great code."
  },
  {
    title: "Fair Compensation",
    description: "Creators earn recognition and revenue for their open source contributions."
  }
];

export interface WhySectionProps {
  items?: WhyItem[];
}

export function WhySection({ items = whyItems }: WhySectionProps) {
  return (
    <section className="w-full bg-black py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 sm:mb-12 md:mb-16">
          Why use layR?
        </h2>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {items.map((item, index) => (
            <div
              key={index}
              className="group relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6 hover:border-neutral-700 transition-all duration-300 hover:bg-neutral-900/70"
            >
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              
              {/* Content */}
              <div className="relative">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhySection;
