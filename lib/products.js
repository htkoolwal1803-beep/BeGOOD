export const products = [
  {
    id: 'begood-abar-001',
    name: 'A-Bar',
    tagline: 'Just Feel It',
    shortDescription: 'A Functional Chocolate Bar that reduces anxiety and induces calm and focus',
    fullDescription: 'A-Bar is your perfect companion for high-stakes moments. Whether it\'s an exam, interview, presentation, or any stressful situation, this premium functional chocolate helps you stay calm, focused, and at your best. 100% natural ingredients with no pills, no powders—just delicious, science-backed wellness in every bite.',
    image: 'https://customer-assets.emergentagent.com/job_aba2787e-1b7f-4ca4-8c0f-6bdec7418ef0/artifacts/e2gmlali_A%20chocolate%20that%20Induces%20Calm%20and%20Focus..jpg',
    category: 'Functional Chocolate',
    featured: true,
    weight: '40g',
    price: 120,
    stock: 100,
    keyAspects: [
      '100% Natural Ingredients',
      'No Added Sugar',
      'No Added Preservatives',
      'Science-Backed Formula',
      'Quick Acting (15-20 min)'
    ],
    ingredients: [
      {
        name: 'L-Theanine',
        benefit: 'Promotes GABA and dopamine synthesis, inducing calmness without drowsiness and restoring neural inhibition'
      },
      {
        name: 'Magnesium',
        benefit: 'Regulates NMDA receptors and modulates cortisol secretion, reducing physical tension and anxiety'
      },
      {
        name: 'Omega-3 Rich (Walnuts, Pumpkin Seeds)',
        benefit: 'Supports brain health, reduces inflammation, and improves cognitive function'
      },
      {
        name: 'Caffeine (Dark Chocolate, Coffee)',
        benefit: 'Enhances alertness and focus while synergizing with L-Theanine for calm energy'
      }
    ],
    benefits: [
      'Reduces anxiety and nervousness',
      'Enhances mental clarity and focus',
      'Promotes calm without drowsiness',
      'Improves performance under pressure',
      'Delicious and convenient'
    ],
    occasions: [
      'Before your exam',
      'Before your interview',
      'Before your presentation',
      'During stressful work days',
      'When you need to perform your best'
    ],
    howItWorks: 'BeGood A-Bar combines carefully selected functional ingredients with premium dark chocolate. Ashwagandha and L-Theanine work synergistically to reduce cortisol levels and promote alpha brain waves associated with relaxation and focus. Magnesium supports your nervous system, while dark cocoa provides natural mood enhancement. The result? You feel calm, centered, and ready to tackle whatever comes your way.',
    usage: 'Consume one bar 30-45 minutes before a high-stakes situation for optimal results. Can be enjoyed daily as part of your wellness routine.',
    reviews: [
      {
        name: 'Priya S.',
        rating: 5,
        comment: 'This saved me during my board exams! Felt so much calmer and could focus better. Plus it tastes amazing!',
        date: '2024-11-15'
      },
      {
        name: 'Rahul M.',
        rating: 5,
        comment: 'Had my job interview and was super nervous. Had this bar 30 mins before and felt noticeably more relaxed. Got the job!',
        date: '2024-11-20'
      },
      {
        name: 'Ananya K.',
        rating: 4,
        comment: 'Works really well for my anxiety. The dark chocolate flavor is rich and premium. Slightly pricey but worth it.',
        date: '2024-11-25'
      }
    ]
  }
]

export function getProductById(id) {
  return products.find(p => p.id === id)
}

export function getFeaturedProducts() {
  return products.filter(p => p.featured)
}