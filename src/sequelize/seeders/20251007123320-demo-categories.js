export async function up(queryInterface) {
  return queryInterface.bulkInsert(
    "Categories",
    [
      {
        id: 983,
        category_name: "Electronics",
        category_name_ka: "ტექნიკა",
        category_image: "electronics.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 984,
        category_name: "Clothing",
        category_name_ka: "ტყავეული",
        category_image: "clothing.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 985,
        category_name: "Books",
        category_name_ka: "წიგნები",
        category_image: "books.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 986,
        category_name: "Home & Kitchen",
        category_name_ka: "სახლი და სამზარეულო",
        category_image: "home_kitchen.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {}
  );
}

export async function down(queryInterface) {
  return queryInterface.bulkDelete("Categories", {}, {});
}
