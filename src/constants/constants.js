const transmissionEnum = ["Automatic", "Manual"]; // Enum for transmission type
const fuelEnum = ["Petrol", "Diesel", "Electric", "Hybrid"]; // Enum for fuel type
const MIN_SEATS = 2; // Minimum number of seats
const MAX_SEATS = 20; // Maximum number of seats
const MIN_RENTAL_PRICE = 0; // Minimum rental price
const MAX_RENTAL_PRICE = 100000; // Maximum rental price
const MIN_RENTAL_PERIOD = 1; // Minimum rental period
const MAX_RENTAL_PERIOD = 30; // Maximum rental period
const MIN_Fixed_KILOMETER = 100; // Minimum fixed kilometer
const MAX_Fixed_KILOMETER = 10000; // Maximum fixed kilometer
const MIN_RATE_PER_KM = 0; // Minimum rate per km
const MAX_RATE_PER_KM = 5; // Maximum rate per km
const roles = ["user", "admin", "super-admin"]; // Enum for user roles
const MIN_BID_AMOUNT = 0;
const MAX_BID_AMOUNT = 1000000;
// Enum for vehicle type
const vehicleTypeEnum = [
  "Sedan",
  "SUV",
  "Covertible",
  "Coupe",
  "Hatchback",
  "Minivan",
  "Pickup",
  "Wagon",
  "Van",
  "Truck",
  "Jeep",
  "Bus",
  "Motorcycle",
  "Trailer",
  "Tractor",
  "Boat",
  "Aircraft",
  "Bicycle",
  "Scooter",
  "Rickshaw",
  "Cycle",
  "Other",
];

export {
  MAX_Fixed_KILOMETER,
  MAX_BID_AMOUNT,
  MIN_BID_AMOUNT,
  MAX_RATE_PER_KM,
  MAX_RENTAL_PERIOD,
  MAX_RENTAL_PRICE,
  MAX_SEATS,
  MIN_Fixed_KILOMETER,
  MIN_RATE_PER_KM,
  MIN_RENTAL_PERIOD,
  MIN_RENTAL_PRICE,
  MIN_SEATS,
  fuelEnum,
  transmissionEnum,
  vehicleTypeEnum,
  roles,
};
