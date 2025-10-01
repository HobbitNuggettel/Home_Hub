class UPCDatabaseService {
  constructor() {
    this.apiKey = process.env.REACT_APP_UPC_API_KEY || 'demo';
    this.baseUrl = 'https://api.upcitemdb.com/prod/trial/lookup';
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  async lookupProduct(barcode) {
    // Check cache first
    const cached = this.getCachedProduct(barcode);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.baseUrl}?upc=${barcode}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const product = this.formatProductData(data.items[0]);
        this.cacheProduct(barcode, product);
        return product;
      } else {
        throw new Error('Product not found in database');
      }
    } catch (error) {
      console.error('UPC lookup error:', error);
      
      // Return mock data for demo purposes
      return this.getMockProduct(barcode);
    }
  }

  formatProductData(item) {
    return {
      name: item.title || 'Unknown Product',
      brand: item.brand || 'Unknown Brand',
      category: this.categorizeProduct(item.title || ''),
      description: item.description || '',
      image: item.images && item.images.length > 0 ? item.images[0] : null,
      barcode: item.upc || item.ean || item.isbn,
      price: this.estimatePrice(item.title || ''),
      nutrition: item.nutrition || null,
      ingredients: item.ingredients || null,
      weight: item.weight || null,
      dimensions: item.dimensions || null,
      color: item.color || null,
      material: item.material || null,
      origin: item.origin || null,
      lastUpdated: new Date().toISOString()
    };
  }

  categorizeProduct(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('milk') || titleLower.includes('cheese') || titleLower.includes('yogurt')) {
      return 'Dairy';
    } else if (titleLower.includes('bread') || titleLower.includes('cake') || titleLower.includes('cookie')) {
      return 'Bakery';
    } else if (titleLower.includes('apple') || titleLower.includes('banana') || titleLower.includes('vegetable')) {
      return 'Produce';
    } else if (titleLower.includes('soda') || titleLower.includes('juice') || titleLower.includes('water')) {
      return 'Beverages';
    } else if (titleLower.includes('chips') || titleLower.includes('candy') || titleLower.includes('snack')) {
      return 'Snacks';
    } else if (titleLower.includes('frozen') || titleLower.includes('ice cream')) {
      return 'Frozen';
    } else if (titleLower.includes('can') || titleLower.includes('canned')) {
      return 'Canned';
    } else if (titleLower.includes('meat') || titleLower.includes('chicken') || titleLower.includes('beef')) {
      return 'Meat';
    } else if (titleLower.includes('fish') || titleLower.includes('salmon') || titleLower.includes('tuna')) {
      return 'Seafood';
    } else {
      return 'Other';
    }
  }

  estimatePrice(title) {
    // Simple price estimation based on product type
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('organic') || titleLower.includes('premium')) {
      return Math.random() * 10 + 5; // $5-15
    } else if (titleLower.includes('milk') || titleLower.includes('bread')) {
      return Math.random() * 3 + 2; // $2-5
    } else if (titleLower.includes('produce') || titleLower.includes('fruit')) {
      return Math.random() * 4 + 1; // $1-5
    } else if (titleLower.includes('snack') || titleLower.includes('candy')) {
      return Math.random() * 2 + 1; // $1-3
    } else {
      return Math.random() * 8 + 2; // $2-10
    }
  }

  getMockProduct(barcode) {
    const mockProducts = {
      '1234567890123': {
        name: 'Organic Whole Milk',
        brand: 'Fresh Farms',
        category: 'Dairy',
        description: 'Fresh organic whole milk, 1 gallon',
        image: 'https://via.placeholder.com/150x150?text=Milk',
        barcode: barcode,
        price: 4.99,
        nutrition: {
          calories: 150,
          fat: 8,
          protein: 8,
          carbs: 12
        },
        ingredients: ['Organic whole milk'],
        weight: '1 gallon',
        lastUpdated: new Date().toISOString()
      },
      '9876543210987': {
        name: 'Whole Wheat Bread',
        brand: 'Bakery Fresh',
        category: 'Bakery',
        description: 'Fresh baked whole wheat bread',
        image: 'https://via.placeholder.com/150x150?text=Bread',
        barcode: barcode,
        price: 3.49,
        nutrition: {
          calories: 80,
          fat: 1,
          protein: 3,
          carbs: 15
        },
        ingredients: ['Whole wheat flour', 'Water', 'Yeast', 'Salt'],
        weight: '1 loaf',
        lastUpdated: new Date().toISOString()
      },
      '5555555555555': {
        name: 'Bananas',
        brand: 'Tropical',
        category: 'Produce',
        description: 'Fresh organic bananas, per bunch',
        image: 'https://via.placeholder.com/150x150?text=Bananas',
        barcode: barcode,
        price: 1.99,
        nutrition: {
          calories: 105,
          fat: 0,
          protein: 1,
          carbs: 27
        },
        ingredients: ['Bananas'],
        weight: '1 bunch',
        lastUpdated: new Date().toISOString()
      },
      '1111111111111': {
        name: 'Coca Cola Classic',
        brand: 'Coca Cola',
        category: 'Beverages',
        description: 'Classic Coca Cola, 12 pack cans',
        image: 'https://via.placeholder.com/150x150?text=Coke',
        barcode: barcode,
        price: 2.49,
        nutrition: {
          calories: 140,
          fat: 0,
          protein: 0,
          carbs: 39
        },
        ingredients: ['Carbonated water', 'High fructose corn syrup', 'Caramel color', 'Phosphoric acid', 'Natural flavors', 'Caffeine'],
        weight: '12 pack',
        lastUpdated: new Date().toISOString()
      }
    };

    return mockProducts[barcode] || {
      name: 'Unknown Product',
      brand: 'Unknown Brand',
      category: 'Other',
      description: 'Product information not available',
      image: 'https://via.placeholder.com/150x150?text=?',
      barcode: barcode,
      price: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  getCachedProduct(barcode) {
    const cached = this.cache.get(barcode);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  cacheProduct(barcode, product) {
    this.cache.set(barcode, {
      data: product,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheSize() {
    return this.cache.size;
  }

  // Search products by name
  async searchProducts(query, limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}?s=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        return data.items.map(item => this.formatProductData(item));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Product search error:', error);
      return [];
    }
  }

  // Get product suggestions based on category
  getProductSuggestions(category, limit = 5) {
    const suggestions = {
      'Dairy': [
        { name: 'Organic Milk', brand: 'Fresh Farms', price: 4.99 },
        { name: 'Cheddar Cheese', brand: 'Dairy Delight', price: 6.49 },
        { name: 'Greek Yogurt', brand: 'Healthy Choice', price: 3.99 }
      ],
      'Bakery': [
        { name: 'Whole Wheat Bread', brand: 'Bakery Fresh', price: 3.49 },
        { name: 'Croissants', brand: 'French Bakery', price: 4.99 },
        { name: 'Bagels', brand: 'New York Style', price: 2.99 }
      ],
      'Produce': [
        { name: 'Organic Bananas', brand: 'Tropical', price: 1.99 },
        { name: 'Apples', brand: 'Farm Fresh', price: 2.49 },
        { name: 'Spinach', brand: 'Green Valley', price: 2.99 }
      ]
    };

    return suggestions[category] || [];
  }

  // Validate barcode format
  validateBarcode(barcode) {
    // Remove any non-digit characters
    const cleanBarcode = barcode.replace(/\D/g, '');
    
    // Check length (UPC-A: 12 digits, EAN-13: 13 digits, UPC-E: 8 digits)
    if (cleanBarcode.length === 12 || cleanBarcode.length === 13 || cleanBarcode.length === 8) {
      return cleanBarcode;
    }
    
    return null;
  }

  // Generate barcode image URL
  getBarcodeImageUrl(barcode, format = 'upc') {
    return `https://barcode.tec-it.com/barcode.ashx?data=${barcode}&code=${format}&translate-esc=on`;
  }
}

export default new UPCDatabaseService();
