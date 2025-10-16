'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // --- categories we want ---
    const categoryNames = ['Coffee', 'Desserts', 'Snacks', 'Drinks'];

    // existing categories
    const [existingCats] = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Categories";'
    );
    const existingCatNames = new Set(existingCats.map(c => c.name));

    // insert only missing categories
    const catsToInsert = categoryNames
      .filter(name => !existingCatNames.has(name))
      .map(name => ({ name, createdAt: now, updatedAt: now }));

    if (catsToInsert.length) {
      await queryInterface.bulkInsert('Categories', catsToInsert);
    }

    // re-fetch all categories to get IDs
    const [cats] = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Categories";'
    );
    const idByName = Object.fromEntries(cats.map(c => [c.name, c.id]));

    // desired products (SAME list, switched to your public image paths)
    const products = [
      // Coffee
      { name: 'Espresso',       price: 149, description: 'Strong and bold single shot.',  categoryId: idByName.Coffee,   imageUrl: '/images/products/espressocoffee.jpg' },
      { name: 'Cappuccino',     price: 199, description: 'Rich and foamy.',               categoryId: idByName.Coffee,   imageUrl: '/images/products/cappuccino.jpg' },
      { name: 'Latte',          price: 189, description: 'Smooth milk coffee blend.',     categoryId: idByName.Coffee,   imageUrl: '/images/products/latte.jpg' },

      // Desserts
      { name: 'Chocolate Cake', price: 249, description: 'Rich chocolate delight.',       categoryId: idByName.Desserts, imageUrl: '/images/products/chocolatecake.jpg' },
      { name: 'Cheesecake',     price: 259, description: 'Creamy classic treat.',         categoryId: idByName.Desserts, imageUrl: '/images/products/cheesecake.jpg' },

      // Snacks
      { name: 'Club Sandwich',  price: 229, description: 'Toasted & layered goodness.',   categoryId: idByName.Snacks,   imageUrl: '/images/products/clubsandwich.jpg' },
      { name: 'Croissant',      price: 129, description: 'Buttery flaky pastry.',         categoryId: idByName.Snacks,   imageUrl: '/images/products/croissant.jpg' },

      // Drinks
      { name: 'Iced Coffee',    price: 179, description: 'Chilled & refreshing.',         categoryId: idByName.Drinks,   imageUrl: '/images/products/icedcoffee.jpg' },
      { name: 'Lemon Iced Tea', price: 149, description: 'Zesty cool tea.',               categoryId: idByName.Drinks,   imageUrl: '/images/products/lemonicetea.jpg' },
    ].map(p => ({ ...p, createdAt: now, updatedAt: now }));

    // skip products that already exist with same (name, categoryId)
    const [existingProd] = await queryInterface.sequelize.query(
      'SELECT name, "categoryId" FROM "Products";'
    );
    const existingKeys = new Set(existingProd.map(p => `${p.name}::${p.categoryId}`));

    const toInsert = products.filter(p => !existingKeys.has(`${p.name}::${p.categoryId}`));
    if (toInsert.length) {
      await queryInterface.bulkInsert('Products', toInsert);
    }
  },

  async down(queryInterface, Sequelize) {
    // delete only the rows we added by name
    await queryInterface.bulkDelete('Products', {
      name: [
        'Espresso','Cappuccino','Latte',
        'Chocolate Cake','Cheesecake',
        'Club Sandwich','Croissant',
        'Iced Coffee','Lemon Iced Tea'
      ]
    }, {});

    await queryInterface.bulkDelete('Categories', {
      name: ['Coffee','Desserts','Snacks','Drinks']
    }, {});
  }
};
