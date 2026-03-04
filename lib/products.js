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
    howItWorks: `A-Bar works by targeting the root biochemical cause of anxiety—not just the symptoms.

**The Anxiety Mechanism:**
When you face a high-stakes situation, your brain's amygdala triggers the HPA Axis (your body's alarm system), flooding your system with cortisol and adrenaline. This causes racing thoughts, palpitations, and depletes GABA (your brain's natural brake pedal), putting your brain into high-frequency beta waves (panic mode).

**How A-Bar Helps:**
Our scientifically-formulated ingredients work synergistically to counteract this stress response:

• **L-Theanine** promotes GABA synthesis, restoring your brain's natural inhibition and slowing racing thoughts
• **Magnesium** regulates stress pathways and reduces cortisol secretion
• **Dark Cocoa** increases cerebral blood flow and contains anandamide (a natural mood enhancer)
• **Omega-3s** support brain health and reduce inflammation

**The Result:**
Your brain shifts from high-beta panic waves to alpha-wave calm (8-12 Hz)—the state of relaxed alertness that elite performers achieve. Cortisol is regulated, GABA is restored, and your nervous system calms down, allowing you to think clearly and perform at your peak.`,
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
    id: 'begood-pbar-upcoming',
    name: 'P-Bar',
    tagline: 'Coming Soon',
    shortDescription: 'A functional chocolate bar designed to help manage menstrual discomfort',
    fullDescription: 'P-Bar is our upcoming product specifically formulated to help women manage dysmenorrhea (menstrual pain) and discomfort. Combining science-backed ingredients with delicious chocolate, P-Bar aims to provide natural relief during your cycle.',
    image: 'https://customer-assets.emergentagent.com/job_aba2787e-1b7f-4ca4-8c0f-6bdec7418ef0/artifacts/e2gmlali_A%20chocolate%20that%20Induces%20Calm%20and%20Focus..jpg', // Placeholder - replace when you have P-Bar image
    category: 'Functional Chocolate',
    featured: false,
    upcoming: true,
    launchDate: 'Coming Soon',
    targetAudience: 'Women experiencing menstrual discomfort'
  }
]

export function getProductById(id) {
  return products.find(p => p.id === id)
}

export function getFeaturedProducts() {
  return products.filter(p => p.featured)
}