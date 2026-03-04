export const products = [
  {
    id: 'begood-abar-001',
    name: 'BeGood A-Bar',
    tagline: 'Just Feel It',
    shortDescription: 'A Functional Chocolate Bar that reduces anxiety and induces calm and focus',
    fullDescription: 'BeGood A-Bar is your perfect companion for high-stakes moments. Whether it\'s an exam, interview, presentation, or any stressful situation, this premium functional chocolate helps you stay calm, focused, and at your best. No pills, no powders—just delicious, science-backed wellness in every bite.',
    image: 'https://customer-assets.emergentagent.com/job_aba2787e-1b7f-4ca4-8c0f-6bdec7418ef0/artifacts/e2gmlali_A%20chocolate%20that%20Induces%20Calm%20and%20Focus..jpg',
    category: 'Functional Chocolate',
    featured: true,
    variants: [
      {
        size: '50g',
        flavor: 'Dark Chocolate',
        price: 299,
        stock: 100
      },
      {
        size: '50g',
        flavor: 'Mint Dark Chocolate',
        price: 299,
        stock: 100
      },
      {
        size: '100g',
        flavor: 'Dark Chocolate',
        price: 549,
        stock: 100
      },
      {
        size: '100g',
        flavor: 'Mint Dark Chocolate',
        price: 549,
        stock: 100
      }
    ],
    ingredients: [
      {
        name: 'Ashwagandha',
        benefit: 'Ancient adaptogen that helps reduce stress and anxiety, promoting mental clarity'
      },
      {
        name: 'L-Theanine',
        benefit: 'Amino acid that promotes relaxation without drowsiness, enhancing focus'
      },
      {
        name: 'Dark Cocoa',
        benefit: 'Rich in antioxidants and natural mood enhancers'
      },
      {
        name: 'Magnesium',
        benefit: 'Essential mineral that supports nervous system function and reduces tension'
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