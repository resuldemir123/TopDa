/** Firestore `products` koleksiyonu için örnek kayıtlar (id otomatik) */
const stock36to40 = (a, b, c, d, e) => ({
  '36': a,
  '37': b,
  '38': c,
  '39': d,
  '40': e,
});

export const SAMPLE_PRODUCTS = [
  {
    name: 'Kışlık Terlik Model 102',
    code: 'MST-102',
    category: 'unisex',
    price: 450,
    is_active: true,
    variants: [
      {
        color: 'Siyah',
        color_hex: '#1a1a1a',
        image:
          'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&auto=format&fit=crop&q=80',
        stock: stock36to40(12, 10, 8, 5, 0),
      },
      {
        color: 'Kahverengi',
        color_hex: '#5c4033',
        image:
          'https://images.unsplash.com/photo-1600185365928-3ab27f44bd7c?w=600&h=600&auto=format&fit=crop&q=80',
        stock: stock36to40(8, 9, 7, 4, 2),
      },
    ],
  },
  {
    name: 'Klasik Erkek Ayakkabı A14',
    code: 'ERK-A14',
    category: 'male',
    price: 620,
    is_active: true,
    variants: [
      {
        color: 'Siyah',
        color_hex: '#0f172a',
        image:
          'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=600&auto=format&fit=crop&q=80',
        stock: stock36to40(6, 8, 10, 6, 3),
      },
      {
        color: 'Lacivert',
        color_hex: '#1e3a5f',
        image:
          'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&h=600&auto=format&fit=crop&q=80',
        stock: stock36to40(4, 5, 6, 5, 2),
      },
    ],
  },
  {
    name: 'Kadın Topuklu Model Ela',
    code: 'KDN-ELA',
    category: 'female',
    price: 580,
    is_active: true,
    variants: [
      {
        color: 'Bej',
        color_hex: '#d4c4b0',
        image:
          'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&auto=format&fit=crop&q=80',
        stock: stock36to40(5, 7, 9, 8, 4),
      },
      {
        color: 'Bordo',
        color_hex: '#722f37',
        image:
          'https://images.unsplash.com/photo-1515347619252-60a213bf4d20?w=600&h=600&auto=format&fit=crop&q=80',
        stock: stock36to40(3, 4, 5, 4, 1),
      },
    ],
  },
  {
    name: 'Günlük Sneaker Unisex U90',
    code: 'SNK-U90',
    category: 'unisex',
    price: 890,
    is_active: true,
    variants: [
      {
        color: 'Beyaz',
        color_hex: '#f8fafc',
        image:
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&auto=format&fit=crop&q=80',
        stock: stock36to40(15, 14, 12, 10, 6),
      },
      {
        color: 'Gri',
        color_hex: '#64748b',
        image:
          'https://images.unsplash.com/photo-1595950652773-e0464df5645a?w=600&h=600&auto=format&fit=crop&q=80',
        stock: stock36to40(10, 11, 9, 7, 5),
      },
    ],
  },
  {
    name: 'Bot Model Kar 300',
    code: 'BOT-K300',
    category: 'unisex',
    price: 1120,
    is_active: true,
    variants: [
      {
        color: 'Siyah',
        color_hex: '#111827',
        image:
          'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&h=600&auto=format&fit=crop&q=80',
        stock: stock36to40(4, 5, 6, 4, 2),
      },
      {
        color: 'Haki',
        color_hex: '#4a5d23',
        image:
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&auto=format&fit=crop&q=80',
        stock: stock36to40(3, 4, 4, 3, 1),
      },
    ],
  },
];
