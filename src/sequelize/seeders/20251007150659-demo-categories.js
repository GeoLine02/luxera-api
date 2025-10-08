export async function up(queryInterface) {
  return queryInterface.bulkInsert(
    "Categories",
    [
      {
        categoryName: "Electronics",
        categoryImage: "electronics.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        categoryName: "Clothing",
        categoryImage: "clothing.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        categoryName: "Books",
        categoryImage: "books.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        categoryName: "Home & Kitchen",
        categoryImage: "home_kitchen.jpg",
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
