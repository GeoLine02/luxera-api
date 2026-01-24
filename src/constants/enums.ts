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
enum OrderStatus {
  OrderCancelled = "order_cancelled",
  OrderDelivered = "order_delivered",
  OrderInTransit = "order_in_transit",
  OrderPaymentDue = "order_payment_due",
  OrderPickupAvailable = "order_pickup_available",
  OrderProblem = "order_problem",
  OrderProcessing = "order_processing",
  OrderReturned = "order_returned",
  OrderPendingPayment = "order_pending_payment",
  OrderPaid = "order_paid",
}

export { ProductStatus, NotificationType, AllowedMimeTypes, OrderStatus };
