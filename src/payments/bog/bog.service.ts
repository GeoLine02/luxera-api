import axios from "axios";
import { Request, Response, NextFunction } from "express";
import {
  BOG_TEST_CLIENT_ID,
  BOG_TEST_SECRET,
  OrderDataType,
} from "./bog.controller";
import crypto from "crypto";
interface requestOrderResponse {
  id: string;
  _links: {
    details: {
      href: string;
    };
    redirect: {
      href: string;
    };
  };
}

export async function bogRequestOrderService(
  accessToken: string,
  orderData: OrderDataType,
) {
  // Fetch product prices from ProductVariants for each order product

  const basket = orderData.orderProducts.map((product) => ({
    quantity: product.product_quantity,
    unit_price: product.product_price,
    product_id: product.product_id,
  }));
  const callbackUrl = "https://api.luxeragift.com/payments/bog/callback";

  const payload = {
    callback_url: callbackUrl,
    external_order_id: orderData.order.id,
    capture: "automatic",
    purchase_units: {
      currency: "GEL",
      total_amount: orderData.orderTotal.value,
      basket: basket,
    },
    redirect_urls: {
      fail: "https://luxeragift.com/checkout/fail",
      success: "https://luxeragift.com/checkout/success",
    },
  };

  try {
    const BOG_TEST_REQUEST_ORDER_URL =
      "https://api-sandbox.bog.ge/payments/v1/ecommerce/orders";
    const response = await axios.post(BOG_TEST_REQUEST_ORDER_URL, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Idempotency-Key": orderData.order.id,
      },
      timeout: 1000,
    });
    return response.data as requestOrderResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getBogAccessToken(): Promise<string> {
  const clientId = process.env.BOG_CLIENT_ID;
  const secretKey = process.env.BOG_SECRET_KEY;
  const BOG_TEST_AUTH_URL =
    "https://oauth2-sandbox.bog.ge/auth/realms/bog/protocol/openid-connect/token";
  if (!clientId || !secretKey) {
    throw new Error(
      "BOG_CLIENT_ID or BOG_SECRET_KEY is missing in environment variables",
    );
  }
  try {
    const response = await axios.post(
      BOG_TEST_AUTH_URL,
      new URLSearchParams({
        grant_type: "client_credentials",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username: BOG_TEST_CLIENT_ID,
          password: BOG_TEST_SECRET,
        },
      },
    );

    // Extract access token
    const { access_token } = response.data;

    if (!access_token) {
      throw new Error("Failed to retrieve access token from Bank of Georgia");
    }

    return access_token;
  } catch (error) {
    throw error;
  }
}
const BOG_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu4RUyAw3+CdkS3ZNILQh
zHI9Hemo+vKB9U2BSabppkKjzjjkf+0Sm76hSMiu/HFtYhqWOESryoCDJoqffY0Q
1VNt25aTxbj068QNUtnxQ7KQVLA+pG0smf+EBWlS1vBEAFbIas9d8c9b9sSEkTrr
TYQ90WIM8bGB6S/KLVoT1a7SnzabjoLc5Qf/SLDG5fu8dH8zckyeYKdRKSBJKvhx
tcBuHV4f7qsynQT+f2UYbESX/TLHwT5qFWZDHZ0YUOUIvb8n7JujVSGZO9/+ll/g
4ZIWhC1MlJgPObDwRkRd8NFOopgxMcMsDIZIoLbWKhHVq67hdbwpAq9K9WMmEhPn
PwIDAQAB
-----END PUBLIC KEY-----`;

export function verifyBOGSignature(rawBody: string, headers: any): boolean {
  try {
    // Get signature from header (case-insensitive)
    const signatureHeader =
      headers["callback-signature"]?.toString() ||
      headers["Callback-Signature"]?.toString();
    if (!signatureHeader) {
      console.warn("[SECURITY] Missing Callback-Signature header");
      return true;
    }
    // Signature is Base64 encoded
    const signature = Buffer.from(signatureHeader, "base64");
    // Verify using BOG's public key
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(rawBody, "utf8");
    const isValid = verifier.verify(BOG_PUBLIC_KEY, signature);
    if (!isValid) {
      console.warn("[SECURITY] Invalid BOG signature - callback rejected");
    }
    return isValid;
  } catch (error) {
    console.error("[ERROR] Signature verification failed:", error);
    return false;
  }
}
