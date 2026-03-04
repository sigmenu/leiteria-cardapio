import { 
  GiCoffeeCup, 
  GiKnifeFork, 
  GiMeat, 
  GiWineGlass,
  GiCookingPot,
  GiHamburger
} from 'react-icons/gi'
import { 
  BiCoffee,
  BiDrink
} from 'react-icons/bi'
import { 
  FaPercent,
  FaCocktail,
  FaUtensils,
  FaWineGlassAlt
} from 'react-icons/fa'
import { 
  MdCoffee,
  MdRestaurantMenu,
  MdLocalBar
} from 'react-icons/md'
import {
  LuCoffee,
  LuChefHat,
  LuUtensilsCrossed,
  LuGlassWater,
  LuPercent
} from 'react-icons/lu'

const iconMap = {
  // Default/generic
  default: LuUtensilsCrossed,
  
  // Percentual/Promoções
  percent: LuPercent,
  promotion: LuPercent,
  
  // Café
  coffee: LuCoffee,
  coffeecup: GiCoffeeCup,
  cafe: BiCoffee,
  
  // Utensílios/Cozinha
  utensils: LuUtensilsCrossed,
  kitchen: GiCookingPot,
  chef: LuChefHat,
  cook: GiCookingPot,
  
  // Carne/Parrilla
  meat: GiMeat,
  grill: GiMeat,
  parrilla: GiMeat,
  
  // Bebidas/Bar
  cocktail: FaCocktail,
  drink: BiDrink,
  bar: MdLocalBar,
  drinkeria: FaCocktail,
  glass: LuGlassWater,
  
  // Vinho
  wine: GiWineGlass,
  wineglass: FaWineGlassAlt,
  
  // Menu/Comida
  menu: MdRestaurantMenu,
  food: GiKnifeFork,
  burger: GiHamburger,
  restaurant: FaUtensils
}

export function CategoryIcon({ icon, className = '' }) {
  const IconComponent = iconMap[icon?.toLowerCase()] || iconMap.default
  return <IconComponent className={className} />
}