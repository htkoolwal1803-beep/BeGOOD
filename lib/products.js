export const products = [
  {
    id: 'begood-abar-001',
    name: 'A-Bar',
    tagline: 'Just Feel It',
    shortDescription: 'A Functional Chocolate Bar that reduces anxiety and induces calm and focus',
    fullDescription: 'A-Bar is your perfect companion for high-stakes moments. Whether it\'s an exam, interview, presentation, or any stressful situation, this premium functional chocolate helps you stay calm, focused, and at your best. 100% natural ingredients with no pills, no powders—just delicious, science-backed wellness in every bite.',
    image: '/a-bar-packaging.png',
    category: 'Functional Chocolate',
    featured: true,
    weight: '40g',
    price: 125,
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
        name: 'Walnuts',
        image: '/ingredients/walnuts.jpg',
        benefit: 'Naturally nutrient-rich nuts that support brain health and add a satisfying, wholesome texture'
      },
      {
        name: 'Pumpkin Seeds',
        image: '/ingredients/pumpkin-seeds.jpg',
        benefit: 'A clean seed source that brings minerals, plant-based goodness, and steady nourishment'
      },
      {
        name: 'Cocoa Butter',
        image: '/ingredients/cocoa-butter.jpg',
        benefit: 'A smooth cocoa-derived fat that gives A-Bar its premium chocolate mouthfeel'
      },
      {
        name: 'L-Theanine',
        image: '/ingredients/l-theanine.jpg',
        benefit: 'Supports calm focus without drowsiness, helping you feel composed when it matters'
      }
    ],
    benefits: [
      'Reduces anxiety and nervousness',
      'Enhances mental clarity and focus',
      'Promotes calm without drowsiness',
      'Improves performance under pressure',
      'Shifts brain from panic to alpha-wave calm',
      'Regulates cortisol and stress hormones'
    ],
    occasions: [
      'Before your exam',
      'Before your interview',
      'Before your presentation',
      'During stressful work days',
      'When you need to perform your best',
      'When feeling anxious or overwhelmed'
    ],
    ingredientsList: 'Walnuts, pumpkin seeds, cocoa butter, and L-theanine.',
    howItWorks: "A-Bar works by combining simple functional ingredients with a convenient chocolate format.\n\nHow A-Bar Helps:\nOur carefully selected ingredients work together to support calm focus when you need it most:\n\n• Walnuts bring natural nourishment and brain-supportive nutrients\n• Pumpkin seeds add plant-based minerals and steady energy\n• Cocoa butter creates the smooth, premium chocolate experience\n• L-Theanine supports relaxed alertness without drowsiness\n\nThe Result:\nYou get a convenient functional chocolate designed to help you feel calmer, clearer, and ready for high-stakes moments.",
    usage: 'Consume 15-20 minutes before a high-stakes situation for optimal results, or when feeling anxious. Can be enjoyed daily as part of your wellness routine.',
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
        comment: 'Works really well for my anxiety. The chocolate is rich and delicious. Worth every rupee!',
        date: '2024-11-25'
      }
    ]
  },
  {
    id: 'begood-rakhi-hamper',
    name: 'Rakhi Hamper',
    tagline: 'Made for Moments that Matter',
    shortDescription: 'A healthy Rakhi hamper built around A-Bar, with wholesome treats to gift someone who matters.',
    fullDescription: 'This Rakhi, gift a healthy hamper thoughtfully built around A-Bar - our functional bar that helps reduce stress and nervousness in moments of distress, in a premium chocolate taste. Made with 100% natural ingredients, it is the healthiest bar you can have. The hamper pairs it with wholesome, feel-good goodies in a premium reusable basket.',
    image: '/hampers/hero.jpg',
    category: 'Festive Hamper',
    featured: true,
    weight: 'Gift Hamper',
    price: 758,
    compareAtPrice: 999,
    stock: 100,
    keyAspects: [
      'Basket with net wrap',
      '2 x A-Bars',
      '1 Bottle of Coconut Water',
      '100g Almonds',
      '100g Cashews',
      '40g Phool Makhana',
      '1 Plant Pot',
      '1 Plantable Greeting Card',
      '1 Customizable Polaroid'
    ],
    benefits: [
      'Built around A-Bar - eases stress and nervousness',
      'Premium chocolate taste, 100% natural ingredients',
      'The healthiest bar you can have',
      'Wholesome, feel-good treats in every box',
      'Plantable card and pot to grow something together',
      'Personalise it with a customizable polaroid'
    ],
    occasions: [
      'Raksha Bandhan gifting',
      'For a brother or sister who matters',
      'A thoughtful, healthy festive gift'
    ],
    usage: 'A ready-to-gift Rakhi hamper. Order at the pre-Rakhi price and personalise the polaroid to make it yours.',
    ingredientsList: 'A-Bar (walnuts, pumpkin seeds, cocoa butter, L-theanine), coconut water, almonds, cashews, phool makhana.'
  },
  {
    id: 'begood-pbar-upcoming',
    name: 'P-Bar',
    tagline: 'Coming Soon',
    shortDescription: 'A functional chocolate bar designed to help manage menstrual discomfort',
    fullDescription: 'P-Bar is our upcoming product specifically formulated to help women manage dysmenorrhea (menstrual pain) and discomfort. Combining science-backed ingredients with delicious chocolate, P-Bar aims to provide natural relief during your cycle.',
    image: '/coming-soon-placeholder.png',
    category: 'Functional Chocolate',
    featured: false,
    upcoming: true,
    comingSoon: true,
    launchDate: 'Coming Soon',
    targetAudience: 'Women experiencing menstrual discomfort',
    price: 0,
    weight: 'TBA'
  }
]

export function getProductById(id) {
  return products.find(p => p.id === id)
}

export function getFeaturedProducts() {
  return products.filter(p => p.featured && !p.upcoming)
}

export function getUpcomingProducts() {
  return products.filter(p => p.upcoming)
}
