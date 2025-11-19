export async function up(queryInterface) {
  return queryInterface.bulkInsert(
    "Categories",
    [
      {
        id: 1,
        category_name: "Electronics",
        category_image: "electronics.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        category_name: "Clothing",
        category_image: "clothing.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        category_name: "Books",
        category_image: "books.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        category_name: "Home & Kitchen",
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
