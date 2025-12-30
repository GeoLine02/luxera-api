enum ProductStatus {
  Pending = "pending",
  Active = "active",
  Vip = "vip",
  Rejected = "rejected",
  OutOfStock = "out of stock",
  Inactive = "inactive",
}
enum NotificationType {
  ProductApproved = "product_approval",
  ProductRejected = "product_rejection",
  AccountWarning = "account_warning",
  SystemAnnouncement = "system_announcement",
}
enum AllowedMimeTypes {
  JPG = "image/jpg",
  PNG = "image/png",
  JPEG = "image/jpeg",
  WEBP = "image/webp",
}
export { ProductStatus, NotificationType, AllowedMimeTypes };
