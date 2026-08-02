export const products = [
  {
    id: 'begood-abar-001',
    name: 'A-Bar',
    tagline: 'Just Feel It',
    shortDescription: 'A functional chocolate bar that helps ease stress and nervousness, and supports calm focus',
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
      'Quick Acting (30-45 min)'
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
      'Helps ease stress and nervousness',
      'Supports mental clarity and focus',
      'Promotes calm without drowsiness',
      'Helps you stay composed in high-stakes moments',
      'L-Theanine supports relaxed alertness',
      'Whole-food ingredients, no pills or powders'
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
    usage: 'Consume 30-45 minutes before a high-stakes situation for optimal results, or when feeling stressed. Can be enjoyed daily as part of your wellness routine.',
    reviews: [
      {
        name: 'Siddhant',
        role: 'Student',
        rating: 5,
        comment: 'I was not able to concentrate due to overthinking. After eating the bar, within like just 15-20 min it felt so relaxed and calm. Plus it tastes amazing!',
        date: '2026-06-02'
      },
      {
        name: 'Saksham Jain',
        role: 'Working Professional',
        rating: 5,
        comment: 'I had an interview and I was not fully prepared and so was very nervous, but after eating it I gave answers very calmly and luckily cracked it too. Worth every rupee!',
        date: '2026-05-21'
      },
      {
        name: 'Shubhe Aditya',
        role: 'Customer',
        rating: 5,
        comment: 'I had a fight with my girlfriend and I was thinking so much about it. I wasted an hour thinking about it and then I ate it and it just all felt so normal and relaxing. I think it just saved me time.',
        date: '2026-05-14'
      },
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
    id: 'begood-abar-2pack',
    name: 'A-Bar Duo (2 Bars)',
    tagline: 'Try it twice',
    shortDescription: 'Two A-Bars - one to try, one for when you need it. Free delivery on your first order.',
    fullDescription: 'Two A-Bars in one box. Most people want one bar for the moment they already have in mind, and a second for the one they did not see coming. Same functional chocolate, same 100% natural ingredients - just the sensible way to start.',
    image: '/a-bar-packaging.png',
    category: 'Functional Chocolate',
    featured: true,
    weight: '2 x 40g',
    price: 250,
    stock: 100,
    bundleOf: 'begood-abar-001',
    bundleQty: 2,
    keyAspects: [
      '2 x A-Bar (40g each)',
      '100% Natural Ingredients',
      'No Added Sugar',
      'No Added Preservatives',
      'Quick Acting (30-45 min)'
    ],
    benefits: [
      'Helps ease stress and nervousness',
      'Supports mental clarity and focus',
      'Promotes calm without drowsiness',
      'One to try, one to keep for the moment that matters'
    ],
    occasions: [
      'Before your exam',
      'Before your interview',
      'Before your presentation',
      'When feeling anxious or overwhelmed'
    ],
    ingredientsList: 'Walnuts, pumpkin seeds, cocoa butter, and L-theanine.',
    usage: 'Consume 30-45 minutes before a high-stakes situation for optimal results, or when feeling stressed.'
  },
  {
    id: 'begood-abar-5pack',
    name: 'A-Bar Five Pack',
    tagline: 'Keep one in every bag',
    shortDescription: 'Five A-Bars with free delivery - for exam season, interview rounds and everything in between.',
    fullDescription: 'Five A-Bars in one box, with delivery included. Built for the stretch where the high-stakes moments come back to back: exam season, an interview process, a run of presentations. Keep one in your bag, one at your desk, one at home.',
    image: '/a-bar-packaging.png',
    category: 'Functional Chocolate',
    featured: true,
    weight: '5 x 40g',
    price: 600,
    stock: 100,
    bundleOf: 'begood-abar-001',
    bundleQty: 5,
    keyAspects: [
      '5 x A-Bar (40g each)',
      'Free delivery included',
      '100% Natural Ingredients',
      'No Added Sugar',
      'Quick Acting (30-45 min)'
    ],
    benefits: [
      'Helps ease stress and nervousness',
      'Supports mental clarity and focus',
      'Promotes calm without drowsiness',
      'Always one within reach when it matters'
    ],
    occasions: [
      'Exam season',
      'Interview rounds',
      'A run of presentations',
      'Stressful work stretches'
    ],
    ingredientsList: 'Walnuts, pumpkin seeds, cocoa butter, and L-theanine.',
    usage: 'Consume 30-45 minutes before a high-stakes situation for optimal results, or when feeling stressed.'
  },
  {
    id: 'begood-rakhi-hamper',
    name: 'Rakhi Hamper',
    tagline: 'Made for Moments that Matter',
    shortDescription: 'A healthy Rakhi hamper built around A-Bar, with wholesome treats to gift someone who matters.',
    fullDescription: 'This Rakhi, gift a healthy hamper thoughtfully built around A-Bar - our functional bar that helps reduce stress and nervousness in moments of distress, in a premium chocolate taste. Made with 100% natural ingredients, it is the healthiest bar you can have. The hamper pairs it with wholesome, feel-good goodies in a premium reusable basket.',
    image: '/hampers/hero.png',
    category: 'Festive Hamper',
    featured: true,
    weight: 'Gift Hamper',
    price: 858,
    compareAtPrice: 1199,
    stock: 100,
    keyAspects: [
      'Basket with net wrap',
      '2 x A-Bars',
      '1 Bottle of Coconut Water',
      '150g Almonds',
      '150g Cashews',
      '50g Phool Makhana',
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

// Hampers are excluded from Cash on Delivery: they are high-value, made to
// order and often shipped to a third party as a gift, so a refused COD
// delivery cannot be resold. Checkout and the orders API both use this.
export const HAMPER_PRODUCT_IDS = ['begood-rakhi-hamper']

export function isHamperProduct(idOrItem) {
  if (!idOrItem) return false
  const id = typeof idOrItem === 'string'
    ? idOrItem
    : (idOrItem.id || idOrItem.productId)
  if (id && HAMPER_PRODUCT_IDS.includes(id)) return true
  const category = typeof idOrItem === 'object' ? idOrItem.category : null
  return typeof category === 'string' && category.toLowerCase().includes('hamper')
}

export function cartHasHamper(items) {
  return Array.isArray(items) && items.some(isHamperProduct)
}

// ---------------------------------------------------------------------------
// Reviews / ratings
// Product pages with visible reviews convert materially better than pages
// without, so these are surfaced on the product page, the shop cards and the
// home page from this single source rather than being duplicated per page.
// ---------------------------------------------------------------------------

export function getReviews(product) {
  if (Array.isArray(product?.reviews) && product.reviews.length) return product.reviews
  // A bundle is the same bar in a bigger box, so it carries the bar's reviews
  // rather than showing an empty reviews block.
  if (product?.bundleOf) {
    const base = products.find((p) => p.id === product.bundleOf)
    if (Array.isArray(base?.reviews)) return base.reviews
  }
  return []
}

export function getReviewCount(product) {
  return getReviews(product).length
}

/** Average star rating, rounded to 1dp. Returns null when there are no reviews. */
export function getAverageRating(product) {
  const reviews = getReviews(product)
  if (!reviews.length) return null
  const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0)
  return Math.round((total / reviews.length) * 10) / 10
}

/** Newest-first reviews for display. */
export function getSortedReviews(product) {
  return [...getReviews(product)].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  )
}

/** Every review across the catalogue - used for the home page social proof. */
export function getFeaturedReviews(limit = 3) {
  return products
    .flatMap((p) => getReviews(p).map((r) => ({ ...r, productName: p.name })))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, limit)
}
