import './config/env.config.js';
import connectDB from './config/db.js';
import Product from './models/product.model.js';
import Post from './models/post.model.js';
import User from './models/user.model.js';

const products = [
  { name: 'Vanilla Dream', description: 'Classic Madagascar vanilla bean ice cream made with real cream.', price: 4.99, category: 'classic', image: { url: '/images/img1.png', publicId: '' } },
  { name: 'Chocolate Heaven', description: 'Rich Belgian chocolate ice cream with dark cocoa chunks.', price: 5.49, category: 'classic', image: { url: '/images/img1.png', publicId: '' } },
  { name: 'Strawberry Bliss', description: 'Fresh strawberry ice cream made with real California strawberries.', price: 5.29, category: 'fruit', image: { url: '/images/img1.png', publicId: '' } },
  { name: 'Mint Choco Crunch', description: 'Cool mint ice cream loaded with chocolate cookie pieces.', price: 5.99, category: 'classic', image: { url: '/images/img1.png', publicId: '' } },
  { name: 'Mango Tango', description: 'Tropical mango sorbet — dairy-free and refreshing.', price: 4.49, category: 'fruit', image: { url: '/images/img1.png', publicId: '' } },
  { name: 'Cookies & Cream', description: 'Vanilla ice cream loaded with giant chocolate cookie chunks.', price: 5.79, category: 'classic', image: { url: '/images/img1.png', publicId: '' } },
  { name: 'Pistachio Delight', description: 'Premium pistachio ice cream with roasted pistachio pieces.', price: 6.49, category: 'classic', image: { url: '/images/img1.png', publicId: '' } },
  { name: 'Caramel Swirl', description: 'Buttery caramel ice cream with a rich salted caramel swirl.', price: 5.99, category: 'classic', image: { url: '/images/img1.png', publicId: '' } },
  { name: 'Blueberry Lavender', description: 'Elegant blueberry and lavender floral ice cream.', price: 6.99, category: 'classic', image: { url: '/images/img1.png', publicId: '' } },
  { name: 'Coffee Toffee', description: 'Coffee-infused ice cream with crunchy toffee bits.', price: 5.49, category: 'classic', image: { url: '/images/img1.png', publicId: '' } },
  { name: 'Lemon Sorbet', description: 'Zesty dairy-free lemon sorbet — light and tangy.', price: 3.99, category: 'fruit', image: { url: '/images/img1.png', publicId: '' } },
  { name: 'Triple Chocolate', description: 'Three kinds of chocolate — milk, dark, and white — in every scoop.', price: 6.29, category: 'classic', image: { url: '/images/img1.png', publicId: '' } },
];

const posts = [
  { title: 'The History of Ice Cream', excerpt: 'From ancient Persia to your cone — how frozen treats conquered the world.', content: 'Ice cream has a rich history stretching back thousands of years. Ancient Persians would pour grape juice over snow, while Emperor Nero of Rome sent slaves into the mountains to fetch ice for fruit toppings. The modern ice cream we know today emerged in the 18th century, and by the 20th century it had become a global phenomenon. Today, artisanal ice cream shops push the boundaries of flavor.,/n,/nGlacy Store continues this tradition by crafting small-batch ice cream using the finest ingredients sourced from around the world.', author: 'Jayblacc' },
  { title: 'How We Source Our Ingredients', excerpt: 'Every scoop tells a story — meet the farmers and suppliers behind Glacy.', content: 'At Glacy Store, we believe great ice cream starts with great ingredients. We source our vanilla beans from Madagascar, our cocoa from Belgium, and our strawberries from local California farms. Every ingredient is carefully selected for flavor, sustainability, and ethical production.,/n,/nOur dairy comes from grass-fed cows in Wisconsin, giving our ice cream its rich, creamy texture. We work directly with farmers to ensure fair wages and environmentally friendly practices.', author: 'Jayblacc' },
  { title: '5 Ice Cream Flavors to Try This Summer', excerpt: 'Beat the heat with these refreshing and unique frozen treats.', content: 'Summer is here, and there is no better way to cool down than with a scoop (or two) of ice cream. Here are our top 5 picks for this season: 1) Mango Tango — a dairy-free sorbet bursting with tropical flavor. 2) Blueberry Lavender — floral and fruity, perfect for warm evenings. 3) Mint Choco Crunch — cool mint meets crunchy chocolate. 4) Lemon Sorbet — zesty and light. 5) Cookies & Cream — you can never go wrong with a classic.,/n,/nVisit our catalog to explore the full range of flavors and find your new favorite.', author: 'Jayblacc' },
  { title: 'The Art of Pairing Ice Cream with Desserts', excerpt: 'Turn any dessert into an unforgettable experience with the right scoop.', content: 'Pairing ice cream with desserts is an art. A warm brownie demands vanilla, while a slice of apple pie sings next to caramel. Here are some pro tips: Chocolate cake + Coffee Toffee ice cream = a match made in heaven. Fresh berries + Lemon Sorbet = a light, refreshing end to any meal. Fruit tart + Strawberry Bliss = double the fruit, double the flavor.,/n,/nExperiment with contrasting temperatures and textures to elevate your dessert game.', author: 'Jayblacc' },
  { title: 'Behind the Scoop: A Day at Glacy Store', excerpt: 'Ever wonder what goes into making your favorite pint? Come behind the scenes.', content: 'A typical day at Glacy Store starts early. Our team arrives at 6 AM to begin the ice cream-making process. First, we prepare the base — milk, cream, sugar, and eggs — and pasteurize it to perfection. Then comes the flavoring: real vanilla beans are split and scraped, chocolate is melted and tempered, fruit is pureed fresh.,/n,/nThe mixture is churned in small batches to ensure the perfect texture — creamy, not icy. After churning, the ice cream is hardened for 24 hours before it is ready to serve. Every batch is taste-tested by our team before it reaches your cone.', author: 'Jayblacc' },
];

async function seed() {
  await connectDB();

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.log('No admin user found. Create one first via the register endpoint.');
  }

  await Product.deleteMany({});
  const createdProducts = await Product.insertMany(products);
  console.log(`Seeded ${createdProducts.length} products`);

  await Post.deleteMany({});
  const createdPosts = await Post.insertMany(posts);
  console.log(`Seeded ${createdPosts.length} blog posts`);

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
