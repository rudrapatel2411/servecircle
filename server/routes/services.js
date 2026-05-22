import express from 'express';

const router = express.Router();

// Static services data (will later come from DB)
const services = [
  {
    id: 1, category: 'Home Repairs', icon: '🔧',
    items: [
      { name: 'Electrical Work', desc: 'Wiring, switches, fans, lights', worker: 'Electrician', price: 300 },
      { name: 'Plumbing', desc: 'Pipe repair, tap fix, leakage', worker: 'Plumber', price: 350 },
      { name: 'Carpentry', desc: 'Door/window repair, furniture fix', worker: 'Carpenter', price: 400 },
      { name: 'AC & Appliance Repair', desc: 'AC service, fridge, washing machine', worker: 'Technician', price: 500 },
      { name: 'Painting', desc: 'Wall painting, waterproofing', worker: 'Painter', price: 600 },
    ],
  },
  {
    id: 2, category: 'Vehicle Services', icon: '🚗',
    items: [
      { name: 'Car Repair', desc: 'Engine, brakes, suspension', worker: 'Mechanic', price: 800 },
      { name: 'Bike Repair', desc: 'Engine, chain, brakes', worker: 'Mechanic', price: 400 },
      { name: 'Car/Bike Washing', desc: 'Exterior, interior, foam wash', worker: 'Washer', price: 250 },
      { name: 'Puncture Repair', desc: 'On-spot tyre puncture fix', worker: 'Tyre Tech', price: 150 },
    ],
  },
  {
    id: 3, category: 'Cleaning & Hygiene', icon: '🧹',
    items: [
      { name: 'Home Deep Cleaning', desc: 'Full house thorough cleaning', worker: 'Cleaning Staff', price: 1200 },
      { name: 'Pest Control', desc: 'Cockroach, termite, mosquito', worker: 'Pest Expert', price: 900 },
      { name: 'Sofa/Carpet Cleaning', desc: 'Shampoo wash, steam clean', worker: 'Specialist', price: 600 },
      { name: 'Water Tank Cleaning', desc: 'Tank emptying, sanitizing', worker: 'Cleaner', price: 800 },
    ],
  },
  {
    id: 4, category: 'Events & Celebrations', icon: '🎉',
    items: [
      { name: 'Birthday Party', desc: 'Theme decoration, cake, photographer', worker: 'Event Team', price: 5000 },
      { name: 'Griha Pravesh', desc: 'Pooja setup, flowers, catering', worker: 'Event Planner', price: 8000 },
      { name: 'Diwali Decoration', desc: 'Lights, rangoli, diyas', worker: 'Decorator', price: 3000 },
      { name: 'Photography', desc: 'Event photos, reels, video', worker: 'Photographer', price: 2000 },
    ],
  },
  {
    id: 5, category: 'Furniture & Decor', icon: '🪑',
    items: [
      { name: 'Furniture Assembly', desc: 'Flat-pack assembly, IKEA style', worker: 'Carpenter', price: 500 },
      { name: 'Furniture Polish', desc: 'Wood polish, refinishing', worker: 'Polish Expert', price: 700 },
      { name: 'Interior Consultation', desc: 'Room layout, decor advice', worker: 'Designer', price: 1500 },
    ],
  },
  {
    id: 6, category: 'Garden & Outdoor', icon: '🪴',
    items: [
      { name: 'Plant Care', desc: 'Watering, pruning, fertilizing', worker: 'Gardener', price: 300 },
      { name: 'Garden Setup', desc: 'New garden design, soil prep', worker: 'Gardener', price: 2000 },
      { name: 'Gate/Grill Repair', desc: 'Welding, painting, fixing', worker: 'Welder', price: 600 },
    ],
  },
  {
    id: 7, category: 'Emergency 24/7', icon: '⚡',
    items: [
      { name: 'Water Leakage', desc: 'Burst pipe, flood control', worker: 'Emergency Plumber', price: 700 },
      { name: 'Electrical Emergency', desc: 'Short circuit, power failure', worker: 'Emergency Electrician', price: 600 },
      { name: 'Lock Break-in Fix', desc: 'Lock jam, key stuck', worker: 'Locksmith', price: 500 },
      { name: 'Vehicle Breakdown', desc: 'On-road breakdown, tow', worker: 'Mechanic', price: 1000 },
    ],
  },
  {
    id: 8, category: 'Employment', icon: '💼',
    items: [
      { name: 'Skilled Workers', desc: 'Electrician, Plumber, AC Tech', worker: 'ITI/Diploma', price: 0 },
      { name: 'Women at Home', desc: 'Tailoring, Beauty, Cooking, Tuition', worker: 'Home-based', price: 0 },
      { name: 'Graduates', desc: 'Tuition, IT Help, Photography', worker: 'Students', price: 0 },
      { name: 'Daily Wage', desc: 'Shifting, Cleaning, Delivery', worker: 'Workers', price: 0 },
    ],
  },
];

// GET all services
router.get('/', (req, res) => {
  res.json(services);
});

// GET services by category
router.get('/:categoryId', (req, res) => {
  const category = services.find((s) => s.id === parseInt(req.params.categoryId));
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json(category);
});

export default router;
