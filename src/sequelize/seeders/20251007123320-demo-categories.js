export async function up(queryInterface) {
  return queryInterface.bulkInsert(
    "Categories",
    [
      {
        id: 1,
        categoryName: "Electronics",
        categoryImage: "electronics.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        categoryName: "Clothing",
        categoryImage: "clothing.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        categoryName: "Books",
        categoryImage: "books.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
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
