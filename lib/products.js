export const abarKeyIngredients = [
  {
    name: 'L-Theanine',
    amount: '140 mg',
    image: '/ingredients/l-theanine.jpg',
    benefit: 'An amino acid studied for supporting relaxed alertness without drowsiness.'
  },
  {
    name: 'Magnesium Glycinate',
    amount: '134 mg · 20% RDA',
    benefit: 'A chelated form of magnesium that supports normal nervous-system function.'
  },
  {
    name: 'Chicory Root Extract',
    amount: '2.18 g chicory root powder',
    benefit: 'A prebiotic root ingredient included to help support magnesium absorption.'
  }
]

export const abarFullIngredients = [
  { name: 'L-Theanine', amount: '140 mg' },
  { name: 'Vitamin E (dl-Alpha Tocopheryl Acetate)', amount: '4 mg', note: '40% RDA' },
  { name: 'Walnuts (Juglans regia)', amount: '3 g' },
  { name: 'Chicory Powder (Cichorium intybus)', amount: '2.18 g' },
  { name: 'Cocoa Powder (Theobroma cacao)', amount: '0.87 g' },
  { name: 'Pumpkin Seeds (Cucurbita pepo)', amount: '1.52 g' },
  { name: 'Coffee (Coffea arabica)', amount: '0.21 g' },
  { name: 'Dark Chocolate', amount: '1.30 g' },
  { name: 'Rolled Oats', amount: '8.7 g' },
  { name: 'Almond Butter', amount: '8.7 g' },
  { name: 'Dates', amount: '4.34 g' },
  { name: 'Cocoa Butter', amount: '1.08 g' },
  { name: 'Honey', amount: '4.16 g' },
  { name: 'Pink Salt', amount: '0.12 g' },
  { name: 'Magnesium Glycinate (Amino Acid Chelate of Magnesium)', amount: '134 mg', note: '20% RDA' },
  { name: 'Soy Lecithin', amount: '0.26 g' },
  { name: 'Glycerin (Glycerol)', amount: '1.3 g' },
  { name: 'Vanilla Extract', amount: '0.2 g' }
]

export const abarIngredientsList = abarFullIngredients
  .map((ingredient) => `${ingredient.name} (${ingredient.amount}${ingredient.note ? ` · ${ingredient.note}` : ''})`)
  .join(', ')

export const products = [
  {
    id: 'begood-abar-001',
    name: 'A-Bar',
    tagline: 'Just Feel It',
    shortDescription: 'A functional chocolate bar created for calmer, clearer high-stakes moments.',
    fullDescription: 'A-Bar is a convenient calm-focus ritual for exams, interviews, presentations and demanding workdays. The formula combines L-Theanine, magnesium glycinate and chicory root with thoughtfully selected whole-food ingredients in a premium chocolate bar.',
    image: '/a-bar-packaging.png',
    category: 'Functional Chocolate',
    featured: true,
    weight: '40g',
    price: 125,
    stock: 100,
    keyAspects: [
      '140 mg L-Theanine',
      '134 mg Magnesium Glycinate (20% RDA)',
      '2.18 g Chicory Root',
      'No Added Sugar',
      'No Added Preservatives'
    ],
    ingredients: abarKeyIngredients,
    fullIngredients: abarFullIngredients,
    benefits: [
      'Supports relaxed alertness',
      'Supports normal nervous-system function',
      'Designed for calm focus without drowsiness',
      'A convenient chocolate-format ritual',
      'Made for high-stakes moments'
    ],
    occasions: [
      'Before an exam',
      'Before an interview',
      'Before a presentation',
      'During a demanding workday',
      'Before an important conversation',
      'Whenever you want a calmer pre-performance ritual'
    ],
    ingredientsList: abarIngredientsList,
    howItWorks: 'A-Bar brings three functional ingredients into one easy ritual. L-Theanine is studied for relaxed alertness, magnesium supports normal nervous-system function, and chicory root is included to support the formula’s magnesium-absorption strategy. The chocolate format makes the routine simple to use before moments that matter.',
    usage: 'Enjoy one bar around 30–45 minutes before a high-stakes moment. Individual experiences vary. Do not use this food as a substitute for medical care.',
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
      }
    ]
  },
  {
    id: 'begood-abar-2pack',
    name: 'A-Bar Duo (2 Bars)',
    tagline: 'Try it twice',
    shortDescription: 'Two A-Bars—one for now, one for the next moment that matters.',
    fullDescription: 'Two A-Bars in one box. Keep one ready for the moment already on your calendar and a second for the one you did not see coming.',
    image: '/a-bar-packaging.png',
    category: 'Functional Chocolate',
    featured: true,
    weight: '2 × 40g',
    price: 250,
    stock: 100,
    bundleOf: 'begood-abar-001',
    bundleQty: 2,
    keyAspects: ['2 × A-Bar (40g each)', '140 mg L-Theanine per bar', '134 mg Magnesium Glycinate per bar', 'No Added Sugar', 'No Added Preservatives'],
    ingredients: abarKeyIngredients,
    fullIngredients: abarFullIngredients,
    benefits: ['Supports relaxed alertness', 'Supports normal nervous-system function', 'One to try and one to keep ready'],
    occasions: ['Before an exam', 'Before an interview', 'Before a presentation', 'During a demanding workday'],
    ingredientsList: abarIngredientsList,
    howItWorks: 'Each A-Bar combines L-Theanine, magnesium glycinate and chicory root in a convenient chocolate-format ritual for calmer, clearer high-stakes moments.',
    usage: 'Enjoy one bar around 30–45 minutes before a high-stakes moment. Individual experiences vary.'
  },
  {
    id: 'begood-abar-5pack',
    name: 'A-Bar Five Pack',
    tagline: 'Keep one within reach',
    shortDescription: 'Five A-Bars for exam season, interview rounds and everything in between.',
    fullDescription: 'Five A-Bars in one box for stretches where high-stakes moments arrive back to back. Keep one in your bag, one at your desk and one at home.',
    image: '/a-bar-packaging.png',
    category: 'Functional Chocolate',
    featured: true,
    weight: '5 × 40g',
    price: 600,
    stock: 100,
    bundleOf: 'begood-abar-001',
    bundleQty: 5,
    keyAspects: ['5 × A-Bar (40g each)', 'Free delivery included', '140 mg L-Theanine per bar', '134 mg Magnesium Glycinate per bar', 'No Added Sugar'],
    ingredients: abarKeyIngredients,
    fullIngredients: abarFullIngredients,
    benefits: ['Supports relaxed alertness', 'Supports normal nervous-system function', 'Keep a calm-focus ritual within reach'],
    occasions: ['Exam season', 'Interview rounds', 'A run of presentations', 'Demanding work stretches'],
    ingredientsList: abarIngredientsList,
    howItWorks: 'Each A-Bar combines L-Theanine, magnesium glycinate and chicory root in a convenient chocolate-format ritual for calmer, clearer high-stakes moments.',
    usage: 'Enjoy one bar around 30–45 minutes before a high-stakes moment. Individual experiences vary.'
  },
  {
    id: 'begood-rakhi-hamper',
    name: 'Rakhi Hamper',
    tagline: 'Made for Moments that Matter',
    shortDescription: 'A healthy Rakhi hamper built around A-Bar, with wholesome treats for someone who matters.',
    fullDescription: 'A thoughtful festive hamper built around two A-Bars, paired with wholesome treats in a premium reusable basket.',
    image: '/hampers/hero.png',
    category: 'Festive Hamper',
    featured: true,
    weight: 'Gift Hamper',
    price: 1048,
    compareAtPrice: 1199,
    stock: 100,
    keyAspects: ['Basket with net wrap', '2 × A-Bars', '1 bottle of coconut water', '150g almonds', '150g cashews', '50g phool makhana', '1 plant pot', '1 plantable greeting card', '1 customizable polaroid'],
    benefits: ['Built around two A-Bars', 'Wholesome feel-good treats', 'Reusable basket and plantable card', 'Personalize it with a polaroid'],
    occasions: ['Raksha Bandhan gifting', 'For a brother or sister who matters', 'A thoughtful festive gift'],
    usage: 'A ready-to-gift Rakhi hamper. Personalize the polaroid to make it yours.',
    ingredientsList: `A-Bar: ${abarIngredientsList}. Hamper also contains coconut water, almonds, cashews and phool makhana.`
  },
  {
    id: 'begood-pbar-upcoming',
    name: 'P-Bar',
    tagline: 'Coming Soon',
    shortDescription: 'A functional chocolate bar in development for menstrual-comfort support.',
    fullDescription: 'P-Bar is our upcoming functional chocolate concept for menstrual-comfort support. Formula and product details will be shared closer to launch.',
    image: '/coming-soon-placeholder.png',
    category: 'Functional Chocolate',
    featured: false,
    upcoming: true,
    comingSoon: true,
    launchDate: 'Coming Soon',
    targetAudience: 'Women seeking menstrual-comfort support',
    price: 0,
    weight: 'TBA'
  }
]

export function getProductById(id) {
  return products.find((product) => product.id === id)
}

export function getFeaturedProducts() {
  return products.filter((product) => product.featured && !product.upcoming)
}

export function getUpcomingProducts() {
  return products.filter((product) => product.upcoming)
}

export const HAMPER_PRODUCT_IDS = ['begood-rakhi-hamper']

export function isHamperProduct(idOrItem) {
  if (!idOrItem) return false
  const id = typeof idOrItem === 'string' ? idOrItem : (idOrItem.id || idOrItem.productId)
  if (id && HAMPER_PRODUCT_IDS.includes(id)) return true
  const category = typeof idOrItem === 'object' ? idOrItem.category : null
  return typeof category === 'string' && category.toLowerCase().includes('hamper')
}

export function cartHasHamper(items) {
  return Array.isArray(items) && items.some(isHamperProduct)
}

export function getReviews(product) {
  if (Array.isArray(product?.reviews) && product.reviews.length) return product.reviews
  if (product?.bundleOf) {
    const base = products.find((item) => item.id === product.bundleOf)
    if (Array.isArray(base?.reviews)) return base.reviews
  }
  return []
}

export function getReviewCount(product) {
  return getReviews(product).length
}

export function getAverageRating(product) {
  const reviews = getReviews(product)
  if (!reviews.length) return null
  const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0)
  return Math.round((total / reviews.length) * 10) / 10
}

export function getSortedReviews(product) {
  return [...getReviews(product)].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
}

export function getFeaturedReviews(limit = 3) {
  return products
    .flatMap((product) => getReviews(product).map((review) => ({ ...review, productName: product.name })))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, limit)
}
